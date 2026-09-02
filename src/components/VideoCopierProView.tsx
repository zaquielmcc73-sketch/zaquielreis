import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  BrainCircuit,
  Zap,
  Layers,
  Wand2,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  TrendingUp,
  Flame,
  Camera,
  FolderOpen,
  Film,
  Package,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Eye,
  Video,
  CheckCircle2,
  Sliders,
  Tag,
} from 'lucide-react';
import {
  MediaAsset,
  Product,
  ProjectBible,
  VideoAnalysisItem,
  VideoTranscriptionResult,
  VideoCopyAnalysis,
  VideoRemodelingResult,
} from '../types';

interface VideoCopierProViewProps {
  mediaAssets: MediaAsset[];
  products: Product[];
  bible: ProjectBible | null;
  onNavigateToPromptStudio: () => void;
  onNavigateToQueue: () => void;
}

export const VideoCopierProView: React.FC<VideoCopierProViewProps> = ({
  mediaAssets,
  products,
  bible,
  onNavigateToPromptStudio,
  onNavigateToQueue,
}) => {
  // State
  const [analyses, setAnalyses] = useState<VideoAnalysisItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<VideoAnalysisItem | null>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'analysis' | 'remodel' | 'history'>('import');

  // Import State
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFilePreviewUrl, setCustomFilePreviewUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  // Remodel State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isRemodeling, setIsRemodeling] = useState(false);

  // Video Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTranscriptionDetails, setShowTranscriptionDetails] = useState(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);

  // Filter video assets from Central de Mídia
  const videoAssets = mediaAssets.filter((m) => m.type === 'VIDEO');

  // Load existing analyses
  const fetchAnalyses = async () => {
    try {
      const res = await fetch('/api/video-copier/analyses');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAnalyses(data);
          if (data.length > 0 && !selectedAnalysis) {
            setSelectedAnalysis(data[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico de análises:', e);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Video Player Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setSelectedMediaId('');
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      const url = URL.createObjectURL(file);
      setCustomFilePreviewUrl(url);
    }
  };

  // Start Video Analysis
  const handleStartAnalysis = async () => {
    if (!selectedMediaId && !customFile) {
      alert('Selecione um vídeo da Central de Mídia ou faça upload de um arquivo local.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Extraindo áudio do vídeo com FFmpeg...');

    try {
      let payload: any = {
        title: videoTitle || 'Vídeo de Referência',
      };

      if (selectedMediaId) {
        payload.mediaId = selectedMediaId;
      } else if (customFile) {
        setAnalysisStep('Convertendo arquivo para análise...');
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(customFile);
        });
        const base64Data = await base64Promise;
        payload.base64Data = base64Data;
        payload.originalFileName = customFile.name;
      }

      setAnalysisStep('Transcrevendo áudio e mapeando timestamps...');
      const res = await fetch('/api/video-copier/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setAnalysisStep('Dissecando estrutura de retenção, hook e neuromarketing...');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar vídeo');
      }

      setSelectedAnalysis(data.item);
      setAnalyses((prev) => [data.item, ...prev.filter((a) => a.id !== data.item.id)]);
      setActiveTab('analysis');
      showToast('Análise de cópia e retenção concluída com sucesso!');
    } catch (err: any) {
      alert(`Falha na análise: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Start Remodeling
  const handleStartRemodeling = async () => {
    if (!selectedAnalysis) return;

    setIsRemodeling(true);
    try {
      const res = await fetch('/api/video-copier/remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: selectedAnalysis.id,
          productId: selectedProductId || undefined,
          customInstructions: customInstructions || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao remodelar');

      setSelectedAnalysis(data.item);
      setAnalyses((prev) => prev.map((a) => (a.id === data.item.id ? data.item : a)));
      setActiveTab('remodel');
      showToast('Conteúdo remodelado 100% original gerado com sucesso!');
    } catch (err: any) {
      alert(`Falha na remodelagem: ${err.message}`);
    } finally {
      setIsRemodeling(false);
    }
  };

  // Export to Prompt Studio PRO
  const handleExportPromptStudio = async () => {
    if (!selectedAnalysis?.remodeling) return;
    try {
      const res = await fetch('/api/video-copier/export-to-prompt-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: selectedAnalysis.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${data.count} templates exportados para o Prompt Studio PRO!`);
        setTimeout(() => onNavigateToPromptStudio(), 800);
      }
    } catch (e) {
      alert('Erro ao exportar para Prompt Studio');
    }
  };

  // Export to Generation Queue
  const handleExportQueue = async () => {
    if (!selectedAnalysis?.remodeling) return;
    try {
      const res = await fetch('/api/video-copier/export-to-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: selectedAnalysis.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${data.count} cenas adicionadas à Fila de Geração!`);
        setTimeout(() => onNavigateToQueue(), 800);
      }
    } catch (e) {
      alert('Erro ao enfileirar criativo');
    }
  };

  // Delete analysis
  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta análise do histórico?')) return;
    try {
      await fetch(`/api/video-copier/analyses/${id}`, { method: 'DELETE' });
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(analyses.find((a) => a.id !== id) || null);
      }
      showToast('Análise removida com sucesso.');
    } catch (err) {}
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-indigo-400/30 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* COMPLIANCE & ETHICAL HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-800/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Video Copier PRO
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    Analisador & Remodelador de Padrões
                  </span>
                </h1>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Aviso de Conformidade:</strong> Use apenas vídeos que você possui ou tem autorização para analisar.
                  A remodelagem busca <strong>ESTRUTURA + PRINCÍPIOS + PADRÕES</strong> e não cópia literal.
                </span>
              </p>
            </div>
          </div>

          {/* TAB SELECTOR */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto justify-center">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'import'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Importar & Analisar
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={!selectedAnalysis}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !selectedAnalysis
                  ? 'text-slate-600 cursor-not-allowed'
                  : activeTab === 'analysis'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              Anatomia do Vídeo
            </button>
            <button
              onClick={() => setActiveTab('remodel')}
              disabled={!selectedAnalysis}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !selectedAnalysis
                  ? 'text-slate-600 cursor-not-allowed'
                  : activeTab === 'remodel'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              Remodelador Original
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Histórico ({analyses.length})
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl w-full mx-auto p-6 flex-1 flex flex-col gap-6">
        {/* ========================================================= */}
        {/* TAB 1: IMPORT & ANALYZE */}
        {/* ========================================================= */}
        {activeTab === 'import' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Import Controls */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                  <Film className="w-5 h-5 text-indigo-400" />
                  1. Selecione o Vídeo de Referência
                </h2>

                {/* Option A: Select from Central de Mídia */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Opção A: Escolher da Central de Mídia ({videoAssets.length} vídeos disponíveis)
                  </label>
                  {videoAssets.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
                      {videoAssets.map((asset) => {
                        const isSelected = selectedMediaId === asset.id;
                        return (
                          <div
                            key={asset.id}
                            onClick={() => {
                              setSelectedMediaId(asset.id);
                              setCustomFile(null);
                              setCustomFilePreviewUrl(asset.relativeUrl);
                              setVideoTitle(asset.name);
                            }}
                            className={`cursor-pointer rounded-xl p-2.5 border transition-all flex flex-col gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10'
                                : 'bg-slate-800/40 border-slate-750 hover:bg-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="h-20 bg-slate-950 rounded-lg overflow-hidden relative flex items-center justify-center border border-slate-800">
                              <Film className="w-6 h-6 text-slate-600" />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] text-slate-300 font-mono">
                                {asset.durationSeconds ? `${Math.round(asset.durationSeconds)}s` : 'Vídeo'}
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-200 truncate">{asset.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                      Nenhum vídeo catalogado na Central de Mídia. Use o upload abaixo.
                    </div>
                  )}
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase">OU</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Option B: Local File Upload */}
                <div className="mt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Opção B: Fazer Upload do Computador (.mp4, .mov, .webm)
                  </label>
                  <label className="border-2 border-dashed border-slate-750 hover:border-indigo-500/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-900/60 group">
                    <Upload className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-sm font-semibold text-slate-200">
                      {customFile ? customFile.name : 'Clique ou arraste um vídeo para cá'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Formatos suportados: MP4, MOV, WEBM (até 50MB)</span>
                    <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>

                {/* Video Title Input */}
                <div className="mt-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Título / Identificação do Vídeo
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Ex: Anúncio Viral TikTok - Sérum Rejuvenescedor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Analysis Action Button */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || (!selectedMediaId && !customFile)}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                      isAnalyzing || (!selectedMediaId && !customFile)
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white hover:opacity-95 shadow-indigo-500/20 active:scale-[0.99]'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                        <span>{analysisStep || 'Processando análise...'}</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4 text-amber-300" />
                        <span>Analisar Estrutura de Cópia & Retenção com IA</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    * Executa extração de áudio via FFmpeg, transcrição detalhada e mapeamento cronológico de neuromarketing.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Video Preview */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 self-start flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  Pré-visualização do Vídeo
                </h3>

                <div className="w-full aspect-[9/16] max-h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-inner">
                  {customFilePreviewUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={customFilePreviewUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full h-full object-contain"
                        muted={isMuted}
                      />
                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2">
                        {/* Timeline Scrubber */}
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          step={0.1}
                          value={currentTime}
                          onChange={(e) => handleSeek(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-xs text-slate-200">
                          <div className="flex items-center gap-2">
                            <button onClick={togglePlay} className="p-1 hover:text-indigo-400">
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setIsMuted(!isMuted)} className="p-1 hover:text-indigo-400">
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <span className="font-mono text-[11px]">
                              {formatSeconds(currentTime)} / {formatSeconds(duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-600 flex flex-col items-center gap-2">
                      <Film className="w-12 h-12 stroke-[1.5]" />
                      <p className="text-xs">Selecione ou envie um vídeo para pré-visualizar aqui</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VIDEO COPY ANATOMY & HEURISTICS */}
        {/* ========================================================= */}
        {activeTab === 'analysis' && selectedAnalysis && (
          <div className="flex flex-col gap-6">
            {/* AUDIT & TRANSPARENCY PIPELINE STATUS BAR */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Origem dos Dados & Pipeline de IA
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Transparência total dos motores de transcrição e visão computacional utilizados.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Transcription Status */}
                <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                  selectedAnalysis.analysis.analysisStatus?.transcriptionStatus === 'REAL_GEMINI'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedAnalysis.analysis.analysisStatus?.transcriptionStatus === 'REAL_GEMINI'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`} />
                  <span>
                    Transcrição: {selectedAnalysis.analysis.analysisStatus?.transcriptionStatus === 'REAL_GEMINI'
                      ? 'Google Gemini 3.7 Flash'
                      : 'Motor Heurístico Offline'}
                  </span>
                </div>

                {/* Visual Analysis Status */}
                <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                  selectedAnalysis.analysis.analysisStatus?.visualStatus === 'REAL_VISUAL_ANALYSIS'
                    ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    Visão: {selectedAnalysis.analysis.analysisStatus?.visualStatus === 'REAL_VISUAL_ANALYSIS'
                      ? 'Extração Real FFmpeg + Gemini Vision'
                      : 'Estimativa Heurística'}
                  </span>
                </div>

                {/* Timestamps Status */}
                <div className="px-2.5 py-1 rounded-lg border border-slate-750 bg-slate-950/60 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Timestamps: {selectedAnalysis.analysis.analysisStatus?.timestampsStatus === 'ESTIMATED_AI'
                      ? 'AI Audio Mapping'
                      : 'Cálculo Proporcional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Bar: Method & Conversion Index */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Detected Sales Method */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-indigo-400" />
                      Método de Venda Detectado
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                      {selectedAnalysis.analysis.detectedSalesMethodConfidence}% Confiança
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {selectedAnalysis.analysis.detectedSalesMethodName}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Identificado a partir do padrão de abertura, ritmo de cortes e estrutura de argumentos de venda.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Duração: <strong>{selectedAnalysis.durationSeconds.toFixed(1)}s</strong></span>
                  <span>Ritmo: <strong>{selectedAnalysis.transcription.wordsPerMinute} WPM</strong></span>
                </div>
              </div>

              {/* Conversion Heuristic Scores */}
              <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Índices de Neuromarketing & Conversão
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      Estimativa Heurística
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Força do Gancho</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-amber-400">
                          {selectedAnalysis.analysis.heuristicScores.hookPower}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${selectedAnalysis.analysis.heuristicScores.hookPower}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Retenção Estimada</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-indigo-400">
                          {selectedAnalysis.analysis.heuristicScores.retentionScore}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-400 h-full rounded-full"
                          style={{ width: `${selectedAnalysis.analysis.heuristicScores.retentionScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Clareza da Oferta</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-emerald-400">
                          {selectedAnalysis.analysis.heuristicScores.offerClarity}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${selectedAnalysis.analysis.heuristicScores.offerClarity}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Índice Geral</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-purple-400">
                          {selectedAnalysis.analysis.heuristicScores.overallConversionIndex}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-purple-400 h-full rounded-full"
                          style={{ width: `${selectedAnalysis.analysis.heuristicScores.overallConversionIndex}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-2 italic">
                  * {selectedAnalysis.analysis.heuristicScores.disclaimer}
                </p>
              </div>
            </div>

            {/* REAL VISUAL ANALYSIS & FRAMING DYNAMICS CARD */}
            {selectedAnalysis.analysis.visualAnalysis && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Análise Visual de Cenas & Enquadramentos
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                          FFmpeg + Visão Computacional
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Extração adaptativa de frames e dissecação multimodal de ângulos, iluminação e elementos de cena.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status da Visão:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      {selectedAnalysis.analysis.visualAnalysis.status === 'REAL_VISUAL_ANALYSIS' ? 'Multimodal Ativa' : 'Estimativa'}
                    </span>
                  </div>
                </div>

                {/* Visual Overview Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Frames Analisados</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">
                        {selectedAnalysis.analysis.visualAnalysis.totalFramesAnalyzed || selectedAnalysis.analysis.visualAnalysis.frames?.length || 0}
                      </span>
                      <span className="text-xs text-slate-500">amostras</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Cortes Estimados (FFmpeg)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-indigo-400">
                        {selectedAnalysis.analysis.visualAnalysis.estimatedSceneChanges}
                      </span>
                      <span className="text-xs text-slate-500">cortes ({selectedAnalysis.analysis.visualAnalysis.estimatedCutsPerMinute}/min)</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Presença do Produto</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-amber-400">
                        {selectedAnalysis.analysis.visualAnalysis.productPresencePercentage}%
                      </span>
                      <span className="text-xs text-slate-500">do tempo</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Personagem / Apresentador</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm font-bold ${selectedAnalysis.analysis.visualAnalysis.hasCharacter ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {selectedAnalysis.analysis.visualAnalysis.hasCharacter ? 'Detectado na Cena' : 'Apenas Produto/B-roll'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dominant Framings */}
                {selectedAnalysis.analysis.visualAnalysis.dominantFramings?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      Enquadramentos Dominantes:
                    </span>
                    {selectedAnalysis.analysis.visualAnalysis.dominantFramings.map((fr, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                      >
                        {fr}
                      </span>
                    ))}
                  </div>
                )}

                {/* Extracted Frames Gallery */}
                {selectedAnalysis.analysis.visualAnalysis.frames?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        Dissecação Quadro a Quadro (Frames Extraídos)
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        {selectedAnalysis.analysis.visualAnalysis.frames.length} frames identificados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {selectedAnalysis.analysis.visualAnalysis.frames.map((frame, idx) => (
                        <div
                          key={frame.frameId || idx}
                          onClick={() => setSelectedFrameIndex(selectedFrameIndex === idx ? null : idx)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            selectedFrameIndex === idx
                              ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-500/20'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                                {frame.timecode}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                                {frame.framing || 'Enquadramento'}
                              </span>
                            </div>

                            <p className="text-xs font-medium text-slate-200 line-clamp-2 mb-1.5">
                              {frame.visibleAction || 'Ação da cena'}
                            </p>

                            {frame.onScreenText && frame.onScreenText !== 'Nenhum' && (
                              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 mb-1.5">
                                <strong className="text-[10px] uppercase block text-amber-400">Texto na tela:</strong>
                                "{frame.onScreenText}"
                              </div>
                            )}

                            <div className="space-y-1 text-[11px] text-slate-400">
                              {frame.lighting && <div><strong className="text-slate-500">Luz:</strong> {frame.lighting}</div>}
                              {frame.composition && <div><strong className="text-slate-500">Composição:</strong> {frame.composition}</div>}
                              {frame.probableObjective && <div><strong className="text-slate-500">Objetivo:</strong> {frame.probableObjective}</div>}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Confiança: {Math.round(frame.confidence * 100)}%</span>
                            <span className="text-indigo-400 font-medium">
                              {selectedFrameIndex === idx ? 'Clique para recolher' : 'Ver detalhes'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Disclaimer */}
                {selectedAnalysis.analysis.visualAnalysis.sceneTechnicalDisclaimer && (
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    * {selectedAnalysis.analysis.visualAnalysis.sceneTechnicalDisclaimer}
                  </p>
                )}
              </div>
            )}

            {/* AUDIO TRANSCRIPTION & TIME-CODED SEGMENTS EXPLORER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Transcrição Completa & Dissecação de Áudio
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedAnalysis.transcription.wordCount} palavras • {selectedAnalysis.transcription.wordsPerMinute} WPM • Idioma: {selectedAnalysis.transcription.language?.toUpperCase() || 'PT'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(selectedAnalysis.transcription.text, 'full_transcript_text')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700"
                  >
                    {copiedId === 'full_transcript_text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Transcrição
                  </button>

                  <button
                    onClick={() => setShowTranscriptionDetails(!showTranscriptionDetails)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30"
                  >
                    {showTranscriptionDetails ? 'Ocultar Segmentos' : 'Explorar Segmentos'}
                  </button>
                </div>
              </div>

              {/* Full Text Box */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-3">
                <p className="text-xs text-slate-200 leading-relaxed font-sans select-all">
                  {selectedAnalysis.transcription.text}
                </p>
              </div>

              {/* Collapsible Chronological Transcript Segments */}
              {showTranscriptionDetails && selectedAnalysis.transcription.segments?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Segmentos de Áudio com Timecodes:
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {selectedAnalysis.transcription.segments.map((seg, idx) => (
                      <div
                        key={seg.id || idx}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 flex items-start gap-3"
                      >
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[11px] font-bold shrink-0">
                          {seg.timecode}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-200">"{seg.text}"</p>
                          {seg.speaker && (
                            <span className="text-[10px] text-slate-500 uppercase mt-0.5 block font-semibold">
                              Locutor: {seg.speaker}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hook Deep Dive Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Anatomia do Gancho (Hook Inicial 0-3s)
                </h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Tipo: {selectedAnalysis.analysis.hookAnalysis.hookType}
                </span>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-4">
                <span className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Texto do Gancho Original:</span>
                <p className="text-sm font-medium text-slate-200 italic">
                  "{selectedAnalysis.analysis.hookAnalysis.hookText}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850">
                  <span className="text-xs font-semibold text-emerald-400 block mb-1">Por que funciona / Converte:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedAnalysis.analysis.hookAnalysis.hookWhyItWorks}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850">
                  <span className="text-xs font-semibold text-indigo-400 block mb-1">Ritmo & Dinâmica Visual:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Estimativa de cortes: <strong>{selectedAnalysis.analysis.pacingMetrics.cutsEstimatePerMin} cortes/min</strong>.
                    Pacing geral: <strong>{selectedAnalysis.analysis.pacingMetrics.overallPacing}</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Chronological Structure Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-400" />
                Decomposição Estrutural Cronológica do Vídeo
              </h3>

              <div className="space-y-3">
                {selectedAnalysis.analysis.structureBlocks.map((block, idx) => (
                  <div
                    key={block.id || idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-bold shrink-0">
                        {block.timecode}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white uppercase px-2 py-0.5 rounded bg-slate-800">
                            {block.phaseLabel}
                          </span>
                          <span className="text-xs text-slate-400">Score de Ritmo: {block.pacingScore}/100</span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium mb-1">"{block.originalText}"</p>
                        <p className="text-[11px] text-slate-400">
                          <strong>Propósito:</strong> {block.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 self-stretch md:self-auto shrink-0 max-w-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Padrão Visual:</span>
                      {block.visualPattern}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Triggers & Retention Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emotional Triggers */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Gatilhos Emocionais Detectados
                </h4>
                <div className="space-y-2.5">
                  {selectedAnalysis.analysis.emotionalTriggers.map((trig, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block mb-0.5">{trig.name}</span>
                        <p className="text-[11px] text-slate-400">{trig.description}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                        Intensidade: {trig.intensity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention Risks & Suggested Fixes */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Momentos de Risco de Queda de Retenção
                </h4>
                <div className="space-y-2.5">
                  {selectedAnalysis.analysis.pacingMetrics.retentionRiskMoments.length > 0 ? (
                    selectedAnalysis.analysis.pacingMetrics.retentionRiskMoments.map((risk, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                            {risk.timecode}
                          </span>
                          <span className="text-xs font-medium text-slate-300">{risk.reason}</span>
                        </div>
                        <p className="text-[11px] text-emerald-400 mt-1">
                          <strong>💡 Correção recomendada:</strong> {risk.suggestedFix}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-xs text-slate-400 text-center">
                      Nenhum ponto crítico de queda brusca de retenção detectado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action: Proceed to Remodeling */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Deseja criar um criativo original a partir desta estrutura?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  O motor de IA vai gerar ganchos, roteiro completo e prompts para o Veo adaptados ao seu produto.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('remodel')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shrink-0"
              >
                <span>Avançar para Remodelagem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORIGINAL CONTENT REMODELING */}
        {/* ========================================================= */}
        {activeTab === 'remodel' && selectedAnalysis && (
          <div className="flex flex-col gap-6">
            {/* Remodel Configuration Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Configurar Produto Alvo para Remodelagem Original
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Selecione o Produto do Seu Catálogo
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category || 'Geral'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Instruções Personalizadas (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Ex: Focar no público feminino 30+, enfatizar frete grátis..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <p className="text-xs text-amber-200/80 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Gera conteúdo 100% original aplicando o método <strong>{selectedAnalysis.analysis.detectedSalesMethodName}</strong>.
                </p>
                <button
                  onClick={handleStartRemodeling}
                  disabled={isRemodeling}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    isRemodeling
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-purple-500/20 active:scale-[0.99]'
                  }`}
                >
                  {isRemodeling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gerando Conteúdo Original...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-amber-300" />
                      <span>Gerar Conteúdo Original Remodelado</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Remodeled Output Section */}
            {selectedAnalysis.remodeling ? (
              <div className="flex flex-col gap-6">
                {/* 3+ New Hook Variations */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-400" />
                      3 Variações de Ganchos Originais de Alto Impacto
                    </h3>
                    <span className="text-xs text-slate-400">Para {selectedAnalysis.remodeling.targetProductName}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAnalysis.remodeling.hookVariations.map((hook, idx) => (
                      <div
                        key={hook.id || idx}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-indigo-300 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                              {hook.angleType}
                            </span>
                            <button
                              onClick={() => handleCopyText(hook.hookText, hook.id)}
                              className="text-slate-400 hover:text-white p-1"
                              title="Copiar gancho"
                            >
                              {copiedId === hook.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-slate-100 mb-2.5 leading-relaxed">
                            "{hook.hookText}"
                          </p>
                          <p className="text-[11px] text-slate-400 mb-2">
                            <strong>Por que converte:</strong> {hook.whyItConverts}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-400">
                          <strong>Ação Visual:</strong> {hook.visualAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complete Remodeled Script Storyboard */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-indigo-400" />
                        Roteiro Completo Remodelado (Cena a Cena)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedAnalysis.remodeling.remodelledScript.title} — Duração Alvo: ~{selectedAnalysis.remodeling.remodelledScript.totalDurationTarget}s
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyText(selectedAnalysis.remodeling!.remodelledScript.fullVoiceover, 'full_voiceover')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700"
                    >
                      {copiedId === 'full_voiceover' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Locução Completa
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedAnalysis.remodeling.remodelledScript.blocks.map((scene, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-4.5 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-xs uppercase">
                            Bloco {idx + 1}: {scene.phase} (~{scene.estimatedDurationSeconds}s)
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-indigo-400" />
                            {scene.cameraMotion}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">Locução (Voz):</span>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">"{scene.voiceover}"</p>
                          </div>
                          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">Visual da Cena:</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{scene.visualScene}</p>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                          <div className="truncate mr-2">
                            <span className="text-slate-500 text-[10px] uppercase font-bold mr-1.5">Prompt Veo:</span>
                            <span className="text-slate-300 font-mono text-[11px]">{scene.veoPrompt}</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(scene.veoPrompt, `prompt_${idx}`)}
                            className="text-slate-400 hover:text-white p-1 shrink-0"
                            title="Copiar prompt"
                          >
                            {copiedId === `prompt_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3+ CTA Variations */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Chamadas para Ação (CTAs) com Gatilhos de Fechamento
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAnalysis.remodeling.ctaVariations.map((cta, idx) => (
                      <div key={cta.id || idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-emerald-300 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              {cta.triggerType}
                            </span>
                            <button onClick={() => handleCopyText(cta.ctaText, cta.id)} className="text-slate-400 hover:text-white p-1">
                              {copiedId === cta.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-slate-100 mb-2 leading-relaxed">
                            "{cta.ctaText}"
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-400">
                          <strong>Ação Visual:</strong> {cta.visualCtaAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration Export Actions */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-indigo-400" />
                      Exportar para Outros Módulos do Sistema
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Envie os prompts e blocos gerados diretamente para o Prompt Studio PRO ou para a Fila de Geração.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportPromptStudio}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center gap-2 shadow"
                    >
                      <Wand2 className="w-4 h-4 text-cyan-300" />
                      <span>Exportar p/ Prompt Studio</span>
                    </button>
                    <button
                      onClick={handleExportQueue}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      <Layers className="w-4 h-4 text-amber-300" />
                      <span>Gerar Cenas na Fila</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                <Wand2 className="w-10 h-10 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-300">Nenhuma remodelagem gerada ainda</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Clique no botão <strong>"Gerar Conteúdo Original Remodelado"</strong> acima para criar um roteiro inédito adaptado ao seu produto.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HISTORY & SAVED ANALYSES */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-400" />
              Histórico de Vídeos Analisados ({analyses.length})
            </h3>

            {analyses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((item) => {
                  const isSelected = selectedAnalysis?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedAnalysis(item);
                        setActiveTab('analysis');
                      }}
                      className={`cursor-pointer rounded-2xl p-4.5 border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {item.analysis.detectedSalesMethodName}
                          </span>
                          <button
                            onClick={(e) => handleDeleteAnalysis(item.id, e)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Excluir do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mb-1">{item.videoTitle}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 italic mb-2">
                          "{item.analysis.hookAnalysis.hookText}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                        <span>{item.durationSeconds.toFixed(1)}s</span>
                        <span className="text-purple-400 font-bold">
                          {item.remodeling ? '✨ Remodelado' : '⚡ Analisado'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Nenhuma análise no histórico. Vá até a aba "Importar & Analisar" para dissecar seu primeiro vídeo.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
