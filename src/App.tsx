import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CreateCampaignView } from './components/CreateCampaignView';
import { SalesMethodsView } from './components/SalesMethodsView';
import { QueueView } from './components/QueueView';
import { LibraryView } from './components/LibraryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { MediaCenterView } from './components/MediaCenterView';
import { ProductsView } from './components/ProductsView';
import { CharactersView } from './components/CharactersView';
import { PromptStudioProView } from './components/PromptStudioProView';
import { VideoJoinerProView } from './components/VideoJoinerProView';
import { VideoMultiplierView } from './components/VideoMultiplierView';
import { TikTokSalesFactoryView } from './components/TikTokSalesFactoryView';
import { LiveSalesFactoryView } from './components/LiveSalesFactoryView';
import { TikTokShopCenterView } from './components/TikTokShopCenterView';
import { VideoCopierProView } from './components/VideoCopierProView';
import { CampaignOrchestratorView } from './components/CampaignOrchestratorView';
import { CharacterWithProductModal } from './components/CharacterWithProductModal';
import { ProjectBibleModal } from './components/ProjectBibleModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { RemixModal } from './components/RemixModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AlertTriangle, Key, Sparkles } from 'lucide-react';
import {
  AnalyticsData,
  AppSettings,
  CampaignFormData,
  Character,
  GenerationJob,
  MediaAsset,
  Product,
  ProjectBible,
  SavedVideoItem,
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [bible, setBible] = useState<ProjectBible | null>(null);
  const [queue, setQueue] = useState<GenerationJob[]>([]);
  const [library, setLibrary] = useState<SavedVideoItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);

  // Selected entities for cross-navigation
  const [selectedProductForStudio, setSelectedProductForStudio] = useState<Product | null>(null);
  const [selectedCharacterForStudio, setSelectedCharacterForStudio] = useState<Character | null>(null);
  const [characterWithProductInitialId, setCharacterWithProductInitialId] = useState<string | undefined>(undefined);

  // Modals
  const [isBibleModalOpen, setIsBibleModalOpen] = useState(false);
  const [isCharacterWithProductOpen, setIsCharacterWithProductOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<SavedVideoItem | null>(null);
  const [videoToRemix, setVideoToRemix] = useState<SavedVideoItem | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Initial fetch
  const fetchData = async () => {
    try {
      const [sRes, bRes, qRes, lRes, aRes, mRes, pRes, cRes] = await Promise.all([
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/bible').then((r) => r.json()),
        fetch('/api/queue/status').then((r) => r.json()),
        fetch('/api/library').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/media').then((r) => r.json()).catch(() => []),
        fetch('/api/products').then((r) => r.json()).catch(() => []),
        fetch('/api/characters').then((r) => r.json()).catch(() => []),
      ]);

      setSettings(sRes);
      setBible(bRes);
      if (qRes?.queue) setQueue(qRes.queue);
      if (Array.isArray(lRes)) setLibrary(lRes);
      setAnalytics(aRes);
      if (Array.isArray(mRes)) setMediaAssets(mRes);
      if (Array.isArray(pRes)) setProducts(pRes);
      if (Array.isArray(cRes)) setCharacters(cRes);

      // Trigger onboarding on first run if API is not set and onboarding never marked done
      if (sRes && !sRes.apiKeyConfigured && !sRes.hasEnvKey && !sRes.onboardingCompleted) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.warn('Initial data load:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll queue & library every 3 seconds
    const interval = setInterval(async () => {
      try {
        const [qRes, lRes, aRes] = await Promise.all([
          fetch('/api/queue/status').then((r) => r.json()),
          fetch('/api/library').then((r) => r.json()),
          fetch('/api/analytics').then((r) => r.json()),
        ]);
        if (qRes?.queue) setQueue(qRes.queue);
        if (Array.isArray(lRes)) setLibrary(lRes);
        setAnalytics(aRes);
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleGenerateBatch = async (campaign: CampaignFormData) => {
    try {
      const res = await fetch('/api/queue/enqueue-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign }),
      });
      const data = await res.json();
      if (data.jobs) {
        setQueue((prev) => [...data.jobs, ...prev]);
        setCurrentTab('queue');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao enfileirar campanha.');
    }
  };

  const handleGenerateTestVideo = async (campaign: CampaignFormData) => {
    try {
      const res = await fetch('/api/queue/test-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign }),
      });
      const data = await res.json();
      if (data.job) {
        setQueue((prev) => [data.job, ...prev]);
        setCurrentTab('queue');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar vídeo de teste.');
    }
  };

  const handlePauseQueue = async () => {
    await fetch('/api/queue/pause', { method: 'POST' });
  };

  const handleResumeQueue = async () => {
    await fetch('/api/queue/resume', { method: 'POST' });
  };

  const handleCancelAllQueue = async () => {
    await fetch('/api/queue/cancel-all', { method: 'POST' });
    const qRes = await fetch('/api/queue/status').then((r) => r.json());
    if (qRes?.queue) setQueue(qRes.queue);
  };

  const handleCancelJob = async (jobId: string) => {
    await fetch(`/api/queue/cancel/${jobId}`, { method: 'POST' });
    const qRes = await fetch('/api/queue/status').then((r) => r.json());
    if (qRes?.queue) setQueue(qRes.queue);
  };

  const handleClearCompleted = async () => {
    await fetch('/api/queue/clear-completed', { method: 'POST' });
    const qRes = await fetch('/api/queue/status').then((r) => r.json());
    if (qRes?.queue) setQueue(qRes.queue);
  };

  const handleDeleteVideo = async (id: string) => {
    await fetch(`/api/library/${id}`, { method: 'DELETE' });
    setLibrary((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveBible = async (newBible: ProjectBible) => {
    const res = await fetch('/api/bible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBible),
    });
    const saved = await res.json();
    setBible(saved);
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings> & { apiKey?: string }) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    const saved = await res.json();
    setSettings(saved);

    if (newSettings.apiKey && window.electronAPI?.saveApiKeySecurely) {
      await window.electronAPI.saveApiKeySecurely(newSettings.apiKey);
    }
  };

  const handleTestConnection = async (apiKey?: string) => {
    const res = await fetch('/api/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    if (data.success) {
      setSettings((prev) => (prev ? { ...prev, apiKeyConfigured: true } : null));
    }
    return data;
  };

  const handleConfirmRemix = async (remixData: {
    id: string;
    hook: string;
    action: string;
    dialogue: string;
    cta: string;
    style: string;
  }) => {
    const res = await fetch(`/api/videos/${remixData.id}/remix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(remixData),
    });
    const data = await res.json();
    if (data.newJob) {
      setQueue((prev) => [data.newJob, ...prev]);
      setCurrentTab('queue');
    }
  };

  const handlePlayVideoById = (jobId: string) => {
    const found = library.find((v) => v.jobId === jobId || v.id === jobId);
    if (found) {
      setVideoToPlay(found);
    } else {
      const qJob = queue.find((j) => j.id === jobId);
      if (qJob) {
        setVideoToPlay({
          id: `vid_${qJob.id}`,
          jobId: qJob.id,
          campaignId: qJob.campaignId,
          campaignName: qJob.campaignName,
          number: qJob.index,
          method: qJob.method,
          methodName: qJob.methodName,
          hook: qJob.hook,
          prompt: qJob.prompt,
          model: qJob.model,
          aspectRatio: qJob.aspectRatio,
          resolution: qJob.resolution,
          durationSeconds: qJob.durationSeconds,
          videoUrl: qJob.localVideoUrl || '/demo-preview.mp4',
          localPath: qJob.localVideoPath,
          status: 'ready',
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#070a10] text-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* Lateral Menu */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        queueCount={queue.filter((j) => j.status === 'generating' || j.status === 'polling').length}
        libraryCount={library.length}
        onOpenBible={() => setIsBibleModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          settings={settings}
          bible={bible}
          queue={queue}
          onOpenBible={() => setIsBibleModalOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* API Not Configured Notice Banner */}
        {settings && !settings.apiKeyConfigured && !settings.hasEnvKey && (
          <div className="mx-6 md:mx-8 mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/80 flex items-center justify-between gap-4 text-xs animate-fade-in shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-200">
                  Configure sua API para gerar vídeos reais.
                </p>
                <p className="text-amber-300/80 text-[11px] mt-0.5">
                  Você pode navegar livremente, cadastrar produtos, campanhas, roteiros, prompts, métodos de vendas e Project Bible.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/80 text-amber-200 font-semibold text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assistente</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('settings')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-md"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configurar API</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              settings={settings}
              analytics={analytics}
              queue={queue}
              library={library}
              bible={bible}
              onNavigate={setCurrentTab}
              onOpenTestVideoModal={() => setCurrentTab('campaign')}
              onPlayVideo={(v) => setVideoToPlay(v)}
            />
          )}

          {currentTab === 'campaign_orchestrator' && (
            <CampaignOrchestratorView
              onNavigateToQueue={() => setCurrentTab('queue')}
              onNavigateToJoiner={(paths) => setCurrentTab('video_joiner')}
              onNavigateToMultiplier={() => setCurrentTab('video_multiplier')}
              onNavigateToTikTokShop={() => setCurrentTab('tiktok_shop')}
              onNavigateToProducts={() => setCurrentTab('products')}
            />
          )}

          {currentTab === 'video_copier' && (
            <VideoCopierProView
              mediaAssets={mediaAssets}
              products={products}
              bible={bible}
              onNavigateToPromptStudio={() => setCurrentTab('prompt_studio')}
              onNavigateToQueue={() => setCurrentTab('queue')}
            />
          )}

          {currentTab === 'tiktok_factory' && (
            <TikTokSalesFactoryView
              products={products}
              characters={characters}
              bible={
                bible || {
                  productName: 'Produto TikTok Shop',
                  niche: 'E-commerce',
                  description: 'Produto de alta conversão para TikTok Shop',
                  targetAudience: 'Público engajado do TikTok',
                  pains: ['Dores comuns do dia a dia'],
                  desires: ['Resultados rápidos e fáceis'],
                  primaryBenefits: ['Praticidade e economia'],
                  secondaryBenefits: ['Durabilidade e estilo'],
                  differentials: ['Qualidade premium'],
                  commonObjections: ['Será que funciona?'],
                  objectionAnswers: ['Sim, com garantia oficial'],
                  visualStyle: 'UGC autêntico',
                  toneOfVoice: 'Espontâneo',
                  irresistibleOffer: 'Oferta especial na sacolinha',
                  ctaVariants: ['Toque na sacolinha amarela'],
                  lighting: 'Natural + Ring-light',
                  materials: 'Premium',
                  colors: 'Vibrantes',
                  forbiddenTerms: ['Falso', 'Golpe'],
                  defaultHashtags: ['#tiktokshop', '#viral'],
                }
              }
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'live_factory' && (
            <LiveSalesFactoryView
              products={products}
              bible={
                bible || {
                  productName: 'Produto TikTok Shop',
                  niche: 'E-commerce',
                  description: 'Produto de alta conversão para TikTok Shop',
                  targetAudience: 'Público engajado do TikTok',
                  pains: ['Dores comuns do dia a dia'],
                  desires: ['Resultados rápidos e fáceis'],
                  primaryBenefits: ['Praticidade e economia'],
                  secondaryBenefits: ['Durabilidade e estilo'],
                  differentials: ['Qualidade premium'],
                  commonObjections: ['Será que funciona?'],
                  objectionAnswers: ['Sim, com garantia oficial'],
                  visualStyle: 'Live enérgica',
                  toneOfVoice: 'Espontâneo e acolhedor',
                  irresistibleOffer: 'Oferta especial de Live',
                  ctaVariants: ['Toque na sacolinha amarela'],
                  lighting: 'Ring-light frontal',
                  materials: 'Premium',
                  colors: 'Vibrantes',
                  forbiddenTerms: [],
                  defaultHashtags: ['#tiktoklive', '#tiktokshop'],
                }
              }
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'tiktok_shop' && (
            <TikTokShopCenterView
              products={products}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'media' && (
            <MediaCenterView />
          )}

          {currentTab === 'video_joiner' && (
            <VideoJoinerProView
              mediaAssets={mediaAssets}
              onNavigateToQueue={() => setCurrentTab('queue')}
              onRefreshMedia={fetchData}
            />
          )}

          {currentTab === 'video_multiplier' && (
            <VideoMultiplierView
              mediaAssets={mediaAssets}
              onNavigateToQueue={() => setCurrentTab('queue')}
              onRefreshMedia={fetchData}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              onSelectProductForCampaign={(prod) => {
                setCurrentTab('campaign');
              }}
              onSelectProductForPromptStudio={(prod) => {
                setSelectedProductForStudio(prod);
                setCurrentTab('prompt_studio');
              }}
              onOpenCharacterWithProduct={(productId) => {
                setCharacterWithProductInitialId(productId);
                setIsCharacterWithProductOpen(true);
              }}
            />
          )}

          {currentTab === 'characters' && (
            <CharactersView
              onSelectCharacterForPromptStudio={(char) => {
                setSelectedCharacterForStudio(char);
                setCurrentTab('prompt_studio');
              }}
              onOpenCharacterWithProduct={(characterId) => {
                setCharacterWithProductInitialId(characterId);
                setIsCharacterWithProductOpen(true);
              }}
            />
          )}

          {currentTab === 'prompt_studio' && (
            <PromptStudioProView
              initialProduct={selectedProductForStudio}
              initialCharacter={selectedCharacterForStudio}
              onEnqueueJob={(prompt, title, product, model, ratio) => {
                // Trigger enqueuing
                setCurrentTab('queue');
              }}
              onOpenCharacterWithProduct={(productId) => {
                setCharacterWithProductInitialId(productId);
                setIsCharacterWithProductOpen(true);
              }}
            />
          )}

          {currentTab === 'campaign' && (
            <CreateCampaignView
              settings={settings}
              bible={bible}
              onGenerateBatch={handleGenerateBatch}
              onGenerateTestVideo={handleGenerateTestVideo}
              onOpenBible={() => setIsBibleModalOpen(true)}
            />
          )}

          {currentTab === 'methods' && (
            <SalesMethodsView
              onSelectMethodForCampaign={() => setCurrentTab('campaign')}
            />
          )}

          {currentTab === 'queue' && (
            <QueueView
              queue={queue}
              onPause={handlePauseQueue}
              onResume={handleResumeQueue}
              onCancelAll={handleCancelAllQueue}
              onCancelJob={handleCancelJob}
              onClearCompleted={handleClearCompleted}
              onPlayVideoById={handlePlayVideoById}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              library={library}
              onPlayVideo={(v) => setVideoToPlay(v)}
              onRemixVideo={(v) => setVideoToRemix(v)}
              onDeleteVideo={handleDeleteVideo}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              bible={bible}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onTestConnection={handleTestConnection}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CharacterWithProductModal
        isOpen={isCharacterWithProductOpen}
        onClose={() => {
          setIsCharacterWithProductOpen(false);
          setCharacterWithProductInitialId(undefined);
        }}
        initialProductId={characterWithProductInitialId}
        initialCharacterId={characterWithProductInitialId}
        onEnqueueJob={async (prompt, title, product) => {
          try {
            await fetch('/api/prompt-studio/enqueue-direct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt,
                title,
                product,
              }),
            });
            setCurrentTab('queue');
          } catch (e) {}
        }}
      />

      <ProjectBibleModal
        isOpen={isBibleModalOpen}
        bible={bible}
        onClose={() => setIsBibleModalOpen(false)}
        onSave={handleSaveBible}
      />

      <VideoPlayerModal
        video={videoToPlay}
        onClose={() => setVideoToPlay(null)}
        onRemix={(v) => setVideoToRemix(v)}
      />

      <RemixModal
        video={videoToRemix}
        onClose={() => setVideoToRemix(null)}
        onConfirmRemix={handleConfirmRemix}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        settings={settings}
        onComplete={() => {
          setIsOnboardingOpen(false);
          handleSaveSettings({ onboardingCompleted: true });
        }}
        onSaveApiKey={async (key: string) => {
          await handleSaveSettings({ apiKey: key } as any);
        }}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
}
export default App;
