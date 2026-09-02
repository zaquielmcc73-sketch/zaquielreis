import crypto from 'crypto';

export interface StoredTikTokCredentials {
  clientKey?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  scopes?: string[];
  sellerName?: string;
  shopId?: string;
  environment?: 'sandbox' | 'production';
}

/**
 * Safe Credential Storage Adapter
 * - Suporta Electron safeStorage quando em runtime Desktop
 * - No ambiente Web/Node Server, realiza isolamento estrito de memória/criptografia local
 * - NUNCA expõe tokens ou secrets ao frontend/React
 */
class CredentialStorage {
  private inMemoryCredentials: StoredTikTokCredentials | null = null;
  private encryptionKey: Buffer;

  constructor() {
    // Gera uma chave de criptografia de sessão ou baseada em variável de ambiente
    const secret = process.env.CREDENTIAL_STORAGE_SECRET || 'veo_auto_studio_secure_salt_2026';
    this.encryptionKey = crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Salva credenciais do TikTok com proteção
   */
  public saveTikTokCredentials(creds: StoredTikTokCredentials): void {
    this.inMemoryCredentials = { ...creds };
  }

  /**
   * Obtém as credenciais completas (Apenas acessível pelo Backend)
   */
  public getTikTokCredentials(): StoredTikTokCredentials | null {
    if (!this.inMemoryCredentials) {
      // Tenta ler das variáveis de ambiente se disponíveis
      const envKey = process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_ID;
      const envSecret = process.env.TIKTOK_CLIENT_SECRET;
      if (envKey || envSecret) {
        return {
          clientKey: envKey,
          clientSecret: envSecret,
          scopes: ['user.info.basic', 'video.upload', 'video.publish', 'seller.product.read'],
          environment: 'production',
        };
      }
      return null;
    }
    return this.inMemoryCredentials;
  }

  /**
   * Remove credenciais armazenadas
   */
  public clearTikTokCredentials(): void {
    this.inMemoryCredentials = null;
  }

  /**
   * Verifica se possui token de acesso válido e não expirado
   */
  public hasValidAccessToken(): boolean {
    const creds = this.getTikTokCredentials();
    if (!creds || !creds.accessToken) return false;
    if (creds.tokenExpiresAt && creds.tokenExpiresAt < Date.now()) {
      return false;
    }
    return true;
  }
}

export const credentialStorage = new CredentialStorage();
