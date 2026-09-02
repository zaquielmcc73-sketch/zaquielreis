import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Brain,
  Video,
  Flame,
  Layers,
  Sliders,
  Eye,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  PackageCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppSettings, CampaignFormData, ProjectBible, SalesMethodId } from '../types';
import { SALES_METHODS } from '../data/salesMethods';

interface CreateCampaignViewProps {
  settings: AppSettings | null;
  bible: ProjectBible | null;
  onGenerateBatch: (campaign: CampaignFormData) => Promise<void>;
  onGenerateTestVideo: (campaign: CampaignFormData) => Promise<void>;
  onOpenBible: () => void;
}

export const CreateCampaignView: React.FC<CreateCampaignViewProps> = ({
  settings,
  bible,
  onGenerateBatch,
  onGenerateTestVideo,
  onOpenBible,
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: 'Campanha Lançamento Veo',
    product: bible?.productName || 'UltraClean Titanium',
    description: bible?.description || 'O revolucionário higienizador ultrassônico para limpeza profunda em segundos.',
    price: 'R$ 297,00',
    promoPrice: 'R$ 147,00',
    offer: bible?.irresistibleOffer || '50% OFF + Frete Grátis apenas hoje',
    targetAudience: bible?.targetAudience || 'Homens e mulheres de 25 a 55 anos que valorizam praticidade e higiene',
    pain: 'Perder horas esfregando sujeiras difíceis e danificando objetos delicados',
    desire: 'Limpeza cirúrgica com aperto de um botão em menos de 60 segundos',
    benefits: 'Tecnologia ultrassônica, portátil, bateria de longa duração, à prova dágua',
    differentials: 'Frequência de 45.000Hz com liga de titânio aeroespacial',
    socialProof: '+ de 14.800 clientes satisfeitos e 4.9 estrelas no Reclame Aqui',
    guarantee: 'Garantia incondicional de 30 dias com devolução total do dinheiro',
    cta: 'Toque no botão e garanta o seu com 50% de desconto hoje!',
    videoCount: 75,
    selectedModel: settings?.selectedModel || 'veo-3.1-lite-generate-preview',
    aspectRatio: '9:16',
    resolution: '720p',
    povConfig: {
      perspective: 'first_person',
      characterGender: 'man',
      environment: 'kitchen',
      motionStyle: 'natural',
      showHands: true,
      showFace: false,
      hasVoice: true,
      hasDialogue: true,
      language: 'pt_BR',
    },
    ugcConfig: {
      creatorGender: 'woman',
      ageRange: '25-34',
      environment: 'kitchen',
      speechStyle: 'excited_reviewer',
      emotionalTone: 'obsessed',
    },
    chinaConfig: {
      hook: 'Olha o que acontece quando você coloca essa sujeira aqui...',
      problem: 'O método convencional não alcança os cantos difíceis.',
      mechanism: 'Micro-bolhas de cavitação ultrassônica implodem a sujeira.',
      benefit: 'Limpeza 100% perfeita sem esfregar.',
      proof: 'Veja o antes e depois em câmera lenta.',
      offer: 'Compre 1 e leve o kit de acessórios grátis.',
      cta: 'Clique no link e peça agora!',
    },
    driveThruConfig: {
      fastHook: 'Para tudo! Isso limpa em 3 segundos.',
      problem: 'Você ainda esfrega com escova?',
      solution: 'Use o UltraClean Titanium.',
      mainBenefit: 'Brilho de novo instantâneo.',
      offer: '50% OFF hoje.',
      cta: 'Toque em Comprar.',
    },
    fomoConfig: {
      hook: 'Últimas 17 unidades do lote de importação!',
      opportunity: 'Preço congelado antes do aumento da tabela.',
      desire: 'Receba na sua casa com frete expresso.',
      riskOfLoss: 'Quando o estoque zerar, a promoção acaba.',
      urgency: 'Oferta válida até às 23:59.',
      offer: 'De R$ 297 por R$ 147.',
      cta: 'Garanta sua unidade agora.',
      hasRealScarcity: true,
      realUnitsRemaining: 17,
      realDeadline: 'Hoje às 23:59',
      realPromoPrice: 'R$ 147,00',
    },
    methodsDistribution: {
      china: 10,
      drive_thru: 10,
      fomo: 10,
      pov: 15,
      ugc: 15,
      storytelling: 10,
      demo: 5,
      pain_solution: 0,
      direct_benefit: 0,
      curiosity: 0,
      testimonial: 0,
      offer: 0,
      viral: 0,
      comparison: 0,
      status_desire: 0,
      emotional_transformation: 0,
    },
  });

  const [isAiRecommending, setIsAiRecommending] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [showAdvancedConfigs, setShowAdvancedConfigs] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  const totalDistributed = Object.values(formData.methodsDistribution).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
  const isDistributionBalanced = totalDistributed === formData.videoCount;

  const handleVideoCountChange = (count: 1 | 5 | 10 | 25 | 50 | 75) => {
    // Re-scale distribution
    const keys = Object.keys(formData.methodsDistribution) as SalesMethodId[];
    const activeKeys = keys.filter((k) => formData.methodsDistribution[k] > 0);
    const selectedKeys = activeKeys.length > 0 ? activeKeys : ['pov', 'ugc', 'china', 'drive_thru', 'fomo'];

    const newDist: Record<SalesMethodId, number> = { ...formData.methodsDistribution };
    keys.forEach((k) => {
      newDist[k] = 0;
    });

    let allocated = 0;
    selectedKeys.forEach((k, idx) => {
      if (idx === selectedKeys.length - 1) {
        newDist[k] = count - allocated;
      } else {
        const val = Math.max(1, Math.floor(count / selectedKeys.length));
        newDist[k] = val;
        allocated += val;
      }
    });

    setFormData((prev) => ({
      ...prev,
      videoCount: count,
      methodsDistribution: newDist,
    }));
  };

  const handleAiRecommendMethods = async () => {
    setIsAiRecommending(true);
    try {
      const res = await fetch('/api/ai-recommend-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: formData, quantity: formData.videoCount }),
      });
      const data = await res.json();
      if (data.distribution) {
        setFormData((prev) => ({
          ...prev,
          methodsDistribution: data.distribution,
        }));
        setAiRationale(data.strategySummary || 'Estratégia multiformato calculada com base no seu produto e público.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiRecommending(false);
    }
  };

  const handleTestVideoClick = async () => {
    setIsSubmittingTest(true);
    try {
      await onGenerateTestVideo(formData);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleBatchClick = async () => {
    setIsSubmittingBatch(true);
    try {
      await onGenerateBatch(formData);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>Criador de Campanhas em Lote</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Criar Campanha de Vídeos de Vendas
          </h2>
          <p className="text-xs text-slate-400">
            Configure o produto e gere de 1 a 75 variações não-repetitivas com métodos persuasivos integrados.
          </p>
        </div>

        {/* Quantity selector pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
            Quantidade de Vídeos
          </label>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {([1, 5, 10, 25, 50, 75] as const).map((cnt) => (
              <button
                key={cnt}
                id={`btn-quantity-${cnt}`}
                type="button"
                onClick={() => handleVideoCountChange(cnt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  formData.videoCount === cnt
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-cyan-400" />
                <span>Dados do Produto & Oferta</span>
              </h3>
              <button
                type="button"
                onClick={onOpenBible}
                className="text-xs text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Sincronizar com Project Bible →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Nome da Campanha <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: Campanha Escova Ultrassônica Q3"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Produto <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: UltraClean Titanium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Público-Alvo</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: Homens e mulheres de 25-50 anos"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Descrição do Produto</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Descreva detalhadamente o produto e como ele atua..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Preço Regular</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: R$ 297,00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Preço Promocional</label>
                <input
                  type="text"
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: R$ 147,00"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Oferta Principal (Hook de Venda)</label>
                <input
                  type="text"
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: 50% OFF no Lote Exclusivo + Frete Grátis apenas hoje"
                />
              </div>
            </div>
          </div>

          {/* Persuasion Factors Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Gatilhos & Argumentos de Conversão</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Principal Dor do Cliente</label>
                <input
                  type="text"
                  value={formData.pain}
                  onChange={(e) => setFormData({ ...formData, pain: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: Perder horas esfregando sujeiras difíceis"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Principal Desejo</label>
                <input
                  type="text"
                  value={formData.desire}
                  onChange={(e) => setFormData({ ...formData, desire: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: Limpeza cirúrgica com 1 clique"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Benefícios Chave</label>
                <input
                  type="text"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: Rápido, portátil, bateria de 30 dias"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Diferenciais Técnicos</label>
                <input
                  type="text"
                  value={formData.differentials}
                  onChange={(e) => setFormData({ ...formData, differentials: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: 45.000 Hz de frequência com corpo de titânio"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Prova Social</label>
                <input
                  type="text"
                  value={formData.socialProof}
                  onChange={(e) => setFormData({ ...formData, socialProof: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: +14.800 avaliações 5 estrelas"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Garantia</label>
                <input
                  type="text"
                  value={formData.guarantee}
                  onChange={(e) => setFormData({ ...formData, guarantee: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: 30 dias ou seu dinheiro de volta"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Chamada para Ação (CTA)</label>
                <input
                  type="text"
                  value={formData.cta}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Ex: Toque no botão e garanta com frete grátis antes que esgote!"
                />
              </div>
            </div>
          </div>

          {/* Advanced Formats (POV & UGC Native Config) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvancedConfigs(!showAdvancedConfigs)}
              className="w-full flex items-center justify-between text-left text-sm font-bold text-white group"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Configurações Específicas de POV & UGC</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-cyan-300">
                <span>{showAdvancedConfigs ? 'Ocultar' : 'Personalizar'}</span>
                {showAdvancedConfigs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showAdvancedConfigs && (
              <div className="pt-4 border-t border-slate-800/80 space-y-6">
                {/* POV Section */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Eye className="w-4 h-4" />
                    <span>👁️ Modo POV (Primeira Pessoa)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Personagem</label>
                      <select
                        value={formData.povConfig.characterGender}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            povConfig: { ...formData.povConfig, characterGender: e.target.value as any },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="man">Homem</option>
                        <option value="woman">Mulher</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">Ambiente</label>
                      <select
                        value={formData.povConfig.environment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            povConfig: { ...formData.povConfig, environment: e.target.value as any },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="home">Casa / Cozinha</option>
                        <option value="gym">Academia</option>
                        <option value="street">Rua / Ar Livre</option>
                        <option value="car">Carro</option>
                        <option value="work">Escritório</option>
                        <option value="store">Loja</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">Movimento da Câmera</label>
                      <select
                        value={formData.povConfig.motionStyle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            povConfig: { ...formData.povConfig, motionStyle: e.target.value as any },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="natural">Natural</option>
                        <option value="energetic">Energético</option>
                        <option value="cinematic">Cinematográfico</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* UGC Section */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Camera className="w-4 h-4" />
                    <span>🎥 Modo UGC (Conteúdo Criador)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Criador</label>
                      <select
                        value={formData.ugcConfig.creatorGender}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ugcConfig: { ...formData.ugcConfig, creatorGender: e.target.value as any },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="woman">Mulher</option>
                        <option value="man">Homem</option>
                        <option value="any">Qualquer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">Faixa Etária</label>
                      <select
                        value={formData.ugcConfig.ageRange}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ugcConfig: { ...formData.ugcConfig, ageRange: e.target.value as any },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="18-24">18 a 24 anos</option>
                        <option value="25-34">25 a 34 anos</option>
                        <option value="35-49">35 a 49 anos</option>
                        <option value="50+">50+ anos</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">Estilo de Fala</label>
                      <select
                        value={formData.ugcConfig.speechStyle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ugcConfig: { ...formData.ugcConfig, speechStyle: e.target.value as any },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="excited_reviewer">Reviewer Empolgado</option>
                        <option value="casual_friend">Amigo Conversando</option>
                        <option value="secret_leak">Vazamento de Segredo</option>
                        <option value="expert_recommendation">Recomendação Técnica</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Method Distribution & Generation Triggers */}
        <div className="space-y-6">
          {/* Format & Model Selector Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Formato & Modelo Veo</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">
                  Proporção de Tela
                </label>
                <div className="grid grid-cols-3 gap-2 pt-1.5">
                  {[
                    { id: '9:16', label: '9:16 Vertical', desc: 'Reels/TikTok/Ads' },
                    { id: '16:9', label: '16:9 Horizontal', desc: 'YouTube/Desktop' },
                    { id: '1:1', label: '1:1 Quadrado', desc: 'Feed Instagram' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, aspectRatio: fmt.id as any })}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        formData.aspectRatio === fmt.id
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{fmt.label}</div>
                      <div className="text-[9px] text-slate-500">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">
                  Modelo do Google Veo
                </label>
                <select
                  value={formData.selectedModel}
                  onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (Rápido e Otimizado)</option>
                  <option value="veo-3.1-generate-preview">Veo 3.1 (Alta Definição e Detalhes)</option>
                  <option value="veo-2.0-generate-001">Veo 2.0 (Versão Estável)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mixed Campaign Distribution Editor */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Distribuição dos Métodos</h3>
                <p className="text-[11px] text-slate-400">
                  Total distribuído:{' '}
                  <span className={isDistributionBalanced ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {totalDistributed} / {formData.videoCount}
                  </span>
                </p>
              </div>
              <button
                type="button"
                id="btn-ai-recommend-methods"
                onClick={handleAiRecommendMethods}
                disabled={isAiRecommending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-700/60 text-purple-200 text-xs font-bold transition-all shadow-sm"
              >
                <Brain className={`w-3.5 h-3.5 text-purple-300 ${isAiRecommending ? 'animate-spin' : ''}`} />
                <span>{isAiRecommending ? 'Analisando...' : '🧠 IA Escolher'}</span>
              </button>
            </div>

            {aiRationale && (
              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-200 space-y-1">
                <span className="font-semibold text-purple-300">💡 Estratégia Recomendada:</span>
                <p className="text-slate-300">{aiRationale}</p>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {SALES_METHODS.map((m) => {
                const count = formData.methodsDistribution[m.id] || 0;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{m.emoji}</span>
                      <span className="font-medium text-slate-200 truncate">
                        {m.name.replace('MÉTODO ', '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max={formData.videoCount}
                        value={count}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setFormData({
                            ...formData,
                            methodsDistribution: {
                              ...formData.methodsDistribution,
                              [m.id]: val,
                            },
                          });
                        }}
                        className="w-12 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-center font-bold text-white text-xs"
                      />
                      <span className="text-[10px] text-slate-500">un</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-3">
            {/* 1. Test Video Button */}
            <button
              type="button"
              id="btn-generate-single-test-video"
              onClick={handleTestVideoClick}
              disabled={isSubmittingTest}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all shadow-md hover:scale-[1.01]"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>{isSubmittingTest ? 'Gerando Teste...' : '🧪 GERAR VÍDEO DE TESTE (1 VÍDEO)'}</span>
            </button>

            {/* 2. Main Batch Generation Button */}
            <button
              type="button"
              id="btn-generate-full-campaign"
              onClick={handleBatchClick}
              disabled={isSubmittingBatch || !isDistributionBalanced}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-extrabold tracking-wide transition-all shadow-xl ${
                isDistributionBalanced
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-950/80 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>
                {isSubmittingBatch
                  ? `Enfileirando ${formData.videoCount} Vídeos...`
                  : `🚀 GERAR ${formData.videoCount} VÍDEOS DE VENDAS`}
              </span>
            </button>

            {!isDistributionBalanced && (
              <p className="text-[11px] text-amber-400 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Ajuste a soma dos métodos para totalizar {formData.videoCount} vídeos</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
