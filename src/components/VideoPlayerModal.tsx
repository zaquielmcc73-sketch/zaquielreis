import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCw,
  Copy,
  Check,
  Folder,
  ExternalLink,
  Film,
  Sparkles,
} from 'lucide-react';
import { SavedVideoItem } from '../types';

interface VideoPlayerModalProps {
  video: SavedVideoItem | null;
  onClose: () => void;
  onRemix: (video: SavedVideoItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onRemix,
}) => {
  if (!video) return null;

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(video.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleOpenFolder = () => {
    if (window.electronAPI?.showItemInFolder && video.localPath) {
      window.electronAPI.showItemInFolder(video.localPath);
    } else {
      navigator.clipboard.writeText(video.localPath || '');
      alert(`Caminho copiado:\n${video.localPath}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Video Player Box */}
        <div className="w-full md:w-1/2 bg-slate-950 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800">
          <div
            className={`w-full max-w-[280px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl relative ${
              video.aspectRatio === '16:9'
                ? 'aspect-video'
                : video.aspectRatio === '1:1'
                ? 'aspect-square'
                : 'aspect-[9/16]'
            }`}
          >
            <video
              src={video.videoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-cover"
              poster=""
            >
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>

          <div className="mt-4 flex items-center justify-between w-full max-w-[280px] text-xs text-slate-400">
            <span className="font-semibold">{video.aspectRatio}</span>
            <span>{video.model}</span>
          </div>
        </div>

        {/* Right: Info, Prompt & Storyboard */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[85vh] space-y-5 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                {video.methodName || video.method}
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                ID: {video.id}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white leading-snug">
              "{video.hook}"
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Campanha: {video.campaignName}
            </p>
          </div>

          {/* Prompt Inspector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Prompt Oficial Veo Injetado
              </label>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-[11px]"
              >
                {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-slate-300 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto">
              {video.prompt}
            </div>
          </div>

          {/* Local Path */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Arquivo Local no Disco
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={video.localPath || 'Caminho local padrão'}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px] font-mono select-all"
              />
              <button
                onClick={handleOpenFolder}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Abrir no Windows Explorer"
              >
                <Folder className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                onRemix(video);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Remixar este Vídeo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
