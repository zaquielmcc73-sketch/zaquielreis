import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Play,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Calculator,
  RefreshCw,
  Film,
  Sliders,
  Upload,
  Eye,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';
import {
  MultiplierBlock,
  MultiplierConfig,
  MultiplierMatrixItem,
  MultiplierSlotType,
  MediaAsset,
} from '../types';

interface VideoMultiplierViewProps {
  mediaAssets: MediaAsset[];
  onNavigateToQueue: () => void;
  onRefreshMedia?: () => void;
}

export const VideoMultiplierView: React.FC<VideoMultiplierViewProps> = ({
  mediaAssets,
  onNavigateToQueue,
  onRefreshMedia,
}) => {
  // Campaign & Matrix Config
  const [campaignName, setCampaignName] = useState('Campanha Multiplicada 75X');
  const [namingPrefix, setNamingPrefix] = useState('VEO_SCALE');
  const [maxCampaignVideos, setMaxCampaignVideos] = useState<1 | 5 | 10 | 25 | 50 | 75>(75);
  const [distributionStrategy, setDistributionStrategy] = useState<'sequential' | 'balanced_random' | 'unique_pairs'>('balanced_random');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [fps, setFps] = useState<30 | 60>(30);

  // 3 Distinct Blocks: Hooks, Bodies, CTAs
  const [hooks, setHooks] = useState<MultiplierBlock[]>([]);
  const [bodies, setBodies] = useState<MultiplierBlock[]>([]);
  const [ctas, setCtas] = useState<MultiplierBlock[]>([]);

  // Calculated Matrix
  const [matrixItems, setMatrixItems] = useState<MultiplierMatrixItem[]>([]);
  const [totalPossibleCombinations, setTotalPossibleCombinations] = useState(0);

  // Media Picker Modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<MultiplierSlotType>('HOOK');

  // Preview variation modal/player
  const [previewVariation, setPreviewVariation] = useState<MultiplierMatrixItem | null>(null);

  // Processing state
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recalculate matrix whenever blocks or settings change
  useEffect(() => {
    recalculateMatrix();
  }, [hooks, bodies, ctas, maxCampaignVideos, distributionStrategy, namingPrefix, aspectRatio, resolution, fps]);

  const recalculateMatrix = async () => {
    if (hooks.length === 0 || bodies.length === 0 || ctas.length === 0) {
      setMatrixItems([]);
      setTotalPossibleCombinations(0);
      return;
    }

    setIsCalculating(true);
    const config: MultiplierConfig = {
      campaignName,
      namingPrefix,
      maxCampaignVideos,
      distributionStrategy,
      aspectRatio,
      resolution,
      fps,
      hooks,
      bodies,
      ctas,
      transitionBetweenBlocks: 'none',
    };

    try {
      const res = await fetch('/api/video-engine/multiplication/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setTotalPossibleCombinations(data.totalPossibleCombinations || 0);
      setMatrixItems(data.availableCombinations || []);
    } catch (err) {
      console.error('Erro ao calcular matriz:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAddMediaToSlot = (media: MediaAsset, slotType: MultiplierSlotType) => {
    const rawDur = media.durationSeconds || (slotType === 'HOOK' ? 3 : slotType === 'BODY' ? 5 : 3);
    const newBlock: MultiplierBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slotType,
      label: media.name || `${slotType}_${Date.now().toString().slice(-4)}`,
      mediaAssetId: media.id,
      filePath: media.filePath,
      url: media.relativeUrl || `/api/media/files/${media.id}/stream`,
      durationSeconds: rawDur,
      trimStartSeconds: 0,
      trimEndSeconds: 0,
      volumePercent: 100,
      isMuted: false,
    };

    if (slotType === 'HOOK') setHooks((prev) => [...prev, newBlock]);
    else if (slotType === 'BODY') setBodies((prev) => [...prev, newBlock]);
    else if (slotType === 'CTA') setCtas((prev) => [...prev, newBlock]);

    setIsMediaModalOpen(false);
  };

  const handleDirectUploadToSlot = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slotType: MultiplierSlotType
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'VIDEO');
      formData.append('name', `${slotType} - ${file.name}`);

      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        const savedMedia: MediaAsset = await res.json();
        handleAddMediaToSlot(savedMedia, slotType);
        onRefreshMedia?.();
      } catch (err) {
        console.error('Falha no upload de bloco:', err);
      }
    }
  };

  const handleDeleteBlock = (id: string, slotType: MultiplierSlotType) => {
    if (slotType === 'HOOK') setHooks((prev) => prev.filter((b) => b.id !== id));
    else if (slotType === 'BODY') setBodies((prev) => prev.filter((b) => b.id !== id));
    else if (slotType === 'CTA') setCtas((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleSelectVariation = (variationId: string) => {
    setMatrixItems((prev) =>
      prev.map((item) =>
        item.id === variationId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const handleToggleSelectAll = (select: boolean) => {
    setMatrixItems((prev) => prev.map((item) => ({ ...item, isSelected: select })));
  };

  const selectedVariations = matrixItems.filter((i) => i.isSelected);

  const handleStartMultiplication = async () => {
    if (selectedVariations.length === 0) {
      setStatusMessage({ type: 'error', text: 'Selecione pelo menos 1 variação da matriz para renderizar.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const config: MultiplierConfig = {
      campaignName,
      namingPrefix,
      maxCampaignVideos,
      distributionStrategy,
      aspectRatio,
      resolution,
      fps,
      hooks,
      bodies,
      ctas,
      transitionBetweenBlocks: 'none',
    };

    try {
      const res = await fetch('/api/video-engine/multiplication/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          selectedVariations,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao iniciar multiplicação');
      }

      setStatusMessage({
        type: 'success',
        text: `🚀 Sucesso! ${data.count} variações adicionadas à fila de processamento local com IDs únicos (V001 a V${String(data.count).padStart(3, '0')}).`,
      });

      setTimeout(() => {
        onNavigateToQueue();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao processar multiplicação.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSlotZone = (
    slotType: MultiplierSlotType,
    title: string,
    subtitle: string,
    colorClass: string,
    items: MultiplierBlock[]
  ) => {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${colorClass}`} />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
              {items.length} {items.length === 1 ? 'bloco' : 'blocos'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">{subtitle}</p>

          {/* BLOCKS LIST */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {items.map((block, idx) => (
              <div
                key={block.id}
                className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center font-mono text-[10px] text-slate-300 font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <input
                      type="text"
                      value={block.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (slotType === 'HOOK')
                          setHooks((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, label: val } : b))
                          );
                        else if (slotType === 'BODY')
                          setBodies((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, label: val } : b))
                          );
                        else if (slotType === 'CTA')
                          setCtas((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, label: val } : b))
                          );
                      }}
                      className="bg-transparent border-0 text-white font-medium p-0 focus:outline-none focus:underline truncate w-full"
                    />
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {block.durationSeconds.toFixed(1)}s
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBlock(block.id, slotType)}
                  className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                Nenhum bloco de {title.toLowerCase()} adicionado
              </div>
            )}
          </div>
        </div>

        {/* ADD BUTTONS */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              setActiveSlotTarget(slotType);
              setIsMediaModalOpen(true);
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-amber-300 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Central</span>
          </button>

          <label className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-400 flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => handleDirectUploadToSlot(e, slotType)}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Multiplicador de Vídeos
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Até 75 Vídeos por Lote
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Multiplique Inícios (Hooks), Meios (Demonstração) e Finais (CTA) em dezenas de variações comerciais sem repetição.
              </p>
            </div>
          </div>

          {/* DYNAMIC COMBINATION COUNTER */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Fórmula Ativa</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {hooks.length} × {bodies.length} × {ctas.length} = {totalPossibleCombinations} Variações
              </div>
            </div>

            <button
              onClick={handleStartMultiplication}
              disabled={isSubmitting || selectedVariations.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Gerar {selectedVariations.length} Vídeos</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center gap-3 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* 3 STRUCTURED BLOCKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderSlotZone(
          'HOOK',
          '1. INÍCIO (Ganchos / Hooks)',
          'Clipes de 3 a 5 segundos para reter a atenção inicial.',
          'bg-amber-400',
          hooks
        )}
        {renderSlotZone(
          'BODY',
          '2. MEIO (Demonstração / Mecanismo)',
          'Clipes centrais com a transformação e funcionamento do produto.',
          'bg-blue-400',
          bodies
        )}
        {renderSlotZone(
          'CTA',
          '3. FINAL (Chamada para Ação)',
          'Clipes de encerramento com oferta, urgência e botão de compra.',
          'bg-emerald-400',
          ctas
        )}
      </div>

      {/* MATRIX CONTROLS & CAMPAIGN SETTINGS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Configuração da Matriz e Limites de Campanha</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Limite de Vídeos a Gerar
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 5, 10, 25, 50, 75].map((lim) => (
                <button
                  key={lim}
                  onClick={() => setMaxCampaignVideos(lim as any)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    maxCampaignVideos === lim
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {lim}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Estratégia de Distribuição
            </label>
            <select
              value={distributionStrategy}
              onChange={(e) => setDistributionStrategy(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="balanced_random">Aleatório Balanceado (Sem repetição contínua)</option>
              <option value="sequential">Sequencial Direto (A-A-A, A-A-B...)</option>
              <option value="unique_pairs">Pares Exclusivos de Hook e CTA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Prefixo do Nome dos Arquivos
            </label>
            <input
              type="text"
              value={namingPrefix}
              onChange={(e) => setNamingPrefix(e.target.value)}
              placeholder="Ex: CAMPANHA_PRODUTO"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Formato & Resolução
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="9:16">9:16 (Vertical)</option>
                <option value="16:9">16:9 (Horizontal)</option>
                <option value="1:1">1:1 (Quadrado)</option>
              </select>

              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* VARIATIONS MATRIX TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Matriz de Variações ({matrixItems.length} calculadas • {selectedVariations.length} selecionadas)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleSelectAll(true)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Marcar Todas</span>
            </button>
            <button
              onClick={() => handleToggleSelectAll(false)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Desmarcar Todas</span>
            </button>
            <button
              onClick={recalculateMatrix}
              disabled={isCalculating}
              className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>Regenerar</span>
            </button>
          </div>
        </div>

        {matrixItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calculator className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-medium text-slate-400">
              Adicione pelo menos 1 Início, 1 Meio e 1 Final para gerar a matriz de variações.
            </p>
            <p className="text-xs text-slate-600">
              Exemplo: 3 Inícios × 3 Meios × 3 Finais = 27 vídeos exclusivos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-3 w-10 text-center">Sel.</th>
                  <th className="p-3 w-20">ID</th>
                  <th className="p-3">Início (Hook)</th>
                  <th className="p-3">Meio (Demonstração)</th>
                  <th className="p-3">Final (CTA)</th>
                  <th className="p-3 w-24">Duração</th>
                  <th className="p-3">Nome do Arquivo Gerado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {matrixItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleToggleSelectVariation(item.id)}
                    className={`cursor-pointer transition-colors ${
                      item.isSelected ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-800/40 opacity-50'
                    }`}
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={() => handleToggleSelectVariation(item.id)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">{item.id}</td>
                    <td className="p-3 font-semibold text-white truncate max-w-[140px]">
                      {item.hookBlock.label}
                    </td>
                    <td className="p-3 text-slate-300 truncate max-w-[140px]">
                      {item.bodyBlock.label}
                    </td>
                    <td className="p-3 text-slate-300 truncate max-w-[140px]">
                      {item.ctaBlock.label}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {item.estimatedDurationSeconds.toFixed(1)}s
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-[220px]">
                      {item.name}.mp4
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: SELECT MEDIA ASSET FROM CENTRAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Selecionar Vídeo para {activeSlotTarget === 'HOOK' ? 'INÍCIO (Hook)' : activeSlotTarget === 'BODY' ? 'MEIO (Demonstração)' : 'FINAL (CTA)'}
              </h3>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-3">
              {mediaAssets
                .filter((m) => m.type === 'VIDEO' || m.type === 'PRODUCT')
                .map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleAddMediaToSlot(media, activeSlotTarget)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-slate-700 rounded-lg text-amber-400 flex-shrink-0">
                        <Film className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {media.name || media.originalFileName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {media.durationSeconds ? `${media.durationSeconds.toFixed(1)}s • ` : ''}
                          {(media.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex-shrink-0">
                      Adicionar
                    </button>
                  </div>
                ))}

              {mediaAssets.filter((m) => m.type === 'VIDEO' || m.type === 'PRODUCT').length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhum vídeo encontrado na Central de Mídia. Faça upload de vídeos primeiro ou use o botão de Upload direto.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
