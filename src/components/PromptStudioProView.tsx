import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  Copy,
  Check,
  Save,
  Trash2,
  RefreshCw,
  Layers,
  Wand2,
  Sliders,
  Eye,
  Camera,
  Film,
  Package,
  UserCheck,
  Flame,
  Bookmark,
  Send,
  Zap,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import {
  Character,
  MediaAsset,
  Product,
  PromptPlatform,
  PromptPresetType,
  PromptStudioConfig,
  PromptTemplate,
  SalesMethodId,
} from '../types';
import { SALES_METHODS } from '../data/salesMethods';

interface PromptStudioProViewProps {
  initialProduct?: Product | null;
  initialCharacter?: Character | null;
  onEnqueueJob?: (prompt: string, title: string, product: string, model?: string, ratio?: string) => void;
  onOpenCharacterWithProduct?: (productId?: string) => void;
}

export const PromptStudioProView: React.FC<PromptStudioProViewProps> = ({
  initialProduct,
  initialCharacter,
  onEnqueueJob,
  onOpenCharacterWithProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [presets, setPresets] = useState<Record<string, any>>({});

  // Studio Form Config
  const [platform, setPlatform] = useState<PromptPlatform>('veo');
  const [selectedPreset, setSelectedPreset] = useState<PromptPresetType | ''>('ugc');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [selectedSalesMethodId, setSelectedSalesMethodId] = useState<SalesMethodId | ''>('ugc');
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');

  const [scenario, setScenario] = useState<string>('Quarto ou sala aconchegante com iluminação suave de janela');
  const [action, setAction] = useState<string>('Segurando o produto próximo à câmera do celular, demonstrando o uso prático com sorriso genuíno');
  const [cameraAngle, setCameraAngle] = useState<string>('Selfie vertical na altura do peito');
  const [lens, setLens] = useState<string>('Lente grande-angular de smartphone (24mm)');
  const [cameraMovement, setCameraMovement] = useState<string>('Handheld orgânico com micro-movimentos naturais');
  const [lighting, setLighting] = useState<string>('Ring-light frontal suave combinada com luz natural');
  const [visualStyle, setVisualStyle] = useState<string>('Vídeo vertical nativo para TikTok/Reels em 4K 60fps, cores vivas');
  const [emotion, setEmotion] = useState<string>('Entusiasmada e espontânea');
  const [cta, setCta] = useState<string>('Clique no link abaixo e garanta o seu');
  const [negativeInstructions, setNegativeInstructions] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(8);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedModel, setSelectedModel] = useState<string>('veo-3.1-lite-generate-preview');

  // Generation result
  const [fullPrompt, setFullPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isEnqueuing, setIsEnqueuing] = useState<boolean>(false);

  // Template Modal
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<string>('UGC / Social');

  const fetchInitialData = async () => {
    try {
      const [prodRes, charRes, mediaRes, tmplRes, presetRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/characters').then((r) => r.json()),
        fetch('/api/media').then((r) => r.json()),
        fetch('/api/prompt-studio/templates').then((r) => r.json()),
        fetch('/api/prompt-studio/presets').then((r) => r.json()),
      ]);

      if (Array.isArray(prodRes)) setProducts(prodRes);
      if (Array.isArray(charRes)) setCharacters(charRes);
      if (Array.isArray(mediaRes)) setMediaList(mediaRes);
      if (Array.isArray(tmplRes)) setTemplates(tmplRes);
      if (presetRes && typeof presetRes === 'object') setPresets(presetRes);

      if (initialProduct) {
        setSelectedProductId(initialProduct.id);
        setCta(initialProduct.cta || cta);
      } else if (prodRes.length > 0) {
        setSelectedProductId(prodRes[0].id);
      }

      if (initialCharacter) {
        setSelectedCharacterId(initialCharacter.id);
      } else if (charRes.length > 0) {
        setSelectedCharacterId(charRes[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleApplyPreset = (presetKey: PromptPresetType) => {
    setSelectedPreset(presetKey);
    const preset = presets[presetKey];
    if (!preset || !preset.defaults) return;

    const d = preset.defaults;
    if (d.platform) setPlatform(d.platform);
    if (d.salesMethodId) setSelectedSalesMethodId(d.salesMethodId);
    if (d.scenario) setScenario(d.scenario);
    if (d.action) setAction(d.action);
    if (d.cameraAngle) setCameraAngle(d.cameraAngle);
    if (d.lens) setLens(d.lens);
    if (d.cameraMovement) setCameraMovement(d.cameraMovement);
    if (d.lighting) setLighting(d.lighting);
    if (d.visualStyle) setVisualStyle(d.visualStyle);
    if (d.emotion) setEmotion(d.emotion);
    if (d.aspectRatio) setAspectRatio(d.aspectRatio);
    if (d.resolution) setResolution(d.resolution);
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const config: PromptStudioConfig = {
        platform,
        preset: selectedPreset || undefined,
        productId: selectedProductId || undefined,
        characterId: selectedCharacterId || undefined,
        salesMethodId: selectedSalesMethodId || undefined,
        scenario,
        action,
        cameraAngle,
        lens,
        cameraMovement,
        lighting,
        visualStyle,
        emotion,
        cta,
        negativeInstructions,
        durationSeconds,
        aspectRatio,
        resolution,
        model: selectedModel,
      };

      const res = await fetch('/api/prompt-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.fullPrompt) {
        setFullPrompt(data.fullPrompt);
        setNegativePrompt(data.negativePrompt || '');
      } else {
        alert(data.error || 'Erro ao sintetizar prompt.');
      }
    } catch (e: any) {
      alert(e?.message || 'Falha ao conectar com o servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate prompt when key parameters change or on mount
  useEffect(() => {
    if (selectedProductId || selectedCharacterId || scenario) {
      handleGeneratePrompt();
    }
  }, [
    platform,
    selectedPreset,
    selectedProductId,
    selectedCharacterId,
    selectedSalesMethodId,
    scenario,
    action,
    cameraAngle,
    cameraMovement,
    lighting,
    visualStyle,
    emotion,
  ]);

  const copyPrompt = () => {
    navigator.clipboard.writeText(fullPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEnqueueDirect = async () => {
    if (!fullPrompt) {
      alert('Gere o prompt antes de enfileirar.');
      return;
    }

    setIsEnqueuing(true);
    try {
      const currentProd = products.find((p) => p.id === selectedProductId);
      const res = await fetch('/api/prompt-studio/enqueue-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio,
          resolution,
          model: selectedModel,
          title: `Studio Pro - ${selectedPreset || 'Criativo'}`,
          product: currentProd?.name || 'Produto',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Vídeo enfileirado com sucesso na Fila de Geração!');
      } else {
        alert(data.error || 'Erro ao enfileirar vídeo.');
      }
    } catch (e: any) {
      alert('Erro ao comunicar com a fila.');
    } finally {
      setIsEnqueuing(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    try {
      const config: PromptStudioConfig = {
        platform,
        preset: selectedPreset || undefined,
        productId: selectedProductId || undefined,
        characterId: selectedCharacterId || undefined,
        salesMethodId: selectedSalesMethodId || undefined,
        scenario,
        action,
        cameraAngle,
        lens,
        cameraMovement,
        lighting,
        visualStyle,
        emotion,
        cta,
        negativeInstructions,
        durationSeconds,
        aspectRatio,
        resolution,
        model: selectedModel,
      };

      const res = await fetch('/api/prompt-studio/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          category: templateCategory,
          config,
          previewPrompt: fullPrompt,
        }),
      });

      const data = await res.json();
      setTemplates((prev) => [...prev, data]);
      setIsSaveTemplateOpen(false);
      setTemplateName('');
      alert('Template salvo com sucesso!');
    } catch (e) {
      alert('Erro ao salvar template.');
    }
  };

  const handleLoadTemplate = (tmpl: PromptTemplate) => {
    const c = tmpl.config;
    if (c.platform) setPlatform(c.platform);
    if (c.preset) setSelectedPreset(c.preset);
    if (c.productId) setSelectedProductId(c.productId);
    if (c.characterId) setSelectedCharacterId(c.characterId);
    if (c.salesMethodId) setSelectedSalesMethodId(c.salesMethodId);
    if (c.scenario) setScenario(c.scenario);
    if (c.action) setAction(c.action);
    if (c.cameraAngle) setCameraAngle(c.cameraAngle);
    if (c.lens) setLens(c.lens);
    if (c.cameraMovement) setCameraMovement(c.cameraMovement);
    if (c.lighting) setLighting(c.lighting);
    if (c.visualStyle) setVisualStyle(c.visualStyle);
    if (c.emotion) setEmotion(c.emotion);
    if (c.cta) setCta(c.cta);
    if (c.aspectRatio) setAspectRatio(c.aspectRatio);
    if (c.resolution) setResolution(c.resolution);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Excluir este template?')) return;
    try {
      await fetch(`/api/prompt-studio/templates/${id}`, { method: 'DELETE' });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {}
  };

  const currentProduct = products.find((p) => p.id === selectedProductId);
  const currentCharacter = characters.find((c) => c.id === selectedCharacterId);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Prompt Studio PRO</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Multi-Provider Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gere prompts comerciais estruturados com presets (UGC, POV, etc.), suporte a personagens, produtos e física realista de mãos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenCharacterWithProduct?.(selectedProductId)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-bold transition-all shadow"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Wizard Personagem com Produto</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaveTemplateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Salvar Template</span>
          </button>
        </div>
      </div>

      {/* 1-Click Preset Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Presets Prontos de Alta Conversão</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ugc', label: '📱 UGC Autêntico' },
            { id: 'pov', label: '👁️ POV 1ª Pessoa' },
            { id: 'direct_ad', label: '🎯 Anúncio Direto' },
            { id: 'demo', label: '🔬 Demonstração de Produto' },
            { id: 'testimonial', label: '💬 Depoimento Emocional' },
            { id: 'storytelling', label: '📖 Storytelling / Crise' },
            { id: 'transformation', label: '⚡ Antes vs Depois' },
            { id: 'comparison', label: '⚖️ Comparativo' },
            { id: 'offer', label: '🎁 Oferta & Escassez' },
            { id: 'viral', label: '🚀 Gancho Viral' },
            { id: 'tiktok_shop', label: '🛍️ TikTok Shop' },
            { id: 'live', label: '🔴 Estilo Live' },
            { id: 'premium_product', label: '💎 Produto Luxo' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id as PromptPresetType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPreset === preset.id
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid (Controls + Realtime Prompt Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CONTROLS (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
          {/* Platform & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Plataforma / Formato Alvo</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PromptPlatform)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="veo">Google Veo 3.1 (Cinematográfico 4K)</option>
                <option value="tiktok_ugc">TikTok & Reels UGC (Nativo 9:16)</option>
                <option value="imagen">Imagen 3 (Fotografia Estúdio)</option>
                <option value="generic_video">Universal AI Video Engine</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Modelo Google Veo</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (Rápido / Testes)</option>
                <option value="veo-3.1-generate-preview">Veo 3.1 Standard (Produção)</option>
              </select>
            </div>
          </div>

          {/* Product & Character Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                <span>Produto Cadastrado</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Nenhum (Genérico)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Personagem Recorrente</span>
              </label>
              <select
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Nenhum (Sem Avatar Fixo)</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.stylePreset})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sales Method Selector */}
          <div className="space-y-1 pb-3 border-b border-slate-800">
            <label className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Método de Vendas Integrado (Estrutura de Conversão)</span>
            </label>
            <select
              value={selectedSalesMethodId}
              onChange={(e) => setSelectedSalesMethodId(e.target.value as SalesMethodId)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Nenhum Método Específico</option>
              {SALES_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.category}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario & Action */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Cenário & Ambiente</label>
              <input
                type="text"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Ex: Quarto moderno com luz de janela aconchegante"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Ação, Interação & Movimento das Mãos</label>
              <textarea
                rows={2}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Ex: Segurando o produto com firmeza e demonstrando a aplicação suave na pele..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>

          {/* Camera, Lighting & Style (Collapsible Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Ângulo / Enquadramento</label>
              <input
                type="text"
                value={cameraAngle}
                onChange={(e) => setCameraAngle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Movimento da Câmera</label>
              <input
                type="text"
                value={cameraMovement}
                onChange={(e) => setCameraMovement(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Iluminação</label>
              <input
                type="text"
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Estilo Visual</label>
              <input
                type="text"
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Expressão / Emoção</label>
              <input
                type="text"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Aspect Ratio, Resolution, Duration */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Proporção</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="9:16">9:16 (Vertical Reels/TikTok)</option>
                <option value="16:9">16:9 (Horizontal YouTube)</option>
                <option value="1:1">1:1 (Quadrado Feed)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Resolução</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="720p">720p (Padrão)</option>
                <option value="1080p">1080p (Alta Definição)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Duração</label>
              <select
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={5}>5 Segundos</option>
                <option value={8}>8 Segundos (Recomendado)</option>
                <option value={10}>10 Segundos</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Chamada para Ação / CTA</label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="Ex: Clique no botão abaixo e aproveite o frete grátis"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME PROMPT PREVIEW & TEMPLATES (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Prompt Box */}
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-cyan-800/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Prompt Estruturado em Tempo Real</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating}
                  title="Recalcular Prompt"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 max-h-72 overflow-y-auto">
              <p className="text-xs font-mono text-cyan-200 leading-relaxed select-all whitespace-pre-wrap">
                {fullPrompt || 'Preencha os campos para gerar o prompt...'}
              </p>
            </div>

            {negativePrompt && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-950/80 space-y-1">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Negative Constraints</span>
                <p className="text-[11px] font-mono text-slate-400">{negativePrompt}</p>
              </div>
            )}

            {/* Direct Action Trigger */}
            <button
              type="button"
              onClick={handleEnqueueDirect}
              disabled={isEnqueuing || !fullPrompt}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              <span>{isEnqueuing ? 'Enviando para Fila...' : '⚡ Gerar Vídeo Imediato (Fila Veo)'}</span>
            </button>
          </div>

          {/* Saved Templates List */}
          {templates.length > 0 && (
            <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white">Meus Templates Salvos</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 font-bold">
                  {templates.length}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{tmpl.name}</p>
                      <span className="text-[10px] text-slate-500">{tmpl.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate(tmpl)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                      >
                        Carregar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tmpl.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Template Modal */}
      {isSaveTemplateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Salvar Configuração como Template</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Nome do Template</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: UGC Skin Care Viral"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Categoria</label>
                <input
                  type="text"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  placeholder="Ex: UGC, Demonstração, Performance"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSaveTemplateOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
