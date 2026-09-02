import React, { useState } from 'react';
import {
  Key,
  CheckCircle2,
  FolderPlus,
  Video,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import { AppSettings } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  settings: AppSettings | null;
  onComplete: () => void;
  onSaveApiKey: (key: string) => Promise<void>;
  onTestConnection: (key?: string) => Promise<any>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  settings,
  onComplete,
  onSaveApiKey,
  onTestConnection,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveOnly = async () => {
    if (!apiKeyInput.trim()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveApiKey(apiKeyInput.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (apiKeyInput.trim()) {
      setIsSaving(true);
      try {
        await onSaveApiKey(apiKeyInput.trim());
      } finally {
        setIsSaving(false);
      }
    }
    setStep(2);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(apiKeyInput.trim() || undefined);
      setTestResult(res);
      if (res.success) {
        setTimeout(() => setStep(3), 1500);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Falha ao testar conexão com a API do Google.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-8 space-y-6">
        {/* Glowing aura */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VEO AUTO STUDIO</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Bem-vindo ao seu estúdio de criação de vídeos.
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Sua central autônoma para criação em lote de vídeos de vendas com inteligência artificial oficial do Google Veo e Gemini.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { num: 1, label: 'Etapa 1: Configurar API', icon: Key },
            { num: 2, label: 'Etapa 2: Testar Conexão', icon: CheckCircle2 },
            { num: 3, label: 'Etapa 3: Criar Projeto', icon: FolderPlus },
            { num: 4, label: 'Etapa 4: Gerar Vídeo', icon: Video },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isActive
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/40'
                    : isDone
                    ? 'bg-slate-950/60 border-emerald-800 text-emerald-400'
                    : 'bg-slate-950/30 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-bold truncate">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">CONFIGURAR GOOGLE AI</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    O aplicativo utiliza a API oficial do Google Veo. Sua chave é salva localmente com criptografia e nunca é exposta.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold flex items-center justify-between text-[11px]">
                  <span>API KEY</span>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Obter chave no AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="******************************"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveOnly}
                    disabled={isSaving || !apiKeyInput.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/60 font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'SALVAR API KEY'}
                  </button>
                  {saveSuccess && (
                    <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Chave salva localmente com sucesso!
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300/90 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Você pode continuar sem chave de API para estruturar produtos, roteiros e Project Bible, configurando a chave mais tarde.
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">TESTAR CONEXÃO</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Validar se sua chave possui acesso aos modelos oficiais do Google Veo e Gemini.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 space-y-3">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg"
                >
                  <Zap className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Validando Conexão...' : 'TESTAR CONEXÃO'}</span>
                </button>

                {/* Status indicator */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span>Status:</span>
                  {testResult === null ? (
                    <span className="text-slate-500">⚪ Aguardando teste</span>
                  ) : testResult.success ? (
                    <span className="text-emerald-400 flex items-center gap-1">🟢 Conectado</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">🔴 Não conectado</span>
                  )}
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-[11px] ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800 text-rose-300'
                  }`}
                >
                  <p className="font-bold">{testResult.message}</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-950/80 border border-pink-800 flex items-center justify-center text-pink-400 shrink-0">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Project Bible & Consistência de Marca</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    O Veo Auto Studio utiliza um livro de regras de marca (cores, materiais, slogan e regras negativas) que é injetado automaticamente em cada prompt para que todos os 75 vídeos mantenham identidade consistente.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300 text-[11px]">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Injeção Automática de Prompts Profissionais</span>
                </div>
                <p>
                  Você pode preencher o Project Bible a qualquer momento pelo menu superior ou criar campanhas diretas selecionando entre os 40+ métodos de vendas.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Tudo Pronto Para Gerar Criativos</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Você pode começar com 1 vídeo de teste para validar o estilo ou disparar um lote completo de até 75 vídeos automatizados com controle inteligente de fila.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800 text-cyan-200 text-[11px] flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  O aplicativo opera totalmente no seu desktop. Conexão com a internet é necessária apenas para a comunicação direta com a API do Google Veo.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev))}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium text-xs transition-colors"
            >
              Voltar
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Pular assistente
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1) handleSaveAndNext();
                else setStep((prev) => ((prev + 1) as any));
              }}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md"
            >
              <span>{step === 1 ? 'Salvar e Avançar' : 'Avançar'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-cyan-950/50"
            >
              <span>COMEÇAR</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
