import React from 'react';
import {
  Layers,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  Sparkles,
  Video,
} from 'lucide-react';
import { GenerationJob } from '../types';

interface QueueViewProps {
  queue: GenerationJob[];
  onPause: () => void;
  onResume: () => void;
  onCancelAll: () => void;
  onCancelJob: (jobId: string) => void;
  onClearCompleted: () => void;
  onPlayVideoById?: (jobId: string) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  queue,
  onPause,
  onResume,
  onCancelAll,
  onCancelJob,
  onClearCompleted,
  onPlayVideoById,
}) => {
  const total = queue.length;
  const completed = queue.filter((j) => j.status === 'completed').length;
  const failed = queue.filter((j) => j.status === 'error').length;
  const inProgress = queue.filter(
    (j) => j.status === 'generating' || j.status === 'polling' || j.status === 'saving'
  ).length;
  const waiting = queue.filter((j) => j.status === 'waiting').length;

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Gerenciador de Renderização em Lote</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Fila de Geração Google Veo
          </h2>
          <p className="text-xs text-slate-400">
            Controle de concorrência, retentativas exponenciais e salvamento de arquivos em tempo real.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-queue-pause"
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Pause className="w-3.5 h-3.5 text-amber-400" />
            <span>Pausar</span>
          </button>

          <button
            id="btn-queue-resume"
            onClick={onResume}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Retomar</span>
          </button>

          <button
            id="btn-queue-cancel-all"
            onClick={onCancelAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-200 hover:text-rose-300 text-xs font-semibold transition-all"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancelar Tudo</span>
          </button>

          <button
            id="btn-queue-clear"
            onClick={onClearCompleted}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Limpar Concluídos</span>
          </button>
        </div>
      </div>

      {/* Progress & Overall Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">
              {completed} / {total} Concluídos
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
              {progressPercent}%
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {inProgress} Gerando
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              {waiting} Aguardando
            </span>
            {failed > 0 && (
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {failed} Erro
              </span>
            )}
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Queue Items List */}
      <div className="space-y-3">
        {queue.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Nenhum item na fila de geração</p>
            <p className="text-xs text-slate-500">
              Vá para a aba Criar Campanha e inicie a geração de 1 a 75 vídeos.
            </p>
          </div>
        ) : (
          queue.map((job) => {
            const isCompleted = job.status === 'completed';
            const isGenerating = job.status === 'generating' || job.status === 'polling' || job.status === 'saving';
            const isError = job.status === 'error';
            const isCancelled = job.status === 'cancelled';

            return (
              <div
                key={job.id}
                id={`queue-item-${job.id}`}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-950/80 border-slate-800'
                    : isGenerating
                    ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-950/20'
                    : isError
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {job.jobOrigin === 'LOCAL_VIDEO_PROCESSING'
                        ? job.title || `Vídeo #${String(job.index).padStart(3, '0')}`
                        : `Vídeo #${String(job.index).padStart(3, '0')}`}
                    </span>
                    {job.jobOrigin === 'LOCAL_VIDEO_PROCESSING' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300">
                        ⚡ {job.methodName || 'Processamento FFmpeg'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300">
                        {job.methodName || job.method}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">{job.aspectRatio}</span>
                    <span className="text-[10px] text-slate-500">{job.model}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                    {job.jobOrigin === 'LOCAL_VIDEO_PROCESSING'
                      ? job.prompt
                      : `"${job.hook}"`}
                  </p>

                  {/* Error & Solution box if failed */}
                  {isError && job.errorMessage && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-200 space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{job.errorMessage}</span>
                      </div>
                      {job.errorSolution && (
                        <p className="text-[11px] text-slate-300">
                          💡 <span className="font-medium text-slate-200">Solução sugerida:</span> {job.errorSolution}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Generation Status detail */}
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-[11px] text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>
                        {job.jobOrigin === 'LOCAL_VIDEO_PROCESSING'
                          ? `Processando vídeo localmente via FFmpeg (${job.progress}%)...`
                          : job.status === 'generating'
                          ? 'Enviando payload para API oficial do Veo...'
                          : job.status === 'polling'
                          ? `Consultando status da operação Veo (${job.progress}%)...`
                          : 'Baixando e salvando vídeo no disco local...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Status & Controls */}
                <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                  {/* Status Pill */}
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Concluído</span>
                      </span>
                    ) : isGenerating ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 text-xs font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{job.progress}%</span>
                      </span>
                    ) : isError ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Falhou</span>
                      </span>
                    ) : isCancelled ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                        Cancelado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Aguardando</span>
                      </span>
                    )}
                  </div>

                  {/* Cancel button */}
                  {(job.status === 'waiting' || isGenerating) && (
                    <button
                      onClick={() => onCancelJob(job.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Cancelar este item"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  {/* Watch if ready */}
                  {isCompleted && onPlayVideoById && (
                    <button
                      onClick={() => onPlayVideoById(job.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-bold transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Ver</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
