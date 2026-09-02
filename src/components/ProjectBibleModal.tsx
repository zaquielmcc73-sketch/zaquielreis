import React, { useState } from 'react';
import { BookOpen, X, Check, Save, Sparkles, AlertCircle } from 'lucide-react';
import { ProjectBible } from '../types';

interface ProjectBibleModalProps {
  isOpen: boolean;
  bible: ProjectBible | null;
  onClose: () => void;
  onSave: (bible: ProjectBible) => Promise<void>;
}

export const ProjectBibleModal: React.FC<ProjectBibleModalProps> = ({
  isOpen,
  bible,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<ProjectBible>({
    productName: bible?.productName || 'UltraClean Titanium',
    slogan: bible?.slogan || 'Limpeza cirúrgica em segundos.',
    description: bible?.description || 'Higienizador ultrassônico portátil de titânio aeroespacial.',
    targetAudience: bible?.targetAudience || 'Homens e mulheres de 25 a 55 anos que valorizam praticidade.',
    brandColors: bible?.brandColors || 'Prata titânio, azul cobalto, branco puro e grafite.',
    materials: bible?.materials || 'Liga de titânio aeroespacial escovado, aço inoxidável 316L, acrílico óptico.',
    logoPlacement: bible?.logoPlacement || 'Canto superior direito sutil ou gravado a laser no centro do produto.',
    voiceTone: bible?.voiceTone || 'Confiante, direto, dinâmico e focado em autoridade e velocidade.',
    irresistibleOffer: bible?.irresistibleOffer || '50% de desconto no lote exclusivo + frete grátis apenas hoje.',
    negativeRules: bible?.negativeRules || 'Sem artefatos de IA, sem mãos deformadas, sem texto borrado, sem iluminação opaca, sem cenários bagunçados.',
    updatedAt: new Date().toISOString(),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(form);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-950/80 border border-pink-800 flex items-center justify-center text-pink-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project Bible — Identidade & Consistência</h3>
              <p className="text-xs text-slate-400">
                Regras e diretrizes visuais injetadas em todos os prompts automaticamente.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Nome do Produto</label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Slogan</label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-slate-300 font-semibold">Descrição Central</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Cores da Marca</label>
              <input
                type="text"
                value={form.brandColors}
                onChange={(e) => setForm({ ...form, brandColors: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Materiais do Produto</label>
              <input
                type="text"
                value={form.materials}
                onChange={(e) => setForm({ ...form, materials: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Posicionamento do Logotipo</label>
              <input
                type="text"
                value={form.logoPlacement}
                onChange={(e) => setForm({ ...form, logoPlacement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Tom de Voz</label>
              <input
                type="text"
                value={form.voiceTone}
                onChange={(e) => setForm({ ...form, voiceTone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-slate-300 font-semibold">Regras Negativas (O que NÃO deve aparecer)</label>
              <textarea
                rows={2}
                value={form.negativeRules}
                onChange={(e) => setForm({ ...form, negativeRules: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
              />
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
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Salvo!' : 'Salvar Project Bible'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
