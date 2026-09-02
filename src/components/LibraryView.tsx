import React, { useState } from 'react';
import {
  FolderKanban,
  Play,
  Copy,
  RotateCw,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Check,
  Film,
  Sparkles,
  Video,
} from 'lucide-react';
import { SavedVideoItem } from '../types';

interface LibraryViewProps {
  library: SavedVideoItem[];
  onPlayVideo: (video: SavedVideoItem) => void;
  onRemixVideo: (video: SavedVideoItem) => void;
  onDeleteVideo: (id: string) => void;
  onOpenFolder?: (path: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  library,
  onPlayVideo,
  onRemixVideo,
  onDeleteVideo,
  onOpenFolder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const methodsList = Array.from(new Set(library.map((v) => v.methodName || v.method)));

  const filtered = library.filter((item) => {
    const matchSearch =
      item.hook.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchMethod =
      selectedMethodFilter === 'all' ||
      item.method === selectedMethodFilter ||
      item.methodName === selectedMethodFilter;

    return matchSearch && matchMethod;
  });

  const handleCopyPrompt = (item: SavedVideoItem) => {
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenLocalFolder = (item: SavedVideoItem) => {
    if (window.electronAPI?.showItemInFolder && item.localPath) {
      window.electronAPI.showItemInFolder(item.localPath);
    } else if (onOpenFolder && item.localPath) {
      onOpenFolder(item.localPath);
    } else {
      navigator.clipboard.writeText(item.localPath || '');
      alert(`Caminho copiado para a área de transferência:\n${item.localPath}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Repositório de Criativos Gerados</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Biblioteca de Vídeos de Vendas
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie, assista, reproduza, remix e exporte todos os criativos de alta conversão.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por gancho, produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Method Filter */}
          <select
            value={selectedMethodFilter}
            onChange={(e) => setSelectedMethodFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Todos os Métodos ({library.length})</option>
            {methodsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-base font-bold text-slate-300">Nenhum vídeo encontrado</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gere novos vídeos pela aba "Criar Campanha" ou limpe os filtros de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              id={`video-card-${item.id}`}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              {/* Thumbnail / Video Preview Box */}
              <div
                onClick={() => onPlayVideo(item)}
                className="relative aspect-[9/14] bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden group/thumb"
              >
                {/* Visual gradient backdrop */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                {/* Animated abstract or play trigger */}
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 group-hover/thumb:bg-cyan-500 border border-cyan-400/40 text-cyan-300 group-hover/thumb:text-slate-950 flex items-center justify-center transition-all shadow-xl z-20 group-hover/thumb:scale-110">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-cyan-300 backdrop-blur-md">
                    #{String(item.number).padStart(3, '0')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/90 border border-purple-800 text-purple-300 backdrop-blur-md">
                    {item.methodName || item.method}
                  </span>
                </div>

                {/* Bottom Aspect/Resolution tag */}
                <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold">{item.aspectRatio}</span>
                  <span>{item.model?.replace('-generate-preview', '')}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    "{item.hook}"
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.scriptSummary?.action || item.prompt}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {/* Play */}
                    <button
                      onClick={() => onPlayVideo(item)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Assistir</span>
                    </button>

                    {/* Remix */}
                    <button
                      onClick={() => onRemixVideo(item)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-semibold transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Remixar</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-slate-400 text-xs pt-1">
                    {/* Copy prompt */}
                    <button
                      onClick={() => handleCopyPrompt(item)}
                      className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                      title="Copiar prompt exato do Veo"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Prompt</span>
                        </>
                      )}
                    </button>

                    {/* Open folder */}
                    <button
                      onClick={() => handleOpenLocalFolder(item)}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      title="Abrir pasta local no Windows Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Pasta</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteVideo(item.id)}
                      className="p-1 rounded hover:text-rose-400 transition-colors"
                      title="Excluir da biblioteca"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
