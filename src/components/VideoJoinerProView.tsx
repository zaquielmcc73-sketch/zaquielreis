import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Plus,
  Play,
  Pause,
  Trash2,
  MoveUp,
  MoveDown,
  Volume2,
  VolumeX,
  Music,
  Scissors,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Upload,
  RefreshCw,
  Sliders,
  Type,
  Maximize2,
  Cpu,
} from 'lucide-react';
import {
  VideoJoinerClip,
  VideoJoinerConfig,
  VideoJoinerPreset,
  VideoTransitionType,
  MediaAsset,
  AudioTrackConfig,
} from '../types';

interface VideoJoinerProViewProps {
  mediaAssets: MediaAsset[];
  onNavigateToQueue: () => void;
  onRefreshMedia?: () => void;
}

const PRESETS: Array<{ id: VideoJoinerPreset; name: string; desc: string; ratio: '9:16' | '16:9' | '1:1'; res: '720p' | '1080p'; fps: 30 | 60 }> = [
  { id: 'tiktok', name: 'TikTok Viral', desc: 'Vertical 9:16, 1080x1920, 30fps otimizado para feed FYP', ratio: '9:16', res: '1080p', fps: 30 },
  { id: 'tiktok_shop', name: 'TikTok Shop E-commerce', desc: 'Vertical 9:16 com cortes rápidos para alta conversão', ratio: '9:16', res: '1080p', fps: 30 },
  { id: 'reels', name: 'Instagram Reels', desc: 'Vertical 9:16, máxima nitidez para Instagram e Stories', ratio: '9:16', res: '1080p', fps: 30 },
  { id: 'shorts', name: 'YouTube Shorts', desc: 'Vertical 9:16 com alta fidelidade de som e vídeo', ratio: '9:16', res: '1080p', fps: 60 },
  { id: 'direct_ad', name: 'Anúncio Direto (Meta/Google)', desc: '1080p formato 9:16 ou 1:1 para campanhas pagas', ratio: '9:16', res: '1080p', fps: 30 },
  { id: 'ugc', name: 'Estilo UGC Realista', desc: 'Montagem fluida com trilha de fundo e áudio original balanceado', ratio: '9:16', res: '1080p', fps: 30 },
  { id: 'custom', name: 'Personalizado', desc: 'Ajuste livre de resolução, FPS e proporção de tela', ratio: '9:16', res: '1080p', fps: 30 },
];

export const VideoJoinerProView: React.FC<VideoJoinerProViewProps> = ({
  mediaAssets,
  onNavigateToQueue,
  onRefreshMedia,
}) => {
  const [title, setTitle] = useState('Meu Vídeo Unificado');
  const [selectedPreset, setSelectedPreset] = useState<VideoJoinerPreset>('tiktok_shop');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  const [clips, setClips] = useState<VideoJoinerClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Background Audio
  const [hasBgAudio, setHasBgAudio] = useState(false);
  const [bgAudio, setBgAudio] = useState<AudioTrackConfig>({
    volumePercent: 25,
    loop: true,
    fadeInSeconds: 0.5,
    fadeOutSeconds: 1.5,
  });

  // Media picker modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'clip' | 'audio'>('clip');

  // Engine status
  const [engineStatus, setEngineStatus] = useState<{ isAvailable: boolean; source: string; error?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Player state
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetchEngineStatus();
  }, []);

  const fetchEngineStatus = async () => {
    try {
      const res = await fetch('/api/video-engine/status');
      const data = await res.json();
      setEngineStatus({
        isAvailable: data.ffmpeg?.isAvailable ?? false,
        source: data.ffmpeg?.source ?? 'none',
        error: data.ffmpeg?.error,
      });
    } catch {
      setEngineStatus({ isAvailable: false, source: 'none', error: 'Servidor inacessível' });
    }
  };

  const handleApplyPreset = (presetId: VideoJoinerPreset) => {
    setSelectedPreset(presetId);
    const p = PRESETS.find((item) => item.id === presetId);
    if (p && presetId !== 'custom') {
      setAspectRatio(p.ratio);
      setResolution(p.res);
      setFps(p.fps);
    }
  };

  const handleAddMediaAsClip = (media: MediaAsset) => {
    const rawDur = media.durationSeconds || 5;
    const newClip: VideoJoinerClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      mediaAssetId: media.id,
      filePath: media.filePath,
      url: media.relativeUrl || `/api/media/files/${media.id}/stream`,
      name: media.name || media.originalFileName,
      durationSeconds: rawDur,
      trimStartSeconds: 0,
      trimEndSeconds: 0,
      effectiveDuration: rawDur,
      volumePercent: 100,
      isMuted: false,
      transitionToNext: 'none',
    };

    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
    setIsMediaModalOpen(false);
  };

  const handleSelectBgAudio = (media: MediaAsset) => {
    setBgAudio((prev) => ({
      ...prev,
      mediaAssetId: media.id,
      filePath: media.filePath,
      url: media.relativeUrl,
      name: media.name,
    }));
    setHasBgAudio(true);
    setIsMediaModalOpen(false);
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('audio') ? 'OTHER' : 'VIDEO');
      formData.append('name', file.name);

      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        const savedMedia: MediaAsset = await res.json();
        handleAddMediaAsClip(savedMedia);
        onRefreshMedia?.();
      } catch (err) {
        console.error('Falha no upload direto do clipe:', err);
      }
    }
  };

  const handleUpdateClip = (clipId: string, partial: Partial<VideoJoinerClip>) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId) {
          const updated = { ...c, ...partial };
          const start = Math.max(0, updated.trimStartSeconds || 0);
          const end = Math.max(0, updated.trimEndSeconds || 0);
          updated.effectiveDuration = Math.max(0.5, updated.durationSeconds - start - end);
          return updated;
        }
        return c;
      })
    );
  };

  const handleMoveClip = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === clips.length - 1)
    )
      return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newClips = [...clips];
    const temp = newClips[index];
    newClips[index] = newClips[targetIdx];
    newClips[targetIdx] = temp;
    setClips(newClips);
  };

  const handleDeleteClip = (clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  const totalDuration = clips.reduce((acc, c) => acc + c.effectiveDuration, 0);

  const handleRenderJoin = async () => {
    if (clips.length === 0) {
      setStatusMessage({ type: 'error', text: 'Adicione pelo menos 1 clipe para renderizar o vídeo.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const config: VideoJoinerConfig = {
      title: title.trim() || 'Vídeo Unificado',
      preset: selectedPreset,
      aspectRatio,
      resolution,
      fps,
      clips,
      backgroundAudio: hasBgAudio && bgAudio.filePath ? bgAudio : undefined,
      targetDurationSeconds: totalDuration,
    };

    try {
      const res = await fetch('/api/video-engine/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, campaignName: title }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao enfileirar o vídeo');
      }

      setStatusMessage({
        type: 'success',
        text: `Vídeo "${title}" enviado para a Fila de Processamento! Acompanhe o progresso em tempo real.`,
      });
      setTimeout(() => {
        onNavigateToQueue();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao processar vídeo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Juntador de Vídeos Pro
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    Fase 2
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Una múltiplos clipes com sincronização estrita de áudio, cortes precisos, normalização automática e mixagem.
                </p>
              </div>
            </div>
          </div>

          {/* ENGINE STATUS & ACTIONS */}
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                engineStatus?.isAvailable
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {engineStatus?.isAvailable
                  ? `Motor FFmpeg Ativo (${engineStatus.source})`
                  : 'Motor Local em Detecção'}
              </span>
            </div>

            <button
              onClick={handleRenderJoin}
              disabled={isSubmitting || clips.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Renderizar & Enviar para Fila</span>
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

      {/* PRESETS BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Presets Comerciais de Exportação
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs truncate">{p.name}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {p.ratio} • {p.res} • {p.fps}fps
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TIMELINE & CLIPS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* GENERAL INFO & FORMAT CONTROLS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Título do Vídeo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Nome do projeto..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Proporção
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="16:9">16:9 (Horizontal)</option>
                    <option value="1:1">1:1 (Quadrado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Resolução
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    FPS
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value) as any)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE LIST */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Timeline de Clipes ({clips.length})
                </h2>
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-mono">
                  {totalDuration.toFixed(1)}s total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMediaPickerMode('clip');
                    setIsMediaModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-amber-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Da Central de Mídia</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-medium text-amber-400 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleDirectFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {clips.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-slate-800 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400">
                  <FileVideo className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium text-sm">
                    Nenhum clipe adicionado à timeline
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Adicione vídeos da Central de Mídia ou faça upload direto de arquivos MP4 do seu computador.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {clips.map((clip, index) => {
                  const isSelected = clip.id === selectedClipId;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex-shrink-0">
                          {index + 1}
                        </span>

                        <div className="w-16 h-12 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800 flex items-center justify-center">
                          <video
                            src={clip.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[260px]">
                            {clip.name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{clip.effectiveDuration.toFixed(1)}s</span>
                            {clip.trimStartSeconds > 0 && (
                              <span className="text-amber-400 text-[10px]">
                                Corte In: +{clip.trimStartSeconds}s
                              </span>
                            )}
                            {clip.isMuted ? (
                              <span className="text-rose-400 text-[10px] flex items-center gap-0.5">
                                <VolumeX className="w-3 h-3" /> Mudo
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[10px]">
                                Vol: {clip.volumePercent}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveClip(index, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1.5 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300"
                          title="Mover para cima"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveClip(index, 'down');
                          }}
                          disabled={index === clips.length - 1}
                          className="p-1.5 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300"
                          title="Mover para baixo"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClip(clip.id);
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400"
                          title="Remover clipe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* INDIVIDUAL CLIP INSPECTOR & CONTROLS */}
          {selectedClip && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>Ajustes do Clipe: {selectedClip.name}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Duração Bruta: {selectedClip.durationSeconds.toFixed(1)}s
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* TRIM START & END */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Corte Inicial (Trim In): {selectedClip.trimStartSeconds.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, selectedClip.durationSeconds - 0.5)}
                    step={0.1}
                    value={selectedClip.trimStartSeconds}
                    onChange={(e) =>
                      handleUpdateClip(selectedClip.id, {
                        trimStartSeconds: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Corte Final (Trim Out): {selectedClip.trimEndSeconds.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(
                      0,
                      selectedClip.durationSeconds - selectedClip.trimStartSeconds - 0.5
                    )}
                    step={0.1}
                    value={selectedClip.trimEndSeconds}
                    onChange={(e) =>
                      handleUpdateClip(selectedClip.id, {
                        trimEndSeconds: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* VOLUME & MUTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-400">
                      Volume do Áudio Original ({selectedClip.volumePercent}%)
                    </label>
                    <button
                      onClick={() =>
                        handleUpdateClip(selectedClip.id, { isMuted: !selectedClip.isMuted })
                      }
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        selectedClip.isMuted
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {selectedClip.isMuted ? 'Mudo (Ativo)' : 'Mutar'}
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    disabled={selectedClip.isMuted}
                    value={selectedClip.volumePercent}
                    onChange={(e) =>
                      handleUpdateClip(selectedClip.id, {
                        volumePercent: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Transição para o Próximo Clipe
                  </label>
                  <select
                    value={selectedClip.transitionToNext || 'none'}
                    onChange={(e) =>
                      handleUpdateClip(selectedClip.id, {
                        transitionToNext: e.target.value as VideoTransitionType,
                      })
                    }
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="none">Corte Direto (Padrão)</option>
                    <option value="fade">Fade to Black</option>
                    <option value="dissolve">Dissolve (Crossfade)</option>
                    <option value="wipeleft">Wipe Esquerda</option>
                    <option value="wiperight">Wipe Direita</option>
                    <option value="slideup">Slide Cima</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* BACKGROUND AUDIO SECTION */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Trilha Sonora / Áudio de Fundo
                </h3>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBgAudio}
                  onChange={(e) => setHasBgAudio(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                />
                <span className="text-xs font-medium text-slate-300">Habilitar Trilha</span>
              </label>
            </div>

            {hasBgAudio && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMediaPickerMode('audio');
                      setIsMediaModalOpen(true);
                    }}
                    className="flex-1 p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-300 truncate">
                      {bgAudio.name ? `🎵 ${bgAudio.name}` : 'Selecionar arquivo de áudio da Central...'}
                    </span>
                    <span className="text-amber-400 font-semibold flex-shrink-0 ml-2">Escolher</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Volume Trilha ({bgAudio.volumePercent}%)
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={bgAudio.volumePercent}
                      onChange={(e) =>
                        setBgAudio((prev) => ({ ...prev, volumePercent: parseInt(e.target.value) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Fade In ({bgAudio.fadeInSeconds}s)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.5}
                      value={bgAudio.fadeInSeconds}
                      onChange={(e) =>
                        setBgAudio((prev) => ({ ...prev, fadeInSeconds: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Fade Out ({bgAudio.fadeOutSeconds}s)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={bgAudio.fadeOutSeconds}
                      onChange={(e) =>
                        setBgAudio((prev) => ({ ...prev, fadeOutSeconds: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW PLAYER & SPECIFICATIONS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* PLAYER PREVIEW */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pré-Visualização do Clipe Ativo
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {clips.length > 0 ? `Clipe ${activePreviewIndex + 1} de ${clips.length}` : 'Vazio'}
              </span>
            </div>

            <div
              className={`bg-black rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-[240px] h-[426px]'
                  : aspectRatio === '1:1'
                  ? 'w-[300px] h-[300px]'
                  : 'w-full h-[220px]'
              }`}
            >
              {clips.length > 0 ? (
                <video
                  ref={videoPlayerRef}
                  src={clips[activePreviewIndex]?.url}
                  className="w-full h-full object-contain"
                  controls
                  onEnded={() => {
                    if (activePreviewIndex + 1 < clips.length) {
                      setActivePreviewIndex(activePreviewIndex + 1);
                    } else {
                      setActivePreviewIndex(0);
                    }
                  }}
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Film className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Nenhum clipe na timeline para reproduzir</p>
                </div>
              )}
            </div>

            {clips.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setActivePreviewIndex(Math.max(0, activePreviewIndex - 1))}
                  disabled={activePreviewIndex === 0}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-medium text-slate-300"
                >
                  ◀ Anterior
                </button>
                <span className="text-xs font-mono text-slate-400">
                  {clips[activePreviewIndex]?.name}
                </span>
                <button
                  onClick={() =>
                    setActivePreviewIndex(Math.min(clips.length - 1, activePreviewIndex + 1))
                  }
                  disabled={activePreviewIndex === clips.length - 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-medium text-slate-300"
                >
                  Próximo ▶
                </button>
              </div>
            )}
          </div>

          {/* PROJECT SUMMARY CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resumo Técnico do Vídeo
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Total de Clipes</span>
                <span className="font-semibold text-white">{clips.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Duração Estimada</span>
                <span className="font-semibold text-amber-400 font-mono">
                  {totalDuration.toFixed(1)} segundos
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Formato / Resolução</span>
                <span className="font-semibold text-white">
                  {aspectRatio} ({resolution} @ {fps}fps)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Trilha de Fundo</span>
                <span className="font-semibold text-white">
                  {hasBgAudio ? `${bgAudio.volumePercent}% vol` : 'Desativada'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Destino do Arquivo</span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                  /Veo Auto Studio/Campanhas
                </span>
              </div>
            </div>

            <button
              onClick={handleRenderJoin}
              disabled={isSubmitting || clips.length === 0}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Iniciar Processamento Local</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: SELECT MEDIA ASSET FROM CENTRAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {mediaPickerMode === 'clip'
                  ? 'Selecionar Vídeo da Central de Mídia'
                  : 'Selecionar Áudio de Fundo'}
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
                .filter((m) => (mediaPickerMode === 'clip' ? m.type === 'VIDEO' || m.type === 'PRODUCT' : true))
                .map((media) => (
                  <div
                    key={media.id}
                    onClick={() => {
                      if (mediaPickerMode === 'clip') {
                        handleAddMediaAsClip(media);
                      } else {
                        handleSelectBgAudio(media);
                      }
                    }}
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
                          {media.type} • {(media.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex-shrink-0">
                      Selecionar
                    </button>
                  </div>
                ))}

              {mediaAssets.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhum arquivo encontrado na Central de Mídia. Faça upload de vídeos na Central primeiro ou use o botão de Upload Local.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
