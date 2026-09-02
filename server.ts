import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { veoProvider } from './server/providers/VeoProvider';
import { salesScriptEngine } from './server/services/salesScriptEngine';
import { methodRecommender } from './server/services/methodRecommender';
import { queueManager } from './server/services/queueManager';
import { resolveFFmpegPaths } from './server/services/ffmpegResolver';
import { probeMedia, extractAudioFromVideo } from './server/services/videoProcessor';
import { calculateMultiplierMatrix } from './server/services/videoMultiplier';
import { SALES_METHODS } from './src/data/salesMethods';
import { tikTokScriptEngine } from './server/services/tiktokScriptEngine';
import { liveSalesEngine } from './server/services/liveSalesEngine';
import { tikTokIntegrationService } from './server/services/tiktokIntegrationService';
import { transcriptionProvider } from './server/services/transcriptionProvider';
import { videoCopyAnalyzer } from './server/services/videoCopyAnalyzer';
import { campaignOrchestratorEngine } from './server/services/campaignOrchestratorEngine';
import { VideoAnalysisItem, OrchestratedCampaign, CampaignCreativeItem } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API ROUTES ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    const settings = db.getSettings();
    res.json(settings);
  });

  app.post('/api/settings', (req, res) => {
    const { apiKey, selectedModel, outputDirectory, maxConcurrency, maxRetries, defaultAspectRatio, defaultResolution, demoMode } = req.body;

    if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
      process.env.GEMINI_API_KEY = apiKey.trim();
      db.updateSettings({ apiKeyConfigured: true });
      db.log('info', 'Chave de API atualizada com sucesso no processo principal.');
    }

    const updated = db.updateSettings({
      ...(selectedModel ? { selectedModel } : {}),
      ...(outputDirectory ? { outputDirectory } : {}),
      ...(maxConcurrency !== undefined ? { maxConcurrency: Number(maxConcurrency) } : {}),
      ...(maxRetries !== undefined ? { maxRetries: Number(maxRetries) } : {}),
      ...(defaultAspectRatio ? { defaultAspectRatio } : {}),
      ...(defaultResolution ? { defaultResolution } : {}),
      ...(demoMode !== undefined ? { demoMode: Boolean(demoMode) } : {}),
    });

    res.json(updated);
  });

  // Test Connection
  app.post('/api/test-connection', async (req, res) => {
    const { apiKey } = req.body;
    try {
      const result = await veoProvider.testConnection(apiKey);
      if (result.success && apiKey) {
        process.env.GEMINI_API_KEY = apiKey.trim();
        db.updateSettings({ apiKeyConfigured: true });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err?.message || 'Erro ao conectar à API do Google Veo / Gemini.',
        provider: 'Google Veo',
      });
    }
  });

  // Project Bible
  app.get('/api/bible', (req, res) => {
    res.json(db.getBible());
  });

  app.post('/api/bible', (req, res) => {
    const updated = db.updateBible(req.body);
    db.log('info', 'Project Bible atualizada com sucesso.');
    res.json(updated);
  });

  // Sales Methods & Configs
  app.get('/api/methods', (req, res) => {
    const methodsWithCustom = SALES_METHODS.map((m) => ({
      ...m,
      customConfig: db.getCustomMethodConfig(m.id),
    }));
    res.json(methodsWithCustom);
  });

  app.post('/api/methods/:id', (req, res) => {
    const { id } = req.params;
    db.setCustomMethodConfig(id, req.body);
    db.log('info', `Configuração personalizada salva para o método "${id}".`);
    res.json({ success: true, methodId: id, config: req.body });
  });

  // AI Method Recommendation
  app.post('/api/ai-recommend-methods', async (req, res) => {
    const { campaign, quantity } = req.body;
    const bible = db.getBible();
    try {
      const rec = await methodRecommender.recommendMethods(campaign, bible, quantity);
      res.json(rec);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro na recomendação de métodos' });
    }
  });

  // Script Generator
  app.post('/api/generate-scripts', async (req, res) => {
    const { campaign, quantity } = req.body;
    const bible = db.getBible();
    try {
      const scripts = await salesScriptEngine.generateScripts(campaign, bible, quantity);
      res.json({ scripts, count: scripts.length });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro na geração de roteiros' });
    }
  });

  // Queue Operations
  app.get('/api/queue/status', (req, res) => {
    const queue = queueManager.getQueue();
    const settings = db.getSettings();
    const completed = queue.filter((j) => j.status === 'completed').length;
    const total = queue.length;
    const inProgress = queue.filter((j) => j.status === 'generating' || j.status === 'polling' || j.status === 'saving').length;
    const waiting = queue.filter((j) => j.status === 'waiting').length;
    const failed = queue.filter((j) => j.status === 'error').length;

    res.json({
      queue,
      stats: {
        total,
        completed,
        inProgress,
        waiting,
        failed,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      settings,
    });
  });

  app.post('/api/queue/enqueue-batch', async (req, res) => {
    const { campaign, scripts } = req.body;
    const bible = db.getBible();
    db.saveCampaign(campaign);

    let scriptList = scripts;
    if (!scriptList || scriptList.length === 0) {
      scriptList = await salesScriptEngine.generateScripts(campaign, bible, campaign.videoCount || 75);
    }

    const jobs = queueManager.enqueueBatch(campaign, scriptList);
    res.json({ success: true, count: jobs.length, jobs });
  });

  app.post('/api/queue/test-video', async (req, res) => {
    const { campaign } = req.body;
    const bible = db.getBible();
    try {
      const testScripts = await salesScriptEngine.generateScripts(campaign, bible, 1);
      const testJob = await queueManager.createSingleTestJob(campaign, testScripts[0]);
      res.json({ success: true, job: testJob });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao criar teste de vídeo' });
    }
  });

  app.post('/api/queue/pause', (req, res) => {
    queueManager.pauseQueue();
    res.json({ success: true, isPaused: true });
  });

  app.post('/api/queue/resume', (req, res) => {
    queueManager.resumeQueue();
    res.json({ success: true, isPaused: false });
  });

  app.post('/api/queue/cancel-all', (req, res) => {
    queueManager.cancelAll();
    res.json({ success: true });
  });

  app.post('/api/queue/cancel/:id', (req, res) => {
    queueManager.cancelJob(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/queue/clear-completed', (req, res) => {
    queueManager.clearCompleted();
    res.json({ success: true });
  });

  // Library
  app.get('/api/library', (req, res) => {
    res.json(db.getLibrary());
  });

  app.delete('/api/library/:id', (req, res) => {
    db.deleteFromLibrary(req.params.id);
    res.json({ success: true });
  });

  // Video Streaming / Playback
  app.get('/api/videos/:jobId/stream', (req, res) => {
    const { jobId } = req.params;
    const library = db.getLibrary();
    const item = library.find((v) => v.jobId === jobId || v.id === jobId);

    if (!item || !item.localPath || !fs.existsSync(item.localPath)) {
      // Return a generated demo mp4 stream or 404
      return res.status(404).json({ error: 'Arquivo de vídeo não encontrado no disco local.' });
    }

    const stat = fs.statSync(item.localPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(item.localPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(item.localPath).pipe(res);
    }
  });

  // Remix Video
  app.post('/api/videos/:id/remix', async (req, res) => {
    const { id } = req.params;
    const { hook, action, dialogue, cta, style } = req.body;
    const library = db.getLibrary();
    const item = library.find((v) => v.id === id || v.jobId === id);

    if (!item) {
      return res.status(404).json({ error: 'Vídeo original não encontrado.' });
    }

    const campaign = db.getCampaigns().find((c) => c.id === item.campaignId) || {
      name: item.campaignName,
      product: item.campaignName,
      aspectRatio: (item.aspectRatio as any) || '9:16',
      selectedModel: item.model,
    } as any;

    const bible = db.getBible();

    const remixedPrompt = `[REMIX - ${item.methodName}] ${style || 'Cinematic High Converting Ad'}. Hook: "${hook || item.hook}". Action: ${action || 'Product in action'}. Product: ${campaign.product} (${bible.materials}). On-screen text: "${dialogue || item.scriptSummary?.dialogue}". Lighting: high contrast commercial studio. Camera: dynamic tracking shot. CTA: ${cta || item.scriptSummary?.cta}.`;

    const remixedScript = {
      id: `remix_${Date.now()}`,
      campaignId: item.campaignId,
      index: library.length + 1,
      title: `[REMIX] ${item.hook.slice(0, 30)}...`,
      method: item.method,
      methodName: item.methodName,
      hook: hook || item.hook,
      scene1: 'Cena de abertura remixada',
      scene2: 'Demonstração de produto aprimorada',
      scene3: 'Prova e autoridade visual',
      scene4: 'Chamada para ação de alta conversão',
      dialogue: dialogue || item.scriptSummary?.dialogue || '',
      visualText: hook || item.hook,
      action: action || 'Ação dinâmica',
      cta: cta || item.scriptSummary?.cta || 'Compre Agora',
      veoPrompt: remixedPrompt,
      aspectRatio: (item.aspectRatio as any) || '9:16',
    };

    const newJob = await queueManager.createSingleTestJob(campaign, remixedScript);
    res.json({ success: true, remixedScript, newJob });
  });

  // Analytics
  app.get('/api/analytics', (req, res) => {
    const library = db.getLibrary();
    const queue = db.getQueue();
    const campaigns = db.getCampaigns();

    const totalVideosGenerated = library.length + queue.filter((j) => j.status === 'completed').length;
    const completedVideos = library.length;
    const failedVideos = queue.filter((j) => j.status === 'error').length;
    const inProgressVideos = queue.filter((j) => j.status === 'generating' || j.status === 'polling' || j.status === 'saving').length;
    const waitingVideos = queue.filter((j) => j.status === 'waiting').length;

    const methodsUsedCount: Record<string, number> = {};
    library.forEach((v) => {
      methodsUsedCount[v.methodName || v.method] = (methodsUsedCount[v.methodName || v.method] || 0) + 1;
    });

    const completionRatePercent = totalVideosGenerated > 0 ? Math.round((completedVideos / (completedVideos + failedVideos || 1)) * 100) : 100;

    const mediaList = db.getMedia();
    const productsList = db.getProducts();
    const charactersList = db.getCharacters();
    const tiktokCreatives = db.getTikTokCreatives();
    const liveScripts = db.getLiveScripts();
    const publishedVideos = tiktokCreatives.filter((c) => c.status === 'PUBLISHED').length;

    res.json({
      totalVideosGenerated,
      completedVideos,
      failedVideos,
      inProgressVideos,
      waitingVideos,
      completionRatePercent,
      avgGenerationTimeSeconds: 42,
      methodsUsedCount,
      recentCampaignsCount: campaigns.length,
      totalMediaAssets: mediaList.length,
      totalProducts: productsList.length,
      totalCharacters: charactersList.length,
      totalTikTokCreatives: tiktokCreatives.length,
      totalLiveScripts: liveScripts.length,
      totalPublishedVideos: publishedVideos,
    });
  });

  // Logs
  app.get('/api/logs', (req, res) => {
    res.json(db['data'].logs || []);
  });

  // ==========================================
  // MEDIA ASSETS API
  // ==========================================
  app.get('/api/media', (req, res) => {
    try {
      const { type, search, productId, campaignId, characterId } = req.query;
      let mediaList = db.getMedia();

      if (type && type !== 'ALL') {
        mediaList = mediaList.filter((m) => m.type === type);
      }
      if (productId) {
        mediaList = mediaList.filter((m) => m.associatedProductId === productId);
      }
      if (campaignId) {
        mediaList = mediaList.filter((m) => m.associatedCampaignId === campaignId);
      }
      if (characterId) {
        mediaList = mediaList.filter((m) => m.associatedCharacterId === characterId);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        mediaList = mediaList.filter((m) => m.name.toLowerCase().includes(q) || m.originalFileName.toLowerCase().includes(q) || m.tags?.some((t) => t.toLowerCase().includes(q)));
      }

      res.json(mediaList);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao listar mídias' });
    }
  });

  app.post('/api/media/upload', (req, res) => {
    try {
      const { name, type, originalFileName, base64Data, mimeType, tags, productId, campaignId, characterId } = req.body;

      if (!base64Data) {
        return res.status(400).json({ error: 'Dados do arquivo em base64 são obrigatórios' });
      }

      const settings = db.getSettings();
      const mediaDir = path.join(settings.outputDirectory, 'Media');
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }

      const cleanFileName = (originalFileName || `${name || 'media'}_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${Date.now()}_${cleanFileName}`;
      const filePath = path.join(mediaDir, uniqueName);

      // Strip potential base64 prefix
      const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');
      fs.writeFileSync(filePath, buffer);

      const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const mediaAsset = {
        id: mediaId,
        name: name || originalFileName || 'Nova Mídia',
        originalFileName: originalFileName || cleanFileName,
        type: type || 'IMAGE',
        mimeType: mimeType || 'image/jpeg',
        sizeBytes: buffer.length,
        filePath,
        relativeUrl: `/api/media/file/${mediaId}`,
        thumbnailUrl: `/api/media/file/${mediaId}`,
        tags: tags || [],
        associatedProductId: productId || undefined,
        associatedCampaignId: campaignId || undefined,
        associatedCharacterId: characterId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.addMedia(mediaAsset as any);
      db.log('info', `Mídia "${mediaAsset.name}" importada com sucesso para o disco local.`);
      res.json({ success: true, media: mediaAsset });
    } catch (e: any) {
      console.error('Media upload error:', e);
      res.status(500).json({ error: e?.message || 'Erro ao salvar arquivo de mídia' });
    }
  });

  app.get('/api/media/file/:id', (req, res) => {
    try {
      const { id } = req.params;
      const media = db.getMedia().find((m) => m.id === id);

      if (!media || !media.filePath || !fs.existsSync(media.filePath)) {
        return res.status(404).send('Arquivo de mídia não encontrado no disco local.');
      }

      res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
      res.sendFile(media.filePath);
    } catch (e: any) {
      res.status(500).send('Erro ao servir arquivo.');
    }
  });

  app.put('/api/media/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateMedia(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Mídia não encontrada' });
      }
      res.json({ success: true, media: updated });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.delete('/api/media/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteMedia(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/media/open-explorer', async (req, res) => {
    try {
      const { id, filePath } = req.body;
      let targetPath = filePath;
      if (id) {
        const media = db.getMedia().find((m) => m.id === id);
        if (media) targetPath = media.filePath;
      }
      if (targetPath && fs.existsSync(targetPath)) {
        const folder = fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath);
        // Execute explorer command if win32 or open on mac/linux
        if (process.platform === 'win32') {
          require('child_process').exec(`explorer.exe /select,"${targetPath.replace(/\//g, '\\')}"`);
        } else if (process.platform === 'darwin') {
          require('child_process').exec(`open -R "${targetPath}"`);
        } else {
          require('child_process').exec(`xdg-open "${folder}"`);
        }
        return res.json({ success: true, path: targetPath });
      }
      res.status(404).json({ error: 'Caminho não encontrado no sistema de arquivos.' });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  // ==========================================
  // PRODUCTS API
  // ==========================================
  app.get('/api/products', (req, res) => {
    res.json(db.getProducts());
  });

  app.post('/api/products', (req, res) => {
    try {
      const product = {
        ...req.body,
        id: req.body.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      const saved = db.saveProduct(product);
      db.log('info', `Produto "${saved.name}" salvo com sucesso.`);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const product = { ...req.body, id };
      const saved = db.saveProduct(product);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteProduct(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  // ==========================================
  // CHARACTERS API
  // ==========================================
  app.get('/api/characters', (req, res) => {
    res.json(db.getCharacters());
  });

  app.post('/api/characters', async (req, res) => {
    try {
      const { promptStudioEngine } = await import('./server/services/promptStudioEngine');
      let character = req.body;
      if (!character.consistencyPrompt || character.consistencyPrompt.trim().length === 0) {
        character.consistencyPrompt = promptStudioEngine.generateCharacterConsistencyPrompt(character);
      }
      character.id = character.id || `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const saved = db.saveCharacter(character);
      db.log('info', `Personagem "${saved.name}" salvo com consistência visual gerada.`);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.put('/api/characters/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { promptStudioEngine } = await import('./server/services/promptStudioEngine');
      let character = { ...req.body, id };
      if (!character.consistencyPrompt || character.consistencyPrompt.trim().length === 0) {
        character.consistencyPrompt = promptStudioEngine.generateCharacterConsistencyPrompt(character);
      }
      const saved = db.saveCharacter(character);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.delete('/api/characters/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteCharacter(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/characters/generate-consistency', async (req, res) => {
    try {
      const { promptStudioEngine } = await import('./server/services/promptStudioEngine');
      const consistency = promptStudioEngine.generateCharacterConsistencyPrompt(req.body);
      res.json({ consistencyPrompt: consistency });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  // ==========================================
  // PROMPT STUDIO PRO API
  // ==========================================
  app.get('/api/prompt-studio/presets', async (req, res) => {
    try {
      const { PROMPT_STUDIO_PRESETS } = await import('./server/services/promptStudioEngine');
      res.json(PROMPT_STUDIO_PRESETS);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/prompt-studio/generate', async (req, res) => {
    try {
      const { promptStudioEngine } = await import('./server/services/promptStudioEngine');
      const result = promptStudioEngine.generatePrompt(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar prompt no Prompt Studio' });
    }
  });

  app.post('/api/prompt-studio/character-with-product', async (req, res) => {
    try {
      const { promptStudioEngine } = await import('./server/services/promptStudioEngine');
      const result = promptStudioEngine.generateCharacterWithProduct(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar prompt de Personagem com Produto' });
    }
  });

  app.post('/api/prompt-studio/enqueue-direct', async (req, res) => {
    try {
      const { prompt, aspectRatio, resolution, model, title, product } = req.body;
      const campaign: any = {
        id: `camp_studio_${Date.now()}`,
        name: title || product || 'Prompt Studio Pro Asset',
        product: product || 'Produto',
        selectedModel: model || 'veo-3.1-lite-generate-preview',
        aspectRatio: aspectRatio || '9:16',
        resolution: resolution || '720p',
      };

      const script: any = {
        id: `script_studio_${Date.now()}`,
        campaignId: campaign.id,
        index: 1,
        title: title || 'Criativo Prompt Studio PRO',
        method: 'custom_method',
        methodName: 'Prompt Studio Pro',
        hook: title || 'Criativo Profissional',
        scene1: 'Demonstração de Produto',
        scene2: 'Engajamento e Ação',
        scene3: 'Prova Visual',
        scene4: 'Chamada para Ação',
        dialogue: '',
        visualText: '',
        action: 'Ação do Prompt Studio',
        cta: 'Compre Agora',
        veoPrompt: prompt,
        aspectRatio: aspectRatio || '9:16',
      };

      const job = await queueManager.createSingleTestJob(campaign, script);
      res.json({ success: true, job });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao enfileirar vídeo direto' });
    }
  });

  app.get('/api/prompt-studio/templates', (req, res) => {
    res.json(db.getPromptTemplates());
  });

  app.post('/api/prompt-studio/templates', (req, res) => {
    try {
      const template = {
        ...req.body,
        id: req.body.id || `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      const saved = db.savePromptTemplate(template);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.delete('/api/prompt-studio/templates/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deletePromptTemplate(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  // ==========================================
  // FASE 2: VIDEO ENGINE & PROBE API
  // ==========================================
  app.get('/api/video-engine/status', (req, res) => {
    const ffmpegStatus = resolveFFmpegPaths();
    res.json({
      status: 'ok',
      ffmpeg: ffmpegStatus,
      engine: 'Veo Auto Studio Video Engine v2.0 (FFmpeg Native + Auto Normalizer)',
      supportedFormats: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'mp3', 'wav', 'aac'],
    });
  });

  app.post('/api/video-engine/probe', async (req, res) => {
    try {
      const { filePath, mediaId } = req.body;
      let targetPath = filePath;
      if (mediaId && !targetPath) {
        const media = db.getMedia().find((m) => m.id === mediaId);
        if (media) targetPath = media.filePath;
      }
      if (!targetPath || !fs.existsSync(targetPath)) {
        return res.status(404).json({ error: 'Arquivo de vídeo não encontrado para análise.' });
      }
      const probeResult = await probeMedia(targetPath);
      res.json(probeResult);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro na inspeção do vídeo' });
    }
  });

  // ==========================================
  // FASE 2: JUNTADOR DE VÍDEOS API
  // ==========================================
  app.post('/api/video-engine/join', async (req, res) => {
    try {
      const { config, campaignName } = req.body;
      if (!config || !config.clips || config.clips.length === 0) {
        return res.status(400).json({ error: 'Nenhum clipe informado para a junção.' });
      }
      const job = queueManager.enqueueVideoJoin(config, campaignName || 'Juntador de Vídeos');
      res.json({ success: true, job });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao enfileirar junção de vídeos' });
    }
  });

  // ==========================================
  // FASE 2: MULTIPLICADOR DE VÍDEOS API
  // ==========================================
  app.post('/api/video-engine/multiplication/calculate', (req, res) => {
    try {
      const config = req.body;
      const result = calculateMultiplierMatrix(config);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro no cálculo da matriz de multiplicação' });
    }
  });

  app.post('/api/video-engine/multiplication/start', async (req, res) => {
    try {
      const { config, selectedVariations } = req.body;
      if (!config) {
        return res.status(400).json({ error: 'Configuração do multiplicador ausente.' });
      }

      let variationsToQueue = selectedVariations;
      if (!variationsToQueue || variationsToQueue.length === 0) {
        const calculated = calculateMultiplierMatrix(config);
        variationsToQueue = calculated.availableCombinations;
      }

      if (!variationsToQueue || variationsToQueue.length === 0) {
        return res.status(400).json({ error: 'Nenhuma combinação selecionada para renderização.' });
      }

      const jobs = queueManager.enqueueMultiplierBatch(config, variationsToQueue);
      res.json({ success: true, count: jobs.length, jobs });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao iniciar multiplicação de vídeos' });
    }
  });

  // ==========================================
  // FASE 3: TIKTOK SALES FACTORY API
  // ==========================================
  app.post('/api/tiktok/hooks/generate', (req, res) => {
    try {
      const { product, customProduct, salesMethodId, count, selectedCategories } = req.body;
      const bible = db.getBible();
      const hooks = tikTokScriptEngine.generateHooks({
        product,
        bible,
        customProduct,
        salesMethodId,
        count: count || 10,
        selectedCategories,
      });
      res.json({ success: true, count: hooks.length, hooks });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar hooks de vendas para TikTok' });
    }
  });

  app.post('/api/tiktok/ctas/generate', (req, res) => {
    try {
      const { product, customProduct, count, selectedCategories } = req.body;
      const bible = db.getBible();
      const ctas = tikTokScriptEngine.generateCtas({
        product,
        bible,
        customProduct,
        count: count || 10,
        selectedCategories,
      });
      res.json({ success: true, count: ctas.length, ctas });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar CTAs profissionais para TikTok' });
    }
  });

  app.post('/api/tiktok/script/generate', (req, res) => {
    try {
      const options = req.body;
      const bible = db.getBible();
      const script = tikTokScriptEngine.generateScript({
        ...options,
        bible,
      });
      res.json({ success: true, script });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar script adaptativo para TikTok' });
    }
  });

  // ==========================================
  // FASE 3: TIKTOK CREATIVES & PUBLISHING API
  // ==========================================
  app.get('/api/tiktok/creatives', (req, res) => {
    try {
      const creatives = db.getTikTokCreatives();
      res.json(creatives);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/tiktok/creatives', (req, res) => {
    try {
      const creative = {
        ...req.body,
        id: req.body.id || `tt_creative_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: req.body.createdAt || new Date().toISOString(),
      };
      const saved = db.saveTikTokCreative(creative);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.delete('/api/tiktok/creatives/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteTikTokCreative(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/tiktok/creatives/enqueue', async (req, res) => {
    try {
      const { creativeId, script, prompt, model } = req.body;
      let creative = db.getTikTokCreativeById(creativeId);

      const targetScript = script || creative?.script;
      const targetPrompt = prompt || creative?.prompt || targetScript?.fullVeoPrompt;

      const campaign: any = {
        id: `camp_tiktok_${Date.now()}`,
        name: creative?.title || targetScript?.title || 'TikTok Sales Creative',
        product: targetScript?.productName || 'Produto TikTok Shop',
        selectedModel: model || 'veo-3.1-lite-generate-preview',
        aspectRatio: targetScript?.aspectRatio || '9:16',
        resolution: '720p',
      };

      const jobScript: any = {
        id: targetScript?.id || `script_tt_${Date.now()}`,
        campaignId: campaign.id,
        index: 1,
        title: creative?.title || targetScript?.title || 'TikTok Shop Video',
        method: targetScript?.salesMethodId || 'pain_solution',
        methodName: targetScript?.salesMethodName || 'Método TikTok Shop',
        hook: targetScript?.hook?.text || 'Hook de Alta Retenção',
        scene1: 'Abertura & Gancho',
        scene2: 'Problema & Apresentação',
        scene3: 'Demonstração & Benefício',
        scene4: 'Oferta & Chamada para Ação',
        dialogue: targetScript?.fullDialogue || '',
        visualText: targetScript?.hook?.text || '',
        action: 'Demonstração TikTok Shop',
        cta: targetScript?.cta?.text || 'Toque na sacolinha amarela',
        veoPrompt: targetPrompt,
        aspectRatio: targetScript?.aspectRatio || '9:16',
      };

      const job = await queueManager.createSingleTestJob(campaign, jobScript);

      if (creative) {
        creative.status = 'GENERATING';
        db.saveTikTokCreative(creative);
      }

      res.json({ success: true, job });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao enfileirar criativo TikTok' });
    }
  });

  // ==========================================
  // FASE 3: LIVE SALES FACTORY API
  // ==========================================
  app.post('/api/live/script/generate', (req, res) => {
    try {
      const options = req.body;
      const bible = db.getBible();
      const liveScript = liveSalesEngine.generateLiveScript({
        ...options,
        bible,
      });
      res.json({ success: true, script: liveScript });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar roteiro de Live Sales' });
    }
  });

  app.get('/api/live/scripts', (req, res) => {
    try {
      const scripts = db.getLiveScripts();
      res.json(scripts);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/live/scripts', (req, res) => {
    try {
      const script = {
        ...req.body,
        id: req.body.id || `live_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: req.body.createdAt || new Date().toISOString(),
      };
      const saved = db.saveLiveScript(script);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.delete('/api/live/scripts/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteLiveScript(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  // ==========================================
  // FASE 3: TIKTOK SHOP CENTER & ACCOUNT API
  // ==========================================
  app.get('/api/tiktok-shop/account/status', (req, res) => {
    try {
      const account = tikTokIntegrationService.getAccountStatus();
      res.json(account);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/tiktok-shop/account/connect', async (req, res) => {
    try {
      const account = await tikTokIntegrationService.connectAccount(req.body);
      res.json({ success: true, account });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/tiktok-shop/account/disconnect', (req, res) => {
    try {
      const disconnected = tikTokIntegrationService.disconnectAccount();
      res.json({ success: true, account: disconnected });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.get('/api/tiktok-shop/products', (req, res) => {
    try {
      const products = db.getTikTokProducts();
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/tiktok-shop/products/sync', async (req, res) => {
    try {
      const result = await tikTokIntegrationService.syncProducts();
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao sincronizar produtos do TikTok Shop' });
    }
  });

  app.post('/api/tiktok-shop/publish', async (req, res) => {
    try {
      const result = await tikTokIntegrationService.publishVideo(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro na publicação oficial no TikTok' });
    }
  });

  // ==========================================
  // FASE 4: VIDEO COPIER PRO & COPY ANALYZER API
  // ==========================================

  app.get('/api/video-copier/analyses', (req, res) => {
    try {
      const list = db.getVideoAnalyses();
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.get('/api/video-copier/analyses/:id', (req, res) => {
    try {
      const { id } = req.params;
      const item = db.getVideoAnalysisById(id);
      if (!item) {
        return res.status(404).json({ error: 'Análise não encontrada' });
      }
      res.json(item);
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/video-copier/analyze', async (req, res) => {
    try {
      const { mediaId, videoPath, base64Data, originalFileName, title } = req.body;
      const settings = db.getSettings();
      const bible = db.getBible();

      let targetVideoPath = videoPath;
      let videoTitle = title || originalFileName || 'Vídeo de Análise';
      let videoUrl = '';
      let originalName = originalFileName || 'video.mp4';

      // If mediaId is provided, retrieve from Central de Mídia
      if (mediaId) {
        const media = db.getMedia().find((m) => m.id === mediaId);
        if (media && media.filePath && fs.existsSync(media.filePath)) {
          targetVideoPath = media.filePath;
          videoTitle = media.name;
          videoUrl = media.relativeUrl;
          originalName = media.originalFileName;
        }
      }

      // If base64Data is uploaded directly
      if (!targetVideoPath && base64Data) {
        const mediaDir = path.join(settings.outputDirectory, 'References');
        if (!fs.existsSync(mediaDir)) {
          fs.mkdirSync(mediaDir, { recursive: true });
        }
        const cleanName = (originalFileName || `video_${Date.now()}.mp4`).replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `ref_${Date.now()}_${cleanName}`;
        targetVideoPath = path.join(mediaDir, uniqueName);

        const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        fs.writeFileSync(targetVideoPath, buffer);
      }

      if (!targetVideoPath || !fs.existsSync(targetVideoPath)) {
        return res.status(400).json({ error: 'Arquivo de vídeo não encontrado no sistema de arquivos local.' });
      }

      db.log('info', `[VIDEO COPIER] Iniciando análise de cópia e neuromarketing do vídeo "${videoTitle}".`);

      // 1. Media probe
      const probe = await probeMedia(targetVideoPath);
      const stats = fs.statSync(targetVideoPath);

      // 2. Extract Audio with FFmpeg
      const audioDir = path.join(settings.outputDirectory, 'References', 'Audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const audioPath = path.join(audioDir, `audio_${path.basename(targetVideoPath, path.extname(targetVideoPath))}.mp3`);
      const audioResult = await extractAudioFromVideo(targetVideoPath, audioPath);

      // 3. Transcribe Audio
      const transcription = await transcriptionProvider.transcribeAudio(
        audioResult.success ? audioResult.audioPath : '',
        probe.durationSeconds
      );

      // 4. Video Copy & Retention Analyzer (Multimodal Audio + Visual Frames + Metadata)
      const copyAnalysis = await videoCopyAnalyzer.analyzeVideoCopy(transcription, probe, bible, targetVideoPath);

      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const savedItem: VideoAnalysisItem = {
        id: analysisId,
        videoTitle,
        originalFileName: originalName,
        videoPath: targetVideoPath,
        videoUrl: videoUrl || `/api/media/file/${mediaId || analysisId}`,
        durationSeconds: probe.durationSeconds,
        fileSizeBytes: stats.size,
        audioExtractedPath: audioResult.audioPath || undefined,
        transcription,
        analysis: copyAnalysis,
        status: 'ANALYZED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.saveVideoAnalysis(savedItem);
      db.log('info', `[VIDEO COPIER] Análise concluída com sucesso para "${videoTitle}" (Método: ${copyAnalysis.detectedSalesMethodName}).`);

      res.json({ success: true, item: savedItem });
    } catch (e: any) {
      console.error('Error in video analysis:', e);
      res.status(500).json({ error: e?.message || 'Erro durante a análise do vídeo' });
    }
  });

  app.post('/api/video-copier/remodel', async (req, res) => {
    try {
      const { analysisId, productId, customInstructions } = req.body;
      const item = db.getVideoAnalysisById(analysisId);
      if (!item) {
        return res.status(404).json({ error: 'Análise não encontrada' });
      }

      const bible = db.getBible();
      const product = productId ? db.getProductById(productId) : null;

      db.log('info', `[VIDEO COPIER] Iniciando remodelagem de conteúdo original para o produto "${product?.name || bible.productName}".`);

      const remodeling = await videoCopyAnalyzer.remodelVideoCopy(
        item.analysis,
        item.transcription,
        product,
        bible,
        customInstructions
      );

      item.remodeling = remodeling;
      item.status = 'REMODELED';
      item.updatedAt = new Date().toISOString();

      db.saveVideoAnalysis(item);
      db.log('info', `[VIDEO COPIER] Remodelagem concluída: Roteiro e ${remodeling.hookVariations.length} ganchos originais criados.`);

      res.json({ success: true, item, remodeling });
    } catch (e: any) {
      console.error('Error in video remodeling:', e);
      res.status(500).json({ error: e?.message || 'Erro ao remodelar criativo' });
    }
  });

  app.delete('/api/video-copier/analyses/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteVideoAnalysis(id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/video-copier/export-to-prompt-studio', (req, res) => {
    try {
      const { analysisId } = req.body;
      const item = db.getVideoAnalysisById(analysisId);
      if (!item || !item.remodeling) {
        return res.status(400).json({ error: 'Análise remodelada não encontrada' });
      }

      const templates = item.remodeling.veoPromptsSummary.map((promptItem, idx) => ({
        id: `tpl_copier_${Date.now()}_${idx + 1}`,
        name: `[Video Copier] ${item.remodeling!.targetProductName} - ${promptItem.blockName}`,
        category: 'Remodelagem de Vídeo',
        methodId: item.remodeling!.adaptedSalesMethod,
        productType: 'physical',
        style: 'commercial_cinematic',
        promptText: promptItem.prompt,
        negativePrompt: 'low quality, blurry, distorted hands, flickering, artifacts',
        recommendedDurationSeconds: 8,
        recommendedRatio: promptItem.recommendedRatio || '9:16',
        motionDynamics: 'fluid_cinematic',
        cameraStyle: 'dolly_in',
        lighting: 'luxury_studio',
        tags: ['video_copier', 'remodelado', item.remodeling!.adaptedSalesMethod],
        createdAt: new Date().toISOString(),
      }));

      templates.forEach((t) => db.savePromptTemplate(t as any));
      db.log('info', `[VIDEO COPIER] ${templates.length} templates visuais exportados para o Prompt Studio PRO.`);

      res.json({ success: true, count: templates.length, templates });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao exportar para Prompt Studio' });
    }
  });

  app.post('/api/video-copier/export-to-queue', async (req, res) => {
    try {
      const { analysisId } = req.body;
      const item = db.getVideoAnalysisById(analysisId);
      if (!item || !item.remodeling) {
        return res.status(400).json({ error: 'Análise remodelada não encontrada' });
      }

      const settings = db.getSettings();
      const campaignName = `[Copier] ${item.remodeling.targetProductName}`;
      const scripts = item.remodeling.remodelledScript.blocks.map((b, idx) => ({
        id: `script_copier_${Date.now()}_${idx + 1}`,
        method: item.remodeling!.adaptedSalesMethod,
        methodName: item.remodeling!.adaptedSalesMethodName,
        hook: b.phase,
        scriptText: b.voiceover,
        visualDescription: b.visualScene,
        veoPrompt: b.veoPrompt,
        aspectRatio: '9:16' as const,
        resolution: '720p' as const,
        estimatedDuration: b.estimatedDurationSeconds,
      }));

      const campaign = {
        id: `camp_copier_${Date.now()}`,
        name: campaignName,
        product: item.remodeling.targetProductName,
        description: `Criativo gerado pelo Video Copier PRO baseado no método ${item.remodeling.adaptedSalesMethodName}`,
        totalVideos: scripts.length,
        selectedMethods: [item.remodeling.adaptedSalesMethod],
        aspectRatio: '9:16' as const,
        resolution: '720p' as const,
        selectedModel: settings.selectedModel,
        status: 'queued' as const,
        createdAt: new Date().toISOString(),
      };

      const jobs = queueManager.enqueueBatch(campaign as any, scripts as any);
      db.log('info', `[VIDEO COPIER] ${jobs.length} cenas enfileiradas com sucesso na Fila de Geração.`);

      res.json({ success: true, count: jobs.length, jobs });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao enfileirar criativo' });
    }
  });

  // ==========================================
  // FASE 5: CAMPAIGN ORCHESTRATOR ENDPOINTS
  // ==========================================

  // Step 2: ICP Generator
  app.post('/api/orchestrator/generate-icp', async (req, res) => {
    try {
      const { productId, customApiKey } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const bible = db.getBible();
      const icp = await campaignOrchestratorEngine.generateIdealICP(product, bible, customApiKey);
      res.json(icp);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar ICP' });
    }
  });

  // Step 3: Offer Generator
  app.post('/api/orchestrator/generate-offer', async (req, res) => {
    try {
      const { productId, icp, customApiKey } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const bible = db.getBible();
      const offer = await campaignOrchestratorEngine.generateCommercialOffer(product, icp, bible, customApiKey);
      res.json(offer);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar oferta comercial' });
    }
  });

  // Step 4: Method Recommendation & Reasoning
  app.post('/api/orchestrator/recommend-methods', async (req, res) => {
    try {
      const { productId } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const bible = db.getBible();
      const campaignForm = {
        product: product.name,
        description: product.description,
        price: product.price,
        targetAudience: product.targetAudience,
        pain: product.pains?.[0] || '',
        desire: product.desires?.[0] || '',
        offer: product.cta || '',
        videoCount: 25,
      } as any;
      const recommendation = await methodRecommender.recommendMethods(campaignForm, bible, 25);
      res.json(recommendation);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao recomendar métodos' });
    }
  });

  // Step 17: Angles Generator
  app.post('/api/orchestrator/generate-angles', async (req, res) => {
    try {
      const { productId, icp, offer, count } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const angles = campaignOrchestratorEngine.generateAngles(product, icp, offer, count || 17);
      res.json(angles);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar ângulos' });
    }
  });

  // Step 5: Hooks Generator
  app.post('/api/orchestrator/generate-hooks', async (req, res) => {
    try {
      const { productId, angles, selectedMethods, count, categoriesFilter } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const hooks = campaignOrchestratorEngine.generateHooks(
        product,
        angles || [],
        selectedMethods || [],
        count || 25,
        categoriesFilter
      );
      res.json(hooks);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar hooks' });
    }
  });

  // Step 6: Scripts Generator
  app.post('/api/orchestrator/generate-scripts', async (req, res) => {
    try {
      const { productId, icp, offer, hooks, angles, selectedMethods, duration, characterId, count } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const character = characterId ? db.getCharacters().find((c) => c.id === characterId) : undefined;
      const scripts = campaignOrchestratorEngine.generateScripts(
        product,
        icp,
        offer,
        hooks || [],
        angles || [],
        selectedMethods || [],
        duration || 30,
        character,
        count || 10
      );
      res.json(scripts);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar roteiros' });
    }
  });

  // Step 10: Matrix & Combinator Generator
  app.post('/api/orchestrator/generate-matrix', async (req, res) => {
    try {
      const { campaignId, productId, hooks, scripts, offer, selectedMethods, batchLimit, characterId } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const character = characterId ? db.getCharacters().find((c) => c.id === characterId) : undefined;
      const creatives = campaignOrchestratorEngine.generateCreativesMatrix(
        campaignId || `camp_${Date.now()}`,
        product,
        hooks || [],
        scripts || [],
        offer,
        selectedMethods || [],
        batchLimit || 25,
        character
      );

      // Save generated creatives to database
      creatives.forEach((cr) => db.saveCampaignCreative(cr));

      res.json(creatives);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao gerar matriz de criativos' });
    }
  });

  // Step 18: Score Heurístico
  app.post('/api/orchestrator/calculate-score', async (req, res) => {
    try {
      const { hookText, script, offer, productId } = req.body;
      const product = db.getProducts().find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const score = campaignOrchestratorEngine.calculateCreativeScore(hookText, script, offer, product);
      res.json(score);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao calcular score' });
    }
  });

  // Orchestrated Campaigns CRUD
  app.get('/api/orchestrator/campaigns', (req, res) => {
    const campaigns = db.getOrchestratedCampaigns();
    res.json(campaigns);
  });

  app.get('/api/orchestrator/campaigns/:id', (req, res) => {
    const campaign = db.getOrchestratedCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }
    res.json(campaign);
  });

  app.post('/api/orchestrator/campaigns', (req, res) => {
    try {
      const campaign = req.body as OrchestratedCampaign;
      const saved = db.saveOrchestratedCampaign(campaign);
      db.log('info', `[ORCHESTRATOR] Campanha "${saved.name}" salva com sucesso.`);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao salvar campanha' });
    }
  });

  app.put('/api/orchestrator/campaigns/:id', (req, res) => {
    try {
      const existing = db.getOrchestratedCampaignById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Campanha não encontrada' });
      }
      const updated = db.saveOrchestratedCampaign({
        ...existing,
        ...req.body,
        id: req.params.id,
      });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao atualizar campanha' });
    }
  });

  app.delete('/api/orchestrator/campaigns/:id', (req, res) => {
    try {
      const deleted = db.deleteOrchestratedCampaign(req.params.id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao excluir campanha' });
    }
  });

  // Enqueue Campaign Creatives to Queue
  app.post('/api/orchestrator/campaigns/:id/enqueue', async (req, res) => {
    try {
      const campaign = db.getOrchestratedCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campanha não encontrada' });
      }

      const creatives = db.getCampaignCreatives(campaign.id);
      const readyCreatives = creatives.filter((c) => c.status === 'DRAFT' || c.status === 'READY');

      if (readyCreatives.length === 0) {
        return res.status(400).json({ error: 'Nenhum criativo disponível para enfileirar' });
      }

      const settings = db.getSettings();
      const scripts = readyCreatives.map((cr, idx) => ({
        id: `script_orch_${cr.id}`,
        method: cr.salesMethodId,
        methodName: cr.salesMethodName,
        hook: cr.hookText,
        scriptText: cr.script?.fullDialogue || cr.hookText,
        visualDescription: cr.script?.visualPrompt || cr.prompt,
        veoPrompt: cr.prompt,
        aspectRatio: (cr.format || '9:16') as any,
        resolution: (cr.resolution || '720p') as any,
        estimatedDuration: cr.durationSeconds || 30,
      }));

      const campaignFormData = {
        id: campaign.id,
        name: campaign.name,
        product: campaign.productName,
        description: `Orquestração de criativos para ${campaign.productName}`,
        totalVideos: scripts.length,
        selectedMethods: campaign.selectedMethods,
        aspectRatio: '9:16' as const,
        resolution: '720p' as const,
        selectedModel: settings.selectedModel,
        status: 'queued' as const,
        createdAt: new Date().toISOString(),
      };

      const jobs = queueManager.enqueueBatch(campaignFormData as any, scripts as any);

      // Link job IDs to creatives
      readyCreatives.forEach((cr, idx) => {
        if (jobs[idx]) {
          cr.jobId = jobs[idx].id;
          cr.status = 'GENERATING';
          db.saveCampaignCreative(cr);
        }
      });

      // Update campaign status
      campaign.status = 'ENQUEUED';
      campaign.overviewMetrics = {
        plannedCount: campaign.creatives.length || readyCreatives.length,
        generatedCount: 0,
        processedCount: 0,
        readyCount: readyCreatives.length,
        errorCount: 0,
        progressPercentage: 15,
      };
      db.saveOrchestratedCampaign(campaign);

      db.log('info', `[ORCHESTRATOR] ${jobs.length} criativos da campanha "${campaign.name}" enfileirados.`);
      res.json({ success: true, count: jobs.length, jobs });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao enfileirar criativos' });
    }
  });

  // Creatives Management
  app.get('/api/orchestrator/creatives', (req, res) => {
    const campaignId = req.query.campaignId as string | undefined;
    const creatives = db.getCampaignCreatives(campaignId);
    res.json(creatives);
  });

  app.get('/api/orchestrator/creatives/:id', (req, res) => {
    const creative = db.getCampaignCreativeById(req.params.id);
    if (!creative) {
      return res.status(404).json({ error: 'Criativo não encontrado' });
    }
    res.json(creative);
  });

  app.put('/api/orchestrator/creatives/:id', (req, res) => {
    try {
      const existing = db.getCampaignCreativeById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Criativo não encontrado' });
      }
      const updated = db.saveCampaignCreative({
        ...existing,
        ...req.body,
        id: req.params.id,
      });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao atualizar criativo' });
    }
  });

  app.delete('/api/orchestrator/creatives/:id', (req, res) => {
    try {
      const deleted = db.deleteCampaignCreative(req.params.id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao excluir criativo' });
    }
  });

  app.post('/api/orchestrator/creatives/:id/duplicate', (req, res) => {
    try {
      const duplicated = db.duplicateCampaignCreative(req.params.id);
      if (!duplicated) {
        return res.status(404).json({ error: 'Criativo original não encontrado' });
      }
      db.log('info', `[ORCHESTRATOR] Criativo duplicado: "${duplicated.hookText}" (${duplicated.version})`);
      res.json(duplicated);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao duplicar criativo' });
    }
  });

  app.post('/api/orchestrator/creatives/:id/send-to-tiktok-shop', async (req, res) => {
    try {
      const creative = db.getCampaignCreativeById(req.params.id);
      if (!creative) {
        return res.status(404).json({ error: 'Criativo não encontrado' });
      }

      // Check TikTok account status
      const account = db.getTikTokAccount();
      const isConnected = account.status === 'CONNECTED';

      const campaign = db.getOrchestratedCampaignById(creative.campaignId);
      const tiktokCreative = {
        id: `tt_cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `${creative.productName} — ${creative.salesMethodName} (${creative.version})`,
        prompt: creative.prompt || `${creative.hookText} ${creative.ctaText}`,
        hookText: creative.hookText,
        ctaText: creative.ctaText,
        localVideoPath: creative.videoFilePath || '',
        videoUrl: creative.videoUrl || '',
        productId: creative.productId,
        productName: creative.productName,
        campaignId: creative.campaignId,
        campaignName: campaign?.name || 'Campanha Orquestrada',
        methodId: creative.salesMethodId,
        methodName: creative.salesMethodName,
        durationSeconds: creative.durationSeconds || 30,
        format: creative.format || '9:16',
        version: creative.version || 'V1',
        status: isConnected ? ('READY_TO_PUBLISH' as const) : ('DRAFT' as const),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.saveTikTokCreative(tiktokCreative);

      // Update creative status
      creative.publishedTikTokId = tiktokCreative.id;
      creative.status = isConnected ? 'READY_TO_PUBLISH' : 'PUBLISH_NOT_AVAILABLE';
      creative.publishStatusDetails = isConnected
        ? 'Pronto para publicação via TikTok Content Posting API oficial'
        : 'Conecte sua conta TikTok Shop no menu TikTok Shop Center para publicar';
      db.saveCampaignCreative(creative);

      res.json({
        success: true,
        tiktokCreative,
        status: creative.status,
        message: creative.publishStatusDetails,
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao enviar para TikTok Shop' });
    }
  });

  app.post('/api/orchestrator/creatives/:id/send-to-joiner', (req, res) => {
    try {
      const creative = db.getCampaignCreativeById(req.params.id);
      if (!creative) {
        return res.status(404).json({ error: 'Criativo não encontrado' });
      }

      res.json({
        success: true,
        message: 'Criativo pronto para edição no Juntador de Vídeos PRO',
        creative,
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Erro ao exportar para Video Joiner' });
    }
  });


  // --- VITE MIDDLEWARE / SPA FALLBACK ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const candidates = [
      __dirname,
      path.join(__dirname, '..', 'dist'),
      path.join(process.cwd(), 'dist'),
      path.join((process as any).resourcesPath || '', 'app.asar', 'dist'),
      path.join((process as any).resourcesPath || '', 'app', 'dist'),
    ];
    const distPath = candidates.find((p) => {
      try {
        return p && fs.existsSync(path.join(p, 'index.html'));
      } catch (_) {
        return false;
      }
    }) || path.join(process.cwd(), 'dist');

    console.log(`⚡ [Veo Server] Servindo frontend a partir de: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Veo Auto Studio Server rodando em http://localhost:${PORT}`);
  });
}

startServer();
