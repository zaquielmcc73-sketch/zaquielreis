import fs from 'fs';
import path from 'path';
import {
  AppSettings,
  CampaignFormData,
  Character,
  GenerationJob,
  MediaAsset,
  Product,
  ProjectBible,
  PromptTemplate,
  SavedVideoItem,
  SalesMethodId,
  TikTokCreative,
  LiveSalesScript,
  TikTokAccountInfo,
  TikTokShopProduct,
  VideoAnalysisItem,
  OrchestratedCampaign,
  CampaignCreativeItem,
} from '../src/types';

export interface DatabaseSchema {
  settings: AppSettings;
  bible: ProjectBible;
  campaigns: CampaignFormData[];
  queue: GenerationJob[];
  library: SavedVideoItem[];
  media: MediaAsset[];
  products: Product[];
  characters: Character[];
  promptTemplates: PromptTemplate[];
  tiktokCreatives: TikTokCreative[];
  liveScripts: LiveSalesScript[];
  tiktokAccount: TikTokAccountInfo;
  tiktokProducts: TikTokShopProduct[];
  videoAnalyses: VideoAnalysisItem[];
  orchestratedCampaigns: OrchestratedCampaign[];
  campaignCreatives: CampaignCreativeItem[];
  customMethodConfigs: Record<string, any>;
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error'; message: string; details?: any }>;
}

function resolveAppDataDir(): string {
  // Use APPDATA on Windows (%APPDATA%\VeoAutoStudio)
  if (process.env.APPDATA) {
    return path.join(process.env.APPDATA, 'VeoAutoStudio');
  }
  if (process.env.USERPROFILE) {
    return path.join(process.env.USERPROFILE, 'AppData', 'Roaming', 'VeoAutoStudio');
  }
  if (process.env.HOME && process.platform !== 'win32') {
    return path.join(process.env.HOME, '.veoautostudio');
  }
  return path.join(process.cwd(), 'data');
}

function resolveDefaultOutputDir(): string {
  const userHome = process.env.USERPROFILE || process.env.HOME || process.cwd();
  // %USERPROFILE%\Videos\Veo Auto Studio\
  if (process.env.USERPROFILE) {
    return path.join(process.env.USERPROFILE, 'Videos', 'Veo Auto Studio');
  }
  return path.join(userHome, 'Veo Auto Studio');
}

const DATA_DIR = resolveAppDataDir();
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_BIBLE: ProjectBible = {
  productName: 'Veo Pro Sales System',
  slogan: 'Automação de criativos de alta conversão em escala',
  description: 'Sistema avançado de alta conversão para produtos físicos e digitais.',
  brandColors: 'Preto ônix, Dourado metálico e Azul elétrico',
  logoDescription: 'Tipografia moderna e minimalista com ícone geométrico de play futurista',
  logoPlacement: 'Canto superior direito sutil ou gravado a laser no centro do produto',
  keyFeatures: [
    'Design ergonômico premium e ultra-resistente',
    'Resultados visíveis desde os primeiros minutos de uso',
    'Tecnologia proprietária de rápida absorção / ação',
    'Garantia incondicional de satisfação total',
  ],
  materials: 'Acabamento aeroespacial com polímero fosco acetinado e toque suave',
  primaryBenefits: [
    'Economiza até 80% de tempo e esforço diário',
    'Elimina a frustração com soluções ultrapassadas',
    'Aumenta a confiança e o status do usuário',
  ],
  irresistibleOffer: '50% de desconto no lote promocional + Frete Grátis apenas hoje',
  targetAudience: 'Homens e mulheres de 24 a 55 anos que buscam praticidade, alta qualidade e resultados rápidos',
  brandTone: 'Confiante, direto, sofisticado, dinâmico e focado em soluções imediatas',
  voiceTone: 'Confiante, direto, dinâmico e focado em autoridade e velocidade',
  visualRules: 'Planos detalhados em alta resolução, iluminação de estúdio limpa, foco dinâmico no produto, estética moderna sem ruído visual',
  negativeRules: 'Baixa resolução, distorções em mãos, logos de concorrentes, texto truncado, desfoque excessivo, visual amador, cores lavadas',
  negativePromptRules: 'Baixa resolução, distorções em mãos, logos de concorrentes, texto truncado, desfoque excessivo, visual amador, cores lavadas',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKeyConfigured: false,
  hasEnvKey: Boolean(process.env.GEMINI_API_KEY),
  selectedModel: 'veo-3.1-lite-generate-preview',
  outputDirectory: resolveDefaultOutputDir(),
  maxConcurrency: 1,
  maxRetries: 3,
  defaultAspectRatio: '9:16',
  defaultResolution: '720p',
  demoMode: false,
  testVideoVerified: false,
  onboardingCompleted: false,
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_lumina_serum',
    name: 'Sérum Rejuvenescedor Lumina Glow 24k',
    description: 'Sérum facial de alta potência com micropartículas de ouro 24k, ácido hialurônico triplo e niacinamida pura.',
    category: 'Cosméticos & Skincare',
    price: '197,00',
    currency: 'BRL',
    benefits: [
      'Redução visível de linhas de expressão em 14 dias',
      'Hidratação profunda sem efeito oleoso ou pegajoso',
      'Uniformiza o tom da pele e devolve o viço natural',
    ],
    differentials: [
      'Micropartículas puras de ouro 24k com absorção celular acelerada',
      'Fórmula dermatologicamente testada e livre de parabenos',
      'Toque aveludado instantâneo com efeito primer matte',
    ],
    features: [
      'Frasco de vidro âmbar fosco com conta-gotas de precisão metálico dourado',
      'Textura em gel aquoso translúcido com brilho dourado sutil',
      'Fragrância hipoalergênica suave floral branca',
    ],
    materials: 'Frasco de vidro âmbar fosco 30ml com pipeta de alta precisão e anel dourado cromado',
    dimensions: '11cm altura x 3.5cm diâmetro (30ml)',
    targetAudience: 'Mulheres e homens de 28 a 60 anos que desejam recuperar a firmeza e luminosidade da pele com praticidade diária',
    pains: [
      'Sensação de envelhecimento precoce e pele opaca/cansada',
      'Frustração com produtos caros que deixam a pele oleosa',
      'Medo de procedimentos estéticos invasivos e dolorosos',
    ],
    desires: [
      'Pele jovem, radiante e com brilho saudável de filtro natural',
      'Rotina de autocuidado rápida de menos de 2 minutos por dia',
      'Receber elogios espontâneos sobre a vitalidade do rosto',
    ],
    objections: [
      'Será que funciona para peles muito oleosas? (Sim, fórmula water-gel oil-free)',
      'Quanto tempo demora para ver resultado? (Primeiras melhoras em 72h)',
    ],
    salesArguments: [
      'Tecnologia de ouro coloidal utilizada pelas maiores clínicas estéticas de Beverly Hills',
      'Garantia blindada de 30 dias: Se não notar a pele mais firme, devolvemos 100% do valor',
    ],
    cta: 'Experimente o Lumina Glow 24k com Frete Grátis e 40% OFF no lote de hoje!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_ergo_cleaner',
    name: 'Aspirador Portátil Turbo Cyclone Max',
    description: 'Mini aspirador automotivo e doméstico sem fio com sucção ciclônica ultra-potente de 15.000Pa e bico 3 em 1.',
    category: 'Casa & Automotivo',
    price: '249,90',
    currency: 'BRL',
    benefits: [
      'Limpa farelos, poeira e pelos em cantos inacessíveis em segundos',
      'Sem fio, leve (380g) e recarregável via USB-C',
      'Filtro HEPA lavável e reutilizável',
    ],
    differentials: [
      'Motor brushless silencioso de 120W com 15.000 Pa de sucção',
      'Bateria de lítio de longa duração (até 35 min contínuos)',
      'Acessório extensor flexível para frestas de bancos e teclados',
    ],
    features: [
      'Corpo cilíndrico ergonômico em preto fosco com detalhes em LED azul',
      'Compartimento de poeira transparente de abertura com 1 clique',
    ],
    materials: 'Polímero ABS reforçado fosco com acabamento soft-touch e grade de ventilação em alumínio escovado',
    dimensions: '26cm x 6.5cm (380 gramas)',
    targetAudience: 'Motoristas exigentes, donos de pets e pessoas que prezam por ambientes e veículos impecáveis sem esforço',
    pains: [
      'Carro sujo de areia, farelos e poeira difícil de tirar nos lava-rápidos',
      'Aspiradores pesados com fios enormes que atrapalham a limpeza rápida',
    ],
    desires: [
      'Manter o interior do veículo com cheiro e aparência de carro zero km',
      'Resolver pequenas sujeiras instantaneamente com elegância',
    ],
    objections: [
      'A bateria dura o suficiente? (Sim, faz até 3 limpezas completas do carro)',
      'Tem força para aspirar areia grossa? (Sim, pressão de sucção de 15.000Pa)',
    ],
    salesArguments: [
      'Mais de 12.000 clientes satisfeitos e recomendação 4.9/5 estrelas',
      'Acompanha estojo rígido premium para guardar no porta-luvas',
    ],
    cta: 'Garanta o seu Turbo Cyclone Max com kit completo de bocais inclusos!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char_camila_ugc',
    name: 'Camila Santos (Criadora UGC)',
    ageGroup: '25-34',
    appearance: 'Jovem brasileira simpática, expressiva e comunicativa com sorriso carismático e natural.',
    hair: 'Cabelos castanhos médios ondulados com mechas iluminadas soltos sobre os ombros',
    eyes: 'Castanhos expressivos e calorosos',
    skinTone: 'Pele morena clara natural, iluminada e saudável',
    clothing: 'Camiseta básica de algodão off-white de corte casual moderno e jaqueta jeans leve aberta',
    accessories: 'Argolas douradas delicadas e anel minimalista',
    personality: 'Espontânea, entusiasmada, confiável, fala como uma amiga próxima recomendando um segredo incrível',
    profession: 'Criadora de Conteúdo UGC & Reviewer de Estilo de Vida',
    style: 'ugc_casual',
    voiceTone: 'Animada, dinâmica, natural, sem afetação ou postura de telejornal',
    language: 'pt_BR',
    distinctiveFeatures: 'Expressão facial vibrante ao demonstrar o produto, gestos naturais com as mãos',
    consistencyPrompt: 'Same Brazilian female creator Camila, 28 years old, wavy brunette hair with light highlights, friendly expressive face, soft natural makeup, wearing a casual off-white top, identical facial features and energetic warm smile across all scenes.',
    negativePrompt: 'Uncanny CGI skin, distorted fingers, excessive makeup, artificial studio stiffness, blank stare',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'char_rafael_tech',
    name: 'Rafael Moreira (Apresentador & Especialista)',
    ageGroup: '25-34',
    appearance: 'Homem atlético, barba curta bem desenhada, olhar atento e postura confiante de autoridade.',
    hair: 'Cabelo preto curto texturizado nas laterais',
    eyes: 'Pretos focados e persuasivos',
    skinTone: 'Moreno claro com textura de pele limpa e detalhada',
    clothing: 'Camisa polo preta minimalista de tecido tecnológico de corte ajustado',
    accessories: 'Smartwatch esportivo preto no pulso esquerdo',
    personality: 'Pragmático, direto, focado em testes de eficiência, desempenho e custo-benefício',
    profession: 'Especialista em Testes de Produtos & E-commerce',
    style: 'tech_reviewer',
    voiceTone: 'Firme, confiante, ritmo rápido e persuasivo',
    language: 'pt_BR',
    distinctiveFeatures: 'Mãos firmes ao manusear o produto e demonstrar os ângulos para a câmera',
    consistencyPrompt: 'Same Brazilian male presenter Rafael, 32 years old, short trimmed beard, neat dark crew cut hair, wearing a sleek black polo shirt, identical facial geometry, sharp jawline, confident authoritative presence across all scenes.',
    negativePrompt: 'Blurry face, extra fingers, cartoonish look, low contrast, washed out colors',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.ensureOutputDirectories(DEFAULT_SETTINGS.outputDirectory);
    this.data = this.load();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Could not create AppData data directory, using local fallback:', err);
    }
  }

  public ensureOutputDirectories(baseDir: string) {
    try {
      const subdirs = [
        'Campaigns',
        'Videos',
        'Prompts',
        'Scripts',
        'Exports',
        'Errors',
        'Media',
        'Products',
        'Characters',
        'References',
      ];
      for (const sub of subdirs) {
        const full = path.join(baseDir, sub);
        if (!fs.existsSync(full)) {
          fs.mkdirSync(full, { recursive: true });
        }
      }
    } catch (e) {
      console.warn('Could not create video output subdirectories:', e);
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings, hasEnvKey: Boolean(process.env.GEMINI_API_KEY) },
          bible: { ...DEFAULT_BIBLE, ...parsed.bible },
          campaigns: parsed.campaigns || [],
          queue: parsed.queue || [],
          library: parsed.library || [],
          media: parsed.media || [],
          products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
          characters: parsed.characters && parsed.characters.length > 0 ? parsed.characters : INITIAL_CHARACTERS,
          promptTemplates: parsed.promptTemplates || [],
          tiktokCreatives: parsed.tiktokCreatives || [],
          liveScripts: parsed.liveScripts || [],
          tiktokAccount: parsed.tiktokAccount || {
            status: 'NOT_CONNECTED',
            openApiAvailable: true,
            activeScopes: ['video.upload', 'video.publish', 'seller.product.read'],
            environment: 'production',
            documentationUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
          },
          tiktokProducts: parsed.tiktokProducts || [],
          videoAnalyses: parsed.videoAnalyses || [],
          orchestratedCampaigns: parsed.orchestratedCampaigns || [],
          campaignCreatives: parsed.campaignCreatives || [],
          customMethodConfigs: parsed.customMethodConfigs || {},
          logs: parsed.logs || [],
        };
      }
    } catch (e) {
      console.error('Error loading db.json, creating initial default state:', e);
    }

    const initial: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      bible: DEFAULT_BIBLE,
      campaigns: [],
      queue: [],
      library: [],
      media: [],
      products: INITIAL_PRODUCTS,
      characters: INITIAL_CHARACTERS,
      promptTemplates: [],
      tiktokCreatives: [],
      liveScripts: [],
      tiktokAccount: {
        status: 'NOT_CONNECTED',
        openApiAvailable: true,
        activeScopes: ['video.upload', 'video.publish', 'seller.product.read'],
        environment: 'production',
        documentationUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
      },
      tiktokProducts: [],
      videoAnalyses: [],
      orchestratedCampaigns: [],
      campaignCreatives: [],
      customMethodConfigs: {},
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Local Database initialized successfully with Products & Characters' }],
    };
    this.save(initial);
    return initial;
  }

  public save(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database to file:', e);
    }
  }

  public getSettings(): AppSettings {
    return {
      ...this.data.settings,
      hasEnvKey: Boolean(process.env.GEMINI_API_KEY),
      apiKeyConfigured: this.data.settings.apiKeyConfigured || Boolean(process.env.GEMINI_API_KEY),
    };
  }

  public updateSettings(partial: Partial<AppSettings>) {
    this.data.settings = { ...this.data.settings, ...partial };
    if (partial.outputDirectory) {
      this.ensureOutputDirectories(partial.outputDirectory);
    }
    this.save();
    return this.getSettings();
  }

  public getBible(): ProjectBible {
    return this.data.bible;
  }

  public updateBible(bible: Partial<ProjectBible>) {
    this.data.bible = { ...this.data.bible, ...bible, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.bible;
  }

  public getCampaigns(): CampaignFormData[] {
    return this.data.campaigns;
  }

  public saveCampaign(campaign: CampaignFormData) {
    const existingIndex = this.data.campaigns.findIndex((c) => c.id === campaign.id);
    if (existingIndex >= 0) {
      this.data.campaigns[existingIndex] = campaign;
    } else {
      this.data.campaigns.unshift(campaign);
    }
    this.save();
    return campaign;
  }

  public getQueue(): GenerationJob[] {
    return this.data.queue;
  }

  public setQueue(queue: GenerationJob[]) {
    this.data.queue = queue;
    this.save();
  }

  public addQueueJobs(jobs: GenerationJob[]) {
    this.data.queue.push(...jobs);
    this.save();
  }

  public updateQueueJob(jobId: string, updates: Partial<GenerationJob>) {
    const job = this.data.queue.find((j) => j.id === jobId);
    if (job) {
      Object.assign(job, updates);
      this.save();
    }
    return job;
  }

  public getLibrary(): SavedVideoItem[] {
    return this.data.library;
  }

  public addToLibrary(item: SavedVideoItem) {
    const existingIndex = this.data.library.findIndex((v) => v.id === item.id || v.jobId === item.jobId);
    if (existingIndex >= 0) {
      this.data.library[existingIndex] = item;
    } else {
      this.data.library.unshift(item);
    }
    this.save();
    return item;
  }

  public deleteFromLibrary(id: string) {
    this.data.library = this.data.library.filter((v) => v.id !== id);
    this.save();
  }

  // ==========================================
  // MEDIA ASSETS METHODS
  // ==========================================
  public getMedia(): MediaAsset[] {
    return this.data.media || [];
  }

  public addMedia(media: MediaAsset): MediaAsset {
    if (!this.data.media) this.data.media = [];
    const idx = this.data.media.findIndex((m) => m.id === media.id);
    if (idx >= 0) {
      this.data.media[idx] = media;
    } else {
      this.data.media.unshift(media);
    }
    this.save();
    return media;
  }

  public updateMedia(id: string, partial: Partial<MediaAsset>): MediaAsset | null {
    if (!this.data.media) this.data.media = [];
    const media = this.data.media.find((m) => m.id === id);
    if (media) {
      Object.assign(media, partial, { updatedAt: new Date().toISOString() });
      this.save();
      return media;
    }
    return null;
  }

  public deleteMedia(id: string): boolean {
    if (!this.data.media) return false;
    const media = this.data.media.find((m) => m.id === id);
    if (media) {
      try {
        if (media.filePath && fs.existsSync(media.filePath)) {
          fs.unlinkSync(media.filePath);
        }
      } catch (e) {
        console.warn('Error deleting media file from disk:', e);
      }
      this.data.media = this.data.media.filter((m) => m.id !== id);
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // PRODUCTS METHODS
  // ==========================================
  public getProducts(): Product[] {
    return this.data.products || [];
  }

  public getProductById(id: string): Product | null {
    return (this.data.products || []).find((p) => p.id === id) || null;
  }

  public saveProduct(product: Product): Product {
    if (!this.data.products) this.data.products = [];
    const existingIndex = this.data.products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      this.data.products[existingIndex] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      this.data.products.unshift({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.save();
    return product;
  }

  public deleteProduct(id: string): boolean {
    if (!this.data.products) return false;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // CHARACTERS METHODS
  // ==========================================
  public getCharacters(): Character[] {
    return this.data.characters || [];
  }

  public getCharacterById(id: string): Character | null {
    return (this.data.characters || []).find((c) => c.id === id) || null;
  }

  public saveCharacter(character: Character): Character {
    if (!this.data.characters) this.data.characters = [];
    const existingIndex = this.data.characters.findIndex((c) => c.id === character.id);
    if (existingIndex >= 0) {
      this.data.characters[existingIndex] = { ...character, updatedAt: new Date().toISOString() };
    } else {
      this.data.characters.unshift({ ...character, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.save();
    return character;
  }

  public deleteCharacter(id: string): boolean {
    if (!this.data.characters) return false;
    this.data.characters = this.data.characters.filter((c) => c.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // PROMPT TEMPLATES METHODS
  // ==========================================
  public getPromptTemplates(): PromptTemplate[] {
    return this.data.promptTemplates || [];
  }

  public savePromptTemplate(template: PromptTemplate): PromptTemplate {
    if (!this.data.promptTemplates) this.data.promptTemplates = [];
    const idx = this.data.promptTemplates.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      this.data.promptTemplates[idx] = template;
    } else {
      this.data.promptTemplates.unshift(template);
    }
    this.save();
    return template;
  }

  public deletePromptTemplate(id: string): boolean {
    if (!this.data.promptTemplates) return false;
    this.data.promptTemplates = this.data.promptTemplates.filter((t) => t.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // FASE 3: TIKTOK CREATIVES METHODS
  // ==========================================
  public getTikTokCreatives(): TikTokCreative[] {
    return this.data.tiktokCreatives || [];
  }

  public getTikTokCreativeById(id: string): TikTokCreative | null {
    return (this.data.tiktokCreatives || []).find((c) => c.id === id) || null;
  }

  public saveTikTokCreative(creative: TikTokCreative): TikTokCreative {
    if (!this.data.tiktokCreatives) this.data.tiktokCreatives = [];
    const idx = this.data.tiktokCreatives.findIndex((c) => c.id === creative.id);
    if (idx >= 0) {
      this.data.tiktokCreatives[idx] = { ...creative, updatedAt: new Date().toISOString() };
    } else {
      this.data.tiktokCreatives.unshift({
        ...creative,
        createdAt: creative.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return creative;
  }

  public deleteTikTokCreative(id: string): boolean {
    if (!this.data.tiktokCreatives) return false;
    this.data.tiktokCreatives = this.data.tiktokCreatives.filter((c) => c.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // FASE 3: LIVE SCRIPTS METHODS
  // ==========================================
  public getLiveScripts(): LiveSalesScript[] {
    return this.data.liveScripts || [];
  }

  public getLiveScriptById(id: string): LiveSalesScript | null {
    return (this.data.liveScripts || []).find((s) => s.id === id) || null;
  }

  public saveLiveScript(script: LiveSalesScript): LiveSalesScript {
    if (!this.data.liveScripts) this.data.liveScripts = [];
    const idx = this.data.liveScripts.findIndex((s) => s.id === script.id);
    if (idx >= 0) {
      this.data.liveScripts[idx] = { ...script, updatedAt: new Date().toISOString() };
    } else {
      this.data.liveScripts.unshift({
        ...script,
        createdAt: script.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return script;
  }

  public deleteLiveScript(id: string): boolean {
    if (!this.data.liveScripts) return false;
    this.data.liveScripts = this.data.liveScripts.filter((s) => s.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // FASE 3: TIKTOK ACCOUNT & SHOP PRODUCTS METHODS
  // ==========================================
  public getTikTokAccount(): TikTokAccountInfo {
    return (
      this.data.tiktokAccount || {
        status: 'NOT_CONNECTED',
        openApiAvailable: true,
        activeScopes: ['video.upload', 'video.publish', 'seller.product.read'],
        environment: 'production',
        documentationUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
      }
    );
  }

  public updateTikTokAccount(account: Partial<TikTokAccountInfo>): TikTokAccountInfo {
    this.data.tiktokAccount = {
      ...(this.data.tiktokAccount || {
        status: 'NOT_CONNECTED',
        openApiAvailable: true,
        activeScopes: [],
        environment: 'production',
      }),
      ...account,
    };
    this.save();
    return this.data.tiktokAccount;
  }

  public getTikTokProducts(): TikTokShopProduct[] {
    return this.data.tiktokProducts || [];
  }

  public saveTikTokProduct(prod: TikTokShopProduct): TikTokShopProduct {
    if (!this.data.tiktokProducts) this.data.tiktokProducts = [];
    const idx = this.data.tiktokProducts.findIndex((p) => p.id === prod.id || (prod.sku && p.sku === prod.sku));
    if (idx >= 0) {
      this.data.tiktokProducts[idx] = prod;
    } else {
      this.data.tiktokProducts.unshift(prod);
    }
    this.save();
    return prod;
  }

  public deleteTikTokProduct(id: string): boolean {
    if (!this.data.tiktokProducts) return false;
    this.data.tiktokProducts = this.data.tiktokProducts.filter((p) => p.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // FASE 4: VIDEO ANALYSES METHODS
  // ==========================================
  public getVideoAnalyses(): VideoAnalysisItem[] {
    return this.data.videoAnalyses || [];
  }

  public getVideoAnalysisById(id: string): VideoAnalysisItem | null {
    return (this.data.videoAnalyses || []).find((a) => a.id === id) || null;
  }

  public saveVideoAnalysis(item: VideoAnalysisItem): VideoAnalysisItem {
    if (!this.data.videoAnalyses) this.data.videoAnalyses = [];
    const idx = this.data.videoAnalyses.findIndex((a) => a.id === item.id);
    if (idx >= 0) {
      this.data.videoAnalyses[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      this.data.videoAnalyses.unshift({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return item;
  }

  public deleteVideoAnalysis(id: string): boolean {
    if (!this.data.videoAnalyses) return false;
    this.data.videoAnalyses = this.data.videoAnalyses.filter((a) => a.id !== id);
    this.save();
    return true;
  }

  // ==========================================
  // FASE 5: ORCHESTRATED CAMPAIGNS METHODS
  // ==========================================
  public getOrchestratedCampaigns(): OrchestratedCampaign[] {
    return this.data.orchestratedCampaigns || [];
  }

  public getOrchestratedCampaignById(id: string): OrchestratedCampaign | null {
    return (this.data.orchestratedCampaigns || []).find((c) => c.id === id) || null;
  }

  public saveOrchestratedCampaign(campaign: OrchestratedCampaign): OrchestratedCampaign {
    if (!this.data.orchestratedCampaigns) this.data.orchestratedCampaigns = [];
    const idx = this.data.orchestratedCampaigns.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) {
      this.data.orchestratedCampaigns[idx] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      this.data.orchestratedCampaigns.unshift({
        ...campaign,
        createdAt: campaign.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return campaign;
  }

  public deleteOrchestratedCampaign(id: string): boolean {
    if (!this.data.orchestratedCampaigns) return false;
    this.data.orchestratedCampaigns = this.data.orchestratedCampaigns.filter((c) => c.id !== id);
    // Also delete associated creatives
    if (this.data.campaignCreatives) {
      this.data.campaignCreatives = this.data.campaignCreatives.filter((cr) => cr.campaignId !== id);
    }
    this.save();
    return true;
  }

  // ==========================================
  // FASE 5: CAMPAIGN CREATIVES METHODS
  // ==========================================
  public getCampaignCreatives(campaignId?: string): CampaignCreativeItem[] {
    const list = this.data.campaignCreatives || [];
    if (campaignId) {
      return list.filter((cr) => cr.campaignId === campaignId);
    }
    return list;
  }

  public getCampaignCreativeById(id: string): CampaignCreativeItem | null {
    return (this.data.campaignCreatives || []).find((cr) => cr.id === id) || null;
  }

  public saveCampaignCreative(creative: CampaignCreativeItem): CampaignCreativeItem {
    if (!this.data.campaignCreatives) this.data.campaignCreatives = [];
    const idx = this.data.campaignCreatives.findIndex((cr) => cr.id === creative.id);
    if (idx >= 0) {
      this.data.campaignCreatives[idx] = { ...creative, updatedAt: new Date().toISOString() };
    } else {
      this.data.campaignCreatives.unshift({
        ...creative,
        createdAt: creative.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return creative;
  }

  public deleteCampaignCreative(id: string): boolean {
    if (!this.data.campaignCreatives) return false;
    this.data.campaignCreatives = this.data.campaignCreatives.filter((cr) => cr.id !== id);
    this.save();
    return true;
  }

  public duplicateCampaignCreative(id: string): CampaignCreativeItem | null {
    const original = this.getCampaignCreativeById(id);
    if (!original) return null;

    // Count existing versions for this base creative
    const parentId = original.parentCreativeId || original.id;
    const allVersions = (this.data.campaignCreatives || []).filter(
      (c) => c.id === parentId || c.parentCreativeId === parentId
    );
    const nextVersionNum = allVersions.length + 1;

    const duplicated: CampaignCreativeItem = {
      ...original,
      id: `creative_${Date.now()}_v${nextVersionNum}_${Math.random().toString(36).substring(2, 6)}`,
      parentCreativeId: parentId,
      version: `version ${nextVersionNum}`,
      status: 'DRAFT',
      jobId: undefined,
      publishedTikTokId: undefined,
      publishStatusDetails: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveCampaignCreative(duplicated);
    return duplicated;
  }


  public getCustomMethodConfig(methodId: string) {
    return this.data.customMethodConfigs[methodId] || null;
  }

  public setCustomMethodConfig(methodId: string, config: any) {
    this.data.customMethodConfigs[methodId] = config;
    this.save();
  }

  public log(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    this.data.logs.unshift({
      timestamp: new Date().toISOString(),
      level,
      message,
      details: details ? (typeof details === 'object' ? JSON.stringify(details).slice(0, 300) : String(details)) : undefined,
    });
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(0, 500);
    }
    this.save();
  }
}

export const db = new LocalDatabase();

