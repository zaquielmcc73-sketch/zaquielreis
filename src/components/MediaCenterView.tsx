import React, { useState, useEffect, useRef } from 'react';
import {
  FolderKanban,
  Upload,
  Image as ImageIcon,
  Film,
  Package,
  UserCheck,
  Tag,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Edit2,
  Plus,
  Info,
  Check,
  X,
  FileText,
  Copy,
  Layers,
} from 'lucide-react';
import { MediaAsset, MediaType, Product } from '../types';

interface MediaCenterViewProps {
  onSelectMediaForProduct?: (media: MediaAsset) => void;
  onSelectMediaForCharacter?: (media: MediaAsset) => void;
}

export const MediaCenterView: React.FC<MediaCenterViewProps> = ({
  onSelectMediaForProduct,
  onSelectMediaForCharacter,
}) => {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Form State
  const [uploadName, setUploadName] = useState<string>('');
  const [uploadType, setUploadType] = useState<MediaType>('IMAGE');
  const [uploadTags, setUploadTags] = useState<string>('');
  const [uploadProductId, setUploadProductId] = useState<string>('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [uploadOriginalName, setUploadOriginalName] = useState<string>('');
  const [uploadMimeType, setUploadMimeType] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/media', window.location.origin);
      if (selectedType !== 'ALL') url.searchParams.set('type', selectedType);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) {
        setMediaList(data);
      }
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchMedia();
    fetchProducts();
  }, [selectedType, searchQuery]);

  const handleFileSelected = (file: File) => {
    setUploadOriginalName(file.name);
    setUploadMimeType(file.type);
    if (!uploadName) {
      setUploadName(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.type.startsWith('video/')) {
      setUploadType('VIDEO');
    } else if (file.type.startsWith('image/')) {
      setUploadType('IMAGE');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) {
      alert('Selecione um arquivo de imagem ou vídeo.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName || uploadOriginalName,
          type: uploadType,
          originalFileName: uploadOriginalName,
          base64Data: previewDataUrl,
          mimeType: uploadMimeType,
          tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
          productId: uploadProductId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsUploadModalOpen(false);
        resetUploadForm();
        fetchMedia();
      } else {
        alert(data.error || 'Erro ao fazer upload da mídia.');
      }
    } catch (err) {
      console.error(err);
      alert('Falha ao enviar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadName('');
    setUploadType('IMAGE');
    setUploadTags('');
    setUploadProductId('');
    setPreviewDataUrl(null);
    setUploadOriginalName('');
    setUploadMimeType('image/jpeg');
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir a mídia "${name}"?`)) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      if (selectedMedia?.id === id) setSelectedMedia(null);
    } catch (e) {
      alert('Erro ao excluir mídia.');
    }
  };

  const handleOpenInExplorer = async (media: MediaAsset) => {
    try {
      if (window.electronAPI?.showItemInFolder) {
        await window.electronAPI.showItemInFolder(media.filePath);
      } else {
        await fetch('/api/media/open-explorer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: media.id, filePath: media.filePath }),
        });
      }
    } catch (e) {
      alert('Não foi possível abrir o arquivo no Explorer.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;
    try {
      const res = await fetch(`/api/media/${editingMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMedia),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingMedia(null);
        fetchMedia();
      }
    } catch (e) {
      alert('Erro ao salvar alterações.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'VIDEO':
        return <Film className="w-3.5 h-3.5 text-purple-400" />;
      case 'PRODUCT':
        return <Package className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CHARACTER_REFERENCE':
        return <UserCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'LOGO':
        return <Tag className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <FolderKanban className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Central de Mídia</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
              {mediaList.length} Arquivos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize fotos de produtos, referências de personagens, vídeos e logos locais para uso em prompts e campanhas.
          </p>
        </div>

        <button
          id="btn-open-upload-modal"
          onClick={() => {
            resetUploadForm();
            setIsUploadModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Importar Mídia Local</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'IMAGE', label: 'Imagens' },
            { id: 'VIDEO', label: 'Vídeos' },
            { id: 'PRODUCT', label: 'Produtos' },
            { id: 'CHARACTER_REFERENCE', label: 'Personagens' },
            { id: 'LOGO', label: 'Logos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedType === tab.id
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou tag..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-500 text-xs">Carregando mídias locais...</div>
      ) : mediaList.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Nenhuma mídia encontrada</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Importe fotos de produtos, referências visuais de personagens ou logos para enriquecer a geração de prompts e vídeos.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            Importar Primeiro Arquivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {mediaList.map((media) => {
            const isSelected = selectedMedia?.id === media.id;
            return (
              <div
                key={media.id}
                id={`media-card-${media.id}`}
                onClick={() => setSelectedMedia(media)}
                className={`group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/80 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-950/40'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {media.type === 'VIDEO' ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors">
                      <Film className="w-8 h-8" />
                      <span className="text-[10px] mt-1 font-mono uppercase">VÍDEO</span>
                    </div>
                  ) : (
                    <img
                      src={media.relativeUrl}
                      alt={media.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 text-[10px] font-semibold text-slate-300">
                    {getTypeIcon(media.type)}
                    <span className="text-[9px] uppercase tracking-wider">{media.type.slice(0, 4)}</span>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/90 rounded-lg p-1 border border-slate-800">
                    <button
                      type="button"
                      title="Abrir no Explorer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInExplorer(media);
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMedia(media);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(media.id, media.name);
                      }}
                      className="p-1 hover:bg-rose-950/80 rounded text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-2.5 space-y-1">
                  <p className="text-xs font-semibold text-slate-200 truncate" title={media.name}>
                    {media.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{formatBytes(media.sizeBytes)}</span>
                    <span className="text-[9px] text-slate-600">
                      {new Date(media.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Media Drawer / Info Panel */}
      {selectedMedia && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-800/60 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                {selectedMedia.type === 'VIDEO' ? (
                  <Film className="w-6 h-6 text-purple-400" />
                ) : (
                  <img src={selectedMedia.relativeUrl} alt={selectedMedia.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedMedia.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedMedia.originalFileName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenInExplorer(selectedMedia)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir no Explorer</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(selectedMedia.filePath, selectedMedia.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                {copiedId === selectedMedia.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === selectedMedia.id ? 'Copiado!' : 'Copiar Caminho'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tipo</span>
              <span className="font-semibold text-cyan-300">{selectedMedia.type}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tamanho</span>
              <span className="font-semibold text-slate-200">{formatBytes(selectedMedia.sizeBytes)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Formato / Mime</span>
              <span className="font-semibold text-slate-200 font-mono text-[11px]">{selectedMedia.mimeType}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Local no Disco</span>
              <span className="font-mono text-[10px] text-slate-400 truncate block" title={selectedMedia.filePath}>
                {selectedMedia.filePath}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Importar Mídia para o Projeto</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                />

                {previewDataUrl ? (
                  <div className="space-y-3">
                    {uploadType === 'VIDEO' ? (
                      <div className="w-20 h-20 mx-auto rounded-xl bg-purple-950/40 border border-purple-800 flex items-center justify-center text-purple-400">
                        <Film className="w-8 h-8" />
                      </div>
                    ) : (
                      <img
                        src={previewDataUrl}
                        alt="Preview"
                        className="max-h-36 mx-auto rounded-xl object-contain border border-slate-800 shadow-md"
                      />
                    )}
                    <p className="text-xs text-slate-300 font-medium">{uploadOriginalName}</p>
                    <p className="text-[11px] text-cyan-400 font-semibold">Clique para trocar de arquivo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      Arraste e solte ou clique para selecionar do computador
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Suporta PNG, JPG, WEBP, MP4 (salvo localmente na pasta Media/ do projeto)
                    </p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Nome da Mídia</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Ex: Frasco Sérum Frente"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Categoria de Mídia</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as MediaType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="IMAGE">Foto / Imagem Geral</option>
                    <option value="PRODUCT">Foto do Produto Principal</option>
                    <option value="CHARACTER_REFERENCE">Referência de Personagem</option>
                    <option value="LOGO">Logotipo / Marca</option>
                    <option value="VIDEO">Vídeo de Referência / B-Roll</option>
                    <option value="OTHER">Outros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Vincular a Produto (Opcional)</label>
                <select
                  value={uploadProductId}
                  onChange={(e) => setUploadProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Nenhum produto associado</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="Ex: skincare, embalagem, close-up, dourado"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !previewDataUrl}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar no Disco Local</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Editar Informações da Mídia</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Nome</label>
                <input
                  type="text"
                  value={editingMedia.name}
                  onChange={(e) => setEditingMedia({ ...editingMedia, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Tipo</label>
                <select
                  value={editingMedia.type}
                  onChange={(e) => setEditingMedia({ ...editingMedia, type: e.target.value as MediaType })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="IMAGE">Foto / Imagem Geral</option>
                  <option value="PRODUCT">Foto do Produto Principal</option>
                  <option value="CHARACTER_REFERENCE">Referência de Personagem</option>
                  <option value="LOGO">Logotipo / Marca</option>
                  <option value="VIDEO">Vídeo de Referência / B-Roll</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Vincular a Produto</label>
                <select
                  value={editingMedia.associatedProductId || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, associatedProductId: e.target.value || undefined })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Nenhum produto associado</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
