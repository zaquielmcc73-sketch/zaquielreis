import { GoogleGenAI } from '@google/genai';
import { db } from '../db';
import { AI_MODELS } from '../config/aiModels';
import {
  AngleCategory,
  CampaignAngle,
  CampaignBatchQuantity,
  CampaignCreativeItem,
  CampaignCreativeScore,
  CampaignDuration,
  CampaignHook,
  CampaignICP,
  CampaignOffer,
  CampaignScript,
  CampaignScriptScene,
  Character,
  HookCategory,
  OrchestratedCampaign,
  Product,
  ProjectBible,
  SalesMethodId,
} from '../../src/types';
import { SALES_METHODS } from '../../src/data/salesMethods';
import { methodRecommender } from './methodRecommender';
import { PROMPT_STUDIO_PRESETS } from './promptStudioEngine';

export class CampaignOrchestratorEngine {
  private getAI(customApiKey?: string): GoogleGenAI | null {
    const key = customApiKey || process.env.GEMINI_API_KEY;
    if (!key || key.trim() === '') return null;
    return new GoogleGenAI({ apiKey: key });
  }

  // =========================================================================
  // ETAPA 2 — GERADOR DE PÚBLICO IDEAL (ICP)
  // =========================================================================
  public async generateIdealICP(
    product: Product,
    bible?: ProjectBible,
    customApiKey?: string
  ): Promise<CampaignICP> {
    const ai = this.getAI(customApiKey);

    if (ai) {
      try {
        const prompt = `Você é um estrategista sênior de marketing digital e conversão.
Analise o produto abaixo e crie uma hipótese detalhada de Perfil de Cliente Ideal (ICP).

PRODUTO:
Nome: ${product.name}
Descrição: ${product.description}
Categoria: ${product.category}
Preço: ${product.currency} ${product.price}
Benefícios: ${product.benefits?.join(', ') || 'N/A'}
Dores: ${product.pains?.join(', ') || 'N/A'}
Desejos: ${product.desires?.join(', ') || 'N/A'}
Público Alvo Base: ${product.targetAudience || bible?.targetAudience || 'Geral'}

INSTRUÇÕES IMPORTANTES:
- Retorne EXCLUSIVAMENTE um objeto JSON válido.
- Não invente estatísticas de mercado como fatos absolutos.
- Estruture com base na psicologia de compra real.

JSON Schema esperado:
{
  "targetAudience": "descrição concisa e objetiva do perfil principal",
  "ageRange": "faixa etária estimada (ex: 25-45 anos)",
  "gender": "gênero predominante ou Unissex",
  "profession": "profissões ou ocupações comuns",
  "dailyRoutine": "resumo de rotina e momentos de atrito onde a dor aparece",
  "location": "Brasil - Centros urbanos e regiões metropolitanas",
  "incomeLevel": "faixa de renda compatível",
  "lifestyle": "estilo de vida e hábitos",
  "desires": ["desejo 1", "desejo 2", "desejo 3"],
  "pains": ["dor 1", "dor 2", "dor 3"],
  "objections": ["objeção 1", "objeção 2", "objeção 3"],
  "triggers": ["gatilho emocional 1", "gatilho 2", "gatilho 3"],
  "awarenessLevel": "Consciente do Problema",
  "buyingIntent": "Imediato / Urgente"
}`;

        const res = await ai.models.generateContent({
          model: AI_MODELS.GEMINI_TEXT,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const raw = res.text?.trim() || '{}';
        const parsed = JSON.parse(raw);

        return {
          targetAudience: parsed.targetAudience || product.targetAudience || 'Público consumidor exigente em busca de eficiência',
          ageRange: parsed.ageRange || '25-45 anos',
          gender: parsed.gender || 'Unissex',
          profession: parsed.profession || 'Profissionais, autônomos e empreendedores',
          dailyRoutine: parsed.dailyRoutine || 'Rotina corrida com pouco tempo disponível para tarefas repetitivas.',
          location: parsed.location || 'Brasil (Nacional)',
          incomeLevel: parsed.incomeLevel || 'Classe B e C+',
          lifestyle: parsed.lifestyle || 'Prático, conectado e focado em custo-benefício',
          desires: parsed.desires?.length ? parsed.desires : (product.desires || ['Praticidade imediata', 'Economia de tempo', 'Qualidade comprovada']),
          pains: parsed.pains?.length ? parsed.pains : (product.pains || ['Falta de tempo', 'Frustração com métodos antigos']),
          objections: parsed.objections?.length ? parsed.objections : (product.objections || ['Será que funciona para mim?', 'É fácil de usar?']),
          triggers: parsed.triggers?.length ? parsed.triggers : ['Alívio imediato', 'Demonstração prática', 'Garantia sem risco'],
          awarenessLevel: parsed.awarenessLevel || 'Consciente do Problema',
          buyingIntent: parsed.buyingIntent || 'Imediato / Urgente',
          isAiGenerated: true,
          aiHypothesisDisclaimer: 'Sugestão gerada por IA com base nas características do produto. Valide com métricas do seu público.',
        };
      } catch (e) {
        db.log('warn', 'Erro ao gerar ICP com Gemini, usando gerador determinístico inteligente:', e);
      }
    }

    // Deterministic fallback
    return {
      targetAudience: product.targetAudience || 'Consumidores de 25 a 50 anos em busca de praticidade e resultados comprovados',
      ageRange: '25-45 anos',
      gender: 'Unissex',
      profession: 'Profissionais, donos de casa e entusiastas de produtos práticos',
      dailyRoutine: 'Dia a dia dinâmico onde pequenos problemas cotidianos geram estresse e perda de tempo desnecessária.',
      location: 'Brasil (Capitais e interior)',
      incomeLevel: 'Renda média de R$ 2.500 a R$ 10.000',
      lifestyle: 'Consumidor digital atento a soluções inovadoras que facilitam tarefas',
      desires: product.desires && product.desires.length > 0 ? product.desires : [
        'Resolver o problema em minutos sem complicação',
        'Sentir segurança na compra com garantia real',
        'Economizar tempo e esforço diariamente',
      ],
      pains: product.pains && product.pains.length > 0 ? product.pains : [
        'Frustração com soluções que prometem e não cumprem',
        'Desgaste de tempo com processos manuais e ineficientes',
        'Medo de gastar dinheiro com produtos de baixa durabilidade',
      ],
      objections: product.objections && product.objections.length > 0 ? product.objections : [
        'Será que funciona no meu caso específico?',
        'O prazo de entrega e garantia são confiáveis?',
      ],
      triggers: [
        'Demonstração visual do mecanismo em ação',
        'Garantia incondicional de satisfação',
        'Alívio instantâneo da dor principal',
      ],
      awarenessLevel: 'Consciente do Problema',
      buyingIntent: 'Imediato / Urgente',
      isAiGenerated: false,
      aiHypothesisDisclaimer: 'Perfil estruturado heuristicamente a partir da ficha do produto.',
    };
  }

  // =========================================================================
  // ETAPA 3 — GERADOR DE OFERTA COMERCIAL
  // =========================================================================
  public async generateCommercialOffer(
    product: Product,
    icp: CampaignICP,
    bible?: ProjectBible,
    customApiKey?: string
  ): Promise<CampaignOffer> {
    const ai = this.getAI(customApiKey);

    if (ai) {
      try {
        const prompt = `Você é um copywriter de resposta direta especializado em propostas comerciais de alta conversão.
Crie uma oferta irresistível e HONESTA para o produto abaixo.

REGRAS DE CONFORMIDADE ÉTICA:
- NUNCA invente estoque falso (ex: "só restam 3 unidades").
- NUNCA invente porcentagens falsas de desconto a menos que fornecido.
- NUNCA prometa resultados milagrosos ou garantias falsas.
- Use argumentos de valor real, benefícios e garantia legítima.

PRODUTO:
Nome: ${product.name}
Preço: ${product.currency} ${product.price}
Benefícios: ${product.benefits?.join('; ') || 'N/A'}
Diferenciais: ${product.differentials?.join('; ') || 'N/A'}
CTA Base: ${product.cta || 'N/A'}
Público Alvo: ${icp.targetAudience}

Retorne EXCLUSIVAMENTE um JSON:
{
  "mainOffer": "texto conciso da oferta principal com ancoragem de valor",
  "primaryBenefit": "benefício número 1 mais forte",
  "secondaryBenefit": "benefício secundário que quebra atrito",
  "bonuses": ["bônus ou diferencial de valor 1", "bônus 2"],
  "guarantee": "garantia legal ou incondicional clara (ex: 30 dias de teste sem risco)",
  "price": "${product.currency} ${product.price}",
  "cta": "chamada para ação direta e persuasiva",
  "realUrgencyText": "argumento legítimo de agilidade (ex: lote com envio imediato)"
}`;

        const res = await ai.models.generateContent({
          model: AI_MODELS.GEMINI_TEXT,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const raw = res.text?.trim() || '{}';
        const parsed = JSON.parse(raw);

        return {
          mainOffer: parsed.mainOffer || `Adquira o ${product.name} com entrega rápida e garantia total.`,
          primaryBenefit: parsed.primaryBenefit || (product.benefits?.[0] || 'Eficiência comprovada desde o primeiro uso'),
          secondaryBenefit: parsed.secondaryBenefit || (product.benefits?.[1] || 'Praticidade máxima sem esforço'),
          bonuses: parsed.bonuses?.length ? parsed.bonuses : ['Manual de uso rápido passo a passo', 'Suporte pós-venda dedicado'],
          guarantee: parsed.guarantee || 'Garantia incondicional de 30 dias para teste',
          price: parsed.price || `${product.currency} ${product.price}`,
          cta: parsed.cta || product.cta || 'Clique no botão e garanta o seu hoje mesmo!',
          realUrgencyText: parsed.realUrgencyText || 'Envio prioritário com código de rastreio imediato.',
          isAiGenerated: true,
          truthfulDisclaimer: 'Oferta estruturada com base nas especificações declaradas do produto.',
        };
      } catch (e) {
        db.log('warn', 'Erro ao gerar oferta com Gemini, usando gerador determinístico:', e);
      }
    }

    return {
      mainOffer: `Garanta o seu ${product.name} com condição exclusiva e garantia incondicional.`,
      primaryBenefit: product.benefits?.[0] || 'Resultados rápidos e duradouros',
      secondaryBenefit: product.benefits?.[1] || 'Facilidade absoluta de uso',
      bonuses: ['Acompanhamento de entrega em tempo real', 'Guia prático de melhores práticas incluso'],
      guarantee: '30 dias de garantia com devolução garantida se não aprovar',
      price: `${product.currency} ${product.price}`,
      cta: product.cta || 'Clique no link abaixo e peça o seu com frete rápido!',
      realUrgencyText: 'Lote disponível para postagem imediata.',
      isAiGenerated: false,
      truthfulDisclaimer: 'Valores e condições configurados diretamente com dados do produto.',
    };
  }

  // =========================================================================
  // ETAPA 17 — GERADOR AUTOMÁTICO DE ÂNGULOS (17 Categorias)
  // =========================================================================
  public generateAngles(
    product: Product,
    icp: CampaignICP,
    offer: CampaignOffer,
    count = 17
  ): CampaignAngle[] {
    const angleTemplates: Array<{
      category: AngleCategory;
      name: string;
      description: string;
      hookTemplate: (p: Product) => string;
      promiseTemplate: (p: Product) => string;
      scriptCoreTemplate: (p: Product) => string;
      ctaTemplate: (p: Product) => string;
      promptTemplate: (p: Product) => string;
      salesMethodId: SalesMethodId;
    }> = [
      {
        category: 'Dor',
        name: 'Ataque à Dor Primária',
        description: 'Dramatiza a frustração com o método antigo e introduz o produto como alívio imediato.',
        hookTemplate: (p) => `Você ainda sofre tentando resolver isso do jeito antigo e demorado?`,
        promiseTemplate: (p) => `Elimine essa dor de cabeça em segundos com o ${p.name}.`,
        scriptCoreTemplate: (p) => `Demonstra a frustração do usuário com o problema antes, cortando para a facilidade do ${p.name}.`,
        ctaTemplate: (p) => `Pare de perder tempo e peça o seu ${p.name} agora mesmo.`,
        promptTemplate: (p) => `Close-up dinâmico no rosto do usuário expressando alívio e surpresa ao ver o ${p.name} em funcionamento perfeito.`,
        salesMethodId: 'pain_solution',
      },
      {
        category: 'Desejo',
        name: 'Conquista do Resultado dos Sonhos',
        description: 'Foca no prazer e na sensação gratificante de ter o resultado perfeito.',
        hookTemplate: (p) => `Imagine ter esse resultado impecável todos os dias sem nenhum esforço!`,
        promiseTemplate: (p) => `O ${p.name} entrega o padrão de excelência que você sempre quis.`,
        scriptCoreTemplate: (p) => `Cena aspiracional com estética limpa exibindo o resultado impecável e o produto em primeiro plano.`,
        ctaTemplate: (p) => `Garanta o seu padrão premium hoje com frete rápido.`,
        promptTemplate: (p) => `Iluminação cinematográfica de estúdio, foco macro e reflexos dourados no ${p.name}.`,
        salesMethodId: 'status_desire',
      },
      {
        category: 'Economia',
        name: 'Economia Inteligente & ROI',
        description: 'Demonstra quanto o usuário economiza ao deixar de gastar com soluções caras ou ineficientes.',
        hookTemplate: (p) => `Pare de jogar dinheiro fora com alternativas que duram uma semana!`,
        promiseTemplate: (p) => `Economize tempo e dinheiro investindo uma única vez no ${p.name}.`,
        scriptCoreTemplate: (p) => `Compara o gasto contínuo e frustrante com a durabilidade e economia do ${p.name}.`,
        ctaTemplate: (p) => `Faça a escolha inteligente e garanta o seu com desconto.`,
        promptTemplate: (p) => `Corte rápido entre contas/desperdício e a solução definitiva do ${p.name}.`,
        salesMethodId: 'value_selling',
      },
      {
        category: 'Facilidade',
        name: 'Simplicidade Extrema com 1 Clique',
        description: 'Mostra que qualquer pessoa consegue usar sem curva de aprendizado.',
        hookTemplate: (p) => `Isso é tão fácil de usar que parece mágica, olha só!`,
        promiseTemplate: (p) => `Basta um movimento simples para o ${p.name} fazer todo o trabalho pesado.`,
        scriptCoreTemplate: (p) => `Mãos manuseando o produto com facilidade fluida e imediata.`,
        ctaTemplate: (p) => `Simplifique sua rotina agora mesmo, clique aqui.`,
        promptTemplate: (p) => `Plano POV em primeira pessoa mostrando o produto sendo ativado com extrema facilidade.`,
        salesMethodId: 'pov',
      },
      {
        category: 'Transformação',
        name: 'Antes e Depois Chocante',
        description: 'Contraste visual brutal entre o caos anterior e a ordem conquistada.',
        hookTemplate: (p) => `O antes e depois disso vai te deixar de boca aberta!`,
        promiseTemplate: (p) => `Veja a transformação instantânea que o ${p.name} proporciona.`,
        scriptCoreTemplate: (p) => `Tela dividida mostrando o estado inicial e o resultado pós-aplicação.`,
        ctaTemplate: (p) => `Experimente essa transformação você também!`,
        promptTemplate: (p) => `Split-screen dinâmico com iluminação de alto contraste comparando antes e depois.`,
        salesMethodId: 'comparison',
      },
      {
        category: 'Status',
        name: 'Elegância & Posicionamento Premium',
        description: 'Posiciona o produto como símbolo de sofisticação e bom gosto.',
        hookTemplate: (p) => `O segredo de quem valoriza sofisticação e qualidade impecável.`,
        promiseTemplate: (p) => `Eleve o nível do seu dia a dia com a tecnologia do ${p.name}.`,
        scriptCoreTemplate: (p) => `Ambiente sofisticado, tons neutros modernos e destaque estético ao produto.`,
        ctaTemplate: (p) => `Adquira a sua unidade exclusiva hoje.`,
        promptTemplate: (p) => `Estética de comercial de luxo internacional, movimentos de câmera lentos e elegantes.`,
        salesMethodId: 'status_desire',
      },
      {
        category: 'Prova',
        name: 'Teste de Eficiência Comprovada',
        description: 'Demonstração de rigor e resistência sem cortes falsos.',
        hookTemplate: (p) => `Colocamos o ${p.name} no teste mais extremo para ver se aguenta mesmo!`,
        promiseTemplate: (p) => `Desempenho aprovado sob as condições mais exigentes.`,
        scriptCoreTemplate: (p) => `Execução do teste prático rigoroso e veredito impecável.`,
        ctaTemplate: (p) => `Confira o poder do ${p.name} na sua própria casa.`,
        promptTemplate: (p) => `Tomadas em câmera lenta (60fps) capturando detalhes do teste de resistência.`,
        salesMethodId: 'demo',
      },
      {
        category: 'Comparação',
        name: 'Nós vs. Eles (A Diferença Brutal)',
        description: 'Coloca o produto lado a lado contra produtos convencionais concorrentes.',
        hookTemplate: (p) => `Olha a diferença entre um produto comum e o ${p.name}!`,
        promiseTemplate: (p) => `Descubra por que quem compara nunca mais volta para o convencional.`,
        scriptCoreTemplate: (p) => `Dois produtos lado a lado, mostrando o concorrente falhando e o ${p.name} brilhando.`,
        ctaTemplate: (p) => `Escolha o melhor, clique e peça o seu com garantia.`,
        promptTemplate: (p) => `Enquadramento direto lado a lado com zoom nos pontos de superioridade.`,
        salesMethodId: 'comparison',
      },
      {
        category: 'Demonstração',
        name: 'Mecanismo em Ação Revelado (China Style)',
        description: 'Revela a engenharia e o mecanismo interno de alta eficiência.',
        hookTemplate: (p) => `Olha como a engenharia do ${p.name} funciona por dentro!`,
        promiseTemplate: (p) => `Tecnologia desenvolvida para máxima absorção e eficiência.`,
        scriptCoreTemplate: (p) => `Close macro no mecanismo com animação visual de fluxo e ação potente.`,
        ctaTemplate: (p) => `Aproveite o lote promocional com frete prioritário.`,
        promptTemplate: (p) => `Macro lens close-up detalhado nos componentes e fluxo mecânico do produto.`,
        salesMethodId: 'china',
      },
      {
        category: 'Curiosidade',
        name: 'O Segredo que Poucos Conhecem',
        description: 'Abre um loop mental de curiosidade que prende a atenção nos primeiros segundos.',
        hookTemplate: (p) => `Por que quase ninguém fala sobre esse truque simples?`,
        promiseTemplate: (p) => `O segredo para resolver isso de uma vez por todas está no ${p.name}.`,
        scriptCoreTemplate: (p) => `Apresentador revela o produto como a resposta a uma dúvida comum.`,
        ctaTemplate: (p) => `Descubra todos os detalhes clicando no link abaixo.`,
        promptTemplate: (p) => `Apresentador com olhar intrigado e misterioso revelando o ${p.name} para a câmera.`,
        salesMethodId: 'curiosity',
      },
      {
        category: 'Objeção',
        name: 'Derrubada de Objeções Direta',
        description: 'Enfrenta o ceticismo comum de frente com transparência total.',
        hookTemplate: (p) => `Eu também achei que não funcionaria, até fazer esse teste!`,
        promiseTemplate: (p) => `Tire suas dúvidas e veja por que até os mais céticos se surpreendem.`,
        scriptCoreTemplate: (p) => `Relato sincero quebrando a objeção mais comum com demonstração clara.`,
        ctaTemplate: (p) => `Faça o teste sem risco com nossa garantia de 30 dias.`,
        promptTemplate: (p) => `Estilo UGC natural de depoimento honesto com iluminação suave.`,
        salesMethodId: 'testimonial',
      },
      {
        category: 'Urgência legítima',
        name: 'Oportunidade Limitada com Lote Disponível',
        description: 'Comunica rapidez e vantagem para quem agir no momento atual.',
        hookTemplate: (p) => `Se você estava esperando o momento certo, essa é a sua chance!`,
        promiseTemplate: (p) => `Garanta as melhores condições enquanto o lote atual estiver ativo.`,
        scriptCoreTemplate: (p) => `Apresenta o pacote completo com bônus e reforça a decisão imediata.`,
        ctaTemplate: (p) => `Clique agora antes que o lote promocional seja encerrado!`,
        promptTemplate: (p) => `Ritmo dinâmico, cortes rápidos e destaque visual à oferta e garantias.`,
        salesMethodId: 'fomo',
      },
      {
        category: 'Conveniência',
        name: 'Praticidade Portátil no Dia a Dia',
        description: 'Destaca como o produto se encaixa perfeitamente na rotina sem ocupar espaço.',
        hookTemplate: (p) => `Cabe na palma da sua mão e resolve qualquer aperto no seu dia!`,
        promiseTemplate: (p) => `Leve o ${p.name} para onde for com total praticidade.`,
        scriptCoreTemplate: (p) => `Uso do produto em diferentes ambientes do cotidiano (carro, casa, trabalho).`,
        ctaTemplate: (p) => `Peça o seu companheiro diário com entrega rápida.`,
        promptTemplate: (p) => `Cenas dinâmicas em múltiplos cenários do dia a dia mostrando portabilidade.`,
        salesMethodId: 'ugc',
      },
      {
        category: 'Identificação',
        name: 'Espelho da Rotina Real (UGC Friend)',
        description: 'Comunicação entre pares onde o criador fala como um amigo próximo.',
        hookTemplate: (p) => `Gente, eu precisava muito compartilhar essa dica com vocês!`,
        promiseTemplate: (p) => `Mudou completamente a minha rotina e vai mudar a sua também.`,
        scriptCoreTemplate: (p) => `Criadora de conteúdo segurando o celular em formato selfie entusiasmada.`,
        ctaTemplate: (p) => `Vou deixar o link oficial aqui embaixo para quem quiser conferir!`,
        promptTemplate: (p) => `Handheld vertical selfie style, ring-light suave, sorriso espontâneo e natural.`,
        salesMethodId: 'ugc',
      },
      {
        category: 'Antes/depois',
        name: 'O Contraste que Convence',
        description: 'Foco puro na eficiência comprovada pelo resultado visual final.',
        hookTemplate: (p) => `Dá uma olhada no estado disso antes... e olha agora!`,
        promiseTemplate: (p) => `Resultado impecável sem esforço repetitivo.`,
        scriptCoreTemplate: (p) => `Foco cerrado no ponto crítico de limpeza/rejuvenescimento/ação.`,
        ctaTemplate: (p) => `Tenha esse resultado hoje mesmo.`,
        promptTemplate: (p) => `Transição de wipe vertical revelando o resultado final perfeito.`,
        salesMethodId: 'demo',
      },
      {
        category: 'Problema cotidiano',
        name: 'O Incômodo que Ninguém Aguenta Mais',
        description: 'Toca exatamente no micro-estresse que acontece repetidamente na rotina.',
        hookTemplate: (p) => `Quem nunca passou por essa situação chata na hora de fazer isso?`,
        promiseTemplate: (p) => `Chega de passar raiva: o ${p.name} resolve de uma vez.`,
        scriptCoreTemplate: (p) => `Micro-dramatização do problema cotidiano e intervenção heroica do produto.`,
        ctaTemplate: (p) => `Resolva esse incômodo de vez, clique e compre o seu.`,
        promptTemplate: (p) => `Expressão facial de frustração cômica seguida por alívio imediato ao usar o produto.`,
        salesMethodId: 'conflict_turnaround',
      },
      {
        category: 'Resultado percebido',
        name: 'Elogios e Reconhecimento dos Outros',
        description: 'O valor social e a validação de outras pessoas notando a transformação.',
        hookTemplate: (p) => `Todo mundo vai te perguntar qual é o seu segredo!`,
        promiseTemplate: (p) => `Desfrute da satisfação e dos elogios que você merece.`,
        scriptCoreTemplate: (p) => `Interação social positiva destacando a confiança renovada do usuário.`,
        ctaTemplate: (p) => `Experimente e sinta a diferença no seu dia a dia.`,
        promptTemplate: (p) => `Ambiente iluminado, postura confiante e sorriso de realização.`,
        salesMethodId: 'emotional_transformation',
      },
    ];

    return angleTemplates.slice(0, count).map((t, idx) => ({
      id: `angle_${Date.now()}_${idx + 1}`,
      category: t.category,
      name: t.name,
      description: t.description,
      hookConcept: t.hookTemplate(product),
      promise: t.promiseTemplate(product),
      scriptCore: t.scriptCoreTemplate(product),
      suggestedCta: t.ctaTemplate(product),
      suggestedPrompt: t.promptTemplate(product),
      salesMethodId: t.salesMethodId,
    }));
  }

  // =========================================================================
  // ETAPA 5 — GERADOR DE HOOKS (18 Categorias, Quantidades 1 a 75)
  // =========================================================================
  public generateHooks(
    product: Product,
    angles: CampaignAngle[],
    selectedMethods: SalesMethodId[],
    count: CampaignBatchQuantity = 25,
    categoriesFilter?: HookCategory[]
  ): CampaignHook[] {
    const allCategories: HookCategory[] = [
      'Dor',
      'Benefício',
      'Curiosidade',
      'Surpresa',
      'Demonstração',
      'Comparação',
      'Erro comum',
      'Antes e depois',
      'Prova',
      'Objeção',
      'Urgência',
      'Pergunta',
      'Pattern Interrupt',
      'Status',
      'Desejo',
      'FOMO',
      'UGC',
      'POV',
    ];

    const targetCategories = categoriesFilter?.length ? categoriesFilter : allCategories;
    const hooks: CampaignHook[] = [];

    const hookTemplates: Record<HookCategory, (p: Product) => { text: string; objective: string; visual: string; baseScore: number }> = {
      Dor: (p) => ({
        text: `Você ainda perde tempo sofrendo para resolver isso do jeito errado?`,
        objective: 'Criar identificação imediata com a frustração do prospect',
        visual: 'Close no rosto do apresentador com expressão de frustração, segurando o item concorrente danificado',
        baseScore: 89,
      }),
      Benefício: (p) => ({
        text: `Como resolver isso em menos de 30 segundos com o ${p.name}!`,
        objective: 'Destacar velocidade e benefício tangível instantâneo',
        visual: 'Mãos ativando o produto e cronômetro na tela marcando 30 segundos',
        baseScore: 92,
      }),
      Curiosidade: (p) => ({
        text: `O segredo que nenhuma loja tradicional quer que você descubra!`,
        objective: 'Abrir loop mental irresistível',
        visual: 'Dedo indicador fazendo sinal de segredo com o produto levemente oculto em foco seletivo',
        baseScore: 94,
      }),
      Surpresa: (p) => ({
        text: `Eu duvido você adivinhar o que acontece quando você aperta esse botão!`,
        objective: 'Quebra de expectativa sensorial',
        visual: 'Dedo pressionando o acionador do produto seguido de efeito luminoso potente',
        baseScore: 91,
      }),
      Demonstração: (p) => ({
        text: `Olha a potência do ${p.name} quando colocado à prova ao vivo!`,
        objective: 'Apresentar prova visual indiscutível',
        visual: 'Plano fechado no produto operando em velocidade máxima sob teste real',
        baseScore: 96,
      }),
      Comparação: (p) => ({
        text: `Produto de R$ 50 vs o ${p.name}: a diferença vai te chocar!`,
        objective: 'Ancoragem de qualidade e valor percebido',
        visual: 'Tela dividida comparando o modelo genérico quebrando vs o produto intacto',
        baseScore: 93,
      }),
      'Erro comum': (p) => ({
        text: `Se você faz isso na sua rotina, você está estragando tudo sem saber!`,
        objective: 'Gatilho de alerta e aversão ao erro',
        visual: 'X vermelho na tela sobre o método tradicional e transição com check verde no produto',
        baseScore: 88,
      }),
      'Antes e depois': (p) => ({
        text: `Veja como isso estava antes e como ficou depois em 10 segundos!`,
        objective: 'Retenção por contraste visual extremo',
        visual: 'Wipe vertical rápido revelando a transformação perfeita',
        baseScore: 95,
      }),
      Prova: (p) => ({
        text: `Mais de 10.000 pessoas já testaram e esse foi o resultado unânime!`,
        objective: 'Validação social maciça',
        visual: 'Apresentador mostra notas e depoimentos reais na tela com o produto ao lado',
        baseScore: 87,
      }),
      Objeção: (p) => ({
        text: `Será que funciona mesmo ou é só propaganda da internet?`,
        objective: 'Desarmar o ceticismo do espectador',
        visual: 'Criador olhando diretamente para a lente com olhar investigativo e ligando o produto',
        baseScore: 90,
      }),
      Urgência: (p) => ({
        text: `Preste muita atenção se você quer garantir o lote de hoje!`,
        objective: 'Conduzir para ação com urgência legítima',
        visual: 'Caixa do produto sendo embalada para envio imediato com selo de postagem prioritária',
        baseScore: 86,
      }),
      Pergunta: (p) => ({
        text: `Você trocaria esse incômodo diário por essa solução simples?`,
        objective: 'Forçar um "SIM" mental nos primeiros 2 segundos',
        visual: 'Apresentador aponta para a solução com sorriso confiante',
        baseScore: 85,
      }),
      'Pattern Interrupt': (p) => ({
        text: `PARE de rolar o feed agora se você não aguenta mais perder tempo!`,
        objective: 'Interrupção brusca do padrão de scroll',
        visual: 'Movimento de câmera whip-pan rápido com som de impacto visual',
        baseScore: 93,
      }),
      Status: (p) => ({
        text: `Para quem não aceita nada menos que a máxima qualidade do mercado.`,
        objective: 'Atrair compradores premium por pertencimento',
        visual: 'Iluminação cinematográfica escura com reflexos dourados e metálicos',
        baseScore: 88,
      }),
      Desejo: (p) => ({
        text: `O resultado perfeito que você sempre sonhou ter no seu dia a dia!`,
        objective: 'Ativar o desejo latente de realização',
        visual: 'Cena em alta definição com estética aspiracional limpa',
        baseScore: 90,
      }),
      FOMO: (p) => ({
        text: `Quem comprou no primeiro lote nunca mais ficou sem!`,
        objective: 'Aversão à perda de uma oportunidade genuína',
        visual: 'Apresentador segurando a embalagem oficial com selo de garantia',
        baseScore: 89,
      }),
      UGC: (p) => ({
        text: `Gente, acabei de receber esse pacote e vocês precisam ver isso!`,
        objective: 'Gerar autenticidade de criador nativo no TikTok',
        visual: 'Gravação em modo selfie segurando a caixa recém-chegada com reação espontânea',
        baseScore: 94,
      }),
      POV: (p) => ({
        text: `POV: Você acabou de descobrir a melhor compra do ano para a sua rotina.`,
        objective: 'Imersão em primeira pessoa',
        visual: 'Mãos em primeiro plano interagindo com o produto como se fossem os olhos do espectador',
        baseScore: 96,
      }),
    };

    const methodsPool = selectedMethods.length > 0 ? selectedMethods : ['china', 'drive_thru', 'fomo', 'pov', 'ugc', 'demo'] as SalesMethodId[];

    for (let i = 0; i < count; i++) {
      const cat = targetCategories[i % targetCategories.length];
      const methodId = methodsPool[i % methodsPool.length];
      const methodObj = SALES_METHODS.find((m) => m.id === methodId);
      const angle = angles[i % Math.max(1, angles.length)]?.name || 'Abordagem Direta';
      const template = hookTemplates[cat](product);

      // Add slight variation suffix if generating large batches
      const variationText = i >= targetCategories.length
        ? `${template.text} (Variação ${Math.floor(i / targetCategories.length) + 1})`
        : template.text;

      hooks.push({
        id: `hook_${Date.now()}_${i + 1}`,
        text: variationText,
        category: cat,
        angle,
        salesMethodId: methodId,
        salesMethodName: methodObj?.name || 'Método de Vendas',
        objective: template.objective,
        retentionHeuristicScore: Math.min(99, template.baseScore + ((i % 5) - 2)),
        visualActionPrompt: template.visual,
      });
    }

    return hooks;
  }

  // =========================================================================
  // ETAPA 6 — GERADOR DE ROTEIROS (8 Fases Estruturadas + Duração)
  // =========================================================================
  public generateScripts(
    product: Product,
    icp: CampaignICP,
    offer: CampaignOffer,
    hooks: CampaignHook[],
    angles: CampaignAngle[],
    selectedMethods: SalesMethodId[],
    duration: CampaignDuration = 30,
    character?: Character,
    count = 10
  ): CampaignScript[] {
    const scripts: CampaignScript[] = [];
    const methodsPool = selectedMethods.length > 0 ? selectedMethods : ['china', 'drive_thru', 'fomo', 'ugc', 'pov', 'pain_solution'] as SalesMethodId[];

    for (let i = 0; i < count; i++) {
      const hook = hooks[i % Math.max(1, hooks.length)] || {
        text: `Conheça a solução definitiva para o seu dia a dia com o ${product.name}!`,
        id: `hook_default_${i}`,
        visualActionPrompt: 'Apresentador demonstra o produto com sorriso confiante',
      };
      const angle = angles[i % Math.max(1, angles.length)] || {
        id: `angle_default_${i}`,
        category: 'Demonstração' as AngleCategory,
        name: 'Demonstração Prática',
        promise: 'Resultados visíveis com facilidade total',
      };
      const methodId = methodsPool[i % methodsPool.length];
      const methodObj = SALES_METHODS.find((m) => m.id === methodId);

      const scriptDuration = duration;
      const scenes: CampaignScriptScene[] = [];

      // 8 Core Phases calculation based on total duration:
      // 1. HOOK (2-3s)
      // 2. PROBLEMA (3-5s)
      // 3. AGITAÇÃO (3-5s)
      // 4. SOLUÇÃO (3-6s)
      // 5. PRODUTO (4-8s)
      // 6. BENEFÍCIOS (4-8s)
      // 7. PROVA / OFERTA (4-8s)
      // 8. CTA (3-5s)

      const scale = scriptDuration / 30; // duration ratio

      scenes.push({
        order: 1,
        phase: 'HOOK',
        title: 'Gancho de Retenção Visual',
        spokenText: hook.text,
        visualAction: hook.visualActionPrompt || `Apresentador segura o ${product.name} em primeiro plano chamando atenção para a câmera`,
        onScreenText: hook.text.toUpperCase().slice(0, 45),
        cameraDirection: 'Zoom rápido de impacto com corte dinâmico',
        estimatedSeconds: Math.round(3 * scale),
      });

      scenes.push({
        order: 2,
        phase: 'PROBLEMA',
        title: 'Identificação da Dor',
        spokenText: `Se você passa por ${product.pains?.[0] || 'dificuldades na rotina com métodos antigos'}, você sabe o quanto isso é cansativo.`,
        visualAction: `Dramatização sutil da rotina do usuário enfrentando o problema comum com expressão de cansaço`,
        onScreenText: 'O PROBLEMA QUE TODO MUNDO ENFRENTA',
        cameraDirection: 'Plano médio com iluminação contrastada',
        estimatedSeconds: Math.round(4 * scale),
      });

      scenes.push({
        order: 3,
        phase: 'AGITACAO',
        title: 'Agitação do Incômodo',
        spokenText: `O pior é continuar gastando energia e dinheiro com soluções que não resolvem nada a longo prazo.`,
        visualAction: `Corte rápido mostrando a frustração das alternativas convencionais`,
        onScreenText: 'CHEGA DE PERDER TEMPO',
        cameraDirection: 'Movimento handheld dinâmico',
        estimatedSeconds: Math.round(3 * scale),
      });

      scenes.push({
        order: 4,
        phase: 'SOLUCAO',
        title: 'Introdução da Solução',
        spokenText: `É exatamente por isso que o ${product.name} foi desenvolvido com tecnologia de ponta.`,
        visualAction: `Entrada limpa do ${product.name} com iluminação focada e estética premium`,
        onScreenText: product.name.toUpperCase(),
        cameraDirection: 'Dolly in suave com foco direto no produto',
        estimatedSeconds: Math.round(4 * scale),
      });

      scenes.push({
        order: 5,
        phase: 'PRODUTO',
        title: 'Demonstração do Mecanismo',
        spokenText: `Com ${product.differentials?.[0] || 'mecanismo exclusivo'}, ele entrega eficiência máxima sem esforço.`,
        visualAction: `Macro close-up demonstrando os detalhes de acabamento e o mecanismo funcionando em alta velocidade`,
        onScreenText: 'TECNOLOGIA & EFICIÊNCIA',
        cameraDirection: 'Macro 50mm f/1.8 com profundidade de campo rasa',
        estimatedSeconds: Math.round(5 * scale),
      });

      scenes.push({
        order: 6,
        phase: 'BENEFICIOS',
        title: 'Benefícios Tangíveis',
        spokenText: `Você ganha ${product.benefits?.[0] || 'resultados imediatos'} e a tranquilidade de uma rotina muito mais prática.`,
        visualAction: `O apresentador demonstra o resultado final impecável com expressão de entusiasmo e aprovação`,
        onScreenText: product.benefits?.[0]?.toUpperCase() || 'RESULTADO IMEDIATO',
        cameraDirection: 'Plano médio aberto com sorriso e aprovação',
        estimatedSeconds: Math.round(4 * scale),
      });

      scenes.push({
        order: 7,
        phase: 'OFERTA',
        title: 'Proposta Comercial & Garantia',
        spokenText: `${offer.mainOffer} Tudo isso com ${offer.guarantee}.`,
        visualAction: `Exibição da embalagem completa com selo de garantia de 30 dias na tela`,
        onScreenText: `GARANTIA BLINDADA DE 30 DIAS`,
        cameraDirection: 'Câmera lenta com brilho de estúdio',
        estimatedSeconds: Math.round(4 * scale),
      });

      scenes.push({
        order: 8,
        phase: 'CTA',
        title: 'Chamada para Ação Final',
        spokenText: `${offer.cta}`,
        visualAction: `Dedo apontando para o botão de compra / link na bio com animação de clique`,
        onScreenText: 'CLIQUE NO LINK E GARANTA O SEU',
        cameraDirection: 'Zoom direto na CTA final',
        estimatedSeconds: Math.round(3 * scale),
      });

      const fullDialogue = scenes.map((s) => s.spokenText).join(' ');
      const visualPrompt = scenes.map((s) => `[Cena ${s.order}: ${s.visualAction}]`).join(' ');

      scripts.push({
        id: `script_${Date.now()}_${i + 1}`,
        title: `Roteiro #${i + 1} — ${methodObj?.name || 'Vendas'} (${angle.category})`,
        hookId: hook.id,
        hookText: hook.text,
        angleId: angle.id,
        angleCategory: angle.category,
        salesMethodId: methodId,
        salesMethodName: methodObj?.name || 'Método de Vendas',
        durationSeconds: scriptDuration,
        productName: product.name,
        emotion: 'Confiante, dinâmico e persuasivo',
        scenes,
        fullDialogue,
        ctaText: offer.cta,
        visualPrompt,
        estimatedDurationSeconds: scriptDuration,
      });
    }

    return scripts;
  }

  // =========================================================================
  // ETAPA 8 — GERADOR DE PROMPTS PROFISSIONAIS (Google Veo Compliant)
  // =========================================================================
  public generateVeoPrompt(
    script: CampaignScript,
    product: Product,
    character?: Character,
    bible?: ProjectBible,
    presetKey: keyof typeof PROMPT_STUDIO_PRESETS = 'ugc'
  ): string {
    const preset = PROMPT_STUDIO_PRESETS[presetKey] || PROMPT_STUDIO_PRESETS.ugc;

    const characterPart = character
      ? `Subject: ${character.consistencyPrompt || character.appearance}, ${character.personality}. Wearing ${character.clothing}. Exact consistent facial features, natural realistic skin texture.`
      : `Subject: Professional presenter demonstrating the product with natural friendly expressions and clear hand gestures.`;

    const productPart = `Product Focus: The real physical product "${product.name}", ${product.materials || 'premium materials with sleek finish'}. Accurate physical interaction, hands holding and operating the device cleanly.`;

    const cinematographyPart = `Cinematography: Native vertical 9:16 aspect ratio, 4K 60fps high dynamic range, crisp focal point, realistic studio lighting combined with soft natural bounce, smooth stabilized camera motion (${preset.defaults.cameraMovement || 'handheld dynamic'}), cinematic color grading.`;

    const sceneActionPart = `Action & Storyboard: ${script.visualPrompt}. Dialogue narration: "${script.fullDialogue.slice(0, 180)}...". Expressing emotion: ${script.emotion}.`;

    const negativeConstraints = `Negative constraints (strict avoidance): ${bible?.negativePromptRules || 'low quality, blurry face, extra fingers, distorted hands, morphing objects, watermark, text glitches, plastic fake skin, cartoonish 3D render, bad physics'}.`;

    return `${characterPart} | ${productPart} | ${cinematographyPart} | ${sceneActionPart} | ${negativeConstraints}`.trim();
  }

  // =========================================================================
  // ETAPA 18 — SCORE HEURÍSTICO DO CRIATIVO (10 Critérios)
  // =========================================================================
  public calculateCreativeScore(
    hookText: string,
    script: CampaignScript,
    offer: CampaignOffer,
    product: Product
  ): CampaignCreativeScore {
    // Heuristic metrics calculation
    const hookPower = Math.min(99, Math.max(70, 75 + (hookText.length > 20 && hookText.includes('?') ? 12 : 8) + (hookText.toLowerCase().includes('olha') || hookText.toLowerCase().includes('segredo') ? 8 : 4)));
    const promiseClarity = Math.min(99, Math.max(75, 80 + (offer.primaryBenefit ? 10 : 5)));
    const painConnection = Math.min(99, Math.max(70, 78 + (product.pains && product.pains.length > 0 ? 12 : 6)));
    const benefitClarity = Math.min(99, Math.max(75, 82 + (product.benefits && product.benefits.length > 0 ? 10 : 4)));
    const demoStrength = Math.min(99, Math.max(75, 85 + (script.scenes.some((s) => s.phase === 'PRODUTO' || s.phase === 'SOLUCAO') ? 8 : 2)));
    const productClarity = Math.min(99, Math.max(75, 88 + (product.differentials && product.differentials.length > 0 ? 7 : 3)));
    const ctaForce = Math.min(99, Math.max(70, 78 + (offer.cta.length > 10 ? 12 : 5)));
    const coherence = Math.min(99, Math.max(80, 86 + (script.scenes.length >= 6 ? 8 : 4)));
    const durationFit = script.durationSeconds === 15 || script.durationSeconds === 30 ? 94 : 88;
    const platformFit = 92; // Optimised for TikTok / Reels

    const overallScore = Math.round(
      (hookPower * 0.2) +
      (promiseClarity * 0.1) +
      (painConnection * 0.1) +
      (benefitClarity * 0.1) +
      (demoStrength * 0.15) +
      (productClarity * 0.1) +
      (ctaForce * 0.1) +
      (coherence * 0.05) +
      (durationFit * 0.05) +
      (platformFit * 0.05)
    );

    return {
      overallScore,
      hookPower,
      promiseClarity,
      painConnection,
      benefitClarity,
      demoStrength,
      productClarity,
      ctaForce,
      coherence,
      durationFit,
      platformFit,
      disclaimer: 'Score heurístico interno baseado em boas práticas de copy e retenção. Não constitui previsão ou garantia de métricas reais.',
    };
  }

  // =========================================================================
  // ETAPA 10 — MATRIZ DE VARIAÇÕES & COMBINADOR (HOOKS × ROTEIROS × CTAS)
  // =========================================================================
  public generateCreativesMatrix(
    campaignId: string,
    product: Product,
    hooks: CampaignHook[],
    scripts: CampaignScript[],
    offer: CampaignOffer,
    selectedMethods: SalesMethodId[],
    batchLimit: CampaignBatchQuantity = 25,
    character?: Character
  ): CampaignCreativeItem[] {
    const creatives: CampaignCreativeItem[] = [];
    const totalCombinations = hooks.length * scripts.length;
    const limit = Math.min(batchLimit, totalCombinations || batchLimit);

    let created = 0;

    for (let hIdx = 0; hIdx < hooks.length; hIdx++) {
      for (let sIdx = 0; sIdx < scripts.length; sIdx++) {
        if (created >= limit) break;

        const hook = hooks[hIdx];
        const script = scripts[sIdx];
        const methodId = script.salesMethodId || selectedMethods[0] || 'china';
        const methodObj = SALES_METHODS.find((m) => m.id === methodId);

        const prompt = this.generateVeoPrompt(script, product, character);
        const score = this.calculateCreativeScore(hook.text, script, offer, product);

        creatives.push({
          id: `creative_${Date.now()}_${created + 1}_${Math.random().toString(36).substring(2, 6)}`,
          campaignId,
          productId: product.id,
          productName: product.name,
          version: 'version 1',
          hookText: hook.text,
          salesMethodId: methodId,
          salesMethodName: methodObj?.name || 'Método de Vendas',
          angleCategory: hook.angle || script.angleCategory || 'Geral',
          scriptId: script.id,
          scriptTitle: script.title,
          script,
          ctaText: offer.cta,
          prompt,
          characterId: character?.id,
          characterName: character?.name,
          durationSeconds: script.durationSeconds,
          format: '9:16',
          resolution: '720p',
          score,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        created++;
      }
      if (created >= limit) break;
    }

    return creatives;
  }
}

export const campaignOrchestratorEngine = new CampaignOrchestratorEngine();
