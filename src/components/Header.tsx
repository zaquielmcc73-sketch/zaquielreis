import React from 'react';
import { Sparkles, BookOpen, Layers, ShieldCheck, AlertCircle, PlayCircle, Cpu } from 'lucide-react';
import { AppSettings, GenerationJob, ProjectBible } from '../types';

interface HeaderProps {
  settings: AppSettings | null;
  bible: ProjectBible | null;
  queue: GenerationJob[];
  onOpenBible: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  bible,
  queue,
  onOpenBible,
  onOpenSettings,
}) => {
  const activeJobs = queue.filter(
    (j) => j.status === 'generating' || j.status === 'polling' || j.status === 'saving'
  ).length;

  const isConnected = settings?.apiKeyConfigured || settings?.hasEnvKey;
  const isDemo = settings?.demoMode;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold tracking-tight text-white text-base">
              VEO AUTO STUDIO
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
              Desktop Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Criação Automatizada de Vídeos de Vendas com Google Veo
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Queue indicator */}
        {activeJobs > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs animate-pulse">
            <Layers className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="font-medium">{activeJobs} vídeo(s) gerando...</span>
          </div>
        )}

        {/* Selected Model */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Modelo:</span>
          <span className="font-medium text-slate-200">
            {settings?.selectedModel?.replace('-generate-preview', '') || 'veo-3.1-lite'}
          </span>
        </div>

        {/* Export ZIP Download Button */}
        <a
          id="btn-download-source-zip"
          href="/veo-auto-studio-fase5-corrigido.zip"
          download="veo-auto-studio-fase5-corrigido.zip"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 hover:border-indigo-400 text-xs font-semibold text-indigo-200 hover:text-white transition-all shadow-sm"
          title="Baixar código-fonte completo da Fase 5 (ZIP)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Baixar ZIP Fase 5</span>
        </a>

        {/* Project Bible quick trigger */}
        <button
          id="btn-header-bible"
          onClick={onOpenBible}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span>Project Bible</span>
          {bible?.productName && (
            <span className="max-w-[120px] truncate text-slate-400 text-[11px]">
              ({bible.productName})
            </span>
          )}
        </button>

        {/* Connection status badge */}
        <button
          id="btn-header-api-status"
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isDemo
              ? 'bg-amber-950/30 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
              : isConnected
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300 hover:bg-rose-900/40 animate-pulse'
          }`}
        >
          {isDemo ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo Demo</span>
            </>
          ) : isConnected ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>🟢 API Conectada</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>🔴 API Não Configurada</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
