import {
  LiveBlock,
  LiveBlockType,
  LiveInteractionPrompt,
  LiveSalesDuration,
  LiveSalesScript,
  Product,
  ProjectBible,
} from '../../src/types';

export interface GenerateLiveScriptOptions {
  product?: Product;
  bible?: ProjectBible;
  productName: string;
  durationMinutes: LiveSalesDuration;
  targetAudience: string;
  offerDetails: string;
  hostStyle?: string;
  focusPoints?: string[];
}

export class LiveSalesEngine {
  /**
   * Gera um roteiro completo de Live de vendas estruturado por blocos modulares
   */
  public generateLiveScript(options: GenerateLiveScriptOptions): LiveSalesScript {
    const {
      productName,
      durationMinutes,
      targetAudience,
      offerDetails,
      product,
      bible,
    } = options;

    const pBenefit = product?.benefits?.[0] || bible?.primaryBenefits?.[0] || 'transformação e resultados práticos';
    const pPain = product?.pains?.[0] || 'perder tempo e dinheiro com métodos antigos';
    const pDiff = product?.differentials?.[0] || 'tecnologia inovadora e facilidade de uso';
    const pPrice = product?.price ? `R$ ${product.price}` : 'condição especial desta Live';

    const blocks: LiveBlock[] = [];

    if (durationMinutes === 5) {
      // 5 min express live: Abertura & Hook (1m) -> Problema & Demonstração (2m) -> Oferta & CTA (2m)
      blocks.push({
        id: `blk_live_1_${Math.random().toString(36).substring(2, 6)}`,
        type: 'opening',
        title: '1. Abertura Enérgica & Hook de Entrada',
        durationMinutes: 1,
        objective: 'Reter quem está entrando na Live nos primeiros 10 segundos e anunciar o tema',
        speakerSpeech: `Fala pessoal! Sejam muito bem-vindos! Se você estava procurando uma solução definitiva para ${pPain}, fica comigo nestes próximos 5 minutos porque eu vou te mostrar algo surreal com o ${productName}!`,
        action: 'Acenar com energia, segurar o produto em mãos bem próximo da câmera com iluminação frontal limpa.',
        productName,
        benefitHighlight: pBenefit,
        offerHighlight: offerDetails || 'Condição de Live liberada',
        cta: 'Toque na sacolinha amarela no canto da tela',
        audienceQuestionPrompt: 'Comente aqui embaixo de onde você está assistindo e se você já conhece o produto!',
        onScreenText: `🔴 AO VIVO: ${productName} — Teste Prático`,
        speakerNotes: 'Mantenha tom vibrante e acolhedor. Sorria e olhe diretamente para a lente.',
        orderIndex: 0,
      });

      blocks.push({
        id: `blk_live_2_${Math.random().toString(36).substring(2, 6)}`,
        type: 'demonstration',
        title: '2. Demonstração Prática Sem Cortes',
        durationMinutes: 2,
        objective: 'Provar a eficiência do produto e quebrar o ceticismo',
        speakerSpeech: `Dá uma olhada nisto aqui ao vivo! Sem truques e sem enrolação: olha como o ${productName} resolve o problema de forma simples. O grande diferencial é ${pDiff}, entregando ${pBenefit} em instantes!`,
        action: 'Fazer o teste em tempo real com a câmera focando nos detalhes e nas funções principais.',
        productName,
        benefitHighlight: pBenefit,
        offerHighlight: offerDetails,
        cta: 'A sacolinha amarela está com desconto ativo',
        audienceQuestionPrompt: 'Quem aí também precisa de uma praticidade dessa no dia a dia?',
        onScreenText: `🧪 Teste em Tempo Real — ${pDiff}`,
        speakerNotes: 'Mostre os ângulos, demonstre a pegada ergonômica e a facilidade.',
        orderIndex: 1,
      });

      blocks.push({
        id: `blk_live_3_${Math.random().toString(36).substring(2, 6)}`,
        type: 'cta',
        title: '3. Oferta Especial & Chamada para Ação',
        durationMinutes: 2,
        objective: 'Conduzir os espectadores ao checkout no TikTok Shop',
        speakerSpeech: `Para quem está aqui na Live agora, nós liberamos ${offerDetails || `o valor especial de ${pPrice}`} com frete e garantia total. Basta tocar na sacolinha amarela aqui embaixo e garantir o seu antes que o lote da Live se encerre!`,
        action: 'Apontar para o ícone de compra na tela, exibir a caixa do produto e reforçar a garantia.',
        productName,
        benefitHighlight: pBenefit,
        offerHighlight: offerDetails || `Por apenas ${pPrice}`,
        cta: 'Toque na sacola e finalize o pedido no TikTok Shop',
        audienceQuestionPrompt: 'Quem já garantiu o seu, manda "GARANTIDO" aqui no chat!',
        onScreenText: `🛒 TOQUE NA SACOLINHA E APROVEITE`,
        speakerNotes: 'Reforce que a entrega é garantida pelo TikTok Shop e o pagamento é 100% seguro.',
        orderIndex: 2,
      });
    } else if (durationMinutes === 15) {
      // 15 min live: Abertura (2m) -> Problema (2m) -> Demonstração 1 (3m) -> Benefícios (2m) -> Objeções (2m) -> Oferta (2m) -> CTA & Encerramento (2m)
      const templates15: Array<{ type: LiveBlockType; title: string; duration: number; obj: string; speech: string; action: string; prompt: string; screenText: string; notes: string }> = [
        {
          type: 'opening',
          title: '1. Abertura & Boas-vindas',
          duration: 2,
          obj: 'Captar a audiência e fixar a promessa da Live',
          speech: `Boa noite, pessoal! Sejam muito bem-vindos! Hoje eu preparei uma demonstração especial do ${productName}. Quem ficar até o final vai entender por que esse produto virou febre no TikTok!`,
          action: 'Recepcionar com energia, ajustar a câmera e posicionar o produto na bancada.',
          prompt: 'De qual cidade você está falando? Manda aqui nos comentários!',
          screenText: `🔴 LIVE ESPECIAL: Conheça o ${productName}`,
          notes: 'Cumprimente as pessoas que forem entrando pelo nome de usuário.',
        },
        {
          type: 'problem',
          title: '2. A Dor Comum & O Grande Problema',
          duration: 2,
          obj: 'Conectar emocionalmente com a frustração do dia a dia',
          speech: `Quantas vezes você já se pegou estressado com ${pPain}? A gente tenta soluções caseiras, compra coisas caras e no fim só perde tempo. É exatamente essa dor que vamos resolver hoje.`,
          action: 'Expressar empatia, balançar a cabeça e mostrar que compreende a frustração.',
          prompt: 'Quem aqui já passou raiva tentando resolver isso? Manda um "EU" no chat!',
          screenText: `❌ Cansado de sofrer com ${pPain.slice(0, 30)}?`,
          notes: 'Valide as dores relatadas nos comentários em tempo real.',
        },
        {
          type: 'demonstration',
          title: '3. Demonstração Prática & Mecanismo',
          duration: 3,
          obj: 'Apresentar a tecnologia e a facilidade de uso',
          speech: `Olha só como o ${productName} funciona na prática! Basta fazer este movimento simples. O mecanismo de ${pDiff} faz todo o trabalho pesado por você. Veja o resultado!`,
          action: 'Demonstrar o produto em funcionamento com close-up nítido nos detalhes.',
          prompt: 'Vocês conseguem ver a diferença na textura e na velocidade?',
          screenText: `✨ Demonstração ao vivo do ${productName}`,
          notes: 'Faça pausas dramáticas para que o público absorva a qualidade visual.',
        },
        {
          type: 'benefits',
          title: '4. Principais Benefícios & Transformação',
          duration: 2,
          obj: 'Destacar o ganho de tempo, conforto e economia',
          speech: `O melhor de tudo não é só a rapidez: é você ter a tranquilidade de ${pBenefit} todos os dias sem complicação!`,
          action: 'Segurar o produto com postura de orgulho e mostrar a leveza/acabamento.',
          prompt: 'Qual desses benefícios faria mais diferença na sua rotina hoje?',
          screenText: `🔥 Benefício: ${pBenefit.slice(0, 35)}`,
          notes: 'Foque nos ganhos práticos de tempo e dinheiro.',
        },
        {
          type: 'objections',
          title: '5. Quebra de Objeções Comuns',
          duration: 2,
          obj: 'Responder às principais dúvidas sobre durabilidade e garantia',
          speech: `Muita gente me pergunta: "Mas será que é resistente? Será que serve para o meu dia a dia?" Sim! O material é de alta durabilidade e você conta com a garantia completa do fabricante!`,
          action: 'Mostrar a solidez dos materiais, os encaixes e o acabamento premium.',
          prompt: 'Tem alguma dúvida sobre como usar? Manda sua pergunta aqui que eu respondo agora!',
          screenText: `💬 Respondendo Dúvidas ao Vivo`,
          notes: 'Seja transparente e detalhista nas explicações técnicas.',
        },
        {
          type: 'offer',
          title: '6. Apresentação da Oferta & Bônus',
          duration: 2,
          obj: 'Apresentar a condição comercial exclusiva',
          speech: `Para quem está acompanhando esta transmissão, conseguimos ativar ${offerDetails || `o valor de ${pPrice}`} diretamente na sacolinha do TikTok Shop!`,
          action: 'Exibir a embalagem oficial, o conteúdo da caixa e os brindes se houver.',
          prompt: 'Clica na sacolinha amarela para ver o cupom disponível para você!',
          screenText: `🎁 OFERTA EXCLUSIVA DESTA LIVE`,
          notes: 'Mencione a segurança do checkout oficial do TikTok.',
        },
        {
          type: 'cta',
          title: '7. Chamada para Ação Final & Encerramento',
          duration: 2,
          obj: 'Finalizar com incentivo à compra imediata',
          speech: `Não deixe para depois! Toque na sacolinha amarela agora, confirme seu endereço e garanta a sua unidade. Muito obrigado pela companhia de todos e até a próxima!`,
          action: 'Apontar para o botão de compra, agradecer a audiência e acenar calorosamente.',
          prompt: 'Quem garantiu, comente "COMPREI" que vou mandar um abraço ao vivo!',
          screenText: `🛒 TOQUE NA SACOLINHA E GARANTA O SEU`,
          notes: 'Agradeça a quem comprou e mencione que a transmissão continuará nos bastidores.',
        },
      ];

      templates15.forEach((t, i) => {
        blocks.push({
          id: `blk_live_15_${i + 1}_${Math.random().toString(36).substring(2, 6)}`,
          type: t.type,
          title: t.title,
          durationMinutes: t.duration,
          objective: t.obj,
          speakerSpeech: t.speech,
          action: t.action,
          productName,
          benefitHighlight: pBenefit,
          offerHighlight: offerDetails,
          cta: 'Toque na sacolinha amarela',
          audienceQuestionPrompt: t.prompt,
          onScreenText: t.screenText,
          speakerNotes: t.notes,
          orderIndex: i,
        });
      });
    } else {
      // 30 ou 60 minutos: Estrutura em ciclos com repetição estratégica e novos ângulos
      const cycleCount = durationMinutes === 30 ? 2 : 4;
      const cycleDuration = durationMinutes / cycleCount;
      let globalIndex = 0;

      for (let c = 0; c < cycleCount; c++) {
        const cycleNum = c + 1;
        blocks.push({
          id: `blk_live_cyc_${c}_open_${Math.random().toString(36).substring(2, 6)}`,
          type: c === 0 ? 'opening' : 'new_hook',
          title: c === 0 ? '1. Abertura & Boas-vindas' : `${globalIndex + 1}. Novo Hook — Ciclo ${cycleNum} (Entrada de Novo Público)`,
          durationMinutes: Math.max(1, Math.round(cycleDuration * 0.15)),
          objective: 'Reter quem acabou de entrar e recapitular a oportunidade',
          speakerSpeech:
            c === 0
              ? `Fala galera! Sejam muito bem-vindos à nossa Live oficial do ${productName}! Fiquem comigo porque hoje teremos demonstrações incríveis e condições únicas!`
              : `Para quem está chegando agora na Live: nós estamos testando ao vivo o famoso ${productName}, o produto que está revolucionando a entrega de ${pBenefit}!`,
          action: 'Cumprimentar com entusiasmo, segurar o produto em posição nobre.',
          productName,
          benefitHighlight: pBenefit,
          offerHighlight: offerDetails,
          cta: 'Toque na sacolinha amarela',
          audienceQuestionPrompt: 'Quem tá chegando agora, comenta um "OI" e a cidade de onde assiste!',
          onScreenText: `🔴 AO VIVO [Ciclo ${cycleNum}]: ${productName}`,
          speakerNotes: 'Lembre-se que o público de Live do TikTok se renova a cada poucos minutos.',
          orderIndex: globalIndex++,
        });

        blocks.push({
          id: `blk_live_cyc_${c}_demo_${Math.random().toString(36).substring(2, 6)}`,
          type: c === 0 ? 'demonstration' : 'new_demo',
          title: `${globalIndex + 1}. Demonstração Prática — Ângulo ${cycleNum}`,
          durationMinutes: Math.max(2, Math.round(cycleDuration * 0.35)),
          objective: `Demonstrar o produto com foco especial no diferencial: ${cycleNum === 1 ? 'Facilidade de uso' : cycleNum === 2 ? 'Durabilidade e potência' : 'Economia e versatilidade'}`,
          speakerSpeech: `Vejam esse teste detalhado: olha como a tecnologia de ${pDiff} atua diretamente no problema de ${pPain}!`,
          action: 'Executar demonstração em close com teste sensorial (som, toque, velocidade).',
          productName,
          benefitHighlight: pBenefit,
          offerHighlight: offerDetails,
          cta: 'Aproveite o preço especial na sacolinha',
          audienceQuestionPrompt: 'Vocês querem que eu teste em qual outra situação? Mandem sugestões!',
          onScreenText: `🧪 Teste em Tempo Real — ${pDiff}`,
          speakerNotes: 'Interaja diretamente com as sugestões mais curiosas do chat.',
          orderIndex: globalIndex++,
        });

        blocks.push({
          id: `blk_live_cyc_${c}_interact_${Math.random().toString(36).substring(2, 6)}`,
          type: 'interaction',
          title: `${globalIndex + 1}. Interação & Resposta a Objeções (Ciclo ${cycleNum})`,
          durationMinutes: Math.max(1, Math.round(cycleDuration * 0.2)),
          objective: 'Engajar a comunidade e dissipar hesitações de compra',
          speakerSpeech: `Olha essa dúvida excelente que mandaram: "Como funciona a garantia e o prazo de entrega?" Pessoal, comprando pelo TikTok Shop a entrega é rastreada e você tem garantia total!`,
          action: 'Ler os comentários olhando para a tela secundária ou celular, respondendo com naturalidade.',
          productName,
          benefitHighlight: pBenefit,
          offerHighlight: offerDetails,
          cta: 'Consulte o prazo para o seu CEP na sacolinha',
          audienceQuestionPrompt: 'Qual é a maior dúvida que você tem sobre o produto?',
          onScreenText: `💬 Dúvidas ao Vivo & Garantia Oficial`,
          speakerNotes: 'Transmita calma, segurança e domínio pleno do produto.',
          orderIndex: globalIndex++,
        });

        blocks.push({
          id: `blk_live_cyc_${c}_cta_${Math.random().toString(36).substring(2, 6)}`,
          type: c === cycleCount - 1 ? 'closing' : 'new_cta',
          title: `${globalIndex + 1}. Chamada para Ação & Oferta (Ciclo ${cycleNum})`,
          durationMinutes: Math.max(1, Math.round(cycleDuration * 0.3)),
          objective: 'Gerar o pico de conversões da rodada',
          speakerSpeech: `Aproveitem a condição liberada para esta Live: ${offerDetails || `Apenas ${pPrice}`} tocando na sacolinha amarela no canto inferior esquerdo!`,
          action: 'Exibir a caixa do produto, apontar repetidamente para o link de compra com animação.',
          productName,
          benefitHighlight: pBenefit,
          offerHighlight: offerDetails,
          cta: 'Toque na sacolinha amarela agora',
          audienceQuestionPrompt: 'Quem comprar agora avisa aqui no chat para eu agradecer nominalmente!',
          onScreenText: `🛒 TOQUE NA SACOLINHA — CONDIÇÃO DA LIVE`,
          speakerNotes: 'Celebre cada novo comprador para incentivar a audiência restante.',
          orderIndex: globalIndex++,
        });
      }
    }

    // Prompts de interação e perguntas para o apresentador (sem comentários ou dados fictícios)
    const interactionPrompts: LiveInteractionPrompt[] = [
      {
        id: `int_1_${Math.random().toString(36).substring(2, 6)}`,
        category: 'questions',
        categoryLabel: 'Perguntas para a Audiência',
        promptText: 'Pergunte à audiência: "Quem aqui já tentou outras soluções e não teve resultado?"',
        suggestedAction: 'Aguardar 5 segundos enquanto lê as respostas com acenos de concordância.',
        targetMoment: 'Durante a transição entre abertura e problema',
      },
      {
        id: `int_2_${Math.random().toString(36).substring(2, 6)}`,
        category: 'demonstration',
        categoryLabel: 'Provocação de Demonstração',
        promptText: 'Diga: "Vocês querem que eu faça o teste mais pesado agora ou querem ver os detalhes primeiro?"',
        suggestedAction: 'Fazer enquete rápida no chat e atender à opção mais votada.',
        targetMoment: 'No início do bloco de demonstração prática',
      },
      {
        id: `int_3_${Math.random().toString(36).substring(2, 6)}`,
        category: 'product',
        categoryLabel: 'Foco no Mecanismo',
        promptText: 'Aproxime o produto da lente e pergunte: "Dá para ver a textura e o acabamento premium daí?"',
        suggestedAction: 'Girar o produto devagar sob a luz para evidenciar os reflexos e a qualidade.',
        targetMoment: 'Durante a apresentação de diferenciais',
      },
      {
        id: `int_4_${Math.random().toString(36).substring(2, 6)}`,
        category: 'cta',
        categoryLabel: 'Instrução Visual de Checkout',
        promptText: 'Explique o caminho: "É só clicar na sacolinha amarela no canto esquerdo, selecionar a quantidade e confirmar."',
        suggestedAction: 'Apontar para o local exato na tela com o dedo indicador.',
        targetMoment: 'Em todos os blocos de CTA',
      },
      {
        id: `int_5_${Math.random().toString(36).substring(2, 6)}`,
        category: 'follow_profile',
        categoryLabel: 'Seguir o Perfil',
        promptText: 'Lembrete de retenção: "Se você gosta desse tipo de conteúdo e quer mais ofertas exclusivas, toca no botão de seguir aqui em cima!"',
        suggestedAction: 'Apontar para o canto superior onde fica a foto de perfil.',
        targetMoment: 'No meio da transmissão',
      },
      {
        id: `int_6_${Math.random().toString(36).substring(2, 6)}`,
        category: 'retention',
        categoryLabel: 'Pique de Retenção & Tap na Tela',
        promptText: 'Peça engajamento: "Bora bater a meta de curtidas da Live! Dê dois toques na tela se você está curtindo o teste!"',
        suggestedAction: 'Tocar no ar simulando os toques na tela.',
        targetMoment: 'Momentos antes de uma demonstração de grande impacto',
      },
    ];

    return {
      id: `live_script_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `Roteiro de Live — ${productName} (${durationMinutes}min)`,
      productName,
      durationMinutes,
      targetAudience,
      offerDetails,
      blocks,
      interactionPrompts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const liveSalesEngine = new LiveSalesEngine();
