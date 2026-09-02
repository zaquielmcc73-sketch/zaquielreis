import {
  Product,
  ProjectBible,
  SalesMethodId,
  TikTokCta,
  TikTokCtaCategory,
  TikTokHook,
  TikTokHookCategory,
  TikTokScript,
  TikTokScriptBlock,
  TikTokVideoType,
} from '../../src/types';

export interface GenerateHooksOptions {
  productName?: string;
  targetAudience?: string;
  pain?: string;
  desire?: string;
  count?: number;
  categories?: TikTokHookCategory[];
  product?: Product | null;
  bible?: ProjectBible | null;
  customProduct?: string;
  salesMethodId?: SalesMethodId;
  selectedCategories?: TikTokHookCategory[];
}

export interface GenerateCtasOptions {
  productName?: string;
  offer?: string;
  count?: number;
  categories?: TikTokCtaCategory[];
  product?: Product | null;
  bible?: ProjectBible | null;
  customProduct?: string;
  selectedCategories?: TikTokCtaCategory[];
}

export interface GenerateScriptOptions {
  productName: string;
  targetAudience?: string;
  pain?: string;
  desire?: string;
  benefit?: string;
  offer?: string;
  salesMethodId: SalesMethodId;
  videoType: TikTokVideoType;
  duration: 15 | 30 | 45 | 60;
  aspectRatio: '9:16' | '16:9' | '1:1';
  hook: TikTokHook;
  cta: TikTokCta;
  characterName?: string;
  scenario?: string;
  visualStyle?: string;
  tone?: string;
}

export const HOOK_CATEGORY_LABELS: Record<TikTokHookCategory, string> = {
  curiosity: 'Curiosidade & Segredo',
  controversy: 'Opinião Forte / Polêmica Leve',
  problem_solution: 'Problema Imediato & Solução',
  transformation: 'Transformação & Antes/Depois',
  secret_tip: 'Dica Exclusiva / Hack',
  proof: 'Prova Social & Demonstração',
  urgency: 'Oportunidade & Agilidade',
  unboxing: 'Unboxing & Primeira Impressão',
  comparison: 'Comparação & Teste Cego',
  aesthetic: 'ASMR / Satisfatório / Visual',
  pain: 'Dor Latente',
  benefit: 'Benefício Imediato',
  surprise: 'Surpresa / Espanto',
  demo: 'Demonstração em Ação',
  common_error: 'Erro Comum do Público',
  before_after: 'Antes e Depois',
  objection: 'Quebra de Objeção',
  question: 'Pergunta Instigante',
  pattern_interrupt: 'Quebra de Padrão',
  contrarian: 'Visão Contrariana',
  storytelling: 'Storytelling Viral',
  status: 'Status & Reconhecimento',
  economy: 'Economia Real',
};

export const CTA_CATEGORY_LABELS: Record<TikTokCtaCategory, string> = {
  immediate_purchase: 'Compra Imediata',
  yellow_cart: 'Sacolinha Amarela (TikTok Shop)',
  limited_offer: 'Oferta Especial / Condição',
  free_shipping: 'Frete Grátis / Vantagem',
  coupon: 'Cupom de Desconto',
  tiktok_shop: 'Garantia TikTok Shop',
  click_product: 'Toque no Produto',
  view_product: 'Ver Detalhes na Vitrine',
  enjoy_condition: 'Aproveite a Condição',
  last_opportunity: 'Disponibilidade Regional',
  benefit: 'Foco no Benefício',
  urgency: 'Urgência Ética',
  scarcity: 'Disponibilidade Real',
  curiosity: 'Curiosidade de Preço',
  proof: 'Prova de Satisfação',
  offer: 'Oferta de Lançamento',
};

export const SALES_METHODS_DATA: Array<{ id: SalesMethodId; name: string; category: string; description: string }> = [
  {
    id: 'ugc',
    name: 'UGC Autêntico',
    category: 'Conversão Social',
    description: 'Estilo criador nativo de smartphone, falando espontaneamente sobre a experiência com o produto.',
  },
  {
    id: 'china',
    name: 'Método Chinês de Alta Conversão',
    category: 'E-commerce Ágil',
    description: 'Cortes rápidos a cada 1-2s, demonstração de estresse extrema, foco no mecanismo e oferta agressiva.',
  },
  {
    id: 'pain_solution',
    name: 'Problema & Solução Clássico',
    category: 'Dor & Alívio',
    description: 'Exposição da frustração diária com corte dinâmico para a solução imediata e transformadora.',
  },
  {
    id: 'demo',
    name: 'Demonstração Prática & Mecanismo',
    category: 'Clareza & Prova',
    description: 'Foco total no funcionamento, ergonomia, facilidade de uso e entrega prática de valor.',
  },
  {
    id: 'storytelling',
    name: 'Unboxing Sensorial',
    category: 'Experiência & ASMR',
    description: 'Abertura da embalagem com sons táteis, primeira impressão, acabamento e encaixe perfeito.',
  },
  {
    id: 'heros_journey',
    name: 'Mini Storytelling & Transformação',
    category: 'Conexão Emocional',
    description: 'História rápida de superação: como o protagonista saiu do caos para a facilidade total.',
  },
];

export class TikTokScriptEngine {
  /**
   * Gera hooks classificados por categoria com suporte ético e sem falsas escassezes.
   */
  public generateHooks(options: GenerateHooksOptions): TikTokHook[] {
    const {
      productName,
      product,
      bible,
      customProduct,
      targetAudience = product?.targetAudience || bible?.targetAudience || 'quem busca praticidade e resultados reais',
      pain = product?.pains?.[0] || bible?.pains?.[0] || 'perder tempo com métodos complicados',
      desire = product?.desires?.[0] || bible?.desires?.[0] || 'resolver isso de forma simples e rápida',
      count = 10,
      categories,
      selectedCategories,
    } = options;

    const targetCategories: TikTokHookCategory[] =
      selectedCategories && selectedCategories.length > 0
        ? selectedCategories
        : categories && categories.length > 0
        ? categories
        : (Object.keys(HOOK_CATEGORY_LABELS) as TikTokHookCategory[]);

    const pName = productName || product?.name || bible?.productName || customProduct || 'este produto';

    const hookTemplates: Partial<
      Record<
        TikTokHookCategory,
        Array<{
          text: string;
          action: string;
          level: 'ALTO' | 'MUITO_ALTO' | 'EXPLOSIVO';
          duration: number;
          sound: string;
        }>
      >
    > = {
      curiosity: [
        {
          text: 'Eu testei o ' + pName + ' por 7 dias seguidos e não imaginava que isso fosse acontecer...',
          action: 'Apresentador olha diretamente para a lente com expressão de espanto e aproxima o produto da câmera.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'Whoosh dinâmico + Batida grave',
        },
        {
          text: 'Se você ainda usa o método tradicional para ' + pain + ', você precisa ver isso agora!',
          action: 'Gesto de pare com a mão e transição rápida para close do produto.',
          level: 'ALTO',
          duration: 3,
          sound: 'Efeito sonoro de parada / Stop effect',
        },
      ],
      controversy: [
        {
          text: 'Muita gente diz que ' + pName + ' não vale a pena, mas olha o que aconteceu quando coloquei à prova...',
          action: 'Mostra o produto sendo submetido a um teste de uso prático imediato sem cortes.',
          level: 'EXPLOSIVO',
          duration: 3,
          sound: 'Sintetizador tenso com resolução rápida',
        },
        {
          text: 'Vou falar a verdade sobre o ' + pName + ' que quase ninguém no TikTok tem coragem de mostrar!',
          action: 'Aproximação rápida da câmera estilo confidência/segredo.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'Swoosh de proximidade',
        },
      ],
      problem_solution: [
        {
          text: 'Cansado de ' + pain + '? Foi exatamente por isso que criaram o ' + pName + '!',
          action: 'Demonstra a frustração do problema nos primeiros 1.5s e revela o produto com iluminação limpa.',
          level: 'ALTO',
          duration: 3,
          sound: 'Transição sombria para som cristalino',
        },
        {
          text: 'Se você sofre com ' + pain + ', isso aqui vai economizar horas da sua rotina!',
          action: 'Apresentador segura o produto apontando para os detalhes que eliminam o problema.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'Pop sonoro de revelação',
        },
      ],
      transformation: [
        {
          text: 'Olha o antes e depois de usar o ' + pName + ' na minha rotina!',
          action: 'Tela dividida mostrando o estado inicial e o resultado perfeito após o uso.',
          level: 'EXPLOSIVO',
          duration: 3,
          sound: 'Click duplo + Transição visual',
        },
        {
          text: 'De um dia caótico para ' + desire + ' em menos de 2 minutos usando isso aqui...',
          action: 'Mudança de iluminação de fria para quente e vibrante com sorriso de alívio.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'Efeito sonoro de elevação / Sparkle',
        },
      ],
      secret_tip: [
        {
          text: 'O segredo que quase ninguém conhece para ' + desire + ' direto de casa!',
          action: 'Gesto de dedo indicador convidando a audiência a prestar atenção nos detalhes.',
          level: 'ALTO',
          duration: 3,
          sound: 'Sussurro suave + Ding de notificação',
        },
        {
          text: 'Hack definitivo do TikTok Shop para ' + pain + ' de uma vez por todas!',
          action: 'Close macro nos botões e acabamento premium do produto.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'Som futurista de confirmação',
        },
      ],
      proof: [
        {
          text: 'Mais de 10.000 pessoas avaliaram o ' + pName + ' no TikTok Shop e agora entendi o motivo!',
          action: 'Mostra o produto sendo usado e funcionando com perfeição instantânea.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'Campainha de sucesso',
        },
        {
          text: 'Fiz o teste definitivo ao vivo para ver se o ' + pName + ' realmente entrega o que promete...',
          action: 'Demonstração sem cortes do produto desempenhando sua função principal.',
          level: 'EXPLOSIVO',
          duration: 3,
          sound: 'Batida rítmica enérgica',
        },
      ],
      urgency: [
        {
          text: 'Se você viu esse vídeo no seu feed, é a oportunidade perfeita para garantir ' + pName + ' com frete especial!',
          action: 'Aponta rapidamente para a sacolinha amarela no canto inferior com entusiasmo genuíno.',
          level: 'ALTO',
          duration: 3,
          sound: 'Som de notificação de oferta',
        },
      ],
      unboxing: [
        {
          text: 'Acabou de chegar a minha encomenda do TikTok Shop e a qualidade do ' + pName + ' me surpreendeu!',
          action: 'Corta fita adesiva com som satisfatório (ASMR) e retira o produto brilhando da caixa.',
          level: 'MUITO_ALTO',
          duration: 3,
          sound: 'ASMR fita + Abertura crocante',
        },
      ],
      comparison: [
        {
          text: 'Produto barato vs ' + pName + ' original: a diferença vai te chocar!',
          action: 'Compara lado a lado os dois itens demonstrando a robustez do modelo oficial.',
          level: 'EXPLOSIVO',
          duration: 3,
          sound: 'Tensão de vs + Impacto sonoro',
        },
      ],
      aesthetic: [
        {
          text: 'O vídeo mais satisfatório de ' + pName + ' que você vai ver hoje...',
          action: 'Enquadramento ultra limpo, iluminação estética suave e movimento fluido do produto.',
          level: 'ALTO',
          duration: 3,
          sound: 'Música lofi suave + Sons táteis puros',
        },
      ],
    };

    const hooks: TikTokHook[] = [];
    let idx = 0;

    while (hooks.length < count) {
      for (const cat of targetCategories) {
        if (hooks.length >= count) break;
        const list = hookTemplates[cat] || hookTemplates.curiosity;
        const item = list[idx % list.length];

        hooks.push({
          id: 'hook_' + cat + '_' + (idx + 1) + '_' + Math.random().toString(36).substring(2, 7),
          text: item.text,
          category: cat,
          categoryLabel: HOOK_CATEGORY_LABELS[cat] || cat,
          retentionScore: item.level === 'EXPLOSIVO' ? 98 : item.level === 'MUITO_ALTO' ? 93 : 87,
          retentionLevel: item.level,
          visualSuggestion: item.action,
          audioEffect: item.sound,
          estimatedDurationSeconds: item.duration,
        });
      }
      idx++;
    }

    return hooks.slice(0, count);
  }

  /**
   * Gera CTAs orientados ao TikTok Shop com conformidade total.
   */
  public generateCtas(options: GenerateCtasOptions): TikTokCta[] {
    const {
      productName,
      product,
      bible,
      customProduct,
      offer = bible?.irresistibleOffer || 'condições especiais no checkout',
      count = 8,
      categories,
      selectedCategories,
    } = options;

    const targetCategories: TikTokCtaCategory[] =
      selectedCategories && selectedCategories.length > 0
        ? selectedCategories
        : categories && categories.length > 0
        ? categories
        : (Object.keys(CTA_CATEGORY_LABELS) as TikTokCtaCategory[]);

    const pName = productName || product?.name || bible?.productName || customProduct || 'o produto';

    const ctaTemplates: Record<
      TikTokCtaCategory,
      Array<{
        text: string;
        emotion: string;
        placement: 'on_screen_text' | 'voiceover' | 'both';
        compliance: string;
      }>
    > = {
      immediate_purchase: [
        {
          text: 'Garanta o seu ' + pName + ' agora mesmo tocando na sacolinha amarela!',
          emotion: 'Decisão rápida',
          placement: 'both',
          compliance: 'Clareza de ação e redirecionamento oficial',
        },
        {
          text: 'Faça seu pedido diretamente pelo TikTok com total garantia e segurança!',
          emotion: 'Segurança',
          placement: 'both',
          compliance: 'Processamento oficial e seguro',
        },
      ],
      yellow_cart: [
        {
          text: 'O link oficial está aqui na sacolinha amarela, bem no cantinho da tela!',
          emotion: 'Orientação clara',
          placement: 'both',
          compliance: 'Referência ao botão nativo do TikTok Shop',
        },
        {
          text: 'Toque na sacolinha amarela para conferir a disponibilidade e os modelos!',
          emotion: 'Curiosidade',
          placement: 'both',
          compliance: 'Linguagem ética de estoque real',
        },
      ],
      limited_offer: [
        {
          text: 'Aproveite esta condição especial tocando no botão de compra abaixo!',
          emotion: 'Oportunidade',
          placement: 'both',
          compliance: 'Condição promocional legítima',
        },
      ],
      free_shipping: [
        {
          text: 'Confira se o seu endereço tem frete grátis liberado na sacolinha amarela!',
          emotion: 'Economia',
          placement: 'both',
          compliance: 'Verificação em tempo real por CEP',
        },
      ],
      coupon: [
        {
          text: 'Resgate o cupom de primeira compra direto na sacola antes de finalizar!',
          emotion: 'Economia real',
          placement: 'both',
          compliance: 'Cupons oficiais da loja',
        },
      ],
      tiktok_shop: [
        {
          text: 'Compre com total segurança e garantia oficial diretamente no TikTok Shop!',
          emotion: 'Confiança na plataforma',
          placement: 'both',
          compliance: 'Processamento oficial TikTok Shop',
        },
      ],
      click_product: [
        {
          text: 'Toque na sacolinha amarela no canto inferior esquerdo para comprar agora!',
          emotion: 'Instrução visual clara',
          placement: 'both',
          compliance: 'Direcionamento de interface oficial',
        },
      ],
      view_product: [
        {
          text: 'Acesse a vitrine oficial do ' + pName + ' e confira as opções de pagamento!',
          emotion: 'Transparência',
          placement: 'both',
          compliance: 'Catálogo de produtos oficial',
        },
      ],
      enjoy_condition: [
        {
          text: 'Aproveite a condição deste vídeo e faça o seu pedido antes que a campanha finalize!',
          emotion: 'Agilidade',
          placement: 'both',
          compliance: 'Condição temporária sem datas falsas',
        },
      ],
      last_opportunity: [
        {
          text: 'Consulte as condições disponíveis para o seu CEP tocando no link abaixo!',
          emotion: 'Conveniência regional',
          placement: 'both',
          compliance: 'Cálculo de frete real por localização',
        },
      ],
      benefit: [
        {
          text: 'Experimente a praticidade do ' + pName + ' e sinta a diferença no primeiro uso!',
          emotion: 'Confiança',
          placement: 'both',
          compliance: 'Benefício real do produto',
        },
      ],
      urgency: [
        {
          text: 'Garanta o seu hoje mesmo enquanto a condição do vídeo está ativa!',
          emotion: 'Prontidão',
          placement: 'both',
          compliance: 'Sem contadores regressivos fictícios',
        },
      ],
      scarcity: [
        {
          text: 'Consulte a disponibilidade de pronta entrega tocando no produto abaixo!',
          emotion: 'Oportunidade',
          placement: 'both',
          compliance: 'Estoque real consultado no checkout',
        },
      ],
      curiosity: [
        {
          text: 'Toque para ver o valor promocional e todas as avaliações de quem comprou!',
          emotion: 'Curiosidade',
          placement: 'both',
          compliance: 'Avaliações reais na loja',
        },
      ],
      proof: [
        {
          text: 'Veja por que milhares de pessoas aprovaram: clique na sacola!',
          emotion: 'Prova social',
          placement: 'both',
          compliance: 'Comprovação comunitária',
        },
      ],
      offer: [
        {
          text: 'Aproveite a oferta de lançamento liberada exclusivamente para este vídeo!',
          emotion: 'Oferta',
          placement: 'both',
          compliance: 'Condição transparente',
        },
      ],
    };

    const ctas: TikTokCta[] = [];
    let idx = 0;

    while (ctas.length < count) {
      for (const cat of targetCategories) {
        if (ctas.length >= count) break;
        const list = ctaTemplates[cat] || ctaTemplates.immediate_purchase;
        const item = list[idx % list.length];

        ctas.push({
          id: 'cta_' + cat + '_' + (idx + 1) + '_' + Math.random().toString(36).substring(2, 7),
          text: item.text,
          category: cat,
          categoryLabel: CTA_CATEGORY_LABELS[cat] || cat,
          dominantEmotion: item.emotion,
          placement: item.placement,
          complianceNote: item.compliance,
        });
      }
      idx++;
    }

    return ctas.slice(0, count);
  }

  /**
   * Gera o roteiro completo adaptado à duração selecionada (15s, 30s, 45s, 60s)
   */
  public generateScript(options: GenerateScriptOptions): TikTokScript {
    const {
      productName,
      targetAudience = 'Público engajado do TikTok',
      pain = 'dificuldade e tempo perdido no dia a dia',
      desire = 'praticidade e economia imediata',
      benefit = 'qualidade garantida e facilidade de uso',
      offer = 'Condição especial de lançamento',
      salesMethodId,
      videoType,
      duration,
      aspectRatio,
      hook,
      cta,
      characterName = 'Criador(a) Especialista',
      scenario = 'Ambiente moderno e iluminado com luz natural suave',
      visualStyle = 'UGC realista gravado em smartphone com iluminação limpa e foco nítido',
      tone = 'Dinâmico, espontâneo, empático e focado em soluções imediatas',
    } = options;

    const methodObj = SALES_METHODS_DATA.find((m) => m.id === salesMethodId) || SALES_METHODS_DATA[0];
    const scriptId = 'tt_script_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const blocks: TikTokScriptBlock[] = [];

    if (duration === 15) {
      blocks.push({
        id: 'blk_hook_' + Math.random().toString(36).substring(2, 6),
        type: 'HOOK',
        title: '1. Hook / Gancho de Retenção',
        durationSeconds: 3,
        spokenText: hook.text,
        visualAction: hook.visualSuggestion || 'Aparece segurando ' + productName + ' com expressão enérgica e olhar focado na câmera.',
        onScreenText: hook.text.slice(0, 45) + '...',
        audioEffect: 'Efeito sonoro suave de transição / Whoosh',
      });
      blocks.push({
        id: 'blk_benefit_' + Math.random().toString(36).substring(2, 6),
        type: 'BENEFICIOS',
        title: '2. Benefício Chave Instantâneo',
        durationSeconds: 5,
        spokenText: 'Com ele você conquista ' + benefit + ' sem perder tempo nem passar estresse!',
        visualAction: 'Close no produto em uso demonstrando a entrega imediata de ' + benefit + '.',
        onScreenText: '✅ ' + benefit.slice(0, 35),
      });
      blocks.push({
        id: 'blk_prod_' + Math.random().toString(36).substring(2, 6),
        type: 'SOLUCAO',
        title: '3. Apresentação do Produto',
        durationSeconds: 4,
        spokenText: 'É exatamente por isso que o ' + productName + ' viralizou tanto no TikTok!',
        visualAction: 'Giro de 360 graus com o produto na mão evidenciando os detalhes de acabamento e a qualidade.',
        onScreenText: productName,
      });
      blocks.push({
        id: 'blk_cta_' + Math.random().toString(36).substring(2, 6),
        type: 'CTA',
        title: '4. Chamada para Ação (CTA)',
        durationSeconds: 3,
        spokenText: cta.text,
        visualAction: 'Aponta diretamente para a sacolinha amarela no canto inferior esquerdo com um sorriso convidativo.',
        onScreenText: '🛒 Toque na sacolinha abaixo',
        audioEffect: 'Sino suave / Pop sonoro de clique',
      });
    } else if (duration === 30) {
      blocks.push({
        id: 'blk_hook_' + Math.random().toString(36).substring(2, 6),
        type: 'HOOK',
        title: '1. Hook de Alta Retenção (0-3s)',
        durationSeconds: 3,
        spokenText: hook.text,
        visualAction: hook.visualSuggestion || 'Entrada dinâmica em primeiro plano segurando o produto.',
        onScreenText: hook.text,
        audioEffect: 'Transição rápida com batida moderna',
      });
      blocks.push({
        id: 'blk_prob_' + Math.random().toString(36).substring(2, 6),
        type: 'PROBLEMA',
        title: '2. Identificação da Dor do Público',
        durationSeconds: 5,
        spokenText: 'Se você já passou raiva tentando resolver ' + pain + ', você sabe como isso consome energia...',
        visualAction: 'Expressão de cansaço ou demonstração rápida do problema sem cortes longos.',
        onScreenText: '❌ O problema que você já conhece',
      });
      blocks.push({
        id: 'blk_sol_' + Math.random().toString(36).substring(2, 6),
        type: 'SOLUCAO',
        title: '3. Apresentação da Solução',
        durationSeconds: 7,
        spokenText: 'Foi por isso que eu decidi testar o ' + productName + '. E o resultado superou todas as expectativas!',
        visualAction: 'Corte limpo para o produto em alta definição, iluminação de estúdio e textura nítida.',
        onScreenText: '✨ Conheça o ' + productName,
      });
      blocks.push({
        id: 'blk_demo_' + Math.random().toString(36).substring(2, 6),
        type: 'DEMONSTRACAO',
        title: '4. Demonstração Prática & Mecanismo',
        durationSeconds: 8,
        spokenText: 'Basta acionar assim: ele entrega ' + benefit + ' com muita facilidade e precisão.',
        visualAction: 'Mãos manipulando o produto em close-up, destacando o funcionamento perfeito e sem esforço.',
        onScreenText: '⚙️ Mecanismo em ação',
      });
      blocks.push({
        id: 'blk_off_' + Math.random().toString(36).substring(2, 6),
        type: 'OFERTA',
        title: '5. Oferta do TikTok Shop',
        durationSeconds: 4,
        spokenText: offer || 'Está com preço especial e entrega rápida direto pelo TikTok Shop.',
        visualAction: 'Exibe o selo de produto verificado e destaque de compra segura.',
        onScreenText: '🏷️ Condição especial de lançamento',
      });
      blocks.push({
        id: 'blk_cta_' + Math.random().toString(36).substring(2, 6),
        type: 'CTA',
        title: '6. Chamada para Ação Final',
        durationSeconds: 3,
        spokenText: cta.text,
        visualAction: 'Gesto claro em direção ao canto inferior esquerdo onde fica a sacolinha amarela.',
        onScreenText: '🛒 Peça na sacolinha amarela!',
        audioEffect: 'Som de notificação positiva',
      });
    } else {
      // 45s ou 60s
      blocks.push({
        id: 'blk_hook_' + Math.random().toString(36).substring(2, 6),
        type: 'HOOK',
        title: '1. Hook de Parada de Feed (0-3s)',
        durationSeconds: 3,
        spokenText: hook.text,
        visualAction: hook.visualSuggestion || 'Visual de alto impacto segurando o produto.',
        onScreenText: hook.text,
        audioEffect: 'Impacto sutil + Swoosh',
      });
      blocks.push({
        id: 'blk_prob_' + Math.random().toString(36).substring(2, 6),
        type: 'PROBLEMA',
        title: '2. Identificação da Dor Latente',
        durationSeconds: 8,
        spokenText: 'Eu sei exatamente como é conviver com ' + pain + ' e achar que não existe nenhuma saída prática.',
        visualAction: 'Câmera em plano médio retratando a rotina comum do público-alvo antes do produto.',
        onScreenText: 'Você também passa por isso?',
      });
      blocks.push({
        id: 'blk_agit_' + Math.random().toString(36).substring(2, 6),
        type: 'AGITACAO',
        title: '3. Agitação da Dor & Custo da Inação',
        durationSeconds: 7,
        spokenText: 'O pior é que quanto mais tempo você espera, mais dinheiro e paciência você perde no caminho.',
        visualAction: 'Expressão pensativa e reflexiva evidenciando a urgência de uma mudança.',
        onScreenText: 'O custo de não resolver agora',
      });
      blocks.push({
        id: 'blk_sol_' + Math.random().toString(36).substring(2, 6),
        type: 'SOLUCAO',
        title: '4. Revelação da Solução Definitiva',
        durationSeconds: 8,
        spokenText: 'Mas tudo mudou quando eu conheci o ' + productName + '. Essa tecnologia foi desenvolvida para virar o jogo!',
        visualAction: 'Transição brilhante revelando o produto em iluminação profissional de destaque.',
        onScreenText: '✨ A solução: ' + productName,
      });
      blocks.push({
        id: 'blk_demo_' + Math.random().toString(36).substring(2, 6),
        type: 'DEMONSTRACAO',
        title: '5. Demonstração Prática & Mecanismo',
        durationSeconds: 12,
        spokenText: 'Veja como é fácil: basta usar assim para entregar ' + benefit + ' de forma rápida e segura!',
        visualAction: 'Passo a passo rápido mostrando a facilidade de uso e o produto operando perfeitamente.',
        onScreenText: '👉 Passo a passo simplificado',
      });
      blocks.push({
        id: 'blk_proof_' + Math.random().toString(36).substring(2, 6),
        type: 'PROVA',
        title: '6. Prova & Quebra de Objeção',
        durationSeconds: 8,
        spokenText: 'E para quem tem dúvida se funciona: milhares de pessoas já testaram e comprovaram a qualidade.',
        visualAction: 'Mostrando detalhes construtivos, certificações e visual consistente do produto.',
        onScreenText: '⭐ Qualidade comprovada e garantida',
      });
      blocks.push({
        id: 'blk_off_' + Math.random().toString(36).substring(2, 6),
        type: 'OFERTA',
        title: '7. Apresentação da Oferta Irresistível',
        durationSeconds: 6,
        spokenText: offer || 'Aproveite as condições especiais de frete e garantia diretamente pelo TikTok Shop!',
        visualAction: 'Exibição do kit completo / produto com destaque para o valor agregado.',
        onScreenText: '🎁 Oferta imperdível no TikTok Shop',
      });
      blocks.push({
        id: 'blk_cta_' + Math.random().toString(36).substring(2, 6),
        type: 'CTA',
        title: '8. Chamada para Ação Final',
        durationSeconds: 6,
        spokenText: cta.text,
        visualAction: 'Apresentador finaliza com um sorriso confiante apontando para o link de compra na tela.',
        onScreenText: '🛒 Peça o seu na sacolinha amarela!',
        audioEffect: 'Sucesso sonoro / Final alegre',
      });
    }

    const fullDialogue = blocks
      .map((b) => b.title.toUpperCase() + ':\n"' + b.spokenText + '"')
      .join('\n\n');

    const sceneDescriptions = blocks
      .map(
        (b, i) =>
          'Scene ' +
          (i + 1) +
          ' (' +
          b.durationSeconds +
          's) [' +
          b.type +
          ']: ' +
          b.visualAction +
          ' Spoken audio cue: "' +
          b.spokenText +
          '". On-screen text: "' +
          (b.onScreenText || '') +
          '"'
      )
      .join('\n');

    const fullVeoPrompt = [
      'Commercial Sales Video for TikTok / TikTok Shop.',
      'Format: Vertical ' + aspectRatio + ', High quality, crisp lighting.',
      'Product: ' + productName + ' (featured clearly throughout the video).',
      'Presenter: ' + characterName + ', charismatic, authentic, expressive.',
      'Style & Lighting: ' + visualStyle + ', ' + scenario + '.',
      'Tone & Emotion: ' + tone + '.',
      'Duration: ' + duration + ' seconds.',
      'Methodology: ' + methodObj.name + ' (' + methodObj.category + ').',
      '',
      'Visual Breakdown:',
      sceneDescriptions,
      '',
      'Audio & Acoustics: Crisp voiceover in Portuguese (pt-BR), natural ambient sound, subtle positive background beat, clean pronunciation.',
      'Negative Prompt: Blurry logos, low resolution, warped hands, distorted product geometry, static boring frames, generic stock footage feeling.',
    ].join('\n');

    return {
      id: scriptId,
      productName,
      title: productName + ' — ' + methodObj.name + ' (' + duration + 's)',
      targetAudience,
      salesMethodId,
      salesMethodName: methodObj.name,
      videoType,
      duration,
      aspectRatio,
      hook,
      cta,
      characterName,
      scenario,
      visualStyle,
      tone,
      blocks,
      estimatedTotalDuration: blocks.reduce((acc, b) => acc + b.durationSeconds, 0),
      fullDialogue,
      fullVeoPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const tikTokScriptEngine = new TikTokScriptEngine();
