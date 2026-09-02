import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Sparkles,
  Check,
  X,
  Upload,
  Layers,
  Wand2,
  RefreshCw,
  Eye,
  Shirt,
  Smile,
  Mic,
  Tag,
} from 'lucide-react';
import { Character, CharacterAgeGroup, MediaAsset } from '../types';

interface CharacterFormModalProps {
  character?: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Partial<Character>) => Promise<void>;
  mediaList: MediaAsset[];
}

export const CharacterFormModal: React.FC<CharacterFormModalProps> = ({
  character,
  isOpen,
  onClose,
  onSave,
  mediaList,
}) => {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<CharacterAgeGroup>('25-34');
  const [customAge, setCustomAge] = useState('');
  const [appearance, setAppearance] = useState('');
  const [hair, setHair] = useState('');
  const [eyes, setEyes] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [clothing, setClothing] = useState('');
  const [accessories, setAccessories] = useState('');
  const [personality, setPersonality] = useState('');
  const [profession, setProfession] = useState('');
  const [stylePreset, setStylePreset] = useState('UGC / Creator Casual');
  const [voiceTone, setVoiceTone] = useState('Amigável, natural e enérgico');
  const [language, setLanguage] = useState('pt_BR');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');
  const [consistencyPrompt, setConsistencyPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  const [isGeneratingConsistency, setIsGeneratingConsistency] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'consistency'>('profile');

  useEffect(() => {
    if (character) {
      setName(character.name || '');
      setAgeGroup(character.ageGroup || '25-34');
      setCustomAge(character.customAge || '');
      setAppearance(character.appearance || '');
      setHair(character.hair || '');
      setEyes(character.eyes || '');
      setSkinTone(character.skinTone || '');
      setClothing(character.clothing || '');
      setAccessories(character.accessories || '');
      setPersonality(character.personality || '');
      setProfession(character.profession || '');
      setStylePreset(character.stylePreset || 'UGC / Creator Casual');
      setVoiceTone(character.voiceTone || 'Amigável');
      setLanguage(character.language || 'pt_BR');
      setDistinctiveFeatures(character.distinctiveFeatures || '');
      setConsistencyPrompt(character.consistencyPrompt || '');
      setNegativePrompt(character.negativePrompt || '');
      setReferenceImageUrl(character.referenceImageUrl || '');
    } else {
      setName('');
      setAgeGroup('25-34');
      setCustomAge('');
      setAppearance('Mulher brasileira de 28 anos, traços autênticos e expressivos, sorriso cativante e simpático');
      setHair('Cabelo castanho ondulado na altura dos ombros');
      setEyes('Olhos castanhos brilhantes');
      setSkinTone('Pele morena clara natural');
      setClothing('Camiseta de algodão básica neutra e jaqueta jeans casual');
      setAccessories('Brincos pequenos dourados e anel minimalista');
      setPersonality('Espontânea, confiante, comunicativa e empática');
      setProfession('Criadora de Conteúdo / Empreendedora Digital');
      setStylePreset('UGC / Creator Casual');
      setVoiceTone('Conversacional, espontâneo e caloroso');
      setLanguage('pt_BR');
      setDistinctiveFeatures('Pequena covinha no rosto ao sorrir');
      setConsistencyPrompt('');
      setNegativePrompt('mudança de traços faciais, envelhecimento repentino, formato de olho diferente, roupa trocada no meio da cena');
      setReferenceImageUrl('');
    }
  }, [character, isOpen]);

  if (!isOpen) return null;

  const handleGenerateConsistencyPrompt = async () => {
    setIsGeneratingConsistency(true);
    try {
      const res = await fetch('/api/characters/generate-consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Protagonista',
          ageGroup,
          customAge,
          appearance,
          hair,
          eyes,
          skinTone,
          clothing,
          accessories,
          distinctiveFeatures,
        }),
      });
      const data = await res.json();
      if (data.consistencyPrompt) {
        setConsistencyPrompt(data.consistencyPrompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingConsistency(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Preencha o nome do personagem.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: character?.id,
        name,
        ageGroup,
        customAge,
        appearance,
        hair,
        eyes,
        skinTone,
        clothing,
        accessories,
        personality,
        profession,
        stylePreset,
        voiceTone,
        language,
        distinctiveFeatures,
        consistencyPrompt,
        negativePrompt,
        referenceImageUrl,
      });
      onClose();
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar personagem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-700/60 flex items-center justify-center text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {character ? `Editar Personagem: ${character.name}` : 'Character Builder (Personagem Recorrente)'}
              </h2>
              <p className="text-xs text-slate-400">
                Crie avatares e personagens consistentes com regras de traços, idade, roupas e estilo para manter identidade visual nos vídeos.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950 shrink-0">
          {[
            { id: 'profile', label: '1. Perfil & Personalidade', icon: Smile },
            { id: 'appearance', label: '2. Aparência & Figurino', icon: Shirt },
            { id: 'consistency', label: '3. Prompt de Consistência', icon: Wand2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nome do Personagem *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Dra. Camila Santos ou Sofia (UGC Creator)"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Faixa Etária</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as CharacterAgeGroup)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="18-24">Jovem (18 a 24 anos)</option>
                    <option value="25-34">Adulto Jovem (25 a 34 anos)</option>
                    <option value="35-44">Adulto Maduro (35 a 44 anos)</option>
                    <option value="45-54">Experiente (45 a 54 anos)</option>
                    <option value="55+">Sênior (55+ anos)</option>
                    <option value="custom">Idade Personalizada</option>
                  </select>
                </div>
              </div>

              {ageGroup === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Idade Específica</label>
                  <input
                    type="text"
                    value={customAge}
                    onChange={(e) => setCustomAge(e.target.value)}
                    placeholder="Ex: 31 anos"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Profissão / Papel</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Ex: Criadora UGC, Especialista em Estética, Executiva"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Preset de Estilo</label>
                  <select
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="UGC / Creator Casual">UGC / Creator Casual (TikTok / Reels)</option>
                    <option value="Apresentador Comercial">Apresentador Comercial Studio</option>
                    <option value="Especialista / Médico">Especialista / Médico / Autoridade</option>
                    <option value="Executivo / Negócios">Executivo / Corporativo</option>
                    <option value="Fitness & Bem-Estar">Fitness & Bem-Estar</option>
                    <option value="Luxo & High-End">Alta Sociedade / Estilo Luxo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Personalidade & Comportamento</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Ex: Enérgica, carismática, segura e transparente"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tom de Voz</label>
                <input
                  type="text"
                  value={voiceTone}
                  onChange={(e) => setVoiceTone(e.target.value)}
                  placeholder="Ex: Natural, confiante, acolhedor"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Descrição Visual Geral</label>
                <textarea
                  rows={2}
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  placeholder="Ex: Mulher brasileira de 28 anos, traços expressivos, porte atlético elegante..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cabelo</label>
                  <input
                    type="text"
                    value={hair}
                    onChange={(e) => setHair(e.target.value)}
                    placeholder="Ex: Castanho ondulado médio"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Olhos</label>
                  <input
                    type="text"
                    value={eyes}
                    onChange={(e) => setEyes(e.target.value)}
                    placeholder="Ex: Castanhos escuros"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tom de Pele</label>
                  <input
                    type="text"
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                    placeholder="Ex: Morena clara natural"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Figurino / Roupas Típicas</label>
                  <input
                    type="text"
                    value={clothing}
                    onChange={(e) => setClothing(e.target.value)}
                    placeholder="Ex: Blusa neutra bege e jaqueta jeans"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Acessórios</label>
                  <input
                    type="text"
                    value={accessories}
                    onChange={(e) => setAccessories(e.target.value)}
                    placeholder="Ex: Brincos pequenos dourados"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Traços Marcantes / Diferenciais</label>
                <input
                  type="text"
                  value={distinctiveFeatures}
                  onChange={(e) => setDistinctiveFeatures(e.target.value)}
                  placeholder="Ex: Covinha no lado esquerdo da bochecha, pequenas sardas suaves"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Photo Reference Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Foto de Referência da Central de Mídia</label>
                {mediaList.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                    {mediaList
                      .filter((m) => m.type !== 'VIDEO')
                      .map((media) => {
                        const isChosen = referenceImageUrl === media.relativeUrl;
                        return (
                          <div
                            key={media.id}
                            onClick={() => setReferenceImageUrl(media.relativeUrl)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isChosen ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <img src={media.relativeUrl} alt={media.name} className="w-full h-full object-cover" />
                            {isChosen && (
                              <div className="absolute inset-0 bg-purple-950/60 flex items-center justify-center text-purple-300">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONSISTENCY PROMPT */}
          {activeTab === 'consistency' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Prompt de Consistência Visual Automática</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateConsistencyPrompt}
                    disabled={isGeneratingConsistency}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingConsistency ? 'animate-spin' : ''}`} />
                    <span>Gerar / Atualizar Prompt</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Esse texto é injetado automaticamente pelo Veo Auto Studio em todas as gerações de cena com este personagem, garantindo que o modelo mantenha a mesma fisionomia e roupas.
                </p>
                <textarea
                  rows={4}
                  value={consistencyPrompt}
                  onChange={(e) => setConsistencyPrompt(e.target.value)}
                  placeholder="Clique em 'Gerar / Atualizar Prompt' para sintetizar os traços acima..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-rose-300">Negative Prompt para o Personagem</label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Ex: mudando de roupa, deformação de rosto, mãos com 6 dedos"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              {activeTab !== 'profile' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'appearance') setActiveTab('profile');
                    if (activeTab === 'consistency') setActiveTab('appearance');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Voltar
                </button>
              )}
              {activeTab !== 'consistency' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'profile') setActiveTab('appearance');
                    if (activeTab === 'appearance') setActiveTab('consistency');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
                >
                  Próxima Etapa
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Personagem'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
