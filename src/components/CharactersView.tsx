import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Package,
  Search,
  Wand2,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Character, MediaAsset } from '../types';
import { CharacterFormModal } from './CharacterFormModal';

interface CharactersViewProps {
  onSelectCharacterForPromptStudio?: (character: Character) => void;
  onOpenCharacterWithProduct?: (characterId: string) => void;
}

export const CharactersView: React.FC<CharactersViewProps> = ({
  onSelectCharacterForPromptStudio,
  onOpenCharacterWithProduct,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const fetchCharacters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/characters');
      const data = await res.json();
      if (Array.isArray(data)) setCharacters(data);
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
    fetchCharacters();
    fetchMedia();
  }, []);

  const handleSaveCharacter = async (charData: Partial<Character>) => {
    const isEdit = !!charData.id;
    const url = isEdit ? `/api/characters/${charData.id}` : '/api/characters';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao salvar personagem');
    }

    fetchCharacters();
  };

  const handleDeleteCharacter = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o personagem "${name}"?`)) return;
    try {
      await fetch(`/api/characters/${id}`, { method: 'DELETE' });
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert('Erro ao excluir personagem.');
    }
  };

  const filtered = characters.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.personality.toLowerCase().includes(q) ||
      c.appearance.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-700/60 flex items-center justify-center text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Personagens & Criadores</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-medium">
              {characters.length} Personagens
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Defina atores, criadores UGC e avatares consistentes para aparecerem interagindo com produtos em múltiplos vídeos.
          </p>
        </div>

        <button
          id="btn-new-character"
          onClick={() => {
            setEditingCharacter(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Personagem</span>
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
            placeholder="Buscar por nome, características ou estilo..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Characters Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-500 text-xs">Carregando personagens...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Nenhum personagem cadastrado</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Crie personagens com consistência de rosto, roupa e traços para utilizá-los em vídeos de demonstração de produto e depoimentos UGC.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCharacter(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors"
          >
            Criar Primeiro Personagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((char) => {
            return (
              <div
                key={char.id}
                id={`character-card-${char.id}`}
                className="group flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-700/60 hover:bg-slate-900 transition-all overflow-hidden shadow-sm"
              >
                {/* Card Top: Photo & Badges */}
                <div className="relative h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/60">
                  {char.referenceImageUrl ? (
                    <img
                      src={char.referenceImageUrl}
                      alt={char.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-purple-400 transition-colors">
                      <UserCheck className="w-10 h-10" />
                      <span className="text-[10px] mt-1 font-mono uppercase tracking-wider">Avatar Conceitual</span>
                    </div>
                  )}

                  {/* Preset Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-sm border border-slate-700/80 text-[10px] font-bold text-purple-300">
                    {char.stylePreset || 'UGC Creator'}
                  </div>

                  {/* Age Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-800 text-[10px] font-bold text-white">
                    {char.ageGroup !== 'custom' ? `${char.ageGroup} anos` : char.customAge || 'Adulto'}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white line-clamp-1" title={char.name}>
                        {char.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {char.appearance}
                    </p>

                    <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">Figurino:</span>
                        <span className="text-slate-300 truncate">{char.clothing || 'Casual'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">Personalidade:</span>
                        <span className="text-slate-300 truncate">{char.personality || 'Espontânea'}</span>
                      </div>
                    </div>

                    {/* Consistency Prompt Preview */}
                    {char.consistencyPrompt && (
                      <div className="pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1 text-[10px] text-purple-400 font-semibold mb-1">
                          <Wand2 className="w-3 h-3" />
                          <span>Regras de Consistência Ativas</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/60 line-clamp-2">
                          {char.consistencyPrompt}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectCharacterForPromptStudio?.(char)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 text-cyan-300 text-xs font-semibold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Prompt Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCharacterWithProduct?.(char.id)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/80 text-purple-300 text-xs font-semibold transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Com Produto</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCharacter(char);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCharacter(char.id, char.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Form Modal */}
      <CharacterFormModal
        isOpen={isModalOpen}
        character={editingCharacter}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCharacter(null);
        }}
        onSave={handleSaveCharacter}
        mediaList={mediaList}
      />
    </div>
  );
};
