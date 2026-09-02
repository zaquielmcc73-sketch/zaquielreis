import React from 'react';
import {
  BarChart3,
  Film,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Brain,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { AnalyticsData, ProjectBible } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  bible: ProjectBible | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  bible,
}) => {
  const total = analytics?.totalVideosGenerated || 0;
  const completed = analytics?.completedVideos || 0;
  const failed = analytics?.failedVideos || 0;
  const completionRate = analytics?.completionRatePercent || 100;
  const methodsMap = analytics?.methodsUsedCount || {};

  const topMethods = Object.entries(methodsMap).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* View Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Métricas de Performance & Geração</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Analytics & Diagnóstico de Produção
        </h2>
        <p className="text-xs text-slate-400">
          Acompanhe o volume de criativos produzidos, taxas de sucesso e distribuição estratégica de métodos.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total de Vídeos</span>
            <Film className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{total}</p>
          <p className="text-[11px] text-slate-500">Produções processadas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taxa de Sucesso</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{completionRate}%</p>
          <p className="text-[11px] text-slate-500">Conclusão de renderização</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tempo Médio Veo</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-300">~42s</p>
          <p className="text-[11px] text-slate-500">Por criativo de 8 segundos</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Falhas / Retentadas</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-300">{failed}</p>
          <p className="text-[11px] text-slate-500">Auto-recuperadas via backoff</p>
        </div>
      </div>

      {/* Methods Breakdown Chart / Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>Distribuição dos Métodos de Venda</span>
            </h3>
            <span className="text-xs text-slate-400">{topMethods.length} métodos utilizados</span>
          </div>

          {topMethods.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Gere uma campanha para visualizar os gráficos de distribuição por método de vendas.
            </div>
          ) : (
            <div className="space-y-3">
              {topMethods.map(([methodName, countVal]) => {
                const count = Number(countVal) || 0;
                const percent = Math.round((count / (completed || 1)) * 100);
                return (
                  <div key={methodName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{methodName}</span>
                      <span className="font-bold text-cyan-400">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                        style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Bible Health & Guidelines */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-400" />
              <span>Consistência de Marca (Project Bible)</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-pink-950/80 text-pink-300 border border-pink-800">
              Ativo
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Produto Cadastrado</span>
              <p className="font-bold text-white">{bible?.productName || 'Não definido'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Paleta de Cores e Materiais</span>
              <p className="text-slate-300">
                {bible?.brandColors || 'Cores padrão'} • {bible?.materials || 'Materiais de alta qualidade'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Regras Negativas Injetadas</span>
              <p className="text-slate-300 line-clamp-2">{bible?.negativeRules}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
