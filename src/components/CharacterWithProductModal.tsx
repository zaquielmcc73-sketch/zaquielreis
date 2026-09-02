import React, { useState, useEffect } from 'react';
import {
  Package,
  UserCheck,
  Sparkles,
  Check,
  X,
  Copy,
  ArrowRight,
  ArrowLeft,
  Video,
  Camera,
  Layers,
  Wand2,
  Hand,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import {
  Character,
  CharacterWithProductConfig,
  MediaAsset,
  Product,
} from '../types';

interface CharacterWithProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
  initialCharacterId?: string;
  onEnqueueJob?: (prompt: string, title: string, product: string) => void;
}

export const CharacterWithProductModal: React.FC<CharacterWithProductModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
  initialCharacterId,
  onEnqueueJob,
}) => {
  const [step, setStep] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);

  // Wizard selections
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductImageUrl, setSelectedProductImageUrl] = useState<string>('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  // Scene & Interaction Config
  const [scenario, setScenario] = useState<string>('Bancada moderna em mármore claro com luz natural de estúdio');
  const [action, setAction] = useState<string>('Segura o produto com as duas mãos na altura do peito, abre a tampa com um giro suave e demonstra a textura com entusiasmo');
  const [framing, setFraming] = useState<'close_up' | 'medium_shot' | 'cowboy_shot' | 'wide_shot' | 'macro_detail'>('medium_shot');
  const [cameraMovement, setCameraMovement] = useState<'static' | 'smooth_pan' | 'orbit_360' | 'dolly_in' | 'handheld_organic'>('dolly_in');
  const [lighting, setLighting] = useState<'studio_clean' | 'golden_hour' | 'neon_accent' | 'natural_window' | 'dramatic_chiaroscuro'>('studio_clean');
  const [expression, setExpression] = useState<'enthusiastic' | 'focused' | 'amazed' | 'confident' | 'relieved'>('enthusiastic');

  // Result state
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedNegativePrompt, setGeneratedNegativePrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/products')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
            if (initialProductId) setSelectedProductId(initialProductId);
            else if (data.length > 0) setSelectedProductId(data[0].id);
          }
        });

      fetch('/api/characters')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCharacters(data);
            if (initialCharacterId) setSelectedCharacterId(initialCharacterId);
            else if (data.length > 0) setSelectedCharacterId(data[0].id);
          }
        });

      fetch('/api/media')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setMediaList(data);
        });

      setStep(1);
      setGeneratedPrompt('');
    }
  }, [isOpen, initialProductId, initialCharacterId]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId);
  const currentCharacter = characters.find((c) => c.id === selectedCharacterId);

  const handleGeneratePrompt = async () => {
    if (!selectedProductId || !selectedCharacterId) {
      alert('Selecione um produto e um personagem.');
      return;
    }

    setIsGenerating(true);
    try {
      const config: CharacterWithProductConfig = {
        productId: selectedProductId,
        productImageUrl: selectedProductImageUrl || currentProduct?.mainImageUrl,
        characterId: selectedCharacterId,
        scenario,
        action,
        framing,
        cameraMovement,
        lighting,
        expression,
      };

      const res = await fetch('/api/prompt-studio/character-with-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.fullPrompt) {
        setGeneratedPrompt(data.fullPrompt);
        setGeneratedNegativePrompt(data.negativePrompt || '');
        setStep(6);
      } else {
        alert(data.error || 'Erro ao gerar prompt.');
      }
    } catch (e: any) {
      alert(e?.message || 'Falha na conexão com o servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendToQueue = () => {
    if (onEnqueueJob && generatedPrompt) {
      onEnqueueJob(
        generatedPrompt,
        `${currentCharacter?.name || 'Personagem'} com ${currentProduct?.name || 'Produto'}`,
        currentProduct?.name || 'Produto'
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-950 border border-purple-800/80 rounded-3xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-800 border border-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Personagem com Produto — Estúdio de Interação</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  Etapa {step} de 6
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere prompts fotorealistas e ultra-consistentes onde seu personagem segura e utiliza o produto de forma natural.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-6 border-b border-slate-800 text-[11px] font-semibold bg-slate-950 shrink-0">
          {[
            { s: 1, label: '1. Produto' },
            { s: 2, label: '2. Foto Ref.' },
            { s: 3, label: '3. Personagem' },
            { s: 4, label: '4. Cenário' },
            { s: 5, label: '5. Interação' },
            { s: 6, label: '6. Prompt' },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => item.s <= step && setStep(item.s)}
              disabled={item.s > step && !generatedPrompt}
              className={`py-2.5 text-center border-b-2 transition-all ${
                step === item.s
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : item.s < step
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-600 cursor-not-allowed'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Wizard Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: SELECT PRODUCT */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Passo 1: Selecione o Produto que o personagem irá interagir</span>
              </h3>

              {products.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum produto cadastrado. Cadastre um produto na aba Produtos.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((p) => {
                    const isSelected = selectedProductId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/20'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.mainImageUrl ? (
                              <img src={p.mainImageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                            <p className="text-[10px] text-emerald-400 font-semibold">{p.category}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400 font-bold justify-end">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selecionado</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT PRODUCT IMAGE */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Passo 2: Confirme a Foto de Referência do Produto ({currentProduct?.name})</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <p className="text-xs text-slate-300">
                  A imagem fornece textura, proporção física e acabamentos exatos do produto para a física de vídeo.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {mediaList
                    .filter((m) => m.type !== 'VIDEO')
                    .map((media) => {
                      const isChosen = (selectedProductImageUrl || currentProduct?.mainImageUrl) === media.relativeUrl;
                      return (
                        <div
                          key={media.id}
                          onClick={() => setSelectedProductImageUrl(media.relativeUrl)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                            isChosen ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img src={media.relativeUrl} alt={media.name} className="w-full h-full object-cover" />
                          {isChosen && (
                            <div className="absolute inset-0 bg-cyan-950/60 flex items-center justify-center text-cyan-300">
                              <Check className="w-5 h-5 font-bold" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT CHARACTER */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Passo 3: Selecione o Personagem que irá apresentar o produto</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {characters.map((c) => {
                  const isSelected = selectedCharacterId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCharacterId(c.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/20 ring-2 ring-purple-500/20'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {c.referenceImageUrl ? (
                            <img src={c.referenceImageUrl} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCheck className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{c.name}</h4>
                          <p className="text-[10px] text-purple-300 font-semibold">{c.stylePreset}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{c.clothing}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-[10px] text-purple-400 font-bold justify-end">
                          <Check className="w-3.5 h-3.5" />
                          <span>Selecionado</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: DEFINE SCENARIO & LIGHTING */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Passo 4: Defina o Cenário, Enquadramento e Iluminação</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Cenário / Ambiente da Cena</label>
                  <input
                    type="text"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Ex: Sala de estar moderna e aconchegante com janela iluminada"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Enquadramento</label>
                    <select
                      value={framing}
                      onChange={(e) => setFraming(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="medium_shot">Plano Médio (Cintura para Cima)</option>
                      <option value="close_up">Close-Up (Mãos e Produto)</option>
                      <option value="cowboy_shot">Plano Americano (3/4)</option>
                      <option value="macro_detail">Macro Detalhe (Grip nos dedos)</option>
                      <option value="wide_shot">Plano Aberto no Ambiente</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Movimento de Câmera</label>
                    <select
                      value={cameraMovement}
                      onChange={(e) => setCameraMovement(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="dolly_in">Dolly In Suave (Aproximação)</option>
                      <option value="orbit_360">Órbita Semi-Circular 180º</option>
                      <option value="handheld_organic">Handheld Orgânico Smartphone</option>
                      <option value="smooth_pan">Pan Lateral Suave</option>
                      <option value="static">Câmera Fixa em Tripé</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Estilo de Iluminação</label>
                    <select
                      value={lighting}
                      onChange={(e) => setLighting(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="studio_clean">Estúdio Comercial Limpo</option>
                      <option value="golden_hour">Golden Hour (Luz Dourada de Pôr do Sol)</option>
                      <option value="natural_window">Luz Natural Difusa de Janela</option>
                      <option value="neon_accent">Neon Comercial Moderno</option>
                      <option value="dramatic_chiaroscuro">Cinematográfico Alto Contraste</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DEFINE ACTION & INTERACTION */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Hand className="w-4 h-4 text-emerald-400" />
                <span>Passo 5: Como as Mãos do Personagem Interagem com o Produto</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Ação Detalhada (Aderência, pegada e manipulação dos dedos)
                  </label>
                  <textarea
                    rows={3}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="Ex: Segura firmemente o frasco com a mão esquerda e com a mão direita pressiona suavemente a válvula, demonstrando o produto com um sorriso encantado..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Expressão Facial do Personagem</label>
                  <select
                    value={expression}
                    onChange={(e) => setExpression(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="enthusiastic">Entusiasmada e Sorridente (Encantamento)</option>
                    <option value="amazed">Impressionada / Surpresa Positiva</option>
                    <option value="confident">Confiante, Segura e Convincente</option>
                    <option value="relieved">Aliviada (Solução Imediata do Problema)</option>
                    <option value="focused">Focada e Técnica na Aplicação</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: GENERATED PROMPT PREVIEW */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Prompt Estruturado de Alta Fidelidade Gerado!</span>
                </h3>

                <button
                  type="button"
                  onClick={copyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Copiado!' : 'Copiar Prompt'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-800/60 space-y-3">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                  Prompt Pronto para o Google Veo 3.1
                </span>
                <p className="text-xs text-slate-200 font-mono leading-relaxed select-all">{generatedPrompt}</p>
              </div>

              {generatedNegativePrompt && (
                <div className="p-3 rounded-xl bg-slate-950 border border-rose-950/80 space-y-1">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                    Negative Constraints Injetadas
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono">{generatedNegativePrompt}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 5 && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={handleGeneratePrompt}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isGenerating ? 'Sintetizando Prompt...' : 'Gerar Prompt Estruturado'}</span>
              </button>
            )}

            {step === 6 && (
              <button
                type="button"
                onClick={handleSendToQueue}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Gerar Vídeo Agora (Fila)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
