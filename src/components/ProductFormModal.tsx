import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Check,
  X,
  Upload,
  Layers,
  Sparkles,
  HelpCircle,
  DollarSign,
  Tag,
  ShieldCheck,
  Target,
  FileText,
} from 'lucide-react';
import { MediaAsset, Product } from '../types';

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  mediaList: MediaAsset[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  mediaList,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('BRL');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [cta, setCta] = useState('Garanta com 50% de Desconto');
  const [mainImageUrl, setMainImageUrl] = useState('');

  // Dynamic Lists
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');

  const [differentials, setDifferentials] = useState<string[]>([]);
  const [newDiff, setNewDiff] = useState('');

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const [pains, setPains] = useState<string[]>([]);
  const [newPain, setNewPain] = useState('');

  const [desires, setDesires] = useState<string[]>([]);
  const [newDesire, setNewDesire] = useState('');

  const [objections, setObjections] = useState<string[]>([]);
  const [newObjection, setNewObjection] = useState('');

  const [salesArguments, setSalesArguments] = useState<string[]>([]);
  const [newArg, setNewArg] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'benefits' | 'psychology' | 'media'>('basic');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setPrice(product.price);
      setCurrency(product.currency || 'BRL');
      setDescription(product.description || '');
      setMaterials(product.materials || '');
      setDimensions(product.dimensions || '');
      setTargetAudience(product.targetAudience || '');
      setCta(product.cta || 'Garanta com Desconto');
      setMainImageUrl(product.mainImageUrl || '');
      setBenefits(product.benefits || []);
      setDifferentials(product.differentials || []);
      setFeatures(product.features || []);
      setPains(product.pains || []);
      setDesires(product.desires || []);
      setObjections(product.objections || []);
      setSalesArguments(product.salesArguments || []);
    } else {
      setName('');
      setCategory('Beleza & Cuidados');
      setPrice(147);
      setCurrency('BRL');
      setDescription('');
      setMaterials('');
      setDimensions('');
      setTargetAudience('Homens e mulheres de 25 a 55 anos buscando resultados rápidos');
      setCta('Clique no Link e Garanta com Frete Grátis');
      setMainImageUrl('');
      setBenefits(['Resultados visíveis nos primeiros dias de uso', 'Fórmula de rápida absorção']);
      setDifferentials(['Tecnologia patenteada exclusiva', 'Não deixa resíduos oleosos']);
      setFeatures(['Design ergonômico', 'Embalagem premium airless']);
      setPains(['Frustração com métodos tradicionais lentos', 'Medo de gastar e não funcionar']);
      setDesires(['Praticidade no dia a dia', 'Aparência renovada e confiança']);
      setObjections(['Será que funciona mesmo para mim?', 'O envio é rápido e seguro?']);
      setSalesArguments(['Garantia incondicional de 30 dias', 'Mais de 10.000 clientes satisfeitos']);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string, setVal: React.Dispatch<React.SetStateAction<string>>) => {
    if (!val.trim()) return;
    setList([...list, val.trim()]);
    setVal('');
  };

  const handleRemoveTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Preencha o nome do produto.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: product?.id,
        name,
        category,
        price,
        currency,
        description,
        materials,
        dimensions,
        targetAudience,
        cta,
        mainImageUrl,
        benefits,
        differentials,
        features,
        pains,
        desires,
        objections,
        salesArguments,
      });
      onClose();
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {product ? `Editar Produto: ${product.name}` : 'Cadastrar Novo Produto Estruturado'}
              </h2>
              <p className="text-xs text-slate-400">
                Alimente o Veo Auto Studio com os benefícios, diferenciais e dores para gerar prompts de máxima conversão.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950 shrink-0">
          {[
            { id: 'basic', label: '1. Dados Básicos & Preço', icon: Tag },
            { id: 'benefits', label: '2. Benefícios & Diferenciais', icon: Sparkles },
            { id: 'psychology', label: '3. Dores, Desejos & ICP', icon: Target },
            { id: 'media', label: '4. Foto & Referências', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: BASIC */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    Nome Comercial do Produto *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sérum Revitalizante Diamond Glow"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Categoria de Nicho</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Skincare, Gadgets, Moda, etc."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Preço Sugerido (R$)</label>
                  <input
                    type="number"
                    value={price ?? ''}
                    onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Ex: 197.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Materiais / Acabamento</label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="Ex: Vidro fosco, pump dourado, alumínio escovado"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Dimensões / Formato</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="Ex: Frasco de 50ml, portátil"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Descrição Completa do Produto</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que o produto é, como ele age e qual a promessa principal entregue ao cliente..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Chamada para Ação Padrão (CTA)</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Ex: Clique no link da bio e garanta o seu com 40% OFF"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: BENEFITS & FEATURES */}
          {activeTab === 'benefits' && (
            <div className="space-y-6 animate-fade-in">
              {/* Benefits */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Principais Benefícios (O que o cliente ganha)</span>
                  <span className="text-[11px] text-slate-500">{benefits.length} adicionados</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(benefits, setBenefits, newBenefit, setNewBenefit))}
                    placeholder="Ex: Hidratação profunda 24h sem oleosidade"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(benefits, setBenefits, newBenefit, setNewBenefit)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {benefits.map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                      {b}
                      <button type="button" onClick={() => handleRemoveTag(benefits, setBenefits, i)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Differentials */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Diferenciais Competitivos (Por que é superior aos concorrentes)</span>
                  <span className="text-[11px] text-slate-500">{differentials.length} adicionados</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDiff}
                    onChange={(e) => setNewDiff(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(differentials, setDifferentials, newDiff, setNewDiff))}
                    placeholder="Ex: Nanotecnologia com partículas 10x menores"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(differentials, setDifferentials, newDiff, setNewDiff)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {differentials.map((d, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs">
                      {d}
                      <button type="button" onClick={() => handleRemoveTag(differentials, setDifferentials, i)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Características Técnicas / Funcionalidades</span>
                  <span className="text-[11px] text-slate-500">{features.length} adicionados</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(features, setFeatures, newFeature, setNewFeature))}
                    placeholder="Ex: Frasco airless resistente a quedas com trava"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(features, setFeatures, newFeature, setNewFeature)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                      {f}
                      <button type="button" onClick={() => handleRemoveTag(features, setFeatures, i)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PSYCHOLOGY & TARGET */}
          {activeTab === 'psychology' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Público-Alvo Ideal (ICP)</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Mulheres de 25 a 45 anos com rotina agitada que sofrem com manchas e linhas finas"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Dores */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-rose-300 flex items-center justify-between">
                  <span>Dores do Cliente (Problemas que tiram o sono)</span>
                  <span className="text-[11px] text-slate-500">{pains.length} adicionados</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPain}
                    onChange={(e) => setNewPain(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(pains, setPains, newPain, setNewPain))}
                    placeholder="Ex: Vergonha de tirar fotos sem maquiagem"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(pains, setPains, newPain, setNewPain)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pains.map((p, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/50 border border-rose-900/80 text-rose-300 text-xs">
                      {p}
                      <button type="button" onClick={() => handleRemoveTag(pains, setPains, i)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Desejos */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                  <span>Desejos do Cliente (O que ele sonha em conquistar)</span>
                  <span className="text-[11px] text-slate-500">{desires.length} adicionados</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDesire}
                    onChange={(e) => setNewDesire(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(desires, setDesires, newDesire, setNewDesire))}
                    placeholder="Ex: Elogios no trabalho e pele uniforme radiante"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(desires, setDesires, newDesire, setNewDesire)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {desires.map((d, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-900/80 text-indigo-300 text-xs">
                      {d}
                      <button type="button" onClick={() => handleRemoveTag(desires, setDesires, i)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Argumentos de Venda */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                  <span>Argumentos de Venda & Quebra de Objeções</span>
                  <span className="text-[11px] text-slate-500">{salesArguments.length} adicionados</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newArg}
                    onChange={(e) => setNewArg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(salesArguments, setSalesArguments, newArg, setNewArg))}
                    placeholder="Ex: Testado e aprovado dermatologicamente pela Anvisa"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(salesArguments, setSalesArguments, newArg, setNewArg)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {salesArguments.map((a, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-900/80 text-amber-300 text-xs">
                      {a}
                      <button type="button" onClick={() => handleRemoveTag(salesArguments, setSalesArguments, i)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Foto Principal do Produto (Selecione da Central de Mídia ou insira URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mainImageUrl}
                    onChange={(e) => setMainImageUrl(e.target.value)}
                    placeholder="URL ou selecione abaixo..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {mainImageUrl && (
                    <button
                      type="button"
                      onClick={() => setMainImageUrl('')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Preview or Selector from Media Center */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400">Escolha uma foto da Central de Mídia:</p>
                {mediaList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Nenhuma mídia encontrada na Central de Mídia. Você pode importar arquivos na aba Central de Mídia.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {mediaList
                      .filter((m) => m.type !== 'VIDEO')
                      .map((media) => {
                        const isChosen = mainImageUrl === media.relativeUrl;
                        return (
                          <div
                            key={media.id}
                            onClick={() => setMainImageUrl(media.relativeUrl)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isChosen ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <img src={media.relativeUrl} alt={media.name} className="w-full h-full object-cover" />
                            {isChosen && (
                              <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center text-emerald-400">
                                <Check className="w-5 h-5 font-bold" />
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

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'benefits') setActiveTab('basic');
                    if (activeTab === 'psychology') setActiveTab('benefits');
                    if (activeTab === 'media') setActiveTab('psychology');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Voltar
                </button>
              )}
              {activeTab !== 'media' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basic') setActiveTab('benefits');
                    if (activeTab === 'benefits') setActiveTab('psychology');
                    if (activeTab === 'psychology') setActiveTab('media');
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
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Produto'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
