import React from 'react';
import {
  Home,
  Film,
  BrainCircuit,
  Layers,
  FolderKanban,
  BarChart3,
  Settings,
  Sparkles,
  BookOpen,
  HelpCircle,
  Package,
  UserCheck,
  Wand2,
  HardDrive,
  Scissors,
  Zap,
  ShoppingBag,
  Radio,
  Store,
  Copy,
  Target,
  Sliders,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'campaign_orchestrator'
  | 'video_copier'
  | 'tiktok_factory'
  | 'live_factory'
  | 'tiktok_shop'
  | 'media'
  | 'video_joiner'
  | 'video_multiplier'
  | 'products'
  | 'characters'
  | 'prompt_studio'
  | 'campaign'
  | 'methods'
  | 'queue'
  | 'library'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  queueCount: number;
  libraryCount: number;
  onOpenBible: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  queueCount,
  libraryCount,
  onOpenBible,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: Home,
      badge: null,
    },
    {
      id: 'campaign_orchestrator' as NavTab,
      label: 'Orquestrador de Campanhas',
      icon: Target,
      badge: 'Fase 5',
      badgeColor: 'bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-300 border-emerald-700',
    },
    {
      id: 'video_copier' as NavTab,
      label: 'Video Copier PRO',
      icon: Copy,
      badge: 'Fase 4',
      badgeColor: 'bg-gradient-to-r from-indigo-950 to-purple-950 text-indigo-300 border-indigo-750',
    },
    {
      id: 'tiktok_factory' as NavTab,
      label: 'TikTok Sales Factory',
      icon: ShoppingBag,
      badge: 'Fase 3',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    },
    {
      id: 'live_factory' as NavTab,
      label: 'Live Sales Factory',
      icon: Radio,
      badge: 'Live',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    },
    {
      id: 'tiktok_shop' as NavTab,
      label: 'TikTok Shop Center',
      icon: Store,
      badge: 'Oficial',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    },
    {
      id: 'media' as NavTab,
      label: 'Central de Mídia',
      icon: HardDrive,
      badge: 'Local',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      id: 'video_joiner' as NavTab,
      label: 'Juntador de Vídeos',
      icon: Scissors,
      badge: 'Pro',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'video_multiplier' as NavTab,
      label: 'Multiplicador de Vídeos',
      icon: Zap,
      badge: 'Até 75x',
      badgeColor: 'bg-gradient-to-r from-amber-950 to-orange-950 text-amber-300 border-amber-800',
    },
    {
      id: 'products' as NavTab,
      label: 'Produtos',
      icon: Package,
      badge: null,
    },
    {
      id: 'characters' as NavTab,
      label: 'Personagens',
      icon: UserCheck,
      badge: 'Avatares',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      id: 'prompt_studio' as NavTab,
      label: 'Prompt Studio PRO',
      icon: Wand2,
      badge: 'PRO',
      badgeColor: 'bg-gradient-to-r from-cyan-950 to-indigo-950 text-cyan-200 border-cyan-700',
    },
    {
      id: 'campaign' as NavTab,
      label: 'Criar Campanha',
      icon: Film,
      badge: '75 Vídeos',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    },
    {
      id: 'methods' as NavTab,
      label: 'Métodos de Venda',
      icon: BrainCircuit,
      badge: '16 Métodos',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      id: 'queue' as NavTab,
      label: 'Fila de Geração',
      icon: Layers,
      badge: queueCount > 0 ? String(queueCount) : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'library' as NavTab,
      label: 'Biblioteca',
      icon: FolderKanban,
      badge: libraryCount > 0 ? String(libraryCount) : null,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Configurações',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Navegação Principal
          </p>
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/50 text-white border border-cyan-700/50 shadow-sm shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-cyan-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Project Bible Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-indigo-950/30 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <span>Project Bible</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-950/60 border border-pink-800/40 text-pink-300 font-medium">
              Consistência
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Mantenha cores, materiais, logo e regras em todos os prompts automaticamente.
          </p>
          <button
            id="btn-sidebar-open-bible"
            onClick={onOpenBible}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700/80"
          >
            Editar Project Bible
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Veo Auto Studio v1.0</span>
          <span>Google Veo Official</span>
        </div>
        <div className="text-[10px] text-slate-600 leading-tight">
          Arquitetura Desktop Segura • IPC Local
        </div>
      </div>
    </aside>
  );
};
