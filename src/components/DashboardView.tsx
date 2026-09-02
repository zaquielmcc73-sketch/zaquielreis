import React from 'react';
import {
  Film,
  Sparkles,
  Play,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Brain,
  Video,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AnalyticsData, AppSettings, GenerationJob, ProjectBible, SavedVideoItem } from '../types';
import { SALES_METHODS } from '../data/salesMethods';

interface DashboardViewProps {
  settings: AppSettings | null;
  analytics: AnalyticsData | null;
  queue: GenerationJob[];
  library: SavedVideoItem[];
  bible: ProjectBible | null;
  onNavigate: (tab: any) => void;
  onOpenTestVideoModal: () => void;
  onPlayVideo: (video: SavedVideoItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  analytics,
  queue,
  library,
  bible,
  onNavigate,
  onOpenTestVideoModal,
  onPlayVideo,
}) => {
  const isConnected = settings?.apiKeyConfigured || settings?.hasEnvKey;
  const activeQueueCount = queue.filter(
    (j) => j.status === 'generating' || j.status === 'polling' || j.status === 'saving'
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Automação Oficial Google Veo 3.1 & Gemini 3.7</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Crie até 75 criativos de vendas hiper-persuasivos em minutos.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Estratégias multiformato (Método China, Drive-Thru, FOMO Real, POV 1ª Pessoa, UGC e mais 11 métodos) com geração em lote oficial e controle local de arquivos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-dash-campaign-orchestrator"
              onClick={() => onNavigate('campaign_orchestrator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-700/60 text-xs font-semibold text-emerald-300 transition-all shadow-md hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Orquestrador PRO (Fase 5)</span>
            </button>

            <button
              id="btn-dash-video-copier"
              onClick={() => onNavigate('video_copier')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-700/60 text-xs font-semibold text-purple-200 transition-all shadow-md hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Video Copier PRO</span>
            </button>

            <button
              id="btn-dash-test-video"
              onClick={onOpenTestVideoModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white transition-all shadow-md hover:scale-[1.02]"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>🧪 Gerar Vídeo de Teste</span>
            </button>

            <button
              id="btn-dash-create-campaign"
              onClick={() => onNavigate('campaign')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-cyan-950/60 hover:scale-[1.02]"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>🚀 Criar Campanha (75 Vídeos)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Gerados</span>
            <Film className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {library.length + queue.filter((j) => j.status === 'completed').length}
          </p>
          <p className="text-[11px] text-slate-500">Vídeos salvos na biblioteca</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fila em Andamento</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">
            {activeQueueCount} <span className="text-xs text-slate-400 font-normal">/ {queue.length} total</span>
          </p>
          <p className="text-[11px] text-slate-500">Tarefas ativas no processo local</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taxa de Conclusão</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">
            {analytics?.completionRatePercent || 100}%
          </p>
          <p className="text-[11px] text-slate-500">Sucesso nas operações Veo</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Status da API</span>
            {isConnected ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <p className={`text-base font-bold ${isConnected ? 'text-emerald-300' : 'text-rose-400'}`}>
            {isConnected ? '🟢 Conectado' : '🔴 Não configurado'}
          </p>
          <p className="text-[11px] text-slate-500">
            {settings?.selectedModel || 'veo-3.1-lite'}
          </p>
        </div>
      </div>

      {/* Quick Methods Grid Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              16 Métodos de Venda Estruturados
            </h3>
            <p className="text-xs text-slate-400">
              Modelos comprovados prontos para distribuição em campanhas de 75 criativos
            </p>
          </div>
          <button
            id="btn-dash-view-all-methods"
            onClick={() => onNavigate('methods')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver todos e editar estruturas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {SALES_METHODS.slice(0, 8).map((m) => (
            <button
              key={m.id}
              onClick={() => onNavigate('methods')}
              className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="text-xl">{m.emoji}</div>
              <div>
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-white line-clamp-1">
                  {m.name.replace('MÉTODO ', '')}
                </p>
                <p className="text-[9px] text-slate-400 line-clamp-1">{m.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Videos & Active Queue split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Library Items */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Vídeos Recentes da Biblioteca</h3>
            </div>
            <button
              id="btn-dash-view-library"
              onClick={() => onNavigate('library')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Ver biblioteca completa ({library.length})
            </button>
          </div>

          {library.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">
                Nenhum vídeo gerado ainda. Inicie um teste rápido ou lance sua primeira campanha!
              </p>
              <button
                onClick={onOpenTestVideoModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-medium hover:bg-cyan-900 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Gerar 1 Vídeo de Teste</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {library.slice(0, 4).map((video) => (
                <div
                  key={video.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {video.methodName || video.method}
                    </span>
                    <span className="text-[10px] text-slate-500">{video.aspectRatio}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-2">
                    "{video.hook}"
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500">{video.model}</span>
                    <button
                      onClick={() => onPlayVideo(video)}
                      className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:underline"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Assistir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Generation Queue Summary */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Status da Fila</h3>
            </div>
            <button
              id="btn-dash-view-queue"
              onClick={() => onNavigate('queue')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Gerenciar fila
            </button>
          </div>

          {queue.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Fila vazia no momento.</p>
              <p className="text-[11px] text-slate-500">
                Os vídeos gerados em lote aparecerão aqui com progresso ao vivo.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {queue.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300 truncate">
                        Vídeo #{String(job.index).padStart(3, '0')}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">({job.methodName})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{job.hook}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        job.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : job.status === 'generating' || job.status === 'polling'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : job.status === 'error'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {job.status === 'completed'
                        ? 'Concluído'
                        : job.status === 'generating'
                        ? `${job.progress}% Gerando`
                        : job.status === 'polling'
                        ? `${job.progress}% Veo Polling`
                        : job.status === 'error'
                        ? 'Erro'
                        : 'Aguardando'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
