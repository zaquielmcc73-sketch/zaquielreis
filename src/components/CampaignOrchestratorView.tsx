import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Layers,
  ShoppingBag,
  Scissors,
  Zap,
  Wand2,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  Store,
  Film,
  User,
  Eye,
  Check,
  Award,
  BarChart,
  Filter,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  AngleCategory,
  CampaignAngle,
  CampaignBatchQuantity,
  CampaignCreativeItem,
  CampaignCreativeScore,
  CampaignDuration,
  CampaignHook,
  CampaignICP,
  CampaignOffer,
  CampaignScript,
  Character,
  HookCategory,
  OrchestratedCampaign,
  Product,
  ProjectBible,
  SalesMethodId,
} from '../types';
import { SALES_METHODS } from '../data/salesMethods';

interface CampaignOrchestratorViewProps {
  onNavigateToQueue?: () => void;
  onNavigateToJoiner?: (clipPaths?: string[]) => void;
  onNavigateToMultiplier?: () => void;
  onNavigateToTikTokShop?: () => void;
  onNavigateToProducts?: () => void;
}

const STEP_TABS = [
  { id: 1, label: '1. Produto', icon: ShoppingBag },
  { id: 2, label: '2. Público (ICP)', icon: Target },
  { id: 3, label: '3. Oferta', icon: Award },
  { id: 4, label: '4. Método de Venda', icon: TrendingUp },
  { id: 5, label: '5. Hooks', icon: Zap },
  { id: 6, label: '6. Roteiros', icon: Film },
  { id: 7, label: '7. Personagem', icon: User },
  { id: 8, label: '8. Prompts PRO', icon: Wand2 },
  { id: 9, label: '9. Fábrica em Massa', icon: Layers },
  { id: 10, label: '10. Matriz de Criativos', icon: Sliders },
];

export const CampaignOrchestratorView: React.FC<CampaignOrchestratorViewProps> = ({
  onNavigateToQueue,
  onNavigateToJoiner,
  onNavigateToMultiplier,
  onNavigateToTikTokShop,
  onNavigateToProducts,
}) => {
  // Global Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [campaigns, setCampaigns] = useState<OrchestratedCampaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<OrchestratedCampaign | null>(null);
  const [creatives, setCreatives] = useState<CampaignCreativeItem[]>([]);
  const [bible, setBible] = useState<ProjectBible | null>(null);

  // View UI State
  const [activeTab, setActiveTab] = useState<number>(1);
  const [mode, setMode] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [autoStepProgress, setAutoStepProgress] = useState<number>(0);
  const [selectedCreativeForScore, setSelectedCreativeForScore] = useState<CampaignCreativeItem | null>(null);
  const [selectedCreativeForPreview, setSelectedCreativeForPreview] = useState<CampaignCreativeItem | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filters in Creatives Matrix
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCreativeIds, setSelectedCreativeIds] = useState<string[]>([]);

  // Modals
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'Geral',
    price: '97,00',
    currency: 'BRL',
    description: '',
    benefits: [''],
    pains: [''],
    cta: 'Clique no link e garanta o seu hoje!',
  });

  // Load initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [pRes, cRes, campRes, bRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => []),
        fetch('/api/characters').then((r) => r.json()).catch(() => []),
        fetch('/api/orchestrator/campaigns').then((r) => r.json()).catch(() => []),
        fetch('/api/bible').then((r) => r.json()).catch(() => null),
      ]);

      setProducts(pRes || []);
      setCharacters(cRes || []);
      setCampaigns(campRes || []);
      setBible(bRes);

      if (campRes && campRes.length > 0) {
        selectCampaign(campRes[0]);
      } else if (pRes && pRes.length > 0) {
        initNewCampaign(pRes[0]);
      }
    } catch (e) {
      console.error('Error loading orchestrator data:', e);
    }
  };

  const selectCampaign = async (camp: OrchestratedCampaign) => {
    setCurrentCampaign(camp);
    setMode(camp.mode || 'AUTOMATIC');
    try {
      const crRes = await fetch(`/api/orchestrator/creatives?campaignId=${camp.id}`).then((r) => r.json());
      setCreatives(crRes || []);
    } catch (e) {
      setCreatives(camp.creatives || []);
    }
  };

  const initNewCampaign = (product?: Product) => {
    const prod = product || products[0];
    if (!prod) return;

    const newCamp: OrchestratedCampaign = {
      id: `camp_orch_${Date.now()}`,
      name: `Campanha — ${prod.name}`,
      productId: prod.id,
      productName: prod.name,
      mode: 'AUTOMATIC',
      targetDuration: 30,
      batchLimit: 25,
      selectedMethods: ['china', 'drive_thru', 'fomo', 'ugc', 'pov', 'pain_solution'],
      isAutoMethods: true,
      characterType: 'generic',
      icp: {
        targetAudience: prod.targetAudience || 'Consumidores em busca de praticidade e eficiência',
        ageRange: '25-45 anos',
        gender: 'Unissex',
        profession: 'Profissionais e autônomos',
        dailyRoutine: 'Dia a dia dinâmico onde tarefas ineficientes causam perda de tempo e atrito.',
        location: 'Brasil (Nacional)',
        incomeLevel: 'Classe B e C+',
        lifestyle: 'Conectado, prático e orientado a custo-benefício',
        desires: prod.desires?.length ? prod.desires : ['Economizar tempo', 'Solução comprovada', 'Praticidade total'],
        pains: prod.pains?.length ? prod.pains : ['Frustração com métodos antigos', 'Desgaste e retrabalho'],
        objections: prod.objections?.length ? prod.objections : ['Será que funciona para mim?', 'É seguro comprar?'],
        triggers: ['Demonstração do mecanismo', 'Garantia de satisfação', 'Alívio da dor principal'],
        awarenessLevel: 'Consciente do Problema',
        buyingIntent: 'Imediato / Urgente',
      },
      offer: {
        mainOffer: `Adquira o ${prod.name} com entrega rápida e garantia total.`,
        primaryBenefit: prod.benefits?.[0] || 'Eficiência máxima e durabilidade',
        secondaryBenefit: prod.benefits?.[1] || 'Fácil de usar e sem atrito',
        bonuses: ['Guia de uso rápido', 'Suporte especializado'],
        guarantee: '30 dias de garantia incondicional de satisfação',
        price: `${prod.currency || 'BRL'} ${prod.price || '97,00'}`,
        cta: prod.cta || 'Clique no link e garanta o seu com desconto exclusivo!',
        realUrgencyText: 'Lote disponível para envio prioritário.',
      },
      angles: [],
      hooks: [],
      scripts: [],
      creatives: [],
      currentStepIndex: 1,
      overviewMetrics: {
        plannedCount: 25,
        generatedCount: 0,
        processedCount: 0,
        readyCount: 0,
        errorCount: 0,
        progressPercentage: 0,
      },
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentCampaign(newCamp);
    setCreatives([]);
    setActiveTab(1);
    setMode('AUTOMATIC');
  };

  const showFeedback = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Save current campaign to database
  const saveCampaign = async (updatedCamp?: OrchestratedCampaign) => {
    const target = updatedCamp || currentCampaign;
    if (!target) return;
    try {
      const res = await fetch('/api/orchestrator/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      });
      const saved = await res.json();
      setCurrentCampaign(saved);
      // Update campaigns list
      setCampaigns((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
    } catch (e) {
      console.error('Error saving campaign:', e);
    }
  };

  // =========================================================================
  // ACTIONS: GENERATORS FOR EACH STAGE
  // =========================================================================

  const handleGenerateICP = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText('Analisando produto e estruturando Perfil de Cliente Ideal (ICP)...');
    try {
      const res = await fetch('/api/orchestrator/generate-icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: currentCampaign.productId }),
      });
      const icp = await res.json();
      const updated = { ...currentCampaign, icp };
      setCurrentCampaign(updated);
      await saveCampaign(updated);
      showFeedback('success', 'Público Ideal (ICP) gerado e salvo com sucesso!');
    } catch (e: any) {
      showFeedback('error', 'Falha ao gerar ICP: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleGenerateOffer = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText('Construindo proposta comercial ética de alta conversão...');
    try {
      const res = await fetch('/api/orchestrator/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: currentCampaign.productId, icp: currentCampaign.icp }),
      });
      const offer = await res.json();
      const updated = { ...currentCampaign, offer };
      setCurrentCampaign(updated);
      await saveCampaign(updated);
      showFeedback('success', 'Oferta comercial estruturada com sucesso!');
    } catch (e: any) {
      showFeedback('error', 'Falha ao gerar oferta: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleGenerateAngles = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText('Mapeando 17 ângulos estratégicos de conversão...');
    try {
      const res = await fetch('/api/orchestrator/generate-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentCampaign.productId,
          icp: currentCampaign.icp,
          offer: currentCampaign.offer,
          count: 17,
        }),
      });
      const angles = await res.json();
      const updated = { ...currentCampaign, angles };
      setCurrentCampaign(updated);
      await saveCampaign(updated);
      showFeedback('success', `17 ângulos estratégicos mapeados com sucesso!`);
    } catch (e: any) {
      showFeedback('error', 'Falha ao gerar ângulos: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleGenerateHooks = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText(`Gerando ${currentCampaign.batchLimit || 25} ganchos de alta retenção nas 18 categorias...`);
    try {
      const res = await fetch('/api/orchestrator/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentCampaign.productId,
          angles: currentCampaign.angles,
          selectedMethods: currentCampaign.selectedMethods,
          count: currentCampaign.batchLimit || 25,
        }),
      });
      const hooks = await res.json();
      const updated = { ...currentCampaign, hooks };
      setCurrentCampaign(updated);
      await saveCampaign(updated);
      showFeedback('success', `${hooks.length} Hooks de vendas gerados com score heurístico!`);
    } catch (e: any) {
      showFeedback('error', 'Falha ao gerar hooks: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleGenerateScripts = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText(`Construindo roteiros estruturados em 8 fases (${currentCampaign.targetDuration}s)...`);
    try {
      const res = await fetch('/api/orchestrator/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentCampaign.productId,
          icp: currentCampaign.icp,
          offer: currentCampaign.offer,
          hooks: currentCampaign.hooks,
          angles: currentCampaign.angles,
          selectedMethods: currentCampaign.selectedMethods,
          duration: currentCampaign.targetDuration || 30,
          characterId: currentCampaign.characterId,
          count: 10,
        }),
      });
      const scripts = await res.json();
      const updated = { ...currentCampaign, scripts };
      setCurrentCampaign(updated);
      await saveCampaign(updated);
      showFeedback('success', `${scripts.length} Roteiros completos gerados com sucesso!`);
    } catch (e: any) {
      showFeedback('error', 'Falha ao gerar roteiros: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleGenerateMatrix = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText(`Cruzando Hooks × Roteiros × CTAs para criar a Matriz de Criativos (${currentCampaign.batchLimit} variações)...`);
    try {
      // Ensure hooks and scripts exist
      let hList = currentCampaign.hooks;
      if (!hList || hList.length === 0) {
        const hRes = await fetch('/api/orchestrator/generate-hooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: currentCampaign.productId,
            angles: currentCampaign.angles,
            selectedMethods: currentCampaign.selectedMethods,
            count: currentCampaign.batchLimit || 25,
          }),
        });
        hList = await hRes.json();
      }

      let sList = currentCampaign.scripts;
      if (!sList || sList.length === 0) {
        const sRes = await fetch('/api/orchestrator/generate-scripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: currentCampaign.productId,
            icp: currentCampaign.icp,
            offer: currentCampaign.offer,
            hooks: hList,
            angles: currentCampaign.angles,
            selectedMethods: currentCampaign.selectedMethods,
            duration: currentCampaign.targetDuration || 30,
            characterId: currentCampaign.characterId,
            count: 10,
          }),
        });
        sList = await sRes.json();
      }

      const res = await fetch('/api/orchestrator/generate-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: currentCampaign.id,
          productId: currentCampaign.productId,
          hooks: hList,
          scripts: sList,
          offer: currentCampaign.offer,
          selectedMethods: currentCampaign.selectedMethods,
          batchLimit: currentCampaign.batchLimit || 25,
          characterId: currentCampaign.characterId,
        }),
      });

      const generatedCreatives = await res.json();
      setCreatives(generatedCreatives);

      const updated = {
        ...currentCampaign,
        hooks: hList,
        scripts: sList,
        creatives: generatedCreatives,
        overviewMetrics: {
          ...currentCampaign.overviewMetrics,
          plannedCount: generatedCreatives.length,
          readyCount: generatedCreatives.length,
        },
        status: 'READY' as const,
      };

      setCurrentCampaign(updated);
      await saveCampaign(updated);
      setActiveTab(10); // Go to Matrix tab
      showFeedback('success', `Matriz de Criativos gerada com ${generatedCreatives.length} variações prontas!`);
    } catch (e: any) {
      showFeedback('error', 'Falha ao gerar matriz: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  // =========================================================================
  // MODO AUTOMÁTICO: ORQUESTRAÇÃO COMPLETA END-TO-END
  // =========================================================================
  const runAutoOrchestration = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setAutoStepProgress(5);

    try {
      // 1. ICP
      setLoadingText('Etapa 1/6: Estruturando Perfil de Cliente Ideal (ICP)...');
      setAutoStepProgress(15);
      const icpRes = await fetch('/api/orchestrator/generate-icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: currentCampaign.productId }),
      });
      const icp = await icpRes.json();

      // 2. Offer
      setLoadingText('Etapa 2/6: Construindo Proposta Comercial e Garantia Ética...');
      setAutoStepProgress(30);
      const offerRes = await fetch('/api/orchestrator/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: currentCampaign.productId, icp }),
      });
      const offer = await offerRes.json();

      // 3. Angles
      setLoadingText('Etapa 3/6: Mapeando 17 Ângulos Estratégicos de Conversão...');
      setAutoStepProgress(45);
      const anglesRes = await fetch('/api/orchestrator/generate-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: currentCampaign.productId, icp, offer, count: 17 }),
      });
      const angles = await anglesRes.json();

      // 4. Hooks
      setLoadingText(`Etapa 4/6: Gerando ${currentCampaign.batchLimit || 25} Hooks de Retenção Máxima...`);
      setAutoStepProgress(60);
      const hooksRes = await fetch('/api/orchestrator/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentCampaign.productId,
          angles,
          selectedMethods: currentCampaign.selectedMethods,
          count: currentCampaign.batchLimit || 25,
        }),
      });
      const hooks = await hooksRes.json();

      // 5. Scripts
      setLoadingText(`Etapa 5/6: Estruturando Roteiros Comerciais nas 8 Fases (${currentCampaign.targetDuration}s)...`);
      setAutoStepProgress(75);
      const scriptsRes = await fetch('/api/orchestrator/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentCampaign.productId,
          icp,
          offer,
          hooks,
          angles,
          selectedMethods: currentCampaign.selectedMethods,
          duration: currentCampaign.targetDuration || 30,
          characterId: currentCampaign.characterId,
          count: 10,
        }),
      });
      const scripts = await scriptsRes.json();

      // 6. Matrix & Prompts
      setLoadingText(`Etapa 6/6: Montando Matriz de Criativos e Prompts Veo PRO (${currentCampaign.batchLimit} variações)...`);
      setAutoStepProgress(90);
      const matrixRes = await fetch('/api/orchestrator/generate-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: currentCampaign.id,
          productId: currentCampaign.productId,
          hooks,
          scripts,
          offer,
          selectedMethods: currentCampaign.selectedMethods,
          batchLimit: currentCampaign.batchLimit || 25,
          characterId: currentCampaign.characterId,
        }),
      });
      const generatedCreatives = await matrixRes.json();
      setCreatives(generatedCreatives);

      const completedCamp: OrchestratedCampaign = {
        ...currentCampaign,
        icp,
        offer,
        angles,
        hooks,
        scripts,
        creatives: generatedCreatives,
        overviewMetrics: {
          plannedCount: generatedCreatives.length,
          generatedCount: 0,
          processedCount: 0,
          readyCount: generatedCreatives.length,
          errorCount: 0,
          progressPercentage: 50,
        },
        status: 'READY',
      };

      setCurrentCampaign(completedCamp);
      await saveCampaign(completedCamp);
      setAutoStepProgress(100);
      setActiveTab(10); // Open Matriz de Criativos
      showFeedback('success', `Campanha orquestrada com sucesso! ${generatedCreatives.length} criativos gerados e prontos.`);
    } catch (e: any) {
      showFeedback('error', 'Falha na orquestração automática: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
      setAutoStepProgress(0);
    }
  };

  // Enqueue to Generation Queue
  const handleEnqueueAll = async () => {
    if (!currentCampaign) return;
    setIsLoading(true);
    setLoadingText('Enfileirando criativos na Fila de Geração Veo...');
    try {
      const res = await fetch(`/api/orchestrator/campaigns/${currentCampaign.id}/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enfileirar');

      showFeedback('success', `${data.count} Criativos enfileirados com sucesso!`);
      // Refresh creatives
      const crRes = await fetch(`/api/orchestrator/creatives?campaignId=${currentCampaign.id}`).then((r) => r.json());
      setCreatives(crRes || []);

      if (onNavigateToQueue) {
        onNavigateToQueue();
      }
    } catch (e: any) {
      showFeedback('error', 'Falha ao enfileirar: ' + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  // Duplicate creative with versioning
  const handleDuplicateCreative = async (creativeId: string) => {
    try {
      const res = await fetch(`/api/orchestrator/creatives/${creativeId}/duplicate`, {
        method: 'POST',
      });
      const duplicated = await res.json();
      if (!res.ok) throw new Error(duplicated.error || 'Erro ao duplicar');

      setCreatives((prev) => [duplicated, ...prev]);
      showFeedback('success', `Criativo duplicado como "${duplicated.version}"!`);
    } catch (e: any) {
      showFeedback('error', 'Erro ao duplicar: ' + (e?.message || String(e)));
    }
  };

  // Send creative to TikTok Shop
  const handleSendToTikTokShop = async (creativeId: string) => {
    try {
      const res = await fetch(`/api/orchestrator/creatives/${creativeId}/send-to-tiktok-shop`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao exportar');

      // Update creative in state
      setCreatives((prev) =>
        prev.map((c) => (c.id === creativeId ? { ...c, status: data.status, publishStatusDetails: data.message } : c))
      );
      showFeedback('success', data.message || 'Criativo integrado com TikTok Shop Center!');
    } catch (e: any) {
      showFeedback('error', 'Erro ao enviar para TikTok Shop: ' + (e?.message || String(e)));
    }
  };

  // Filtered creatives
  const filteredCreatives = creatives.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchHook = c.hookText.toLowerCase().includes(q);
      const matchMethod = c.salesMethodName.toLowerCase().includes(q);
      const matchScript = c.scriptTitle.toLowerCase().includes(q);
      if (!matchHook && !matchMethod && !matchScript) return false;
    }
    if (filterMethod !== 'all' && c.salesMethodId !== filterMethod) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const selectedProduct = products.find((p) => p.id === currentCampaign?.productId) || products[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* TOP HEADER & CAMPAIGN CONTROLS */}
      {/* ========================================================================= */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {currentCampaign?.name || 'Orquestrador de Campanhas PRO'}
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Fase 5
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fábrica de Criativos de Vendas • 10 Etapas Integradas • Geração em Massa
            </p>
          </div>
        </div>

        {/* Campaign Switcher & New Button */}
        <div className="flex items-center gap-3">
          {campaigns.length > 0 && (
            <select
              value={currentCampaign?.id || ''}
              onChange={(e) => {
                const found = campaigns.find((c) => c.id === e.target.value);
                if (found) selectCampaign(found);
              }}
              aria-label="Selecionar Campanha Salva"
              className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.creatives?.length || 0} criativos)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => initNewCampaign()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all hover:text-white"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Nova Campanha
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setMode('AUTOMATIC');
                if (currentCampaign) saveCampaign({ ...currentCampaign, mode: 'AUTOMATIC' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'AUTOMATIC'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Modo Automático
            </button>
            <button
              onClick={() => {
                setMode('MANUAL');
                if (currentCampaign) saveCampaign({ ...currentCampaign, mode: 'MANUAL' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'MANUAL'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Modo Manual
            </button>
          </div>

          {/* Enqueue Action */}
          {creatives.length > 0 && (
            <button
              onClick={handleEnqueueAll}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-950/60 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Enviar para Fila ({creatives.length})
            </button>
          )}
        </div>
      </header>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
              : 'bg-cyan-950/90 text-cyan-300 border-cyan-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {feedbackMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {feedbackMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAMPAIGN OVERVIEW DASHBOARD */}
      {/* ========================================================================= */}
      <div className="px-6 py-3.5 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Produto Ativo</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-white">{selectedProduct?.name || 'Nenhum'}</span>
              <span className="text-[11px] font-medium text-emerald-400">
                {selectedProduct?.currency} {selectedProduct?.price}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Lote Planejado</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <select
                value={currentCampaign?.batchLimit || 25}
                onChange={(e) => {
                  const val = Number(e.target.value) as CampaignBatchQuantity;
                  if (currentCampaign) {
                    const updated = { ...currentCampaign, batchLimit: val };
                    setCurrentCampaign(updated);
                    saveCampaign(updated);
                  }
                }}
                aria-label="Selecionar Tamanho do Lote"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              >
                <option value={1}>1 Vídeo</option>
                <option value={5}>5 Vídeos</option>
                <option value={10}>10 Vídeos</option>
                <option value={25}>25 Vídeos</option>
                <option value={50}>50 Vídeos</option>
                <option value={75}>75 Vídeos</option>
              </select>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Duração Alvo</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <select
                value={currentCampaign?.targetDuration || 30}
                onChange={(e) => {
                  const val = Number(e.target.value) as CampaignDuration;
                  if (currentCampaign) {
                    const updated = { ...currentCampaign, targetDuration: val };
                    setCurrentCampaign(updated);
                    saveCampaign(updated);
                  }
                }}
                aria-label="Selecionar Duração do Vídeo"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              >
                <option value={15}>15 Segundos</option>
                <option value={30}>30 Segundos</option>
                <option value={45}>45 Segundos</option>
                <option value={60}>60 Segundos</option>
              </select>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Status dos Criativos</span>
            <div className="flex items-center gap-2 mt-0.5 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                {creatives.length} Variações
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                {creatives.filter((c) => c.status === 'READY' || c.status === 'READY_TO_PUBLISH').length} Prontos
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {mode === 'AUTOMATIC' ? (
          <button
            onClick={runAutoOrchestration}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/60 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            CRIAR CAMPANHA AUTOMATICAMENTE
          </button>
        ) : (
          <button
            onClick={handleGenerateMatrix}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-950/60 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            Gerar Matriz de Criativos
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LOADING BANNER / AUTOMATIC STEP TRACKER */}
      {/* ========================================================================= */}
      {isLoading && (
        <div className="px-6 py-4 bg-emerald-950/60 border-b border-emerald-800/80 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
              <div>
                <p className="text-xs font-bold text-white">{loadingText || 'Processando automação da campanha...'}</p>
                <p className="text-[11px] text-emerald-300">
                  Cruzando IA com motores de copy e conformidade do Google Veo
                </p>
              </div>
            </div>
            {autoStepProgress > 0 && (
              <span className="text-xs font-bold text-emerald-300">{autoStepProgress}%</span>
            )}
          </div>
          {autoStepProgress > 0 && (
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-emerald-800/50">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${autoStepProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEW CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Step Navigation Sidebar (Manual Mode) */}
        {mode === 'MANUAL' && (
          <div className="w-56 border-r border-slate-800/80 bg-slate-900/30 p-3 flex flex-col gap-1 shrink-0 overflow-y-auto">
            <span className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              10 Etapas da Fábrica
            </span>
            {STEP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-cyan-950/90 to-indigo-950/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Central Stage Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ===================================================================== */}
          {/* STAGE 1: PRODUTO */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 1) && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 1 — Seleção do Produto</h2>
                    <p className="text-xs text-slate-400">Escolha o produto base para orquestrar todos os criativos de venda</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewProductModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    Criar Novo Produto
                  </button>
                </div>
              </div>

              {/* Product Grid Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {products.map((p) => {
                  const isSelected = currentCampaign?.productId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (currentCampaign) {
                          const updated = {
                            ...currentCampaign,
                            productId: p.id,
                            productName: p.name,
                            name: `Campanha — ${p.name}`,
                          };
                          setCurrentCampaign(updated);
                          saveCampaign(updated);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-600 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 uppercase">
                            {p.category}
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            {p.currency} {p.price}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white line-clamp-1">{p.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          {p.benefits?.length || 0} benefícios mapeados
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                            <Check className="w-3.5 h-3.5" /> Ativo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 2: PÚBLICO (ICP) */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 2) && currentCampaign && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 2 — Perfil de Cliente Ideal (ICP)</h2>
                    <p className="text-xs text-slate-400">Público-alvo, dores, desejos e nível de consciência de compra</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateICP}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Gerar Público Ideal (IA)
                  </button>
                </div>
              </div>

              {/* AI Disclaimer Tag */}
              <div className="p-3 bg-purple-950/30 border border-purple-900/50 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-300">
                  {currentCampaign.icp.aiHypothesisDisclaimer ||
                    'Sugestão gerada por IA com base nas características do produto. Valide com métricas do seu público.'}
                </p>
              </div>

              {/* ICP Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Público-Alvo Principal</label>
                  <input
                    type="text"
                    value={currentCampaign.icp.targetAudience}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        icp: { ...currentCampaign.icp, targetAudience: e.target.value },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Faixa Etária & Gênero</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="25-45 anos"
                      value={currentCampaign.icp.ageRange}
                      onChange={(e) => {
                        const updated = {
                          ...currentCampaign,
                          icp: { ...currentCampaign.icp, ageRange: e.target.value },
                        };
                        setCurrentCampaign(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Unissex"
                      value={currentCampaign.icp.gender}
                      onChange={(e) => {
                        const updated = {
                          ...currentCampaign,
                          icp: { ...currentCampaign.icp, gender: e.target.value },
                        };
                        setCurrentCampaign(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nível de Consciência</label>
                  <select
                    value={currentCampaign.icp.awarenessLevel}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        icp: { ...currentCampaign.icp, awarenessLevel: e.target.value as any },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Inconsciente">Inconsciente</option>
                    <option value="Consciente do Problema">Consciente do Problema</option>
                    <option value="Consciente da Solução">Consciente da Solução</option>
                    <option value="Consciente do Produto">Consciente do Produto</option>
                    <option value="Totalmente Consciente">Totalmente Consciente</option>
                  </select>
                </div>
              </div>

              {/* Dores e Desejos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-rose-400 block mb-1">Dores Críticas</label>
                  <textarea
                    rows={2}
                    value={currentCampaign.icp.pains?.join('\n') || ''}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        icp: { ...currentCampaign.icp, pains: e.target.value.split('\n') },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                    placeholder="1 dor por linha..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-400 block mb-1">Desejos & Transformação</label>
                  <textarea
                    rows={2}
                    value={currentCampaign.icp.desires?.join('\n') || ''}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        icp: { ...currentCampaign.icp, desires: e.target.value.split('\n') },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    placeholder="1 desejo por linha..."
                  />
                </div>
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 3: OFERTA */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 3) && currentCampaign && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 3 — Oferta Comercial & Garantias</h2>
                    <p className="text-xs text-slate-400">Proposta de valor, benefícios tangíveis e garantias reais</p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateOffer}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Gerar Oferta Comercial (IA)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Oferta Principal</label>
                  <input
                    type="text"
                    value={currentCampaign.offer.mainOffer}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        offer: { ...currentCampaign.offer, mainOffer: e.target.value },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Preço / Condição</label>
                  <input
                    type="text"
                    value={currentCampaign.offer.price}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        offer: { ...currentCampaign.offer, price: e.target.value },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Garantia Sem Risco</label>
                  <input
                    type="text"
                    value={currentCampaign.offer.guarantee}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        offer: { ...currentCampaign.offer, guarantee: e.target.value },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Chamada para Ação (CTA)</label>
                  <input
                    type="text"
                    value={currentCampaign.offer.cta}
                    onChange={(e) => {
                      const updated = {
                        ...currentCampaign,
                        offer: { ...currentCampaign.offer, cta: e.target.value },
                      };
                      setCurrentCampaign(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 4: MÉTODOS DE VENDA */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 4) && currentCampaign && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 4 — Métodos de Venda Selecionados</h2>
                    <p className="text-xs text-slate-400">
                      Escolha métodos específicos ou deixe o orquestrador distribuir de forma inteligente
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-300 font-semibold">
                    {currentCampaign.selectedMethods?.length || 0} de {SALES_METHODS.length} métodos selecionados
                  </span>
                </div>
              </div>

              {/* Methods Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 max-h-80 overflow-y-auto pr-1">
                {SALES_METHODS.map((m) => {
                  const isSelected = currentCampaign.selectedMethods?.includes(m.id as any);
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        const current = currentCampaign.selectedMethods || [];
                        const next = isSelected ? current.filter((id) => id !== m.id) : [...current, m.id];
                        const updated = { ...currentCampaign, selectedMethods: next as any };
                        setCurrentCampaign(updated);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{m.emoji}</span>
                        <span className="text-[11px] font-bold truncate">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-1">{m.tagline}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 5: HOOKS */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 5) && currentCampaign && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 5 — Gerador de Hooks de Alta Retenção</h2>
                    <p className="text-xs text-slate-400">18 categorias de retenção com score heurístico interno</p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateHooks}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Gerar Hooks ({currentCampaign.batchLimit} variações)
                </button>
              </div>

              {/* Hooks Cards List */}
              {currentCampaign.hooks && currentCampaign.hooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {currentCampaign.hooks.slice(0, 10).map((h, idx) => (
                    <div key={h.id || idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800">
                          {h.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <BarChart className="w-3 h-3" /> Score {h.retentionHeuristicScore}/100
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white">"{h.text}"</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">Visual: {h.visualActionPrompt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhum hook gerado ainda. Clique em "Gerar Hooks" para criar variações.
                </p>
              )}
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 6: ROTEIROS */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 6) && currentCampaign && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 6 — Gerador de Roteiros Comerciais</h2>
                    <p className="text-xs text-slate-400">Estrutura em 8 fases: Hook → Problema → Agitação → Solução → Produto → Benefícios → Oferta → CTA</p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateScripts}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  Gerar Roteiros ({currentCampaign.targetDuration}s)
                </button>
              </div>

              {/* Script List */}
              {currentCampaign.scripts && currentCampaign.scripts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {currentCampaign.scripts.slice(0, 5).map((s, idx) => (
                    <div key={s.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{s.title}</span>
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          {s.durationSeconds}s
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{s.fullDialogue}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {s.scenes?.map((scene) => (
                          <span
                            key={scene.order}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            {scene.phase}: {scene.estimatedSeconds}s
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhum roteiro gerado ainda. Clique em "Gerar Roteiros" para estruturar cenas e diálogos.
                </p>
              )}
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 7: PERSONAGEM / AVATAR */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 7) && currentCampaign && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Etapa 7 — Personagem & Consistência Facial</h2>
                    <p className="text-xs text-slate-400">Escolha um avatar cadastrado, apresentador genérico ou formato POV</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Generic Presenter */}
                <div
                  onClick={() => {
                    const updated = {
                      ...currentCampaign,
                      characterId: undefined,
                      characterType: 'generic' as const,
                    };
                    setCurrentCampaign(updated);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    !currentCampaign.characterId
                      ? 'bg-cyan-950/80 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <h3 className="text-xs font-bold text-white">Apresentador Genérico Realista</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ator/atriz dinâmico gerado nativamente pelo Veo com expressões naturais
                  </p>
                </div>

                {/* Existing Characters */}
                {characters.map((char) => {
                  const isSelected = currentCampaign.characterId === char.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        const updated = {
                          ...currentCampaign,
                          characterId: char.id,
                          characterType: 'existing' as const,
                        };
                        setCurrentCampaign(updated);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <h3 className="text-xs font-bold text-white">{char.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{char.appearance}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 10: MATRIZ DE CRIATIVOS (CENTRAL DE CRIATIVOS) */}
          {/* ===================================================================== */}
          {(mode === 'AUTOMATIC' || activeTab === 10 || activeTab === 9) && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Matriz de Criativos & Variações ({creatives.length} Criativos)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Combinação: {currentCampaign?.hooks?.length || 0} Hooks × {currentCampaign?.scripts?.length || 0} Roteiros = {(currentCampaign?.hooks?.length || 0) * (currentCampaign?.scripts?.length || 0)} combinações possíveis (Limite do lote: {currentCampaign?.batchQuantity || 75})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateMatrix}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    Regenerar Matriz
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por hook, método ou roteiro..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    aria-label="Filtrar por Método de Venda"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">Todos os Métodos</option>
                    {SALES_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-label="Filtrar por Status do Criativo"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="READY">Pronto</option>
                    <option value="GENERATING">Gerando</option>
                    <option value="READY_TO_PUBLISH">Pronto p/ Publicar</option>
                  </select>
                </div>
              </div>

              {/* Creatives Table */}
              {filteredCreatives.length > 0 ? (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-4">Versão</th>
                          <th className="py-3 px-4">Hook Principal</th>
                          <th className="py-3 px-4">Método</th>
                          <th className="py-3 px-4">Ângulo</th>
                          <th className="py-3 px-4">Duração</th>
                          <th className="py-3 px-4">Score Heurístico</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                        {filteredCreatives.map((cr) => (
                          <tr key={cr.id} className="hover:bg-slate-850/60 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-cyan-400 whitespace-nowrap">
                              {cr.version}
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="font-semibold text-white line-clamp-1">{cr.hookText}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cr.ctaText}</p>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-800">
                                {cr.salesMethodName}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-300 text-[11px]">
                              {cr.angleCategory}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-300 text-[11px]">
                              {cr.durationSeconds}s
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedCreativeForScore(cr)}
                                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-[11px] underline underline-offset-2"
                              >
                                <Award className="w-3.5 h-3.5" />
                                {cr.score?.overallScore || 90}/100
                              </button>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  cr.status === 'READY' || cr.status === 'READY_TO_PUBLISH'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : cr.status === 'GENERATING'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {cr.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedCreativeForPreview(cr)}
                                  title="Visualizar Prompt e Cenas"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateCreative(cr.id)}
                                  title="Duplicar Criativo (Cria v2, v3...)"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleSendToTikTokShop(cr.id)}
                                  title="Enviar para TikTok Shop Center"
                                  className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800"
                                >
                                  <Store className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Nenhum criativo gerado ainda. Clique em "CRIAR CAMPANHA AUTOMATICAMENTE" ou "Gerar Matriz de Criativos".
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SCORE BREAKDOWN (10 CRITÉRIOS HEURÍSTICOS) */}
      {/* ========================================================================= */}
      {selectedCreativeForScore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Score Heurístico do Criativo</h3>
              </div>
              <button
                onClick={() => setSelectedCreativeForScore(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-3xl font-extrabold text-emerald-400">
                {selectedCreativeForScore.score?.overallScore || 92}
              </span>
              <span className="text-xs text-slate-400 font-bold block mt-1">Score Geral (0 - 100)</span>
            </div>

            {/* 10 Criteria List */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Poder de Retenção do Gancho</span>
                <span className="font-bold text-white">{selectedCreativeForScore.score?.hookPower || 92}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Clareza da Promessa</span>
                <span className="font-bold text-white">{selectedCreativeForScore.score?.promiseClarity || 90}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Conexão com a Dor</span>
                <span className="font-bold text-white">{selectedCreativeForScore.score?.painConnection || 91}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Força da Demonstração</span>
                <span className="font-bold text-white">{selectedCreativeForScore.score?.demoStrength || 95}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Força da Chamada para Ação (CTA)</span>
                <span className="font-bold text-white">{selectedCreativeForScore.score?.ctaForce || 88}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {selectedCreativeForScore.score?.disclaimer ||
                  'Score heurístico interno baseado em boas práticas de copy e retenção. Não constitui garantia de métricas reais.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW PROMPT & ROTEIRO */}
      {/* ========================================================================= */}
      {selectedCreativeForPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Detalhes do Criativo ({selectedCreativeForPreview.version})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCreativeForPreview(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Hook</label>
              <p className="text-xs font-semibold text-white p-3 bg-slate-950 rounded-xl border border-slate-800">
                "{selectedCreativeForPreview.hookText}"
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Prompt Google Veo</label>
              <textarea
                readOnly
                rows={4}
                value={selectedCreativeForPreview.prompt}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono focus:outline-none"
              />
            </div>

            {selectedCreativeForPreview.script && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Diálogo do Roteiro</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-200">{selectedCreativeForPreview.script.fullDialogue}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR NOVO PRODUTO */}
      {/* ========================================================================= */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Criar Novo Produto</h3>
              </div>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="Ex: Luminária Solar LED Inteligente"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Preço (R$)</label>
                  <input
                    type="text"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  placeholder="Principais funções e apelo visual..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowNewProductModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!newProductForm.name) return;
                  const newProd: Product = {
                    id: `prod_${Date.now()}`,
                    name: newProductForm.name!,
                    category: newProductForm.category || 'Geral',
                    price: newProductForm.price || '97,00',
                    currency: 'BRL',
                    description: newProductForm.description || '',
                    benefits: newProductForm.benefits || ['Facilidade total'],
                    differentials: ['Qualidade superior e entrega rápida'],
                    features: ['Design moderno e ergonômico'],
                    materials: 'Premium',
                    targetAudience: 'Consumidores que buscam praticidade e resultados',
                    pains: newProductForm.pains || ['Falta de praticidade'],
                    desires: ['Economizar tempo e ter alto desempenho'],
                    objections: ['Dúvida sobre garantia ou durabilidade'],
                    salesArguments: ['Garantia incondicional de 30 dias'],
                    cta: newProductForm.cta || 'Clique e compre o seu com garantia!',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  try {
                    await fetch('/api/products', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newProd),
                    });
                    setProducts((prev) => [newProd, ...prev]);
                    initNewCampaign(newProd);
                    setShowNewProductModal(false);
                    showFeedback('success', `Produto "${newProd.name}" criado e selecionado!`);
                  } catch (e) {
                    showFeedback('error', 'Erro ao criar produto');
                  }
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
              >
                Salvar e Selecionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
