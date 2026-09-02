import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { veoProvider } from '../providers/VeoProvider';
import { processVideoJoin } from './videoProcessor';
import { matrixItemToJoinerConfig } from './videoMultiplier';
import {
  CampaignFormData,
  GeneratedScript,
  GenerationJob,
  SavedVideoItem,
  VideoJoinerConfig,
  MultiplierConfig,
  MultiplierMatrixItem,
  MediaAsset,
} from '../../src/types';

export class QueueManager {
  private isProcessing = false;
  private isPaused = false;
  private activeJobsCount = 0;

  constructor() {
    // Resume queue if any pending jobs were interrupted
    setTimeout(() => {
      this.processNext();
    }, 2000);
  }

  public getQueue(): GenerationJob[] {
    return db.getQueue();
  }

  public enqueueBatch(campaign: CampaignFormData, scripts: GeneratedScript[]): GenerationJob[] {
    const settings = db.getSettings();
    const newJobs: GenerationJob[] = scripts.map((script, idx) => ({
      id: `job_${Date.now()}_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`,
      jobOrigin: 'AI_GENERATION',
      campaignId: campaign.id || `camp_${Date.now()}`,
      campaignName: campaign.name || campaign.product || 'Campanha',
      scriptId: script.id,
      index: idx + 1,
      totalInBatch: scripts.length,
      method: script.method,
      methodName: script.methodName,
      hook: script.hook,
      prompt: script.veoPrompt,
      model: campaign.selectedModel || settings.selectedModel,
      aspectRatio: campaign.aspectRatio || '9:16',
      resolution: campaign.resolution || '720p',
      durationSeconds: 8,
      status: 'waiting',
      progress: 0,
      attempts: 0,
      maxAttempts: settings.maxRetries || 3,
      createdAt: new Date().toISOString(),
    }));

    db.addQueueJobs(newJobs);
    db.log('info', `Enfileirados ${newJobs.length} vídeos para geração na campanha "${campaign.name}"`);

    this.processNext();
    return newJobs;
  }

  public enqueueVideoJoin(config: VideoJoinerConfig, campaignName = 'Juntador de Vídeos'): GenerationJob {
    const settings = db.getSettings();
    const jobId = `job_join_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const job: GenerationJob = {
      id: jobId,
      jobOrigin: 'LOCAL_VIDEO_PROCESSING',
      campaignId: `join_${Date.now()}`,
      campaignName,
      scriptId: `join_script_${Date.now()}`,
      index: 1,
      totalInBatch: 1,
      method: 'custom_method',
      methodName: 'Juntador de Vídeos Pro',
      hook: config.title || 'Vídeo Composto',
      prompt: `Junção profissional de ${config.clips.length} clipes com formato ${config.aspectRatio} e preset ${config.preset}`,
      model: 'FFmpeg Local Engine',
      aspectRatio: config.aspectRatio,
      resolution: config.resolution,
      durationSeconds: config.targetDurationSeconds || 15,
      status: 'waiting',
      progress: 0,
      attempts: 0,
      maxAttempts: 2,
      createdAt: new Date().toISOString(),
      joinConfig: config,
    };

    db.addQueueJobs([job]);
    db.log('info', `Enfileirada renderização local do vídeo "${config.title}" (${config.clips.length} clipes)`);
    this.processNext();
    return job;
  }

  public enqueueMultiplierBatch(
    multiplierConfig: MultiplierConfig,
    selectedItems: MultiplierMatrixItem[]
  ): GenerationJob[] {
    const settings = db.getSettings();
    const campaignId = `mult_${Date.now()}`;
    const newJobs: GenerationJob[] = selectedItems.map((item, idx) => {
      const joinConfig = matrixItemToJoinerConfig(item, multiplierConfig);
      return {
        id: `job_mult_${Date.now()}_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`,
        jobOrigin: 'LOCAL_VIDEO_PROCESSING',
        campaignId,
        campaignName: multiplierConfig.campaignName || 'Multiplicador de Vídeos',
        scriptId: `mult_item_${item.id}`,
        index: idx + 1,
        totalInBatch: selectedItems.length,
        method: 'custom_method',
        methodName: `Multiplicador [${item.id}]`,
        hook: `Hook: ${item.hookBlock.label} | CTA: ${item.ctaBlock.label}`,
        prompt: `Combinação ${item.id}: [INÍCIO] ${item.hookBlock.label} + [MEIO] ${item.bodyBlock.label} + [FINAL] ${item.ctaBlock.label}`,
        model: 'FFmpeg Local Engine',
        aspectRatio: multiplierConfig.aspectRatio || '9:16',
        resolution: multiplierConfig.resolution || '720p',
        durationSeconds: item.estimatedDurationSeconds || 10,
        status: 'waiting',
        progress: 0,
        attempts: 0,
        maxAttempts: 2,
        createdAt: new Date().toISOString(),
        joinConfig,
        multiplierMetadata: {
          variationId: item.id,
          hookName: item.hookBlock.label,
          bodyName: item.bodyBlock.label,
          ctaName: item.ctaBlock.label,
          hookSource: item.hookBlock.filePath,
          bodySource: item.bodyBlock.filePath,
          ctaSource: item.ctaBlock.filePath,
        },
      };
    });

    db.addQueueJobs(newJobs);
    db.log(
      'info',
      `Enfileirados ${newJobs.length} vídeos gerados pelo Multiplicador de Vídeos na campanha "${multiplierConfig.campaignName}"`
    );
    this.processNext();
    return newJobs;
  }

  public async createSingleTestJob(campaign: CampaignFormData, script: GeneratedScript): Promise<GenerationJob> {
    const settings = db.getSettings();
    const testJob: GenerationJob = {
      id: `job_test_${Date.now()}`,
      jobOrigin: 'AI_GENERATION',
      campaignId: campaign.id || 'camp_test',
      campaignName: `[TESTE] ${campaign.name || campaign.product}`,
      scriptId: script.id,
      index: 1,
      totalInBatch: 1,
      method: script.method,
      methodName: script.methodName,
      hook: script.hook,
      prompt: script.veoPrompt,
      model: campaign.selectedModel || settings.selectedModel,
      aspectRatio: campaign.aspectRatio || '9:16',
      resolution: campaign.resolution || '720p',
      durationSeconds: 5,
      status: 'waiting',
      progress: 0,
      attempts: 0,
      maxAttempts: 2,
      createdAt: new Date().toISOString(),
    };

    db.addQueueJobs([testJob]);
    this.processNext();
    return testJob;
  }

  public pauseQueue() {
    this.isPaused = true;
    db.log('info', 'Fila de processamento pausada pelo usuário.');
  }

  public resumeQueue() {
    this.isPaused = false;
    db.log('info', 'Fila de processamento retomada pelo usuário.');
    this.processNext();
  }

  public cancelJob(jobId: string) {
    db.updateQueueJob(jobId, { status: 'cancelled', progress: 0 });
    db.log('info', `Job ${jobId} cancelado.`);
    this.processNext();
  }

  public cancelAll() {
    const queue = db.getQueue();
    queue.forEach((j) => {
      if (j.status === 'waiting' || j.status === 'generating' || j.status === 'polling') {
        j.status = 'cancelled';
      }
    });
    db.setQueue(queue);
    db.log('info', 'Todos os jobs pendentes da fila foram cancelados.');
  }

  public clearCompleted() {
    const queue = db.getQueue().filter((j) => j.status !== 'completed' && j.status !== 'cancelled');
    db.setQueue(queue);
  }

  public async processNext() {
    if (this.isPaused) return;

    const settings = db.getSettings();
    const maxConcurrency = settings.maxConcurrency || 1;

    if (this.activeJobsCount >= maxConcurrency) {
      return;
    }

    const queue = db.getQueue();
    const nextJob = queue.find((j) => j.status === 'waiting');

    if (!nextJob) {
      return;
    }

    this.activeJobsCount++;
    this.executeJob(nextJob)
      .catch((err) => {
        console.error('Job execution unhandled error:', err);
      })
      .finally(() => {
        this.activeJobsCount--;
        this.processNext();
      });
  }

  private async executeJob(job: GenerationJob) {
    const settings = db.getSettings();
    const campaignDir = this.ensureCampaignFolders(job.campaignName);

    // -------------------------------------------------------------
    // BRANCH A: LOCAL VIDEO PROCESSING (JOINER & MULTIPLIER)
    // -------------------------------------------------------------
    if (job.jobOrigin === 'LOCAL_VIDEO_PROCESSING' || job.joinConfig) {
      try {
        db.updateQueueJob(job.id, {
          status: 'generating',
          startedAt: new Date().toISOString(),
          attempts: job.attempts + 1,
          progress: 5,
        });

        db.log('info', `[LOCAL PROCESSOR] Iniciando renderização do Job #${job.index} (${job.hook})`);

        const joinResult = await processVideoJoin(
          job.joinConfig!,
          campaignDir.videos,
          (percent, stepText) => {
            db.updateQueueJob(job.id, {
              progress: percent,
              status: 'generating',
            });
            if (percent % 25 === 0) {
              db.log('info', `[Job #${job.index}] ${stepText}`);
            }
          }
        );

        const localVideoUrl = `/api/videos/${job.id}/stream`;

        db.updateQueueJob(job.id, {
          status: 'completed',
          progress: 100,
          localVideoPath: joinResult.outputPath,
          localVideoUrl,
          durationSeconds: joinResult.durationSeconds || job.durationSeconds,
          completedAt: new Date().toISOString(),
        });

        // Add to Library
        const libraryItem: SavedVideoItem = {
          id: `vid_${job.id}`,
          jobId: job.id,
          campaignId: job.campaignId,
          campaignName: job.campaignName,
          number: job.index,
          method: job.method,
          methodName: job.methodName,
          hook: job.hook,
          prompt: job.prompt,
          model: job.model,
          aspectRatio: job.aspectRatio,
          resolution: job.resolution,
          durationSeconds: joinResult.durationSeconds || job.durationSeconds,
          videoUrl: localVideoUrl,
          localPath: joinResult.outputPath,
          fileSizeBytes: joinResult.fileSizeBytes,
          status: 'ready',
          createdAt: new Date().toISOString(),
          scriptSummary: {
            dialogue: job.hook,
            action: job.multiplierMetadata
              ? `Multiplicação: [INÍCIO] ${job.multiplierMetadata.hookName} + [MEIO] ${job.multiplierMetadata.bodyName} + [FINAL] ${job.multiplierMetadata.ctaName}`
              : `Junção de ${job.joinConfig?.clips.length || 0} clipes`,
            cta: job.multiplierMetadata ? job.multiplierMetadata.ctaName : 'Vídeo Concluído',
          },
        };
        db.addToLibrary(libraryItem);

        // Also add to Central de Mídia as VIDEO asset so user can re-use it immediately
        const mediaAsset: MediaAsset = {
          id: `media_${job.id}`,
          name: path.basename(joinResult.outputPath),
          originalFileName: path.basename(joinResult.outputPath),
          type: 'VIDEO',
          mimeType: 'video/mp4',
          sizeBytes: joinResult.fileSizeBytes,
          filePath: joinResult.outputPath,
          relativeUrl: localVideoUrl,
          durationSeconds: joinResult.durationSeconds,
          tags: ['exportado', job.methodName.toLowerCase(), job.aspectRatio],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.addMedia(mediaAsset);

        db.log('info', `Job #${job.index} (${job.hook}) renderizado e catalogado com sucesso.`);
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        db.log('error', `Falha no processamento do Job #${job.index}: ${errMsg}`);
        db.updateQueueJob(job.id, {
          status: 'error',
          errorMessage: errMsg,
          errorSolution: 'Verifique se os clipes de vídeo originais ainda existem no disco e estão acessíveis.',
        });
      }
      return;
    }

    // -------------------------------------------------------------
    // BRANCH B: AI GENERATION (GEMINI / VEO API)
    // -------------------------------------------------------------
    const isDemoMode = settings.demoMode || !settings.apiKeyConfigured;

    db.updateQueueJob(job.id, {
      status: 'generating',
      startedAt: new Date().toISOString(),
      attempts: job.attempts + 1,
      progress: 10,
    });

    // Save prompt & script files
    try {
      const promptFile = path.join(
        campaignDir.prompts,
        `Prompt_${String(job.index).padStart(3, '0')}_${job.method}.txt`
      );
      fs.writeFileSync(promptFile, job.prompt, 'utf-8');
    } catch (e) {
      console.warn('Failed to write prompt file:', e);
    }

    if (isDemoMode) {
      db.log('info', `[DEMO MODE] Simulando fluxo da fila para o Job #${job.index} (${job.methodName})`);
      for (let p = 15; p <= 95; p += 15) {
        if (this.isPaused) break;
        await new Promise((r) => setTimeout(r, 1200));
        db.updateQueueJob(job.id, {
          progress: p,
          status: p < 50 ? 'generating' : 'polling',
        });
      }

      db.updateQueueJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        errorMessage: undefined,
      });

      const libraryItem: SavedVideoItem = {
        id: `vid_${job.id}`,
        jobId: job.id,
        campaignId: job.campaignId,
        campaignName: job.campaignName,
        number: job.index,
        method: job.method,
        methodName: job.methodName,
        hook: job.hook,
        prompt: job.prompt,
        model: job.model,
        aspectRatio: job.aspectRatio,
        resolution: job.resolution,
        durationSeconds: job.durationSeconds,
        videoUrl: '/demo-preview.mp4',
        localPath: path.join(campaignDir.videos, `Video_${String(job.index).padStart(3, '0')}_${job.method}.mp4`),
        status: 'ready',
        createdAt: new Date().toISOString(),
        scriptSummary: {
          dialogue: job.hook,
          action: 'Demonstração de produto em modo de demonstração',
          cta: 'Oferta Especial',
        },
      };
      db.addToLibrary(libraryItem);

      // Sync with Orchestrated Creatives if linked
      const matchedCreative = db.getCampaignCreatives().find((c) => c.jobId === job.id);
      if (matchedCreative) {
        matchedCreative.status = 'READY';
        matchedCreative.videoFilePath = libraryItem.localPath;
        matchedCreative.videoUrl = libraryItem.videoUrl;
        db.saveCampaignCreative(matchedCreative);

        // Update campaign overview metrics
        const camp = db.getOrchestratedCampaignById(matchedCreative.campaignId);
        if (camp) {
          const allCreatives = db.getCampaignCreatives(camp.id);
          const readyCount = allCreatives.filter((c) => c.status === 'READY' || c.status === 'READY_TO_PUBLISH').length;
          camp.overviewMetrics.readyCount = readyCount;
          camp.overviewMetrics.generatedCount = readyCount;
          camp.overviewMetrics.progressPercentage = Math.round((readyCount / Math.max(1, camp.overviewMetrics.plannedCount)) * 100);
          if (readyCount >= camp.overviewMetrics.plannedCount) {
            camp.status = 'COMPLETED';
          }
          db.saveOrchestratedCampaign(camp);
        }
      }

      return;
    }

    try {
      db.log('info', `Iniciando geração real no Veo para Job #${job.index}`);

      const genResult = await veoProvider.generateVideo({
        prompt: job.prompt,
        model: job.model,
        aspectRatio: job.aspectRatio,
        resolution: job.resolution,
        durationSeconds: job.durationSeconds,
      });

      db.updateQueueJob(job.id, {
        operationName: genResult.operationName,
        status: 'polling',
        progress: 25,
      });

      const maxPollAttempts = 120;
      let pollCount = 0;
      let completedVideoUri = '';

      while (pollCount < maxPollAttempts) {
        if (this.isPaused) {
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        await new Promise((r) => setTimeout(r, 5000));
        pollCount++;

        const currentProgress = Math.min(90, 25 + Math.floor((pollCount / maxPollAttempts) * 65));
        db.updateQueueJob(job.id, { progress: currentProgress });

        const statusRes = await veoProvider.checkOperationStatus(genResult.operationName);

        if (statusRes.done) {
          if (statusRes.error) {
            throw new Error(`Veo Engine Error: ${statusRes.error}`);
          }
          if (statusRes.videoUri) {
            completedVideoUri = statusRes.videoUri;
            break;
          }
        }
      }

      if (!completedVideoUri) {
        throw new Error('A operação de geração do Veo expirou o tempo limite de espera.');
      }

      db.updateQueueJob(job.id, { status: 'saving', progress: 92 });

      const videoFileName = `Video_${String(job.index).padStart(3, '0')}_${job.method}_${Date.now()}.mp4`;
      const localFilePath = path.join(campaignDir.videos, videoFileName);

      await veoProvider.downloadVideo(completedVideoUri, localFilePath);

      const localVideoUrl = `/api/videos/${job.id}/stream`;

      db.updateQueueJob(job.id, {
        status: 'completed',
        progress: 100,
        videoUri: completedVideoUri,
        localVideoPath: localFilePath,
        localVideoUrl,
        completedAt: new Date().toISOString(),
      });

      db.updateSettings({ testVideoVerified: true });

      const libraryItem: SavedVideoItem = {
        id: `vid_${job.id}`,
        jobId: job.id,
        campaignId: job.campaignId,
        campaignName: job.campaignName,
        number: job.index,
        method: job.method,
        methodName: job.methodName,
        hook: job.hook,
        prompt: job.prompt,
        model: job.model,
        aspectRatio: job.aspectRatio,
        resolution: job.resolution,
        durationSeconds: job.durationSeconds,
        videoUrl: localVideoUrl,
        localPath: localFilePath,
        status: 'ready',
        createdAt: new Date().toISOString(),
        scriptSummary: {
          dialogue: job.hook,
          action: 'Apresentação comercial de alta conversão',
          cta: 'Chamada para ação',
        },
      };
      db.addToLibrary(libraryItem);
      db.log('info', `Job #${job.index} concluído e salvo na biblioteca.`);

      // Sync with Orchestrated Creatives if linked
      const matchedCreative = db.getCampaignCreatives().find((c) => c.jobId === job.id);
      if (matchedCreative) {
        matchedCreative.status = 'READY';
        matchedCreative.videoFilePath = libraryItem.localPath;
        matchedCreative.videoUrl = libraryItem.videoUrl;
        db.saveCampaignCreative(matchedCreative);

        // Update campaign overview metrics
        const camp = db.getOrchestratedCampaignById(matchedCreative.campaignId);
        if (camp) {
          const allCreatives = db.getCampaignCreatives(camp.id);
          const readyCount = allCreatives.filter((c) => c.status === 'READY' || c.status === 'READY_TO_PUBLISH').length;
          camp.overviewMetrics.readyCount = readyCount;
          camp.overviewMetrics.generatedCount = readyCount;
          camp.overviewMetrics.progressPercentage = Math.round((readyCount / Math.max(1, camp.overviewMetrics.plannedCount)) * 100);
          if (readyCount >= camp.overviewMetrics.plannedCount) {
            camp.status = 'COMPLETED';
          }
          db.saveOrchestratedCampaign(camp);
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      db.log('error', `Falha no Job #${job.index}: ${errMsg}`);

      const errorFile = path.join(campaignDir.errors, `Error_${String(job.index).padStart(3, '0')}.txt`);
      try {
        fs.writeFileSync(
          errorFile,
          `Timestamp: ${new Date().toISOString()}\nJob ID: ${job.id}\nPrompt: ${job.prompt}\nError: ${errMsg}`,
          'utf-8'
        );
      } catch (e) {}

      if (job.attempts < job.maxAttempts) {
        const delay = Math.pow(2, job.attempts) * 3000;
        db.updateQueueJob(job.id, {
          status: 'waiting',
          progress: 0,
          errorMessage: `Tentativa ${job.attempts} falhou. Re-tentando em ${delay / 1000}s... (${errMsg})`,
        });
        await new Promise((r) => setTimeout(r, delay));
      } else {
        db.updateQueueJob(job.id, {
          status: 'error',
          errorMessage: errMsg,
          errorSolution: this.getErrorSolution(errMsg),
        });
      }
    }
  }

  private ensureCampaignFolders(campaignName: string): {
    root: string;
    videos: string;
    prompts: string;
    roteiros: string;
    errors: string;
  } {
    const settings = db.getSettings();
    const safeName = (campaignName || 'Campanha_Padrao').replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim();
    const base = settings.outputDirectory || path.join(process.cwd(), 'Veo Auto Studio', 'Campanhas');
    const root = path.join(base, safeName);
    const videos = path.join(root, 'Videos');
    const prompts = path.join(root, 'Prompts');
    const roteiros = path.join(root, 'Roteiros');
    const errors = path.join(root, 'Erros');

    [root, videos, prompts, roteiros, errors].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    return { root, videos, prompts, roteiros, errors };
  }

  private getErrorSolution(error: string): string {
    if (error.includes('API_KEY') || error.includes('401') || error.includes('não está configurada')) {
      return 'Acesse Configurações → Integração e insira uma Google Gemini/Veo API Key válida.';
    }
    if (error.includes('RESOURCE_EXHAUSTED') || error.includes('429')) {
      return 'Limite de taxa excedido. O sistema re-tentará automaticamente com exponential backoff.';
    }
    if (error.includes('BILLING_NOT_ENABLED')) {
      return 'O modelo Veo exige um projeto com faturamento no Google Cloud Console.';
    }
    return 'Verifique sua conexão com a internet ou os arquivos de entrada.';
  }
}

export const queueManager = new QueueManager();
