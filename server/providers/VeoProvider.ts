import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { ConnectionTestResult, OperationStatusResult, VideoGenerateParams, VideoGenerationProvider } from './types';
import { AI_MODELS } from '../config/aiModels';
import { db } from '../db';

export class VeoProvider implements VideoGenerationProvider {
  public readonly name = 'Google Veo / Gemini API';

  private getClient(customApiKey?: string): { ai: GoogleGenAI; key: string } {
    const key = customApiKey || process.env.GEMINI_API_KEY || '';
    if (!key) {
      throw new Error('API Key do Google Veo / Gemini não está configurada.');
    }
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return { ai, key };
  }

  public async testConnection(apiKey?: string): Promise<ConnectionTestResult> {
    try {
      const { ai } = this.getClient(apiKey);
      // Validate key by running a lightweight test request
      const response = await ai.models.generateContent({
        model: AI_MODELS.GEMINI_TEXT,
        contents: 'Ping test connection. Respond with "OK".',
      });

      if (response && response.text) {
        return {
          success: true,
          message: '🟢 Conexão com a API do Google estabelecida com sucesso!',
          provider: this.name,
          models: [
            'veo-3.1-generate-preview (Alta Qualidade)',
            'veo-3.1-lite-generate-preview (Rápido / Padrão)',
            'veo-2.0-generate-001 (Versão Estável)',
          ],
        };
      } else {
        return {
          success: false,
          message: '🔴 Resposta inesperada da API durante teste de conexão.',
          provider: this.name,
        };
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      let friendlyMessage = `🔴 Falha na conexão: ${errorMessage}`;
      let requiresBilling = false;

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401') || errorMessage.includes('403')) {
        friendlyMessage = '🔴 API Key inválida ou sem permissão. Verifique sua chave no Google AI Studio / Google Cloud.';
      } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        friendlyMessage = '🟡 Limite de requisições (Quota/Rate Limit) atingido. Aguarde alguns instantes.';
      } else if (errorMessage.includes('BILLING_NOT_ENABLED') || errorMessage.includes('billing')) {
        friendlyMessage = '🟡 O modelo Veo requer um projeto com faturamento configurado no Google Cloud.';
        requiresBilling = true;
      }

      return {
        success: false,
        message: friendlyMessage,
        provider: this.name,
        requiresBilling,
      };
    }
  }

  public async generateVideo(params: VideoGenerateParams, apiKey?: string): Promise<{ operationName: string }> {
    const { ai } = this.getClient(apiKey);
    const modelName = params.model || AI_MODELS.VEO_VIDEO_LITE;
    const resolution = params.resolution || '720p';
    const aspectRatio = params.aspectRatio === '1:1' ? '16:9' : params.aspectRatio || '9:16'; // Fallback if 1:1 unsupported

    db.log('info', `Iniciando geração de vídeo no Veo: Modelo ${modelName}, Formato ${aspectRatio}, Resolução ${resolution}`);

    try {
      const config: Record<string, any> = {
        numberOfVideos: 1,
        resolution,
        aspectRatio,
      };

      const payload: Record<string, any> = {
        model: modelName,
        prompt: params.prompt,
        config,
      };

      if (params.imageBytes) {
        payload.image = {
          imageBytes: params.imageBytes,
          mimeType: params.imageMimeType || 'image/png',
        };
      }

      const operation = await ai.models.generateVideos(payload as any);

      if (!operation || !operation.name) {
        throw new Error('A API do Veo não retornou o identificador da operação (operationName).');
      }

      db.log('info', `Operação Veo criada com sucesso: ${operation.name}`);
      return { operationName: operation.name };
    } catch (err: any) {
      const parsedError = this.parseError(err);
      db.log('error', `Falha ao iniciar geração de vídeo Veo: ${parsedError.message}`, err);
      throw new Error(parsedError.message);
    }
  }

  public async checkOperationStatus(operationName: string, apiKey?: string): Promise<OperationStatusResult> {
    const { ai } = this.getClient(apiKey);

    try {
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      if (updated.done) {
        if (updated.error) {
          const errObj = updated.error as any;
          return {
            done: true,
            error: errObj?.message || String(errObj) || 'Erro durante a renderização do vídeo pelo Veo.',
            rawResponse: updated,
          };
        }

        const resObj = updated.response as any;
        const videoUri: string | undefined = resObj?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) {
          return {
            done: true,
            error: 'Operação concluída, mas nenhum URI de vídeo foi retornado pelo Google Veo.',
            rawResponse: updated,
          };
        }

        return {
          done: true,
          videoUri,
          rawResponse: updated,
        };
      }

      return {
        done: false,
        rawResponse: updated,
      };
    } catch (err: any) {
      const parsed = this.parseError(err);
      return {
        done: false,
        error: parsed.message,
      };
    }
  }

  public async downloadVideo(videoUri: string, outputPath: string, apiKey?: string): Promise<string> {
    const { key } = this.getClient(apiKey);

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db.log('info', `Baixando vídeo gerado do URI oficial para: ${outputPath}`);

    const response = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': key,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao baixar vídeo (${response.status} ${response.statusText}).`);
    }

    if (!response.body) {
      throw new Error('Resposta de download sem corpo binário.');
    }

    const fileStream = fs.createWriteStream(outputPath);
    // Node.js web streams pipeline
    // @ts-ignore
    await pipeline(response.body, fileStream);

    db.log('info', `Vídeo salvo com sucesso no arquivo local: ${outputPath}`);
    return outputPath;
  }

  private parseError(err: any): { message: string; code?: string; solution?: string } {
    const msg = err?.message || String(err);

    if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('403')) {
      return {
        message: 'API Key inválida ou sem autorização.',
        solution: 'Verifique se a sua chave no painel Configurações está correta e ativa.',
      };
    }
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return {
        message: 'Limite de requisições excedido (Quota Exceeded).',
        solution: 'Aguarde 60 segundos ou reduza a concorrência na fila de geração.',
      };
    }
    if (msg.includes('NOT_FOUND') || msg.includes('404')) {
      return {
        message: 'Modelo Veo ou operação não encontrada.',
        solution: 'Alterne o modelo para veo-3.1-lite-generate-preview nas configurações.',
      };
    }
    if (msg.includes('BILLING_NOT_ENABLED')) {
      return {
        message: 'Projeto sem faturamento ativado no Google Cloud.',
        solution: 'Habilite o faturamento no Google Cloud Console para liberar a API do Veo.',
      };
    }
    if (msg.includes('SAFETY') || msg.includes('BLOCKED')) {
      return {
        message: 'Prompt bloqueado pelos filtros de segurança do Google Veo.',
        solution: 'Revise o roteiro e evite menções diretas a marcas protegidas ou termos sensíveis.',
      };
    }
    return {
      message: msg,
      solution: 'Tente novamente ou ative o Modo Demonstração para testar sem consumir a API.',
    };
  }
}

export const veoProvider = new VeoProvider();
