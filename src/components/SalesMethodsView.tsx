import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  Check,
  Sparkles,
  ChevronRight,
  Eye,
  Camera,
  Layers,
  Flame,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { SALES_METHODS } from '../data/salesMethods';
import { SalesMethodId, SalesMethodInfo } from '../types';

interface SalesMethodsViewProps {
  onSelectMethodForCampaign?: (methodId: SalesMethodId) => void;
}

export const SalesMethodsView: React.FC<SalesMethodsViewProps> = ({
  onSelectMethodForCampaign,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<SalesMethodInfo>(SALES_METHODS[0]);
  const [customConfigs, setCustomConfigs] = useState<Record<string, any>>({
    china: {
      hook: 'Olha o que acontece quando você coloca essa sujeira aqui...',
      problem: 'O método convencional não alcança os cantos difíceis.',
      mechanism: 'Micro-bolhas de cavitação ultrassônica implodem a sujeira na hora.',
      benefit: 'Limpeza 100% perfeita sem esfregar.',
      proof: 'Veja o teste em câmera lenta e o resultado final.',
      offer: 'Compre 1 e leve o kit de acessórios grátis.',
      cta: 'Clique no link e peça agora antes que o lote acabe!',
    },
    drive_thru: {
      fastHook: 'Para tudo! Isso limpa qualquer sujeira em 3 segundos.',
      problem: 'Você ainda perde horas esfregando tudo?',
      solution: 'Conheça o sistema UltraClean de alta frequência.',
      mainBenefit: 'Brilho de novo instantâneo sem esforço.',
      offer: '50% de desconto hoje.',
      cta: 'Toque no botão e compre com frete grátis.',
    },
    fomo: {
      hook: 'Últimas 17 unidades do lote de importação com desconto!',
      opportunity: 'Preço congelado antes do aumento da tabela amanhã.',
      desire: 'Receba na sua casa com entrega expressa garantida.',
      riskOfLoss: 'Quando o estoque zerar, a promoção acaba imediatamente.',
      urgency: 'Oferta válida estritamente até às 23:59.',
      offer: 'De R$ 297 por apenas R$ 147.',
      cta: 'Garanta sua unidade agora mesmo.',
      realUnitsRemaining: 17,
      realDeadline: 'Hoje às 23:59',
      realPromoPrice: 'R$ 147,00',
    },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = async () => {
    try {
      await fetch(`/api/methods/${selectedMethod.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customConfigs[selectedMethod.id] || {}),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* View Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold mb-2">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Estratégias de Venda Avançadas</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          16 Métodos de Venda Estruturados
        </h2>
        <p className="text-xs text-slate-400">
          Personalize as etapas, ganchos e estruturas narrativas de cada método de conversão.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Methods List */}
        <div className="lg:col-span-5 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {SALES_METHODS.map((method) => {
            const isSelected = selectedMethod.id === method.id;
            return (
              <button
                key={method.id}
                id={`method-btn-${method.id}`}
                onClick={() => setSelectedMethod(method)}
                className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/60 border-purple-500 shadow-md shadow-purple-950/50'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{method.emoji}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {method.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{method.tagline}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-purple-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right 7 Cols: Selected Method Configurator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedMethod.emoji}</span>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedMethod.name}</h3>
                  <p className="text-xs text-purple-300">{selectedMethod.tagline}</p>
                </div>
              </div>

              <button
                type="button"
                id="btn-save-method-config"
                onClick={handleSaveConfig}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Sliders className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Salvo!' : 'Salvar Alterações'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedMethod.description}
            </p>

            {/* Structure Flow */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Estrutura Narrativa Sequencial
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedMethod.structure.map((step, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
                  >
                    <span className="w-4 h-4 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Custom Edit Fields (China, Drive-Thru, FOMO, etc.) */}
            {selectedMethod.id === 'china' && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  🇨🇳 Módulo Configurável — Método China
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {['hook', 'problem', 'mechanism', 'benefit', 'proof', 'offer', 'cta'].map((field) => (
                    <div key={field} className={field === 'cta' || field === 'mechanism' ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
                      <label className="text-slate-400 capitalize font-medium">{field}</label>
                      <input
                        type="text"
                        value={customConfigs.china?.[field] || ''}
                        onChange={(e) =>
                          setCustomConfigs({
                            ...customConfigs,
                            china: { ...customConfigs.china, [field]: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod.id === 'drive_thru' && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  🚗 Estrutura Ultra-Rápida — Método Drive-Thru
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {['fastHook', 'problem', 'solution', 'mainBenefit', 'offer', 'cta'].map((field) => (
                    <div key={field} className={field === 'cta' || field === 'fastHook' ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
                      <label className="text-slate-400 capitalize font-medium">{field}</label>
                      <input
                        type="text"
                        value={customConfigs.drive_thru?.[field] || ''}
                        onChange={(e) =>
                          setCustomConfigs({
                            ...customConfigs,
                            drive_thru: { ...customConfigs.drive_thru, [field]: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod.id === 'fomo' && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    🔥 Parâmetros de Escassez Real — Método FOMO
                  </h4>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    Sem Falsa Escassez
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Unidades Restantes</label>
                    <input
                      type="number"
                      value={customConfigs.fomo?.realUnitsRemaining || 17}
                      onChange={(e) =>
                        setCustomConfigs({
                          ...customConfigs,
                          fomo: { ...customConfigs.fomo, realUnitsRemaining: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Data / Hora Limite</label>
                    <input
                      type="text"
                      value={customConfigs.fomo?.realDeadline || 'Hoje às 23:59'}
                      onChange={(e) =>
                        setCustomConfigs({
                          ...customConfigs,
                          fomo: { ...customConfigs.fomo, realDeadline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Preço Promocional</label>
                    <input
                      type="text"
                      value={customConfigs.fomo?.realPromoPrice || 'R$ 147,00'}
                      onChange={(e) =>
                        setCustomConfigs({
                          ...customConfigs,
                          fomo: { ...customConfigs.fomo, realPromoPrice: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
