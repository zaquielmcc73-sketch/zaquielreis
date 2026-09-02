import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Play,
  Save,
  FileText,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Share2,
  RefreshCw,
  Award,
  Layers,
  ShoppingBag,
  Zap,
  Flame,
  ArrowRight,
  Printer,
} from 'lucide-react';
import {
  LiveBlock,
  LiveBlockType,
  LiveInteractionPrompt,
  LiveSalesDuration,
  LiveSalesScript,
  Product,
  ProjectBible,
} from '../types';

interface LiveSalesFactoryProps {
  products: Product[];
  bible: ProjectBible;
  onNavigateToTab: (tab: string) => void;
}

export const LiveSalesFactoryView: React.FC<LiveSalesFactoryProps> = ({
  products,
  bible,
  onNavigateToTab,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [duration, setDuration] = useState<LiveSalesDuration>(15);
  const [targetAudience, setTargetAudience] = useState<string>(bible.targetAudience || '');
  const [offerDetails, setOfferDetails] = useState<string>(bible.irresistibleOffer || '');
  const [hostStyle, setHostStyle] = useState<string>('Enérgico, carismático e atencioso');

  // Script State
  const [currentScript, setCurrentScript] = useState<LiveSalesScript | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedScripts, setSavedScripts] = useState<LiveSalesScript[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'prompts' | 'history'>('editor');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Carrega roteiros salvos ao montar
  const fetchSavedScripts = async () => {
    try {
      const res = await fetch('/api/live/scripts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedScripts(data);
      }
    } catch (e) {
      console.error('Erro ao carregar roteiros de Live:', e);
    }
  };

  useEffect(() => {
    fetchSavedScripts();
  }, []);

  // Gerar Roteiro de Live Inicial ou ao clicar no botão
  const handleGenerateScript = async (dur: LiveSalesDuration = duration) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/live/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: currentProduct,
          productName: currentProduct?.name || bible.productName,
          durationMinutes: dur,
          targetAudience,
          offerDetails,
          hostStyle,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setCurrentScript(data.script);
        setActiveTab('editor');
      }
    } catch (e) {
      console.error('Erro ao gerar roteiro de live:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Inicializa script automático se não houver nenhum
  useEffect(() => {
    if (!currentScript) {
      handleGenerateScript(15);
    }
  }, [selectedProductId]);

  // Modificar Bloco
  const handleUpdateBlock = (index: number, field: keyof LiveBlock, value: any) => {
    if (!currentScript) return;
    const updatedBlocks = [...currentScript.blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setCurrentScript({
      ...currentScript,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  // Adicionar Bloco
  const handleAddBlock = (type: LiveBlockType = 'demonstration') => {
    if (!currentScript) return;
    const newBlock: LiveBlock = {
      id: `blk_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: `Novo Bloco — ${type}`,
      durationMinutes: 2,
      objective: 'Engajar e conduzir a audiência',
      speakerSpeech: 'Pessoal, vejam este detalhe importante...',
      action: 'Mostrar o produto para a câmera com entusiasmo.',
      productName: currentProduct?.name || bible.productName,
      benefitHighlight: currentProduct?.benefits?.[0] || 'Praticidade total',
      offerHighlight: offerDetails,
      cta: 'Toque na sacolinha amarela',
      audienceQuestionPrompt: 'Quem tiver dúvidas, envie aqui no chat agora!',
      onScreenText: '🔴 AO VIVO NO TIKTOK SHOP',
      speakerNotes: 'Mantenha o ritmo dinâmico.',
      orderIndex: currentScript.blocks.length,
    };

    setCurrentScript({
      ...currentScript,
      blocks: [...currentScript.blocks, newBlock],
    });
  };

  // Duplicar Bloco
  const handleDuplicateBlock = (index: number) => {
    if (!currentScript) return;
    const target = currentScript.blocks[index];
    const duplicated: LiveBlock = {
      ...target,
      id: `blk_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Cópia)`,
      orderIndex: index + 1,
    };

    const newBlocks = [...currentScript.blocks];
    newBlocks.splice(index + 1, 0, duplicated);

    // Reindex
    newBlocks.forEach((b, i) => (b.orderIndex = i));
    setCurrentScript({
      ...currentScript,
      blocks: newBlocks,
    });
  };

  // Excluir Bloco
  const handleDeleteBlock = (index: number) => {
    if (!currentScript || currentScript.blocks.length <= 1) return;
    const newBlocks = currentScript.blocks.filter((_, i) => i !== index);
    newBlocks.forEach((b, i) => (b.orderIndex = i));
    setCurrentScript({
      ...currentScript,
      blocks: newBlocks,
    });
  };

  // Mover Bloco para Cima / Baixo
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!currentScript) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentScript.blocks.length) return;

    const newBlocks = [...currentScript.blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    newBlocks.forEach((b, i) => (b.orderIndex = i));
    setCurrentScript({
      ...currentScript,
      blocks: newBlocks,
    });
  };

  // Salvar Roteiro no Banco Local
  const handleSaveScript = async () => {
    if (!currentScript) return;
    try {
      const res = await fetch('/api/live/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentScript),
      });
      if (res.ok) {
        setSaveSuccessMsg('Roteiro de Live salvo com sucesso!');
        fetchSavedScripts();
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error('Erro ao salvar roteiro:', e);
    }
  };

  // Exportar texto formatado
  const handleExportText = () => {
    if (!currentScript) return;
    let fullText = `=== ${currentScript.title.toUpperCase()} ===\n`;
    fullText += `Duração: ${currentScript.durationMinutes} minutos | Produto: ${currentScript.productName}\n`;
    fullText += `Público: ${currentScript.targetAudience} | Oferta: ${currentScript.offerDetails}\n\n`;

    currentScript.blocks.forEach((blk, idx) => {
      fullText += `--------------------------------------------------\n`;
      fullText += `BLOCO ${idx + 1}: ${blk.title} [${blk.durationMinutes} min]\n`;
      fullText += `OBJETIVO: ${blk.objective}\n`;
      fullText += `FALA DO APRESENTADOR:\n"${blk.speakerSpeech}"\n\n`;
      fullText += `AÇÃO VISUAL: ${blk.action}\n`;
      if (blk.audienceQuestionPrompt) fullText += `PERGUNTA AO CHAT: ${blk.audienceQuestionPrompt}\n`;
      if (blk.onScreenText) fullText += `TEXTO NA TELA: ${blk.onScreenText}\n`;
      if (blk.speakerNotes) fullText += `NOTA DO APRESENTADOR: ${blk.speakerNotes}\n`;
      fullText += `\n`;
    });

    navigator.clipboard.writeText(fullText);
    setSaveSuccessMsg('Roteiro completo copiado para a área de transferência!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const blockTypeOptions: Array<{ id: LiveBlockType; label: string }> = [
    { id: 'opening', label: 'Abertura Enérgica' },
    { id: 'hook', label: 'Hook de Retenção' },
    { id: 'presentation', label: 'Apresentação' },
    { id: 'problem', label: 'O Problema' },
    { id: 'product', label: 'O Produto' },
    { id: 'demonstration', label: 'Demonstração Prática' },
    { id: 'benefits', label: 'Benefícios' },
    { id: 'proof', label: 'Prova / Teste' },
    { id: 'objections', label: 'Quebra de Objeções' },
    { id: 'offer', label: 'Oferta Especial' },
    { id: 'cta', label: 'Chamada para Ação' },
    { id: 'interaction', label: 'Interação com Audiência' },
    { id: 'strategic_repetition', label: 'Repetição Estratégica' },
    { id: 'new_angle', label: 'Novo Ângulo' },
    { id: 'new_hook', label: 'Novo Hook' },
    { id: 'new_demo', label: 'Nova Demonstração' },
    { id: 'new_cta', label: 'Novo CTA' },
    { id: 'closing', label: 'Encerramento' },
  ];

  return (
    <div className="space-y-6 pb-12" id="live-sales-factory-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              <span>LIVE SALES FACTORY — FASE 3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Gerador de Roteiros Modulares para Live Commerce
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Estruture transmissões ao vivo no TikTok Shop de 5, 15, 30 e 60 minutos em blocos modulares dinâmicos,
              com sugestões práticas de interação, respostas a dúvidas e chamadas estratégicas para o carrinho.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportText}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Copy className="w-4 h-4 text-rose-400" />
              <span>Copiar Roteiro</span>
            </button>
            <button
              onClick={handleSaveScript}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Roteiro</span>
            </button>
          </div>
        </div>

        {/* Duration Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-neutral-800">
          <span className="text-xs text-neutral-400 font-semibold mr-2">Duração da Live:</span>
          {[5, 15, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDuration(d as LiveSalesDuration);
                handleGenerateScript(d as LiveSalesDuration);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                duration === d
                  ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/20'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{d} Minutos</span>
              {d === 5 && <span className="text-[10px] opacity-80">(Express)</span>}
              {d === 15 && <span className="text-[10px] opacity-80">(Padrão)</span>}
              {d === 30 && <span className="text-[10px] opacity-80">(Completo)</span>}
              {d === 60 && <span className="text-[10px] opacity-80">(Maratona)</span>}
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

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Setup & Settings (1 Col) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>Produto & Oferta</span>
            </h3>

            {/* Product Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Produto da Live</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (R$ {p.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Offer Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Condição Comercial da Live</label>
              <textarea
                rows={3}
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                placeholder="Ex: Desconto de 35% na sacolinha + Frete Grátis"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white resize-none"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Público Alvo</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              />
            </div>

            {/* Host Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Estilo do Apresentador</label>
              <input
                type="text"
                value={hostStyle}
                onChange={(e) => setHostStyle(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              />
            </div>

            <button
              onClick={() => handleGenerateScript(duration)}
              disabled={isGenerating}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Recriando Roteiro...' : 'Regenerar Roteiro'}</span>
            </button>
          </div>

          {/* Quick Stats */}
          {currentScript && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Resumo da Estrutura</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Total de Blocos:</span>
                  <span className="text-white font-bold">{currentScript.blocks.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Tempo Estimado:</span>
                  <span className="text-rose-400 font-bold">{currentScript.durationMinutes} minutos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Prompts de Interação:</span>
                  <span className="text-amber-400 font-bold">{currentScript.interactionPrompts.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Builder & Prompts View (3 Cols) */}
        <div className="space-y-6 lg:col-span-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Live Block Builder ({currentScript?.blocks.length || 0} Blocos)</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'prompts'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Prompts de Interação para o Apresentador</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Roteiros Salvos ({savedScripts.length})</span>
            </button>
          </div>

          {/* TAB 1: BLOCK BUILDER */}
          {activeTab === 'editor' && currentScript && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{currentScript.title}</h2>
                  <p className="text-xs text-neutral-400">
                    Você pode editar a fala do apresentador, ajustar a duração de cada bloco, reordenar ou adicionar novos passos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddBlock('demonstration')}
                  className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Bloco</span>
                </button>
              </div>

              {/* Blocks List */}
              <div className="space-y-3">
                {currentScript.blocks.map((block, idx) => (
                  <div
                    key={block.id || idx}
                    className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4 shadow-sm hover:border-neutral-700 transition"
                  >
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={block.title}
                          onChange={(e) => handleUpdateBlock(idx, 'title', e.target.value)}
                          className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-rose-500"
                        />
                        <select
                          value={block.type}
                          onChange={(e) => handleUpdateBlock(idx, 'type', e.target.value as LiveBlockType)}
                          className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-neutral-300 focus:outline-none"
                        >
                          {blockTypeOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700 text-xs">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={block.durationMinutes}
                            onChange={(e) => handleUpdateBlock(idx, 'durationMinutes', Number(e.target.value))}
                            className="w-10 bg-transparent text-center font-bold text-white focus:outline-none"
                          />
                          <span className="text-neutral-400 text-[10px]">min</span>
                        </div>

                        {/* Reorder Up / Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-lg text-neutral-300 transition"
                          title="Subir bloco"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(idx, 'down')}
                          disabled={idx === currentScript.blocks.length - 1}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-lg text-neutral-300 transition"
                          title="Descer bloco"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateBlock(idx)}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition"
                          title="Duplicar bloco"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(idx)}
                          className="p-1.5 bg-neutral-800 hover:bg-rose-900/50 text-neutral-400 hover:text-rose-400 rounded-lg transition"
                          title="Excluir bloco"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Speech & Action Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-neutral-300 flex items-center justify-between">
                          <span>Fala Principal do Apresentador</span>
                          <span className="text-[10px] text-neutral-500">Tom de Conversa Real</span>
                        </label>
                        <textarea
                          rows={3}
                          value={block.speakerSpeech}
                          onChange={(e) => handleUpdateBlock(idx, 'speakerSpeech', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-neutral-300">
                          Ação Visual / Enquadramento na Live
                        </label>
                        <textarea
                          rows={3}
                          value={block.action}
                          onChange={(e) => handleUpdateBlock(idx, 'action', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Secondary Details: Audience Prompt & Screen Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-amber-300">Pergunta para o Chat</label>
                        <input
                          type="text"
                          value={block.audienceQuestionPrompt || ''}
                          onChange={(e) => handleUpdateBlock(idx, 'audienceQuestionPrompt', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-amber-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-rose-300">Texto / Banner na Tela</label>
                        <input
                          type="text"
                          value={block.onScreenText || ''}
                          onChange={(e) => handleUpdateBlock(idx, 'onScreenText', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-rose-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-neutral-400">Observação Técnica</label>
                        <input
                          type="text"
                          value={block.speakerNotes || ''}
                          onChange={(e) => handleUpdateBlock(idx, 'speakerNotes', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTION PROMPTS FOR THE HOST */}
          {activeTab === 'prompts' && currentScript && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Guia de Interação e Engajamento da Live</span>
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Estes prompts são instruções de apoio para o apresentador conduzir o chat ao vivo de forma natural,
                  pedindo opiniões, tirando dúvidas reais e aumentando o tempo de retenção sem recorrer a comentários falsificados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScript.interactionPrompts.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-sm hover:border-neutral-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-[10px] font-bold">
                        {p.categoryLabel}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">{p.targetMoment}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">Instrução para o Apresentador:</div>
                      <p className="text-xs text-neutral-200 bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-medium leading-relaxed">
                        "{p.promptText}"
                      </p>
                    </div>

                    <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                      <strong className="text-neutral-300">Ação Recomendada:</strong> {p.suggestedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED SCRIPTS */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-white">Roteiros de Live Arquivados</h3>
              {savedScripts.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                  Nenhum roteiro salvo ainda. Clique em "Salvar Roteiro" no topo para arquivar seus roteiros de Live.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedScripts.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-neutral-700 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 rounded-md text-rose-300 text-[10px] font-bold">
                            {s.durationMinutes} minutos
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{s.title}</h4>
                        <div className="text-xs text-neutral-400">{s.blocks?.length || 0} blocos modulares</div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentScript(s);
                            setActiveTab('editor');
                          }}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition text-center"
                        >
                          Carregar no Editor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
