import React, { useState } from 'react';
import {
  Settings,
  Key,
  ShieldCheck,
  Cpu,
  Folder,
  Sliders,
  Check,
  AlertCircle,
  Save,
  Radio,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings | null;
  onSaveSettings: (settings: Partial<AppSettings> & { apiKey?: string }) => Promise<void>;
  onTestConnection: (apiKey?: string) => Promise<{ success: boolean; message: string; modelsAvailable?: string[] }>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onTestConnection,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(settings?.selectedModel || 'veo-3.1-lite-generate-preview');
  const [outputDirectory, setOutputDirectory] = useState(settings?.outputDirectory || '');
  const [maxConcurrency, setMaxConcurrency] = useState(settings?.maxConcurrency || 1);
  const [maxRetries, setMaxRetries] = useState(settings?.maxRetries || 3);
  const [demoMode, setDemoMode] = useState(settings?.demoMode || false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; modelsAvailable?: string[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isConnected = settings?.apiKeyConfigured || settings?.hasEnvKey;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings({
        apiKey: apiKeyInput.trim() || undefined,
        selectedModel,
        outputDirectory,
        maxConcurrency,
        maxRetries,
        demoMode,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(apiKeyInput.trim() || undefined);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Falha ao testar conexão.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSelectFolder = async () => {
    if (window.electronAPI?.selectDirectory) {
      const selected = await window.electronAPI.selectDirectory();
      if (selected) {
        setOutputDirectory(selected);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* View Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Painel de Integração & Preferências</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Configurações do Veo Auto Studio
        </h2>
        <p className="text-xs text-slate-400">
          Gerencie sua chave de API oficial, modelos padrão, pastas de destino e limites de concorrência.
        </p>
      </div>

      {/* 1. API Integration Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Chave de API Oficial Google Veo / Gemini</h3>
              <p className="text-[11px] text-slate-400">
                Processada exclusivamente no processo principal / backend local seguro.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                isConnected
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300 animate-pulse'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isConnected ? '🟢 API Conectada' : '🔴 Não Configurada'}</span>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Google AI Studio API Key
          </label>
          <div className="relative">
            <input
              id="input-api-key"
              type="password"
              placeholder={isConnected ? '••••••••••••••••••••••••••••••••••••••••' : 'AIzaSy...'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-500">
            Obtenha sua chave gratuita ou profissional em{' '}
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
            >
              aistudio.google.com <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Action Buttons for API */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id="btn-save-api-key"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-950"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? 'Salvo com Sucesso!' : isSaving ? 'Salvando...' : 'Salvar API'}</span>
          </button>

          <button
            id="btn-test-connection"
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <Radio className={`w-4 h-4 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Validando...' : 'Testar Conexão'}</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs space-y-2 border ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {testResult.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
            {testResult.modelsAvailable && (
              <div className="pt-2 border-t border-emerald-800/40 flex flex-wrap gap-1.5 text-[10px]">
                <span className="text-slate-400">Modelos verificados:</span>
                {testResult.modelsAvailable.map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-200 font-mono">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Models & Engine Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Modelos do Google Veo</h3>
            <p className="text-[11px] text-slate-400">Selecione a versão padrão da engine de geração.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'veo-3.1-lite-generate-preview',
              name: 'Veo 3.1 Lite',
              desc: 'Geração ultra-rápida e otimizada para anúncios curtos em escala.',
              recommended: true,
            },
            {
              id: 'veo-3.1-generate-preview',
              name: 'Veo 3.1 High Quality',
              desc: 'Máxima resolução, textura e detalhes cinematográficos.',
              recommended: false,
            },
            {
              id: 'veo-2.0-generate-001',
              name: 'Veo 2.0 Stable',
              desc: 'Versão legada com suporte estável padrão.',
              recommended: false,
            },
          ].map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 ${
                selectedModel === model.id
                  ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-950'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{model.name}</span>
                {model.recommended && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{model.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Output Directory & Concurrency Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pasta de Saída & Desempenho Local</h3>
            <p className="text-[11px] text-slate-400">
              Onde as campanhas, vídeos .mp4, prompts e roteiros serão gravados.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Diretório de Armazenamento das Campanhas
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={outputDirectory}
                onChange={(e) => setOutputDirectory(e.target.value)}
                placeholder="Veo Auto Studio/Campanhas/"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>Procurar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Concorrência Máxima (Tarefas Simultâneas)
              </label>
              <select
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value={1}>1 tarefa por vez (Recomendado para estabilidade)</option>
                <option value={2}>2 tarefas simultâneas</option>
                <option value={3}>3 tarefas simultâneas (Alto tráfego)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Máximo de Retentativas em Falha
              </label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value={1}>1 tentativa</option>
                <option value={3}>3 tentativas (com Exponential Backoff)</option>
                <option value={5}>5 tentativas</option>
              </select>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Modo de Demonstração (Demo Mode)</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Permite testar todos os fluxos da interface e fila sem consumir créditos da API do Veo.
              </p>
            </div>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-black transition-all shadow-xl shadow-cyan-950 hover:scale-[1.02]"
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'CONFIGURAÇÕES SALVAS!' : 'SALVAR TODAS AS CONFIGURAÇÕES'}</span>
        </button>
      </div>
    </div>
  );
};
