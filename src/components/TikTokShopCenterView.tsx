import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Video,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Play,
  Layers,
  Award,
  Link,
  Lock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Info,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  Product,
  TikTokAccountInfo,
  TikTokCreative,
  TikTokPublishConfig,
  TikTokShopProduct,
} from '../types';

interface TikTokShopCenterProps {
  products: Product[];
  onNavigateToTab: (tab: string) => void;
  onSelectVideoForJoiner?: (videoUrl: string) => void;
}

export const TikTokShopCenterView: React.FC<TikTokShopCenterProps> = ({
  products,
  onNavigateToTab,
}) => {
  // Navigation Tabs: 'dashboard' | 'products' | 'creatives' | 'account'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'creatives' | 'account'>('dashboard');

  // Account State
  const [account, setAccount] = useState<TikTokAccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(false);

  // TikTok Shop Products State
  const [tikTokProducts, setTikTokProducts] = useState<TikTokShopProduct[]>([]);
  const [isSyncingProducts, setIsSyncingProducts] = useState<boolean>(false);

  // TikTok Creatives State
  const [creatives, setCreatives] = useState<TikTokCreative[]>([]);
  const [isLoadingCreatives, setIsLoadingCreatives] = useState<boolean>(false);

  // Publish Modal State
  const [selectedCreativeForPublish, setSelectedCreativeForPublish] = useState<TikTokCreative | null>(null);
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishCaption, setPublishCaption] = useState<string>('');
  const [publishPrivacy, setPublishPrivacy] = useState<'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'>('PUBLIC_TO_EVERYONE');
  const [allowDuet, setAllowDuet] = useState<boolean>(true);
  const [allowStitch, setAllowStitch] = useState<boolean>(true);
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);

  // Connect Account Form State
  const [clientKey, setClientKey] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [sellerName, setSellerName] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('production');

  // Load Data
  const loadAccountStatus = async () => {
    setIsLoadingAccount(true);
    try {
      const res = await fetch('/api/tiktok-shop/account/status');
      const data = await res.json();
      setAccount(data);
      if (data.sellerName) setSellerName(data.sellerName);
      if (data.shopId) setShopId(data.shopId);
      if (data.environment) setEnvironment(data.environment);
    } catch (e) {
      console.error('Erro ao carregar conta TikTok:', e);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const loadTikTokProducts = async () => {
    try {
      const res = await fetch('/api/tiktok-shop/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTikTokProducts(data);
      }
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    }
  };

  const loadCreatives = async () => {
    setIsLoadingCreatives(true);
    try {
      const res = await fetch('/api/tiktok/creatives');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCreatives(data);
      }
    } catch (e) {
      console.error('Erro ao carregar criativos:', e);
    } finally {
      setIsLoadingCreatives(false);
    }
  };

  useEffect(() => {
    loadAccountStatus();
    loadTikTokProducts();
    loadCreatives();
  }, []);

  // Sync Products Handler
  const handleSyncProducts = async () => {
    setIsSyncingProducts(true);
    try {
      const res = await fetch('/api/tiktok-shop/products/sync', { method: 'POST' });
      const data = await res.json();
      if (data.products) {
        setTikTokProducts(data.products);
        setFeedbackMessage({
          type: data.isOfficialSync ? 'success' : 'info',
          text: data.message || 'Catálogo atualizado.',
        });
        setTimeout(() => setFeedbackMessage(null), 6000);
      }
    } catch (e) {
      console.error('Erro na sincronização:', e);
    } finally {
      setIsSyncingProducts(false);
    }
  };

  // Connect Account Handler
  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tiktok-shop/account/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientKey,
          clientSecret,
          sellerName,
          shopId,
          environment,
        }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        setFeedbackMessage({
          type: data.account.status === 'CONNECTED' ? 'success' : 'info',
          text:
            data.account.status === 'CONNECTED'
              ? 'Conta do TikTok conectada com sucesso!'
              : 'Credenciais salvas com segurança. Para autorização completa, realize o fluxo OAuth 2.0.',
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
      }
    } catch (e) {
      console.error('Erro ao salvar credenciais:', e);
    }
  };

  // Disconnect Account Handler
  const handleDisconnectAccount = async () => {
    try {
      const res = await fetch('/api/tiktok-shop/account/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        setClientKey('');
        setClientSecret('');
        setFeedbackMessage({ type: 'info', text: 'Conta desconectada e credenciais limpas com segurança.' });
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (e) {
      console.error('Erro ao desconectar conta:', e);
    }
  };

  // Delete Creative
  const handleDeleteCreative = async (id: string) => {
    try {
      const res = await fetch(`/api/tiktok/creatives/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCreatives((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error('Erro ao excluir criativo:', e);
    }
  };

  // Enqueue Creative for Rendering
  const handleEnqueueCreative = async (creative: TikTokCreative) => {
    try {
      const res = await fetch('/api/tiktok/creatives/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creativeId: creative.id,
          script: creative.script,
          prompt: creative.prompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadCreatives();
        setFeedbackMessage({ type: 'success', text: `Criativo "${creative.title}" enviado para a fila do Google Veo!` });
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (e) {
      console.error('Erro ao enfileirar criativo:', e);
    }
  };

  // Open Publish Modal
  const handleOpenPublishModal = (creative: TikTokCreative, simulate: boolean = false) => {
    setSelectedCreativeForPublish(creative);
    setIsSimulationMode(simulate);
    setPublishTitle(creative.title);
    setPublishCaption(
      `${creative.hookText} ✨ Confira na sacolinha amarela! #tiktokshop #${creative.productName.toLowerCase().replace(/\s+/g, '')} #viral #recomendo`
    );
  };

  // Execute Publish Handler (Strictly distinguishes Simulation from Official Publish)
  const handleExecutePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreativeForPublish) return;

    setIsPublishing(true);
    try {
      const payload: TikTokPublishConfig = {
        creativeId: selectedCreativeForPublish.id,
        title: publishTitle,
        caption: publishCaption,
        privacyLevel: publishPrivacy,
        allowDuet,
        allowStitch,
        allowComments,
        anchorProductId: selectedCreativeForPublish.productId,
        isSimulation: isSimulationMode,
      };

      const res = await fetch('/api/tiktok-shop/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: data.isSimulation ? 'warning' : 'success',
          text: data.message,
        });
        setSelectedCreativeForPublish(null);
        loadCreatives();
      } else {
        setFeedbackMessage({
          type: 'error',
          text: data.message || data.error || 'Publicação não pôde ser concluída.',
        });
      }
    } catch (e: any) {
      setFeedbackMessage({ type: 'error', text: e?.message || 'Erro de conexão com o servidor' });
    } finally {
      setIsPublishing(false);
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
  };

  const isConnected = account?.status === 'CONNECTED';
  const readyToPublishCount = creatives.filter(
    (c) => c.status === 'READY_TO_PUBLISH' || c.status === 'READY' || c.status === 'PREPARED'
  ).length;
  const publishedCount = creatives.filter((c) => c.status === 'PUBLISHED').length;
  const simulationCount = creatives.filter((c) => c.status === 'SIMULATION' || c.isSimulated).length;

  // Render Account Status Badge
  const renderAccountBadge = () => {
    if (!account) return null;
    switch (account.status) {
      case 'CONNECTED':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>API OFICIAL CONECTADA</span>
          </span>
        );
      case 'AUTH_REQUIRED':
        return (
          <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>AUTORIZAÇÃO OAUTH PENDENTE</span>
          </span>
        );
      case 'TOKEN_EXPIRED':
        return (
          <span className="px-2.5 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-300 rounded-full text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>TOKEN EXPIRADO</span>
          </span>
        );
      case 'PERMISSION_DENIED':
        return (
          <span className="px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>PERMISSÃO INSUFICIENTE</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>NÃO CONECTADO</span>
          </span>
        );
    }
  };

  // Render Creative Status Badge
  const renderCreativeBadge = (creative: TikTokCreative) => {
    switch (creative.status) {
      case 'PUBLISHED':
        return (
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>PUBLICADO (OFICIAL)</span>
          </span>
        );
      case 'PUBLISHING':
        return (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded text-[10px] font-bold flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>PUBLICANDO...</span>
          </span>
        );
      case 'SIMULATION':
        return (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>SIMULAÇÃO (NÃO PUBLICADO)</span>
          </span>
        );
      case 'PREPARED':
        return (
          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold">
            PREPARADO (PAYLOAD OK)
          </span>
        );
      case 'READY_TO_PUBLISH':
      case 'READY':
        return (
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
            PRONTO PARA PUBLICAR (LOCAL)
          </span>
        );
      case 'PUBLISH_NOT_AVAILABLE':
        return (
          <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-[10px] font-bold">
            PUBLICAÇÃO INDISPONÍVEL
          </span>
        );
      case 'PUBLISH_FAILED':
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold">
            FALHA NA PUBLICAÇÃO
          </span>
        );
      case 'GENERATING':
        return (
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded text-[10px] font-bold animate-pulse">
            GERANDO VÍDEO (VEO)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-[10px] font-bold">
            {creative.status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12" id="tiktok-shop-center-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-300 text-xs font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
                <span>TIKTOK SHOP CENTER</span>
              </div>
              {renderAccountBadge()}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Gestão de Catálogo & Publicação Oficial no TikTok
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Estruture vídeos de alta conversão, gerencie criativos aprovados e publique com metadados oficiais,
              respeitando estritamente a API de Postagem Direta do TikTok (v2).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('tiktok_factory')}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Criar Roteiro de Vendas</span>
            </button>
            <button
              onClick={() => onNavigateToTab('live_factory')}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Video className="w-4 h-4 text-rose-400" />
              <span>Live Sales Factory</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-neutral-800">
          {[
            { id: 'dashboard', label: 'Dashboard & Métricas', icon: TrendingUp },
            { id: 'products', label: `Catálogo de Produtos (${tikTokProducts.length})`, icon: ShoppingBag },
            { id: 'creatives', label: `Creative Center (${creatives.length})`, icon: Video },
            { id: 'account', label: 'Integração Oficial & API', icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/20'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-3 animate-fadeIn ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : feedbackMessage.type === 'warning'
              ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
              : feedbackMessage.type === 'info'
              ? 'bg-blue-950/50 border-blue-500/40 text-blue-300'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : feedbackMessage.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : feedbackMessage.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* TAB 1: DASHBOARD & METRICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Status da Conexão</span>
                <ShieldCheck className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-neutral-500'
                  }`}
                />
                <span className="text-sm font-bold text-white">
                  {isConnected ? 'API Oficial Conectada' : 'Não Conectado'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 truncate">
                {account?.sellerName ? `Seller: ${account.sellerName}` : 'Content Posting API v2'}
              </div>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Produtos Catalogados</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{tikTokProducts.length}</div>
              <div className="text-[11px] text-neutral-400">
                {tikTokProducts.filter((p) => p.syncStatus === 'SYNCED').length} sincronizados oficialmente
              </div>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Criativos Cadastrados</span>
                <Video className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{creatives.length}</div>
              <div className="text-[11px] text-neutral-400">{readyToPublishCount} prontos para envio</div>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Publicações Confirmadas</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{publishedCount}</div>
              <div className="text-[11px] text-neutral-500">
                {simulationCount > 0 ? `(${simulationCount} simulações realizadas)` : 'Apenas envios reais'}
              </div>
            </div>
          </div>

          {/* Section: Motor Heuristics vs Real TikTok Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heuristics Box */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Métricas do Motor (Estimativas Heurísticas)</h3>
                </div>
                <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded text-[10px] font-bold">
                  ESTIMATIVA
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Calculadas pelos algoritmos de copywriting e retenção de hooks do Veo Auto Studio.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <div className="text-[11px] text-neutral-400">Score Médio de Hook</div>
                  <div className="text-base font-bold text-emerald-400">86.4 / 100</div>
                  <div className="text-[10px] text-neutral-500">Alto impacto nos primeiros 3s</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <div className="text-[11px] text-neutral-400">Aderência ao TikTok Shop</div>
                  <div className="text-base font-bold text-rose-400">100% Nativo</div>
                  <div className="text-[10px] text-neutral-500">CTAs focados na sacolinha amarela</div>
                </div>
              </div>
            </div>

            {/* Real TikTok Metrics Box */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Métricas Reais do TikTok (Oficiais)</h3>
                </div>
                <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded text-[10px] font-bold">
                  API OFICIAL
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Dados consolidados de engajamento e vendas retornados diretamente pelos servidores do TikTok.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <div className="text-[11px] text-neutral-400">Visualizações Reais</div>
                  <div className="text-xs font-bold text-neutral-500">N/D</div>
                  <div className="text-[9px] text-neutral-600">Requer Insights API</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <div className="text-[11px] text-neutral-400">Cliques Sacolinha</div>
                  <div className="text-xs font-bold text-neutral-500">N/D</div>
                  <div className="text-[9px] text-neutral-600">Requer Shop Webhook</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <div className="text-[11px] text-neutral-400">Vendas TikTok Shop</div>
                  <div className="text-xs font-bold text-neutral-500">N/D</div>
                  <div className="text-[9px] text-neutral-600">Requer Shop API</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Creatives */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Criativos Recentes</span>
                </h3>
                <button
                  onClick={() => setActiveTab('creatives')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Ver Todos ({creatives.length})
                </button>
              </div>

              {creatives.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl space-y-3">
                  <p className="text-xs text-neutral-400">Nenhum criativo salvo ainda.</p>
                  <button
                    onClick={() => onNavigateToTab('tiktok_factory')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Primeiro Roteiro</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {creatives.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-neutral-800/40 border border-neutral-700/50 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {renderCreativeBadge(c)}
                          <span className="text-xs font-bold text-white truncate">{c.title}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate">"{c.hookText}"</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.status !== 'PUBLISHED' && (
                          <>
                            <button
                              onClick={() => handleOpenPublishModal(c, true)}
                              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                              title="Simular e validar payload sem enviar aos servidores do TikTok"
                            >
                              Simular
                            </button>
                            <button
                              onClick={() => handleOpenPublishModal(c, false)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Publicar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Compliance Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Oficial & Transparente</span>
                </div>
                <h3 className="text-sm font-bold text-white">Diretrizes de Integridade</h3>
                <ul className="text-xs text-neutral-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Sem publicação fingida — status PUBLISHED somente após confirmação real da API.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Sem scraping, cookies ou automação clandestina de browser.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Tokens e segredos isolados estritamente no backend.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveTab('account')}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>Configurar Conexão Oficial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-400" />
                  <span>Catálogo de Produtos para Roteiros e Anúncios</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Produtos cadastrados no app e preparados para associação aos vídeos do TikTok Shop.
                </p>
              </div>

              <button
                onClick={handleSyncProducts}
                disabled={isSyncingProducts}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                <span>{isSyncingProducts ? 'Atualizando...' : 'Atualizar Catálogo'}</span>
              </button>
            </div>

            {/* Transparency Note Banner */}
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-neutral-300">Aviso de Conformidade:</span>
                <p className="text-[11px] text-neutral-400">
                  Produtos marcados como <strong className="text-neutral-200">PRODUTO LOCAL</strong> são utilizados para criação de roteiros de alta conversão no estúdio. A sincronização com a vitrine do TikTok Shop requer uma conta de Vendedor com a TikTok Shop Open API autorizada.
                </p>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tikTokProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-5 bg-neutral-800/40 border border-neutral-700/60 rounded-2xl space-y-4 hover:border-neutral-600 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-neutral-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-rose-400 uppercase">{p.sku}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.syncStatus === 'SYNCED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {p.syncStatus === 'SYNCED' ? 'SINCRONIZADO OFICIAL' : 'PRODUTO LOCAL'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mt-0.5">{p.name}</h4>
                        <div className="text-xs font-bold text-rose-400">R$ {p.price}</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{p.description}</p>

                    <div className="p-3 bg-neutral-950 rounded-xl space-y-1 text-[11px]">
                      <div className="text-neutral-300 font-semibold">Argumento Principal:</div>
                      <div className="text-neutral-400 truncate">{p.offer}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">Estoque: {p.stockAvailable} un.</span>
                    <button
                      onClick={() => onNavigateToTab('tiktok_factory')}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-bold transition"
                    >
                      Criar Roteiro
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATIVES */}
      {activeTab === 'creatives' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Creative Center & Histórico de Criativos</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Gerencie criativos estruturados, valide payloads via simulação ou envie para publicação oficial.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('tiktok_factory')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Criativo</span>
              </button>
            </div>

            {creatives.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl space-y-3">
                <Video className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">Nenhum criativo cadastrado.</p>
                <button
                  onClick={() => onNavigateToTab('tiktok_factory')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Abrir TikTok Sales Factory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creatives.map((creative) => (
                  <div
                    key={creative.id}
                    className="p-5 bg-neutral-800/40 border border-neutral-700/60 rounded-2xl space-y-4 hover:border-neutral-600 transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {renderCreativeBadge(creative)}
                        <span className="text-[10px] text-neutral-400 font-mono">{creative.format || '9:16'}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{creative.title}</h4>

                      <div className="space-y-1 text-xs">
                        <div className="text-neutral-400">
                          <strong className="text-neutral-300">Hook:</strong> "{creative.hookText}"
                        </div>
                        <div className="text-neutral-400">
                          <strong className="text-neutral-300">CTA:</strong> "{creative.ctaText}"
                        </div>
                      </div>

                      {creative.publishedTikTokVideoId && (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
                          <strong>ID Oficial TikTok:</strong> {creative.publishedTikTokVideoId}
                        </div>
                      )}

                      {creative.localPublishAttemptId && (
                        <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 font-mono">
                          <strong>Tentativa Local:</strong> {creative.localPublishAttemptId}
                        </div>
                      )}

                      {creative.publishErrorDetails && (
                        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300">
                          {creative.publishErrorDetails}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {creative.status !== 'PUBLISHED' ? (
                          <>
                            <button
                              onClick={() => handleOpenPublishModal(creative, true)}
                              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                              title="Validação de Payload (Simulação)"
                            >
                              Simular
                            </button>
                            <button
                              onClick={() => handleOpenPublishModal(creative, false)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Publicar</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmado no TikTok</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleEnqueueCreative(creative)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                        >
                          Renderizar (Veo)
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteCreative(creative.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 transition"
                        title="Excluir criativo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL ACCOUNT & API */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Settings Form (2 Cols) */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Configuração da API Oficial TikTok</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Insira as credenciais do seu aplicativo registrado no portal TikTok for Developers.
                  Os dados são salvos de forma isolada e segura no servidor.
                </p>
              </div>

              <form onSubmit={handleConnectAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Client Key (App Key)</label>
                    <input
                      type="text"
                      value={clientKey}
                      onChange={(e) => setClientKey(e.target.value)}
                      placeholder="Ex: aw89djaslkd923"
                      className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Client Secret</label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Nome do Vendedor / Canal</label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="Ex: Minha Loja Oficial"
                      className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Shop ID (Opcional)</label>
                    <input
                      type="text"
                      value={shopId}
                      onChange={(e) => setShopId(e.target.value)}
                      placeholder="Ex: SHOP_BR_123456"
                      className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Ambiente de Operação</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['production', 'sandbox'].map((env) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setEnvironment(env as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition capitalize ${
                          environment === env
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {env === 'production' ? 'Produção (Oficial)' : 'Sandbox / Testes'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    Salvar Configurações da API
                  </button>
                  {isConnected && (
                    <button
                      type="button"
                      onClick={handleDisconnectAccount}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 border border-neutral-700 rounded-xl text-xs font-semibold transition"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Documentation & Scopes (1 Col) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Escopos Oficiais</h4>
              <div className="space-y-2 text-xs">
                {[
                  { scope: 'video.upload', desc: 'Envio seguro de arquivos de mídia' },
                  { scope: 'video.publish', desc: 'Publicação oficial de vídeos no feed' },
                  { scope: 'seller.product.read', desc: 'Leitura de catálogo do TikTok Shop' },
                  { scope: 'user.info.basic', desc: 'Identificação segura do canal' },
                ].map((s) => (
                  <div key={s.scope} className="p-2.5 bg-neutral-800/60 rounded-xl border border-neutral-700/60">
                    <div className="font-mono text-rose-300 font-bold">{s.scope}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{s.desc}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="https://developers.tiktok.com/doc/content-posting-api-get-started"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-rose-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Documentação Oficial TikTok Developers</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {selectedCreativeForPublish && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-white">
                  {isSimulationMode ? 'Simular e Validar Payload' : 'Publicar no TikTok'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCreativeForPublish(null)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Fechar
              </button>
            </div>

            {isSimulationMode && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Modo de Simulação Ativo:</span>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    Os metadados serão validados estruturalmente. O vídeo NÃO será enviado aos servidores do TikTok e NÃO será marcado como "PUBLISHED".
                  </p>
                </div>
              </div>
            )}

            {!isSimulationMode && !isConnected && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">API Oficial Não Conectada:</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    A publicação direta requer credenciais ativas do TikTok. Ao confirmar, o criativo será marcado como "Publicação Indisponível (Local)".
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleExecutePublish} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Título do Vídeo</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Legenda & Hashtags</label>
                <textarea
                  rows={3}
                  value={publishCaption}
                  onChange={(e) => setPublishCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Privacidade Oficial</label>
                <select
                  value={publishPrivacy}
                  onChange={(e) => setPublishPrivacy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                >
                  <option value="PUBLIC_TO_EVERYONE">Público (Todos)</option>
                  <option value="MUTUAL_FOLLOW_FRIENDS">Amigos / Seguidores Mútuos</option>
                  <option value="SELF_ONLY">Privado (Apenas Eu)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Comentários</span>
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDuet}
                    onChange={(e) => setAllowDuet(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Dueto</span>
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowStitch}
                    onChange={(e) => setAllowStitch(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Costura</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedCreativeForPublish(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 ${
                    isSimulationMode
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                  <span>
                    {isPublishing
                      ? 'Processando...'
                      : isSimulationMode
                      ? 'Executar Simulação'
                      : isConnected
                      ? 'Publicar via API Oficial'
                      : 'Tentar Envio (Local)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
