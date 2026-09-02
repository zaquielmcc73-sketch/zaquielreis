import React, { useState } from 'react';
import { RotateCw, X, Sparkles, Flame, Check } from 'lucide-react';
import { SavedVideoItem } from '../types';

interface RemixModalProps {
  video: SavedVideoItem | null;
  onClose: () => void;
  onConfirmRemix: (remixData: {
    id: string;
    hook: string;
    action: string;
    dialogue: string;
    cta: string;
    style: string;
  }) => Promise<void>;
}

export const RemixModal: React.FC<RemixModalProps> = ({
  video,
  onClose,
  onConfirmRemix,
}) => {
  if (!video) return null;

  const [hook, setHook] = useState(video.hook);
  const [action, setAction] = useState(video.scriptSummary?.action || 'Demonstração dinâmica com micro-detalhes de funcionamento.');
  const [dialogue, setDialogue] = useState(video.scriptSummary?.dialogue || video.hook);
  const [cta, setCta] = useState(video.scriptSummary?.cta || 'Aproveite a promoção de lançamento agora!');
  const [style, setStyle] = useState('Cinematic High Contrast 4K Studio');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmRemix({
        id: video.id,
        hook,
        action,
        dialogue,
        cta,
        style,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Remixar Criativo de Vídeo</h3>
              <p className="text-xs text-slate-400">
                Gere uma variação alternativa modificando elementos específicos do roteiro.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Novo Gancho (Hook)</label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Ação Visual da Cena</label>
            <textarea
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Texto em Tela / Diálogo</label>
            <input
              type="text"
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Chamada para Ação (CTA)</label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Estilo Visual</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Cinematic High Contrast 4K Studio">Cinematográfico / Studio 4K</option>
                <option value="Raw UGC Smartphone Camera Natural Lighting">UGC Orgânico / Smartphone</option>
                <option value="Dynamic Fast Paced High Energy">Dinâmico / Ação Rápida</option>
                <option value="Extreme Macro 120fps Slow Motion">Macro 120fps Slow Motion</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Enfileirando...' : 'Gerar Variação no Veo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
