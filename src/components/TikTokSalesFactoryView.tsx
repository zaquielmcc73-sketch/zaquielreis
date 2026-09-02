import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  ShoppingBag,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  Sliders,
  RefreshCw,
  Copy,
  ChevronRight,
  HelpCircle,
  Play,
  Share2,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
  User,
  Plus,
  Compass,
} from 'lucide-react';
import {
  Character,
  Product,
  ProjectBible,
  SalesMethodId,
  TikTokCta,
  TikTokCtaCategory,
  TikTokHook,
  TikTokHookCategory,
  TikTokScript,
  TikTokScriptBlock,
  TikTokScriptDuration,
  TikTokVideoType,
} from '../types';
import { SALES_METHODS } from '../data/salesMethods';

interface TikTokSalesFactoryProps {
  products: Product[];
  characters: Character[];
  bible: ProjectBible;
  onNavigateToTab: (tab: string) => void;
  onSelectVideoForJoiner?: (videoUrl: string) => void;
}

export const TikTokSalesFactoryView: React.FC<TikTokSalesFactoryProps> = ({
  products,
  characters,
  bible,
  onNavigateToTab,
}) => {
  // Step navigation: 1: Setup & Produto | 2: Hooks & CTAs | 3: Roteirizador | 4: Prompt & Fila
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form selections
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(characters[0]?.id || '');
  const [targetAudience, setTargetAudience] = useState<string>(bible.targetAudience || '');
  const [pain, setPain] = useState<string>('');
  const [desire, setDesire] = useState<string>('');
  const [benefit, setBenefit] = useState<string>('');
  const [offer, setOffer] = useState<string>(bible.irresistibleOffer || '');
  const [salesMethodId, setSalesMethodId] = useState<SalesMethodId>('pain_solution');
  const [videoType, setVideoType] = useState<TikTokVideoType>('tiktok_shop');
  const [duration, setDuration] = useState<TikTokScriptDuration>(30);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [scenario, setScenario] = useState<string>('Ambiente doméstico moderno com luz suave e ring-light');
  const [visualStyle, setVisualStyle] = useState<string>('UGC autêntico em smartphone com cores vivas e foco nítido');
  const [tone, setTone] = useState<string>('Espontâneo, empático, dinâmico e persuasivo');

  // Hooks Generator State
  const [hooksCount, setHooksCount] = useState<5 | 10 | 25 | 50 | 75>(10);
  const [selectedHookCategory, setSelectedHookCategory] = useState<string>('all');
  const [generatedHooks, setGeneratedHooks] = useState<TikTokHook[]>([]);
  const [selectedHook, setSelectedHook] = useState<TikTokHook | null>(null);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState<boolean>(false);

  // CTA Engine State
  const [ctasCount, setCtasCount] = useState<5 | 10 | 25 | 50 | 75>(10);
  const [selectedCtaCategory, setSelectedCtaCategory] = useState<string>('all');
  const [generatedCtas, setGeneratedCtas] = useState<TikTokCta[]>([]);
  const [selectedCta, setSelectedCta] = useState<TikTokCta | null>(null);
  const [isGeneratingCtas, setIsGeneratingCtas] = useState<boolean>(false);

  // Script Generator State
  const [currentScript, setCurrentScript] = useState<TikTokScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isSubmittingToQueue, setIsSubmittingToQueue] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Current selected Product Object
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentCharacter = characters.find((c) => c.id === selectedCharacterId) || characters[0];

  // Sincroniza campos quando o produto selecionado muda
  useEffect(() => {
    if (currentProduct) {
      if (currentProduct.pains && currentProduct.pains[0]) setPain(currentProduct.pains[0]);
      if (currentProduct.desires && currentProduct.desires[0]) setDesire(currentProduct.desires[0]);
      if (currentProduct.benefits && currentProduct.benefits[0]) setBenefit(currentProduct.benefits[0]);
      if (currentProduct.salesArguments && currentProduct.salesArguments[0]) setOffer(currentProduct.salesArguments[0]);
      if (currentProduct.targetAudience) setTargetAudience(currentProduct.targetAudience);
    }
  }, [selectedProductId, currentProduct]);

  // Gerar Hooks automaticamente na inicialização ou sob demanda
  const handleGenerateHooks = async (count: 5 | 10 | 25 | 50 | 75 = hooksCount) => {
    setIsGeneratingHooks(true);
    try {
      const res = await fetch('/api/tiktok/hooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: currentProduct,
          customProduct: {
            name: currentProduct?.name || bible.productName,
            description: currentProduct?.description || bible.description,
            pain,
            desire,
            benefit,
            offer,
            targetAudience,
          },
          salesMethodId,
          count,
          selectedCategories: selectedHookCategory !== 'all' ? [selectedHookCategory] : undefined,
        }),
      });
      const data = await res.json();
      if (data.hooks && data.hooks.length > 0) {
        setGeneratedHooks(data.hooks);
        if (!selectedHook) {
          setSelectedHook(data.hooks[0]);
        }
      }
    } catch (e) {
      console.error('Erro ao gerar hooks:', e);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  // Gerar CTAs sob demanda
  const handleGenerateCtas = async (count: 5 | 10 | 25 | 50 | 75 = ctasCount) => {
    setIsGeneratingCtas(true);
    try {
      const res = await fetch('/api/tiktok/ctas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: currentProduct,
          customProduct: {
            name: currentProduct?.name || bible.productName,
            offer,
            price: currentProduct?.price,
            hasRealStock: false,
          },
          count,
          selectedCategories: selectedCtaCategory !== 'all' ? [selectedCtaCategory] : undefined,
        }),
      });
      const data = await res.json();
      if (data.ctas && data.ctas.length > 0) {
        setGeneratedCtas(data.ctas);
        if (!selectedCta) {
          setSelectedCta(data.ctas[0]);
        }
      }
    } catch (e) {
      console.error('Erro ao gerar CTAs:', e);
    } finally {
      setIsGeneratingCtas(false);
    }
  };

  // Carrega Hooks e CTAs iniciais
  useEffect(() => {
    if (generatedHooks.length === 0) {
      handleGenerateHooks(10);
    }
    if (generatedCtas.length === 0) {
      handleGenerateCtas(10);
    }
  }, [selectedProductId, salesMethodId]);

  // Gerar Script
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const activeHook =
        selectedHook ||
        generatedHooks[0] || {
          id: 'hk_default',
          text: `Você precisa conhecer o ${currentProduct?.name || bible.productName}!`,
          category: 'pain',
          categoryLabel: 'Dor Latente',
          dominantEmotion: 'Curiosidade',
          objective: 'Reter atenção imediata',
          salesMethodId,
          salesMethodName: 'Método Direto',
          visualSuggestion: 'Close no produto em uso',
          openingSuggestion: 'Abertura dinâmica',
          recommendedCta: 'Toque na sacolinha amarela',
        };

      const activeCta =
        selectedCta ||
        generatedCtas[0] || {
          id: 'cta_default',
          text: 'Garanta o seu com desconto exclusivo diretamente no TikTok Shop!',
          category: 'tiktok_shop',
          categoryLabel: 'TikTok Shop',
          dominantEmotion: 'Decisão firme',
          placement: 'both',
          complianceNote: 'Ação direta sem falsas alegações',
        };

      const res = await fetch('/api/tiktok/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: currentProduct,
          productName: currentProduct?.name || bible.productName,
          targetAudience,
          pain,
          desire,
          benefit,
          offer,
          salesMethodId,
          videoType,
          duration,
          aspectRatio,
          hook: activeHook,
          cta: activeCta,
          characterName: currentCharacter?.name || 'Apresentador Oficial',
          scenario,
          visualStyle,
          tone,
        }),
      });

      const data = await res.json();
      if (data.script) {
        setCurrentScript(data.script);
        setActiveStep(3);
      }
    } catch (e) {
      console.error('Erro ao gerar script:', e);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Edição manual de blocos do roteiro
  const handleUpdateScriptBlock = (index: number, field: keyof TikTokScriptBlock, value: any) => {
    if (!currentScript) return;
    const newBlocks = [...currentScript.blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };

    const newFullDialogue = newBlocks.map((b) => `${b.title.toUpperCase()}:\n"${b.spokenText}"`).join('\n\n');
    setCurrentScript({
      ...currentScript,
      blocks: newBlocks,
      fullDialogue: newFullDialogue,
    });
  };

  // Salvar como Criativo Oficial no TikTok Shop Center
  const handleSaveCreative = async () => {
    if (!currentScript) return;
    try {
      const creativePayload = {
        productId: currentProduct?.id,
        productName: currentProduct?.name || bible.productName,
        title: currentScript.title,
        script: currentScript,
        prompt: currentScript.fullVeoPrompt,
        hookText: currentScript.hook.text,
        ctaText: currentScript.cta.text,
        methodId: currentScript.salesMethodId,
        methodName: currentScript.salesMethodName,
        durationSeconds: currentScript.estimatedTotalDuration,
        format: currentScript.aspectRatio,
        version: 'v1.0',
        status: 'READY',
      };

      const res = await fetch('/api/tiktok/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creativePayload),
      });

      if (res.ok) {
        setSaveSuccessMsg('Criativo salvo com sucesso no TikTok Shop Center!');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error('Erro ao salvar criativo:', e);
    }
  };

  // Enviar para Fila de Renderização Google Veo
  const handleEnqueueVeo = async () => {
    if (!currentScript) return;
    setIsSubmittingToQueue(true);
    try {
      const res = await fetch('/api/tiktok/creatives/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: currentScript,
          prompt: currentScript.fullVeoPrompt,
          model: 'veo-3.1-lite-generate-preview',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onNavigateToTab('queue');
      }
    } catch (e) {
      console.error('Erro ao enfileirar para Veo:', e);
    } finally {
      setIsSubmittingToQueue(false);
    }
  };

  const videoTypesList: Array<{ id: TikTokVideoType; label: string; desc: string }> = [
    { id: 'tiktok_shop', label: 'TikTok Shop Showcase', desc: 'Foco no produto, benefício e sacolinha amarela' },
    { id: 'ugc', label: 'UGC Criador Real', desc: 'Estilo selfie espontâneo com alta autenticidade' },
    { id: 'pov', label: 'POV Primeira Pessoa', desc: 'Perspectiva dos olhos do usuário manuseando o produto' },
    { id: 'demo', label: 'Demonstração / Teste', desc: 'Ação prática mostrando a eficácia do mecanismo' },
    { id: 'pain_solution', label: 'Problema → Solução', desc: 'Identifica o incômodo e entrega a resposta rápida' },
    { id: 'before_after', label: 'Antes & Depois', desc: 'Transformação visual e contraste de rotina' } as any,
    { id: 'testimonial', label: 'Depoimento & Review', desc: 'Avaliação genuína com relato de experiência' },
    { id: 'storytelling', label: 'Micro Storytelling', desc: 'Narrativa envolvente com início, conflito e virada' },
    { id: 'comparison', label: 'Comparação / Batalha', desc: 'O jeito antigo vs o jeito com este produto' },
    { id: 'offer', label: 'Oferta & Desconto', desc: 'Destaque comercial para preço e oportunidade' },
    { id: 'curiosity', label: 'Curiosidade / Segredo', desc: 'Revelação de função oculta ou bastidores' },
    { id: 'direct_benefit', label: 'Benefício Direto', desc: 'Entrega do resultado principal nos primeiros 5s' },
    { id: 'social_proof', label: 'Prova Social / Validação', desc: 'Mostra a aceitação e o sucesso entre clientes' },
    { id: 'status_desire', label: 'Status & Luxo', desc: 'Estética sofisticada, pertencimento e poder' },
    { id: 'viral', label: 'Formato Viral Retenção', desc: 'Ritmo acelerado, cortes rápidos e impacto sonoro' },
  ];

  return (
    <div className="space-y-6 pb-12" id="tiktok-sales-factory-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-300 text-xs font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>TIKTOK SHOP SALES FACTORY — FASE 3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Central de Vídeos de Alta Conversão para TikTok Shop
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Crie rapidamente vídeos curtos de 15s a 60s com hooks magnéticos, CTAs profissionais éticos,
              métodos de venda comprovados e integração nativa com o Google Veo e o Multiplicador.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('tiktok_shop')}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>Ver TikTok Shop Center</span>
            </button>
            <button
              onClick={() => onNavigateToTab('video_multiplier')}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Multiplicador de Vídeos</span>
            </button>
          </div>
        </div>

        {/* Steps Progress Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-8 pt-6 border-t border-neutral-800">
          {[
            { step: 1, title: '1. Produto & Configuração', desc: 'Produto, método e formato' },
            { step: 2, title: '2. Hooks & CTA Engine', desc: 'Ganchos e chamadas' },
            { step: 3, title: '3. Roteirizador Adaptativo', desc: 'Estrutura por duração' },
            { step: 4, title: '4. Render & Automação', desc: 'Veo, Fila e Export' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`text-left p-3 rounded-xl border transition-all ${
                activeStep === item.step
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : activeStep > item.step
                  ? 'bg-neutral-800/40 border-neutral-700/60 text-emerald-400'
                  : 'bg-neutral-900/40 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{item.title}</span>
                {activeStep > item.step && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[11px] text-neutral-400 hidden sm:block truncate mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* STEP 1: SETUP & PRODUTO */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="step-1-setup">
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                <span>Configuração de Produto & Oferta Comercial</span>
              </h2>

              {/* Product Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Produto Selecionado</span>
                  <span className="text-neutral-500 text-[11px]">{products.length} cadastrados</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                        selectedProductId === p.id
                          ? 'bg-rose-500/10 border-rose-500/50 text-white shadow-sm'
                          : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.mainImageUrl ? (
                          <img src={p.mainImageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                        <div className="text-[11px] text-rose-400 font-medium mt-0.5">R$ {p.price}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{p.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience & Pain/Desire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Público-Alvo Específico</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    placeholder="Ex: Mulheres de 25 a 45 anos que buscam skincare rápido"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Dor Principal a ser Curada</label>
                  <input
                    type="text"
                    value={pain}
                    onChange={(e) => setPain(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    placeholder="Ex: Linhas de expressão e pele cansada"
                  />
                </div>
              </div>

              {/* Benefit & Offer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Benefício Principal Tangível</label>
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => setBenefit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    placeholder="Ex: Pele firme e iluminada em 14 dias"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Oferta & Condição Comercial</label>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    placeholder="Ex: 40% OFF no lote de hoje + Frete Grátis"
                  />
                </div>
              </div>

              {/* Sales Method Selector (Reusing the 40+ methods) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Método de Vendas (Integrado com os 40+ Métodos)</span>
                  <span className="text-rose-400 text-[11px] font-medium">Reutilização 100% Nativa</span>
                </label>
                <select
                  value={salesMethodId}
                  onChange={(e) => setSalesMethodId(e.target.value as SalesMethodId)}
                  className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {SALES_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.emoji} {m.name} — {m.tagline}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Tipo de Formato Criativo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {videoTypesList.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setVideoType(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        videoType === t.id
                          ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold'
                          : 'bg-neutral-800/50 border-neutral-700/50 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="text-xs truncate">{t.label}</div>
                      <div className="text-[10px] text-neutral-500 truncate mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Settings (1 Col) */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Formato & Parâmetros Técnicos</span>
              </h3>

              {/* Duração */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">Duração do Vídeo</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d as TikTokScriptDuration)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        duration === d
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">Proporção do Enquadramento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: '9:16', label: '9:16 (TikTok/Reels)', badge: 'Prioritário' },
                    { val: '16:9', label: '16:9 (Horizontal)', badge: 'YouTube' },
                    { val: '1:1', label: '1:1 (Quadrado)', badge: 'Feed' },
                  ].map((asp) => (
                    <button
                      key={asp.val}
                      type="button"
                      onClick={() => setAspectRatio(asp.val as any)}
                      className={`p-2 rounded-xl border text-center transition ${
                        aspectRatio === asp.val
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{asp.val}</div>
                      <div className="text-[9px] text-neutral-500">{asp.badge}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                  <span>Personagem / Apresentador</span>
                  <span className="text-[10px] text-neutral-500">{characters.length} disponíveis</span>
                </label>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.profession || c.style})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cenário & Estilo */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Cenário</label>
                  <input
                    type="text"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Estilo Visual</label>
                  <input
                    type="text"
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition mt-4"
              >
                <span>Avançar para Hooks & CTAs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: HOOKS & CTAs GENERATOR */}
      {activeStep === 2 && (
        <div className="space-y-6 animate-fadeIn" id="step-2-hooks-ctas">
          {/* HOOK GENERATOR SECTION */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Gerador Profissional de Hooks de Retenção (18 Categorias)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Gere ganchos magnéticos para os primeiros 3 segundos de vídeo com score de conversão.
                </p>
              </div>

              {/* Batch Selector & Button */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Quantidade:</span>
                <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl p-0.5">
                  {[5, 10, 25, 50, 75].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        setHooksCount(cnt as any);
                        handleGenerateHooks(cnt as any);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        hooksCount === cnt ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateHooks()}
                  disabled={isGeneratingHooks}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingHooks ? 'animate-spin text-rose-400' : ''}`} />
                  <span>Gerar</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedHookCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  selectedHookCategory === 'all'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
              >
                Todas as 18 Categorias
              </button>
              {[
                { id: 'pain', label: 'Dor' },
                { id: 'benefit', label: 'Benefício' },
                { id: 'surprise', label: 'Surpresa' },
                { id: 'demo', label: 'Demonstração' },
                { id: 'comparison', label: 'Comparação' },
                { id: 'common_error', label: 'Erro Comum' },
                { id: 'before_after', label: 'Antes & Depois' },
                { id: 'proof', label: 'Prova' },
                { id: 'objection', label: 'Objeção' },
                { id: 'urgency', label: 'Urgência' },
                { id: 'question', label: 'Pergunta' },
                { id: 'pattern_interrupt', label: 'Pattern Interrupt' },
                { id: 'curiosity', label: 'Curiosidade' },
                { id: 'contrarian', label: 'Contrariana' },
                { id: 'storytelling', label: 'Storytelling' },
                { id: 'status', label: 'Status' },
                { id: 'economy', label: 'Economia' },
                { id: 'transformation', label: 'Transformação' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedHookCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    selectedHookCategory === c.id
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Hooks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {generatedHooks.map((hook, idx) => {
                const isSelected = selectedHook?.id === hook.id;
                return (
                  <div
                    key={hook.id || idx}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/40'
                        : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-semibold text-rose-300">
                          {hook.categoryLabel}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">Score: {hook.score || 95}%</span>
                      </div>
                      <p className="text-xs text-white font-medium leading-relaxed">"{hook.text}"</p>
                      <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-800">
                        <div>
                          <strong className="text-neutral-300">Ação Visual:</strong> {hook.visualSuggestion}
                        </div>
                        <div>
                          <strong className="text-neutral-300">Emoção:</strong> {hook.dominantEmotion}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHook(hook);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSelected ? 'Hook Selecionado' : 'Usar Hook'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(hook.text)}
                        className="p-1.5 text-neutral-400 hover:text-white transition"
                        title="Copiar texto do Hook"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA ENGINE SECTION */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>CTA Engine Profissional (12 Categorias — Sem Escassez Falsa)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Chamadas persuasivas em total conformidade ética com o TikTok Shop.
                </p>
              </div>

              {/* Batch Selector & Button */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Quantidade:</span>
                <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl p-0.5">
                  {[5, 10, 25, 50, 75].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        setCtasCount(cnt as any);
                        handleGenerateCtas(cnt as any);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        ctasCount === cnt ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateCtas()}
                  disabled={isGeneratingCtas}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCtas ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Gerar</span>
                </button>
              </div>
            </div>

            {/* CTAs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {generatedCtas.map((cta, idx) => {
                const isSelected = selectedCta?.id === cta.id;
                return (
                  <div
                    key={cta.id || idx}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/40'
                        : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-semibold text-amber-300">
                          {cta.categoryLabel}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">Compliance Ético ✓</span>
                      </div>
                      <p className="text-xs text-white font-medium">"{cta.text}"</p>
                      {cta.complianceNote && (
                        <div className="text-[10px] text-neutral-400 italic">{cta.complianceNote}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCta(cta)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-amber-600 text-white'
                            : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSelected ? 'CTA Selecionado' : 'Usar CTA'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(cta.text)}
                        className="p-1.5 text-neutral-400 hover:text-white transition"
                        title="Copiar texto do CTA"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition"
              >
                Voltar para Configuração
              </button>

              <button
                type="button"
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                <span>{isGeneratingScript ? 'Estruturando Roteiro...' : `Gerar Roteiro Adaptativo (${duration}s)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ROTEIRIZADOR ADAPTATIVO POR DURAÇÃO */}
      {activeStep === 3 && currentScript && (
        <div className="space-y-6 animate-fadeIn" id="step-3-script-builder">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-300 text-xs font-semibold">
                  <span>Duração Alvo: {currentScript.duration} Segundos</span>
                  <span>•</span>
                  <span>{currentScript.salesMethodName}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{currentScript.title}</h2>
                <p className="text-xs text-neutral-400">
                  Estrutura modular adaptada para {currentScript.duration}s. Você pode editar os textos e ações antes de gerar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCreative}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Award className="w-3.5 h-3.5 text-rose-400" />
                  <span>Salvar como Criativo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
                >
                  <span>Avançar para Render & Fila</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modular Blocks Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Blocos de Cena do Vídeo ({currentScript.blocks.length} Cenas)
              </h3>

              <div className="space-y-3">
                {currentScript.blocks.map((block, idx) => (
                  <div key={block.id || idx} className="p-4 bg-neutral-800/50 border border-neutral-700/60 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">{block.title}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md font-mono">
                        {block.durationSeconds}s
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-neutral-400">Fala do Apresentador / Locução</label>
                        <textarea
                          rows={2}
                          value={block.spokenText}
                          onChange={(e) => handleUpdateScriptBlock(idx, 'spokenText', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-neutral-400">Ação Visual / Enquadramento</label>
                        <textarea
                          rows={2}
                          value={block.visualAction}
                          onChange={(e) => handleUpdateScriptBlock(idx, 'visualAction', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                        />
                      </div>
                    </div>

                    {block.onScreenText && (
                      <div className="flex items-center gap-2 text-[11px] text-rose-300/90 bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-500/20">
                        <span className="font-semibold text-rose-400">Texto na Tela:</span>
                        <span>{block.onScreenText}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Back & Next */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition"
              >
                Voltar para Hooks & CTAs
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <span>Revisar Prompt Veo & Enfileirar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PROMPT VEO & FILA UNIFICADA */}
      {activeStep === 4 && currentScript && (
        <div className="space-y-6 animate-fadeIn" id="step-4-render-queue">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pronto para Renderização no Google Veo</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Prompt Profissional & Envio para Fila</h2>
              <p className="text-xs text-neutral-400">
                O prompt foi gerado seguindo as diretrizes de iluminação, enquadramento e consistência de personagem.
              </p>
            </div>

            {/* Full Prompt Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300">Prompt Estruturado para Google Veo</label>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(currentScript.fullVeoPrompt)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Prompt</span>
                </button>
              </div>
              <textarea
                rows={8}
                value={currentScript.fullVeoPrompt}
                onChange={(e) => setCurrentScript({ ...currentScript, fullVeoPrompt: e.target.value })}
                className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleEnqueueVeo}
                disabled={isSubmittingToQueue}
                className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-left font-semibold space-y-1 shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-rose-200">Google Veo</span>
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-bold">Enviar para Fila de Renderização</div>
                <div className="text-[11px] text-rose-100 font-normal">Processar via API oficial do Veo</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveCreative();
                  onNavigateToTab('tiktok_shop');
                }}
                className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-left font-semibold space-y-1 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-rose-400">TikTok Shop</span>
                  <ShoppingBag className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-sm font-bold text-white">Salvar no Creative Center</div>
                <div className="text-[11px] text-neutral-400 font-normal">Acessar no painel de publicação</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('video_multiplier')}
                className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-left font-semibold space-y-1 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-amber-400">Escala</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-bold text-white">Multiplicar Variações</div>
                <div className="text-[11px] text-neutral-400 font-normal">Combinar com o multiplicador de vídeo</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
