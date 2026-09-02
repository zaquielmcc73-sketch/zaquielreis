import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Video,
  UserCheck,
  Search,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MediaAsset, Product } from '../types';
import { ProductFormModal } from './ProductFormModal';

interface ProductsViewProps {
  onSelectProductForCampaign?: (product: Product) => void;
  onSelectProductForPromptStudio?: (product: Product) => void;
  onOpenCharacterWithProduct?: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onSelectProductForCampaign,
  onSelectProductForPromptStudio,
  onOpenCharacterWithProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (Array.isArray(data)) setMediaList(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchMedia();
  }, []);

  const handleSaveProduct = async (prodData: Partial<Product>) => {
    const isEdit = !!prodData.id;
    const url = isEdit ? `/api/products/${prodData.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao salvar produto');
    }

    fetchProducts();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert('Erro ao excluir produto.');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Catálogo de Produtos</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
              {products.length} Produtos Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre os produtos com benefícios, diferenciais, dores e objeções para gerar criativos e campanhas de alta conversão.
          </p>
        </div>

        <button
          id="btn-new-product"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, nicho ou benefício..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-500 text-xs">Carregando catálogo de produtos...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Nenhum produto cadastrado</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Adicione seu primeiro produto para começar a gerar vídeos comerciais com roteiros e prompts inteligentes.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
          >
            Cadastrar Produto Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="group flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-700/60 hover:bg-slate-900 transition-all overflow-hidden shadow-sm"
              >
                {/* Card Top: Image & Price */}
                <div className="relative h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/60">
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-emerald-400 transition-colors">
                      <Package className="w-10 h-10" />
                      <span className="text-[10px] mt-1 font-mono uppercase tracking-wider">Sem Imagem</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 text-[10px] font-bold text-emerald-300">
                    {product.category || 'Geral'}
                  </div>

                  {/* Price Tag */}
                  {product.price && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-700 text-xs font-bold text-white shadow-md">
                      R$ {product.price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description || 'Produto estruturado para campanhas de vídeo de alta conversão.'}
                    </p>

                    {/* Benefits preview */}
                    {product.benefits && product.benefits.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                          Benefícios Principais
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {product.benefits.slice(0, 2).map((b, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-emerald-950 line-clamp-1"
                            >
                              ✓ {b}
                            </span>
                          ))}
                          {product.benefits.length > 2 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{product.benefits.length - 2} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/60 space-y-2">
                    {/* Quick Studio & Campaign Triggers */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectProductForPromptStudio?.(product)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 text-cyan-300 text-xs font-semibold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Prompt Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCharacterWithProduct?.(product.id)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/80 text-purple-300 text-xs font-semibold transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Com Personagem</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectProductForCampaign?.(product)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <span>Criar Campanha</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        mediaList={mediaList}
      />
    </div>
  );
};
