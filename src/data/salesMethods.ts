import { SalesMethodInfo } from '../types';

export const SALES_METHODS: SalesMethodInfo[] = [
  {
    id: 'china',
    name: 'MÉTODO CHINA',
    emoji: '🇨🇳',
    tagline: 'Demonstração de hiper-eficiência com mecanismo revelado',
    description:
      'Foco extremo em demonstrar o mecanismo interno que resolve um problema cotidiano com velocidade absurda, sem rodeios.',
    category: 'direct',
    structure: ['Hook de Impacto', 'Problema Crítico', 'Mecanismo Exclusivo', 'Benefício Tangível', 'Prova Visual', 'Oferta Agressiva', 'CTA Imediata'],
  },
  {
    id: 'drive_thru',
    name: 'MÉTODO DRIVE-THRU',
    emoji: '🚗',
    tagline: 'Roteiro ultra-rápido, direto e cirúrgico (<8s)',
    description:
      'Feito para retenção em menos de 5 a 8 segundos. Entrega o gancho na cara, o problema e a solução com clareza visual absoluta.',
    category: 'direct',
    structure: ['Hook Relâmpago (<2s)', 'Problema Universal', 'Solução Instantânea', 'Benefício Principal', 'Oferta Rápida', 'CTA Direta'],
  },
  {
    id: 'fomo',
    name: 'MÉTODO FOMO',
    emoji: '🔥',
    tagline: 'Urgência real e aversão à perda genuína',
    description:
      'Gera necessidade imediata de compra sem falsa escassez. Baseia-se em oportunidades limitadas, prazos e vantagens reais.',
    category: 'psychology',
    structure: ['Hook de Oportunidade', 'Desejo Latente', 'Risco Real de Ficar de Fora', 'Urgência Legítima', 'Oferta Limitada', 'CTA Final'],
  },
  {
    id: 'challenger',
    name: 'METODOLOGIA DESAFIADORA (CHALLENGER)',
    emoji: '⚡',
    tagline: 'Ensina, customiza e assume o controle do diálogo comercial',
    description:
      'Desafia o status quo do espectador trazendo um insight revolucionário sobre o problema que ele nem sabia que tinha.',
    category: 'direct',
    structure: ['Insight Provocativo', 'Desconstrução do Mito', 'Impacto Financeiro/Pessoal', 'A Nova Abordagem', 'CTA de Adoção'],
  },
  {
    id: 'command_message',
    name: 'COMANDO DE VENDAS',
    emoji: '🎯',
    tagline: 'Alinhamento preciso de valor e diferenciação clara',
    description:
      'Comunica com precisão cirúrgica a dor do cliente, a solução ideal e como seu produto supera qualquer concorrente.',
    category: 'direct',
    structure: ['Diagnóstico da Dor Chave', 'Requisitos da Solução Ideal', 'Como Nosso Produto Cumpre', 'Métricas de Sucesso', 'CTA'],
  },
  {
    id: 'conceptual_selling',
    name: 'VENDAS CONCEITUAIS',
    emoji: '💡',
    tagline: 'Foco no conceito do cliente e na relação Ganha-Ganha',
    description:
      'Alinha o conceito mental que o cliente tem de sucesso com a experiência proporcionada pelo produto.',
    category: 'psychology',
    structure: ['Validação do Conceito do Cliente', 'Alinhamento de Expectativas', 'Apresentação Conceitual', 'Confirmação Mútua', 'CTA'],
  },
  {
    id: 'consultative_selling',
    name: 'VENDAS CONSULTIVAS',
    emoji: '👔',
    tagline: 'Orientação especializada e recomendação sob medida',
    description:
      'Atua como um especialista confiável que analisa o cenário e prescreve a melhor recomendação para o usuário.',
    category: 'organic',
    structure: ['Análise de Cenário', 'Identificação da Causa Raiz', 'Prescrição Especializada', 'Plano de Ação', 'CTA'],
  },
  {
    id: 'customer_centric',
    name: 'VENDAS CENTRADAS NO CLIENTE',
    emoji: '🤝',
    tagline: 'Solução sob a ótica das metas reais do comprador',
    description:
      'Prioriza a experiência e os objetivos individuais do comprador, eliminando qualquer pressão de venda tradicional.',
    category: 'organic',
    structure: ['Foco no Objetivo do Cliente', 'Remoção de Obstáculos', 'Experiência Fluida', 'Resultado Concreto', 'CTA'],
  },
  {
    id: 'gap_selling',
    name: 'VENDA COM DIFERENÇA DE PREÇO (GAP SELLING)',
    emoji: '⚖️',
    tagline: 'Evidencia o abismo entre o estado atual e o estado desejado',
    description:
      'Mede a distância entre onde o cliente está hoje e onde ele quer chegar, posicionando o produto como a única ponte viável.',
    category: 'direct',
    structure: ['Estado Atual (Doloroso)', 'Estado Futuro Desejado', 'O Custo de Continuar Igual', 'A Ponte de Acesso', 'CTA'],
  },
  {
    id: 'inbound',
    name: 'MÉTODO INBOUND',
    emoji: '🧲',
    tagline: 'Atração magnética por conteúdo de alto valor educativo',
    description:
      'Atrai o cliente naturalmente resolvendo uma dúvida prática e conduzindo-o suavemente até a oferta do produto.',
    category: 'organic',
    structure: ['Dica Prática Inicial', 'Desenvolvimento do Conteúdo', 'Transição Suave para a Ferramenta', 'Oferta Contextual', 'CTA'],
  },
  {
    id: 'meddic',
    name: 'MÉTODO MEDDIC',
    emoji: '📊',
    tagline: 'Métricas, critério de decisão e dor identificada',
    description:
      'Estrutura com alto rigor analítico: foca em métricas quantificáveis, ROI e critérios irrefutáveis de escolha.',
    category: 'direct',
    structure: ['Métrica de Impacto', 'Critério de Decisão Chave', 'Identificação da Dor Econômica', 'Prova de Retorno', 'CTA'],
  },
  {
    id: 'neat',
    name: 'MÉTODO NEAT',
    emoji: '🧩',
    tagline: 'Necessidades, Impacto Econômico, Acesso e Tempo',
    description:
      'Qualifica a necessidade essencial, demonstra o impacto no bolso e estabelece um horizonte de tempo urgente.',
    category: 'direct',
    structure: ['Necessidade Essencial', 'Impacto Econômico', 'Acesso Facilitado', 'Horizonte de Tempo', 'CTA'],
  },
  {
    id: 'sandler',
    name: 'SISTEMA SANDLER',
    emoji: '🛡️',
    tagline: 'Venda sem pressão, desarmando defesas do comprador',
    description:
      'Inverte o jogo da persuasão com psicologia reversa e diálogo honesto, fazendo o cliente convencer a si mesmo.',
    category: 'psychology',
    structure: ['Desarme de Defesa', 'Exploração da Dor Real', 'Investimento Consciente', 'Compromisso Mútuo', 'CTA'],
  },
  {
    id: 'snap',
    name: 'VENDAS SNAP',
    emoji: '⚡',
    tagline: 'Simples, Inestimável, Alinhado e Prioritário',
    description:
      'Feito para compradores ocupados e sobrecarregados: simplifica ao máximo a decisão e elimina qualquer atrito.',
    category: 'direct',
    structure: ['Gancho Ultra Simples', 'Valor Inestimável Evidenciado', 'Alinhamento Direto', 'Prioridade Imediata', 'CTA'],
  },
  {
    id: 'spin',
    name: 'MÉTODO SPIN SELLING',
    emoji: '🔄',
    tagline: 'Situação, Problema, Implicação e Necessidade de Solução',
    description:
      'A clássica metodologia que conduz o espectador pelas implicações graves de ignorar o problema até a necessidade urgente.',
    category: 'psychology',
    structure: ['Cenário / Situação', 'Problema Oculto', 'Implicação Negativa', 'Necessidade de Solução', 'Apresentação do Produto', 'CTA'],
  },
  {
    id: 'social_selling',
    name: 'VENDA SOCIAL',
    emoji: '📱',
    tagline: 'Construção de relacionamento e autoridade em redes',
    description:
      'Apresenta o produto através de engajamento social, menções orgânicas e recomendações entre pares.',
    category: 'organic',
    structure: ['Tendência nas Redes', 'Comunidade Comentando', 'Unboxing / Teste Real', 'Link Exclusivo', 'CTA'],
  },
  {
    id: 'solution_selling',
    name: 'VENDA DE SOLUÇÕES',
    emoji: '🛠️',
    tagline: 'Resolução completa com pacote integrado',
    description:
      'Foca em entregar não apenas um item, mas a solução definitiva que resolve todas as etapas do problema.',
    category: 'direct',
    structure: ['Mapeamento do Problema Amplo', 'A Solução Completa', 'Componentes Integrados', 'Garantia de Resolução', 'CTA'],
  },
  {
    id: 'tas',
    name: 'VENDAS PARA CONTAS-ALVO (TAS)',
    emoji: '🎯',
    tagline: 'Foco cirúrgico no perfil ideal de cliente de alto valor',
    description:
      'Comunicação ultra-segmentada para quem busca o padrão máximo de qualidade e não aceita concessões.',
    category: 'direct',
    structure: ['Segmentação Clara', 'Dores Específicas do Perfil', 'Solução Sob Medida', 'Status e Eficiência', 'CTA'],
  },
  {
    id: 'value_selling',
    name: 'VENDA BASEADA EM VALOR',
    emoji: '💎',
    tagline: 'Diferenciação clara baseada em valor mensurável',
    description:
      'Constrói valor irrefutável demonstrando economia de tempo, dinheiro e ganho de qualidade de vida.',
    category: 'direct',
    structure: ['Demonstração de Valor', 'Cálculo de Economia/Ganho', 'Comparativo de Custo-Benefício', 'Oferta de Alto Retorno', 'CTA'],
  },
  {
    id: 'heros_journey',
    name: 'JORNADA DO HERÓI',
    emoji: '🏹',
    tagline: 'A clássica trajetória do chamado à transformação épica',
    description:
      'Apresenta o cliente como o herói que supera o monstro (problema) com a ajuda de um mentor ou artefato mágico (produto).',
    category: 'story',
    structure: ['Mundo Comum', 'O Chamado / Desafio', 'A Queda / Frustração', 'O Mentor e o Artefato', 'A Vitória e Retorno', 'CTA'],
  },
  {
    id: 'sparklines',
    name: 'SPARKLINES (CONTRASTE CONSTANTE)',
    emoji: '📈',
    tagline: 'Alternância rítmica entre "O que é" e "O que poderia ser"',
    description:
      'Técnica de oratória e persuasão que cria tensão e desejo contrastando o tempo todo a realidade chata com o futuro incrível.',
    category: 'story',
    structure: ['Realidade Atual', 'Visão do Futuro', 'Contraste Dinâmico', 'O Clímax da Mudança', 'CTA'],
  },
  {
    id: 'four_w',
    name: 'MÉTODO 4W (WHAT, WHO, WHY, WHERE)',
    emoji: '🧭',
    tagline: 'O Que é, Para Quem é, Por Que Comprar e Onde Acessar',
    description:
      'Estrutura ultra-didática e objetiva que responde às 4 principais dúvidas do cérebro comprador em segundos.',
    category: 'direct',
    structure: ['What (O que é)', 'Who (Para quem serve)', 'Why (Por que você precisa)', 'Where (Onde garantir)', 'CTA'],
  },
  {
    id: 'conflict_turnaround',
    name: 'CONFLITO E VIRADA',
    emoji: '💥',
    tagline: 'Quebra de expectativa no momento crucial',
    description:
      'Começa com uma situação de quase desastre ou fracasso eminente e promove uma virada surpreendente com o produto.',
    category: 'story',
    structure: ['Ponto de Conflito Alto', 'Fracasso Iminente', 'Intervenção Surpreendente', 'Reviravolta Positiva', 'CTA'],
  },
  {
    id: 'product_placement',
    name: 'PRODUCT PLACEMENT',
    emoji: '🎬',
    tagline: 'Inserção sutil e elegante do produto no cotidiano aspiracional',
    description:
      'O produto aparece de forma fluida no estilo de vida desejado, gerando desejo subconsciente sem parecer comercial forçado.',
    category: 'story',
    structure: ['Cena de Lifestyle Atraente', 'Uso Natural do Produto', 'Expressão de Satisfação', 'Identificação Subjetiva', 'CTA'],
  },
  {
    id: 'case_study',
    name: 'CASES DE SUCESSO',
    emoji: '🏆',
    tagline: 'Resultados documentados e métricas reais de quem usou',
    description:
      'Apresentação documentada de antes e depois com dados, prazos e transformações reais de usuários.',
    category: 'direct',
    structure: ['Cenário Inicial do Usuário', 'Aplicação do Método/Produto', 'Resultados em Dias/Semanas', 'Depoimento e CTA'],
  },
  {
    id: 'what_if',
    name: 'MÉTODO "E SE?"',
    emoji: '🔮',
    tagline: 'Provocação hipotética que abre novas possibilidades',
    description:
      'Inicia desafiando a imaginação do prospect (ex: "E se você pudesse resolver isso em 30 segundos?") e entrega a resposta prática.',
    category: 'psychology',
    structure: ['Pergunta Hipotética Inspiradora', 'Expansão do Cenário Positivo', 'Revelação da Realidade Acessível', 'Oferta de Acesso', 'CTA'],
  },
  {
    id: 'fala',
    name: 'MÉTODO F.A.L.A.',
    emoji: '📢',
    tagline: 'Fixar Atenção, Atrair Interesse, Lembrar Benefício e Ação',
    description:
      'Fórmula clássica de copy brasileira focada em rápida retenção, magnetismo de interesse e chamada para ação forte.',
    category: 'direct',
    structure: ['F - Fixar Atenção', 'A - Atrair Interesse', 'L - Lembrar Benefício Central', 'A - Ação Imediata (CTA)'],
  },
  {
    id: 'pain_solution',
    name: 'DOR → SOLUÇÃO',
    emoji: '🎯',
    tagline: 'Agitação cirúrgica da dor seguida do alívio definitivo',
    description:
      'Identifica a dor mais incômoda do prospect, dramatiza o incômodo na vida real e introduz o produto como o alívio definitivo.',
    category: 'direct',
    structure: ['Diagnóstico da Dor', 'Agitação do Sofrimento', 'Apresentação da Cura', 'Validação Prática', 'CTA de Resgate'],
  },
  {
    id: 'direct_benefit',
    name: 'BENEFÍCIO DIRETO',
    emoji: '🧲',
    tagline: 'O resultado final na primeira cena',
    description:
      'Sem preliminares: mostra exatamente o resultado dos sonhos já conquistado e como o produto torna isso acessível hoje.',
    category: 'direct',
    structure: ['Resultado dos Sonhos', 'Como Funciona', 'Garantia de Entrega', 'Oferta Especial', 'CTA de Acesso'],
  },
  {
    id: 'curiosity',
    name: 'CURIOSIDADE / SEGREDO',
    emoji: '🧠',
    tagline: 'Quebra de padrão e revelação de segredo',
    description:
      'Abre um loop mental impossível de ignorar (ex: "Por que ninguém te contou isso antes?"), revelando a resposta com o produto.',
    category: 'psychology',
    structure: ['Quebra de Padrão (Loop Aberto)', 'Explicação Intrigante', 'Revelação do Produto', 'Demonstração Prática', 'CTA de Descoberta'],
  },
  {
    id: 'storytelling',
    name: 'STORYTELLING',
    emoji: '📖',
    tagline: 'Jornada de superação com identificação humana',
    description:
      'Conta uma micro-história de 3 atos: o protagonista frustrado, o ponto de virada e a nova realidade após utilizar a solução.',
    category: 'story',
    structure: ['Contexto Inicial', 'Momento de Frustração', 'Ponto de Virada', 'Transformação Visual', 'Convite ao Espectador'],
  },
  {
    id: 'testimonial',
    name: 'DEPOIMENTO REAL',
    emoji: '💬',
    tagline: 'Validação social de quem já testou e aprovou',
    description:
      'Formato de relato sincero de cliente satisfeito compartilhando como estava cético antes e como foi surpreendido.',
    category: 'organic',
    structure: ['Ceticismo Inicial', 'Momento do Teste', 'Surpresa com o Resultado', 'Recomendação Apaixonada', 'CTA'],
  },
  {
    id: 'ugc',
    name: 'UGC (USER GENERATED CONTENT)',
    emoji: '🎥',
    tagline: 'Autenticidade nativa de criador no TikTok/Reels',
    description:
      'Estilo de vídeo gravado em casa, com smartphone na mão, iluminação natural e linguagem informal e espontânea.',
    category: 'organic',
    structure: ['Gancho Autêntico', 'Problema Cotidiano', 'Descoberta do Produto', 'Experiência de Uso', 'Benefício Visível', 'Recomendação', 'CTA'],
  },
  {
    id: 'pov',
    name: 'POV (FIRST PERSON VIEW)',
    emoji: '👁️',
    tagline: 'Perspectiva em primeira pessoa imersiva',
    description:
      'A câmera é os olhos do cliente. O espectador sente que suas próprias mãos estão interagindo com o produto e colhendo o benefício.',
    category: 'organic',
    structure: ['Entrada em 1ª Pessoa', 'Interação Manual com o Produto', 'Experiência Sensorial', 'Resultado Imediato', 'Sensação de Vitória', 'CTA'],
  },
  {
    id: 'demo',
    name: 'DEMONSTRAÇÃO VISUAL',
    emoji: '🛍️',
    tagline: 'O produto em ação extrema sob teste',
    description:
      'Close-ups macro, teste de resistência, facilidade de uso ou comparação física que provam a superioridade do item.',
    category: 'direct',
    structure: ['Desafio/Teste Inicial', 'Execução do Teste', 'Resultado Impecável', 'Especificações Chave', 'Oferta e CTA'],
  },
  {
    id: 'offer',
    name: 'OFERTA IRRESISTÍVEL',
    emoji: '⚡',
    tagline: 'Ancoragem de preço, bônus e garantia inquebrável',
    description:
      'Estrutura focada em valor percebido, empilhamento de bônus e sensação de que seria tolice não aproveitar agora.',
    category: 'direct',
    structure: ['Ancoragem de Valor Alto', 'Condição Especial Única', 'Bônus Inclusos', 'Garantia Blindada', 'CTA de Compra'],
  },
  {
    id: 'viral',
    name: 'VIRAL / TRENDING',
    emoji: '🔥',
    tagline: 'Formato dinâmico baseado nas tendências do momento',
    description:
      'Áudios de ritmo acelerado, cortes rápidos, efeitos visuais e dinâmica feita para reter a atenção nas primeiras frações de segundo.',
    category: 'psychology',
    structure: ['Visual Stunner (0.5s)', 'Trend Hook', 'Rápida Demonstração', 'Comentário Reativo', 'CTA Divertida'],
  },
  {
    id: 'comparison',
    name: 'COMPARAÇÃO (NÓS VS ELES)',
    emoji: '⚔️',
    tagline: 'Contraste direto entre o método antigo e o seu produto',
    description:
      'Tela dividida ou comparação sequencial mostrando a frustração das alternativas convencionais contra a facilidade do seu produto.',
    category: 'direct',
    structure: ['O Jeito Tradicional (Frustrante)', 'O Jeito Novo (Fácil e Rápido)', 'Contraste Visual', 'Veredito Final', 'CTA'],
  },
  {
    id: 'status_desire',
    name: 'STATUS / DESEJO ELEVADO',
    emoji: '💎',
    tagline: 'Estilo cinematográfico e sofisticação aspiracional',
    description:
      'Posiciona o produto como um símbolo de sucesso, elegância e pertencimento a um grupo seleto de pessoas bem-sucedidas.',
    category: 'story',
    structure: ['Ambiente Elegante', 'Uso Natural do Produto', 'Reconhecimento Social', 'Sensação de Exclusividade', 'CTA Premium'],
  },
  {
    id: 'emotional_transformation',
    name: 'TRANSFORMAÇÃO EMOCIONAL',
    emoji: '❤️',
    tagline: 'Da insegurança à autoconfiança plena',
    description:
      'Conecta com os sentimentos mais profundos do cliente, mostrando como o produto devolveu a paz de espírito e a alegria.',
    category: 'story',
    structure: ['Estado Emocional Frágil', 'O Encontro com a Solução', 'A Mudança de Sentimento', 'Vida Renovada', 'CTA Inspirador'],
  },
  {
    id: 'custom_method',
    name: 'MÉTODO CUSTOMIZADO',
    emoji: '⚙️',
    tagline: 'Roteiro totalmente personalizado criado pelo usuário',
    description:
      'Permite criar e salvar regras, ganchos e estruturas proprietárias de vendas para aplicar em qualquer campanha.',
    category: 'direct',
    structure: ['Gancho Personalizado', 'Apresentação do Produto', 'Oferta Customizada', 'CTA'],
  },
];
