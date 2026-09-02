import { db } from '../db';
import { promptProviders, PromptGenerationResult } from '../providers/promptProviders';
import {
  Character,
  CharacterWithProductConfig,
  Product,
  PromptPresetType,
  PromptStudioConfig,
  SalesMethodId,
} from '../../src/types';
import { SALES_METHODS } from '../../src/data/salesMethods';

export const PROMPT_STUDIO_PRESETS: Record<
  PromptPresetType,
  {
    title: string;
    description: string;
    defaults: Partial<PromptStudioConfig>;
  }
> = {
  ugc: {
    title: 'UGC Autêntico Smartphone',
    description: 'Estilo influenciador/criador no TikTok/Instagram, ângulo selfie, linguagem natural e espontânea.',
    defaults: {
      platform: 'tiktok_ugc',
      objective: 'ugc_conversion',
      salesMethodId: 'ugc',
      scenario: 'Quarto ou sala aconchegante com iluminação suave de janela e ring-light',
      action: 'Segurando o produto próximo à câmera do celular, demonstrando o uso prático com reação genuína de surpresa e alívio',
      cameraAngle: 'Selfie vertical na altura do peito com leve ângulo superior',
      lens: 'Lente grande-angular de smartphone (24mm equivalente)',
      cameraMovement: 'Handheld orgânico com micro-movimentos naturais sem tripé',
      lighting: 'Ring-light frontal suave combinada com luz natural de ambiente',
      visualStyle: 'Vídeo vertical nativo para TikTok/Reels em 4K 60fps, cores vivas e textura real',
      emotion: 'Entusiasmada, espontânea e aliviada por encontrar a solução ideal',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  pov: {
    title: 'POV Primeira Pessoa Imersivo',
    description: 'Câmera na perspectiva dos olhos do usuário interagindo diretamente com o produto.',
    defaults: {
      platform: 'veo',
      objective: 'direct_sales',
      salesMethodId: 'pov',
      scenario: 'Ambiente de uso real (bancada de cozinha, painel de carro ou mesa de escritório)',
      action: 'Mãos em primeiro plano desempacotando, segurando e ativando o mecanismo do produto com um simples toque',
      cameraAngle: 'Visão exata dos olhos do usuário (POV em primeira pessoa)',
      lens: '35mm anamórfica de alta nitidez',
      cameraMovement: 'Movimento estável de cabeça e inclinação natural acompanhando as mãos',
      lighting: 'Luz direta limpa com reflexos realistas nos materiais do produto',
      visualStyle: 'Comercial cinematográfico imersivo com profundidade de campo rasa',
      emotion: 'Sensação tátil de satisfação imediata e precisão',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  direct_ad: {
    title: 'Anúncio Direto de Alta Conversão',
    description: 'Roteiro direto focado em dor, solução e chamada de ação imediata.',
    defaults: {
      platform: 'veo',
      objective: 'direct_sales',
      salesMethodId: 'china',
      scenario: 'Estúdio comercial minimalista com fundo em degradê escuro e fumaça sutil',
      action: 'Apresentador demonstra a diferença brutal antes e depois do uso do produto com corte dinâmico',
      cameraAngle: 'Plano médio frontal com zoom rápido de impacto no produto',
      lens: '50mm prime f/1.4',
      cameraMovement: 'Whip-pan rápido seguido de dolly-in com trava no produto',
      lighting: 'Luz de recorte neon ciano e âmbar com softbox frontal potente',
      visualStyle: 'Estética comercial de e-commerce internacional com alto contraste',
      emotion: 'Confiante, urgente e enérgica',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '1080p',
    },
  },
  demo: {
    title: 'Demonstração de Produto / Mecanismo',
    description: 'Foco nos detalhes, materiais, mecanismo interno e teste de estresse.',
    defaults: {
      platform: 'veo',
      objective: 'product_demo',
      salesMethodId: 'demo',
      scenario: 'Bancada técnica de testes em acrílico iluminada',
      action: 'Câmera macro desliza sobre o acabamento do produto enquanto ele executa sua função principal sem falhas',
      cameraAngle: 'Ângulo de 45 graus com transição para macro detalhe',
      lens: 'Lente probe macro 24mm f/14',
      cameraMovement: 'Slow-motion dolly deslizando rente aos detalhes mecânicos',
      lighting: 'Iluminação técnica de precisão destacando texturas e relevos',
      visualStyle: 'Filme publicitário de alta tecnologia industrial com 8K textures',
      emotion: 'Impressionada com a precisão e robustez',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '1080p',
    },
  },
  testimonial: {
    title: 'Depoimento Emocional Real',
    description: 'História de transformação pessoal com relato sincero.',
    defaults: {
      platform: 'tiktok_ugc',
      objective: 'ugc_conversion',
      salesMethodId: 'testimonial',
      scenario: 'Ambiente doméstico relaxado e bem iluminado',
      action: 'Personagem segura o produto com carinho, olha nos olhos da audiência e conta como o produto resolveu sua dor',
      cameraAngle: 'Plano fechado no rosto e produto',
      lens: '35mm com desfoque de fundo agradável',
      cameraMovement: 'Câmera suave e acolhedora na altura dos olhos',
      lighting: 'Luz quente de fim de tarde entrando pela janela',
      visualStyle: 'Documentário cinematográfico intimista',
      emotion: 'Gratidão, honestidade e felicidade genuína',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  storytelling: {
    title: 'Storytelling & Jornada do Herói',
    description: 'Narrativa envolvente do momento de crise até a vitória.',
    defaults: {
      platform: 'veo',
      objective: 'brand_awareness',
      salesMethodId: 'heros_journey',
      scenario: 'Cenário cotidiano mostrando o obstáculo e em seguida a superação elegante',
      action: 'Protagonista supera o momento de estresse usando o produto com facilidade impecável',
      cameraAngle: 'Plano cinematográfico clássico',
      lens: '35mm anamórfica',
      cameraMovement: 'Traveling lateral contínuo',
      lighting: 'Transição de luz fria e tensa para luz dourada e calorosa',
      visualStyle: 'Estilo filme comercial de cinema',
      emotion: 'Determinação seguida de triunfo e tranquilidade',
      durationSeconds: 8,
      aspectRatio: '16:9',
      resolution: '1080p',
    },
  },
  transformation: {
    title: 'Transformação Antes vs. Depois',
    description: 'Comparativo visual instantâneo e impactante.',
    defaults: {
      platform: 'veo',
      objective: 'direct_sales',
      salesMethodId: 'conflict_turnaround',
      scenario: 'Divisão sutil de tela ou transição visual sem corte',
      action: 'De um lado o caos sem o produto, e do outro a perfeição imediata com o produto funcionando',
      cameraAngle: 'Plano centralizado simétrico',
      lens: '50mm',
      cameraMovement: 'Pan horizontal rápido revelando a transformação',
      lighting: 'Luz de contraste alto',
      visualStyle: 'Vídeo de transformação viral para anúncios de performance',
      emotion: 'Choque visual e desejo imediato',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  comparison: {
    title: 'Comparação: Nosso Produto vs. Comum',
    description: 'Evidencia a superioridade técnica e estética contra alternativas genéricas.',
    defaults: {
      platform: 'veo',
      objective: 'direct_sales',
      salesMethodId: 'comparison',
      scenario: 'Bancada limpa de teste lado a lado',
      action: 'O produto concorrente quebra ou falha miseravelmente, enquanto o nosso produto se destaca com facilidade',
      cameraAngle: 'Top-down (visão superior) para plano frontal',
      lens: '35mm',
      cameraMovement: 'Dolly para trás exibindo os dois produtos',
      lighting: 'Luz de laboratório de alta precisão',
      visualStyle: 'Comparativo irrefutável com clareza visual',
      emotion: 'Convicção absoluta de superioridade',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  offer: {
    title: 'Oferta Irresistível & Escassez',
    description: 'Foco total na condição especial, bônus e CTA agressivo.',
    defaults: {
      platform: 'veo',
      objective: 'direct_sales',
      salesMethodId: 'fomo',
      scenario: 'Ambiente dinâmico com caixas e kits sendo montados para envio',
      action: 'Apresentador segura o kit completo nas mãos e aponta para a oferta exclusiva de tempo limitado',
      cameraAngle: 'Ângulo frontal enérgico',
      lens: '28mm grande-angular dinâmica',
      cameraMovement: 'Push-in rápido',
      lighting: 'Vibrante e festiva com brilhos dourados',
      visualStyle: 'Comercial de vendas de alto impacto e conversão',
      emotion: 'Urgência e empolgação contagiante',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  viral: {
    title: 'Gancho Viral de Alta Retenção',
    description: 'Roteiro desenhado para parar o feed no primeiro segundo.',
    defaults: {
      platform: 'tiktok_ugc',
      objective: 'viral_retention',
      salesMethodId: 'curiosity',
      scenario: 'Cenário inesperado e intrigante que gera curiosidade visual imediata',
      action: 'Ação bizarra ou curiosa nos primeiros 1.5 segundos que só é explicada pelo produto inovador',
      cameraAngle: 'Plano aberto rápido fechando em zoom no segredo',
      lens: '24mm',
      cameraMovement: 'Zoom óptico rápido (crash zoom)',
      lighting: 'Natural de alto impacto',
      visualStyle: 'Feed-stopper nativo do TikTok',
      emotion: 'Curiosidade extrema e revelação',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  tiktok_shop: {
    title: 'TikTok Shop / Live Commerce',
    description: 'Formato voltado para vitrine de produtos e compra em 1 clique.',
    defaults: {
      platform: 'tiktok_ugc',
      objective: 'direct_sales',
      salesMethodId: 'drive_thru',
      scenario: 'Estúdio moderno de criadores com arara de produtos ou bancada de unboxing',
      action: 'Apresentação expressa das 3 funções principais com o produto em mãos e apontando para o botão do carrinho',
      cameraAngle: 'Vertical selfie 9:16',
      lens: '24mm',
      cameraMovement: 'Câmera dinâmica móvel',
      lighting: 'Ring-light potente e limpa',
      visualStyle: 'Live commerce dinâmico do TikTok Shop',
      emotion: 'Entusiasmo contagiante de compra',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  live: {
    title: 'Estilo Transmissão ao Vivo',
    description: 'Interação direta como se estivesse respondendo ao chat da audiência.',
    defaults: {
      platform: 'tiktok_ugc',
      objective: 'ugc_conversion',
      salesMethodId: 'social_selling',
      scenario: 'Fundo desfocado com luzes de LED e ambiente descontraído',
      action: 'Criador lê uma dúvida imaginária na tela e pega o produto para provar que a dúvida foi resolvida',
      cameraAngle: 'Direto nos olhos do espectador',
      lens: '35mm',
      cameraMovement: 'Leve respiração de câmera handheld',
      lighting: 'Luz de streamer moderna',
      visualStyle: 'Transmissão ao vivo autêntica',
      emotion: 'Conectividade humana e transparência',
      durationSeconds: 8,
      aspectRatio: '9:16',
      resolution: '720p',
    },
  },
  premium_product: {
    title: 'Produto Premium & Luxo',
    description: 'Estética de alta joalheria, perfumaria e produtos de luxo com planos lentos.',
    defaults: {
      platform: 'veo',
      objective: 'brand_awareness',
      salesMethodId: 'status_desire',
      scenario: 'Mármore nero marquina com gotas de água cristalina e reflexos dourados',
      action: 'O produto surge suavemente em meio a partículas de luz, com foco perfeito no design e materiais nobres',
      cameraAngle: 'Ângulo baixo de autoridade (low angle) com rotação lenta',
      lens: '85mm f/1.2 de máxima nitidez',
      cameraMovement: 'Movimento de braço robótico super suave a 120fps',
      lighting: 'Iluminação automotiva de estúdio esculpindo as arestas',
      visualStyle: 'Comercial de luxo suíço / alta perfumaria',
      emotion: 'Desejo de status, sofisticação e admiração',
      durationSeconds: 8,
      aspectRatio: '16:9',
      resolution: '1080p',
    },
  },
};

export class PromptStudioEngine {
  public generateCharacterConsistencyPrompt(character: Partial<Character>): string {
    const parts = [
      `Same character ${character.name || 'Subject'},`,
      character.ageGroup && character.ageGroup !== 'custom' ? `${character.ageGroup} years old,` : character.customAge || '',
      character.appearance || '',
      character.hair ? `with ${character.hair},` : '',
      character.skinTone ? `${character.skinTone} skin tone,` : '',
      character.eyes ? `${character.eyes} eyes,` : '',
      character.clothing ? `wearing ${character.clothing},` : '',
      character.accessories ? `wearing ${character.accessories},` : '',
      character.distinctiveFeatures ? `distinctive features: ${character.distinctiveFeatures},` : '',
      'strictly maintaining identical facial structure, hair color, skin texture and attire across all camera angles and scenes.',
    ];
    return parts.filter(Boolean).join(' ');
  }

  public generatePrompt(config: PromptStudioConfig): PromptGenerationResult {
    const provider = promptProviders[config.platform] || promptProviders.veo;

    const product = config.productId ? db.getProductById(config.productId) : null;
    const character = config.characterId ? db.getCharacterById(config.characterId) : null;

    return provider.formatPrompt(config, product, character);
  }

  public generateCharacterWithProduct(config: CharacterWithProductConfig): PromptGenerationResult {
    const product = db.getProductById(config.productId);
    const character = db.getCharacterById(config.characterId);

    if (!product || !character) {
      throw new Error('Produto ou Personagem não encontrado para a geração.');
    }

    const provider = promptProviders.veo;
    return provider.formatCharacterWithProduct(config, product, character);
  }
}

export const promptStudioEngine = new PromptStudioEngine();
