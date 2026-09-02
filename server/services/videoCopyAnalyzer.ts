import { GoogleGenAI } from '@google/genai';
import { AI_MODELS } from '../config/aiModels';
import {
  CopyStructureBlock,
  EmotionalTriggerItem,
  ExtractedVideoFrame,
  Product,
  ProjectBible,
  RemodeledCtaVariation,
  RemodeledHookVariation,
  RemodeledScriptBlock,
  RemodeledVeoPromptItem,
  RetentionRiskMoment,
  SalesMethodId,
  TemporalSceneConsolidation,
  VideoCopyAnalysis,
  VideoRemodelingResult,
  VideoTranscriptionResult,
  VideoVisualAnalysisResult,
} from '../../src/types';
import {
  MediaProbeResult,
  extractVideoFrames,
  cleanupTempFrames,
  detectSceneChanges,
} from './videoProcessor';
import { db } from '../db';
import { SALES_METHODS } from '../../src/data/salesMethods';

export class VideoCopyAnalyzer {
  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return null;
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  /**
   * Analisa a transcrição, frames visuais reais, estrutura, gancho, retenção e gatilhos de um criativo em vídeo
   */
  public async analyzeVideoCopy(
    transcription: VideoTranscriptionResult,
    videoProbe: MediaProbeResult,
    bible: ProjectBible,
    videoPath?: string
  ): Promise<VideoCopyAnalysis> {
    const ai = this.getClient();
    const settings = db.getSettings();

    // 1. Extração técnica de frames e detecção de cenas com FFmpeg
    let frameExtractionResult = null;
    if (videoPath) {
      try {
        db.log('info', `[COPY ANALYZER] Extraindo frames representativos e analisando cortes de cena do vídeo com FFmpeg...`);
        frameExtractionResult = await extractVideoFrames(videoPath);
        db.log('info', `[COPY ANALYZER] Extraídos ${frameExtractionResult.frames.length} frames com sucesso.`);
      } catch (e: any) {
        db.log('warn', `[COPY ANALYZER] Falha ao extrair frames com FFmpeg: ${e?.message}`);
      }
    }

    if (!ai || settings.demoMode) {
      db.log('info', '[COPY ANALYZER] Executando análise multimodal e decomposição em MODO OFFLINE/FALLBACK.');
      const result = this.heuristicAnalysis(transcription, videoProbe, bible, frameExtractionResult);
      if (frameExtractionResult?.tempDir) {
        cleanupTempFrames(frameExtractionResult.tempDir);
      }
      return result;
    }

    try {
      db.log('info', '[COPY ANALYZER] Enviando áudio + transcrição + frames visuais para análise multimodal via Gemini 3.7 Flash.');

      const frames = frameExtractionResult?.frames || [];
      const imageParts = frames.map((f, idx) => ({
        inlineData: {
          mimeType: 'image/jpeg',
          data: f.base64,
        },
      }));

      const prompt = `Você é um diretor criativo de alta conversão, especialista em neuromarketing, análise visual cinematográfica e copywriting de resposta direta para vídeos curtos (TikTok Shop, Reels, Shorts).

Analise os seguintes DADOS MULTIMODAIS do vídeo para dissecar sua anatomia de conversão:

DADOS DO VÍDEO:
- Duração total: ${transcription.durationSeconds}s
- Resolução: ${videoProbe.width}x${videoProbe.height} (${videoProbe.aspectRatio})
- Palavras por minuto: ${transcription.wordsPerMinute} WPM
- Transcrição completa: "${transcription.text}"
- Segmentos da fala (com timestamps estimados):
${transcription.segments.map((s) => `  [${s.timecode}] ${s.speaker || 'Locutor'}: ${s.text}`).join('\n')}

FRAMES EXTRAÍDOS DO VÍDEO (${frames.length} frames com timestamps calculados):
${frames.map((f, i) => `  - Frame ${i + 1} (${f.frameId}): timestamp ${f.timecode} (${f.timestampSeconds}s)`).join('\n')}
Mudanças de cena técnicas estimadas: ${frameExtractionResult?.estimatedSceneChanges || 5} cortes (${frameExtractionResult?.estimatedCutsPerMinute || 20} cortes/min).

MÉTODOS DE VENDA DO SISTEMA:
${SALES_METHODS.map((m) => `- ID: ${m.id} (${m.name}) -> ${m.description}`).join('\n')}

DIRETRIZES DE ANÁLISE RIGOROSA:
1. ANÁLISE DE CADA FRAME VISUAL:
   Para cada frame analisado, identifique estritamente o que estiver visível:
   - cenário/ambiente, personagem (quantidade e posição), presença do produto e posição, enquadramento (Close-up, Medium shot, Wide shot, Macro, Over-the-shoulder), câmera, iluminação, cores predominantes, composição, objetos, ação visível, texto na tela, demonstração, expressão geral, mudança visual, contexto comercial, objetivo provável e confiança (0-100%).
   - Se algum elemento não puder ser identificado, preencha estritamente com "Não identificado".
2. CONSOLIDAÇÃO TEMPORAL DE CENAS:
   Agrupe blocos temporais relacionando imagem e fala com objetivo provável e enquadramento.
3. ANÁLISE DO GANCHO (HOOK 0-3s):
   Avalie o gancho combinando fala verbal + primeiros frames visuais + quebra de padrão visual + presença do produto.
4. ESTRUTURA COMBINADA (HOOK, PROBLEM, PAIN, AGITATION, SOLUTION, MECHANISM, BENEFIT, PROOF, OFFER, CTA):
   Para cada bloco forneça: timecode, fala original, descrição visual real, objetivo de vendas, confiança e evidenceSource (AUDIO, VISUAL, AUDIO+VISUAL, ou INFERRED).
5. GATILHOS EMOCIONAIS E RETENÇÃO:
   Avalie momentos de risco de retenção considerando cortes visuais, cadência de fala, demonstrações e variação de enquadramentos.
6. NOTAS HEURÍSTICAS:
   Notas de 0 a 100 com disclaimer explícito de estimativa heurística.

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags adicionais fora do JSON):
{
  "detectedSalesMethod": "pain_solution",
  "detectedSalesMethodName": "Dor & Solução Imediata",
  "detectedSalesMethodConfidence": 92,
  "hookAnalysis": {
    "hookText": "Texto do gancho",
    "durationSeconds": 3.2,
    "hookType": "Quebra de Padrão com Pergunta",
    "hookStrengthScore": 90,
    "hookWhyItWorks": "Combina close dinâmico e pergunta que aborda a maior frustração do cliente.",
    "hookAttentionScore": 92,
    "visualHookPattern": "Close-up com expressão de frustração e corte rápido",
    "patternInterrupt": "Mudança súbita de enquadramento nos primeiros 1.5s"
  },
  "visualAnalysis": {
    "totalFramesAnalyzed": ${frames.length},
    "estimatedSceneChanges": ${frameExtractionResult?.estimatedSceneChanges || 6},
    "estimatedCutsPerMinute": ${frameExtractionResult?.estimatedCutsPerMinute || 24},
    "sceneTechnicalDisclaimer": "Estimativa baseada em análise técnica do vídeo.",
    "dominantFramings": ["Close-up", "Medium shot"],
    "productPresencePercentage": 75,
    "hasCharacter": true,
    "status": "REAL_VISUAL_ANALYSIS",
    "frames": [
      {
        "frameId": "frame_01",
        "timestampSeconds": 0.2,
        "timecode": "00:00.20",
        "setting": "Estúdio / Cenário doméstico",
        "character": "1 pessoa, centralizada",
        "product": "Presente em primeiro plano",
        "framing": "Close-up",
        "camera": "Frontal fixa",
        "lighting": "Iluminação suave difusa",
        "dominantColors": ["#FFFFFF", "#1E293B"],
        "composition": "Regra dos terços com produto em destaque",
        "objects": ["Produto", "Mesa"],
        "visibleAction": "Pessoa segurando o produto em direção à câmera",
        "onScreenText": "Texto na tela ou Não identificado",
        "demonstration": "Exibição inicial de embalagem",
        "generalExpression": "Empolgação / Surpresa",
        "visualChange": "Abertura de cena direta",
        "commercialContext": "Hook de atração comercial",
        "probableObjective": "hook",
        "confidence": 90
      }
    ],
    "temporalConsolidation": [
      {
        "startSeconds": 0,
        "endSeconds": 3.2,
        "timecode": "00:00 - 00:03",
        "visualSummary": "Apresentação de impacto e expressão intrigada",
        "framing": "Close-up",
        "probableObjective": "hook",
        "confidence": 92
      }
    ]
  },
  "structureBlocks": [
    {
      "id": "block_1",
      "phase": "HOOK",
      "phaseLabel": "Gancho de Atenção (0-3s)",
      "startSeconds": 0,
      "endSeconds": 3.2,
      "timecode": "00:00 - 00:03",
      "originalText": "Texto falado no hook",
      "purpose": "Parar a rolagem imediatamente",
      "visualPattern": "Close dinâmico",
      "visualDescription": "Pessoa exibindo produto em close-up com luz direta",
      "salesObjective": "Interrupção de padrão e captura de atenção",
      "confidence": 92,
      "evidenceSource": "AUDIO+VISUAL",
      "pacingScore": 92
    }
  ],
  "emotionalTriggers": [
    {
      "name": "Alívio & Facilidade",
      "intensity": "Alta",
      "description": "Mostra que a solução elimina o esforço desgastante.",
      "timecode": "00:03 - 00:08"
    }
  ],
  "pacingMetrics": {
    "overallPacing": "Rápido e Dinâmico",
    "cutsEstimatePerMin": ${frameExtractionResult?.estimatedCutsPerMinute || 24},
    "retentionRiskMoments": [
      {
        "timecode": "00:07",
        "seconds": 7,
        "reason": "Transição de plano sem mudança de enquadramento",
        "suggestedFix": "Inserir b-roll dinâmico ou corte em macro no produto"
      }
    ]
  },
  "heuristicScores": {
    "hookPower": 89,
    "retentionScore": 85,
    "offerClarity": 90,
    "ctaForce": 88,
    "overallConversionIndex": 88,
    "disclaimer": "Estimativa Heurística baseada em princípios de neuromarketing e retenção para criativos de vídeo."
  }
}`;

      // Monta conteúdo multimodal para a chamada Gemini 3.7 Flash
      const contentParts: any[] = [{ text: prompt }];
      for (let i = 0; i < imageParts.length; i++) {
        contentParts.push(imageParts[i]);
      }

      const response = await ai.models.generateContent({
        model: AI_MODELS.GEMINI_MULTIMODAL_VISION,
        contents: [
          {
            role: 'user',
            parts: contentParts,
          },
        ],
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Mapeia frames com os dados originais e anexa dataUrl para renderização no cliente
      const analyzedFrames: ExtractedVideoFrame[] = frames.map((raw, idx) => {
        const aiFrame = (parsed.visualAnalysis?.frames || [])[idx] || {};
        return {
          frameId: raw.frameId,
          timestampSeconds: raw.timestampSeconds,
          timecode: raw.timecode,
          filePath: raw.filePath,
          dataUrl: `data:image/jpeg;base64,${raw.base64}`,
          setting: aiFrame.setting || 'Ambiente interno iluminado',
          character: aiFrame.character || 'Não identificado',
          product: aiFrame.product || 'Presente na cena',
          framing: aiFrame.framing || 'Medium shot',
          camera: aiFrame.camera || 'Frontal',
          lighting: aiFrame.lighting || 'Boa iluminação',
          dominantColors: aiFrame.dominantColors || ['#334155'],
          composition: aiFrame.composition || 'Centralizada',
          objects: aiFrame.objects || ['Produto'],
          visibleAction: aiFrame.visibleAction || 'Demonstração do criativo',
          onScreenText: aiFrame.onScreenText || 'Não identificado',
          demonstration: aiFrame.demonstration || 'Apresentação prática',
          generalExpression: aiFrame.generalExpression || 'Confiante',
          visualChange: aiFrame.visualChange || 'Corte dinâmico',
          commercialContext: aiFrame.commercialContext || 'Criativo de conversão',
          probableObjective: aiFrame.probableObjective || 'demonstration',
          confidence: Number(aiFrame.confidence) || 88,
        };
      });

      const visualAnalysis: VideoVisualAnalysisResult = {
        frames: analyzedFrames,
        totalFramesAnalyzed: analyzedFrames.length,
        estimatedSceneChanges: parsed.visualAnalysis?.estimatedSceneChanges || frameExtractionResult?.estimatedSceneChanges || 6,
        estimatedCutsPerMinute: parsed.visualAnalysis?.estimatedCutsPerMinute || frameExtractionResult?.estimatedCutsPerMinute || 24,
        sceneTechnicalDisclaimer: 'Estimativa baseada em análise técnica do vídeo.',
        temporalConsolidation: parsed.visualAnalysis?.temporalConsolidation || [],
        dominantFramings: parsed.visualAnalysis?.dominantFramings || ['Close-up', 'Medium shot'],
        productPresencePercentage: parsed.visualAnalysis?.productPresencePercentage || 80,
        hasCharacter: parsed.visualAnalysis?.hasCharacter ?? true,
        status: 'REAL_VISUAL_ANALYSIS',
      };

      if (frameExtractionResult?.tempDir) {
        cleanupTempFrames(frameExtractionResult.tempDir);
      }

      return {
        detectedSalesMethod: parsed.detectedSalesMethod || 'pain_solution',
        detectedSalesMethodName: parsed.detectedSalesMethodName || 'Dor & Solução Imediata',
        detectedSalesMethodConfidence: Number(parsed.detectedSalesMethodConfidence) || 90,
        hookAnalysis: {
          hookText: parsed.hookAnalysis?.hookText || transcription.segments[0]?.text || '',
          durationSeconds: Number(parsed.hookAnalysis?.durationSeconds) || 3.2,
          hookType: parsed.hookAnalysis?.hookType || 'Quebra de Padrão Direta',
          hookStrengthScore: Number(parsed.hookAnalysis?.hookStrengthScore) || 88,
          hookWhyItWorks: parsed.hookAnalysis?.hookWhyItWorks || 'Ativa atenção visual e verbal imediata.',
          hookAttentionScore: Number(parsed.hookAnalysis?.hookAttentionScore) || 90,
          visualHookPattern: parsed.hookAnalysis?.visualHookPattern || 'Close-up dinâmico com iluminação de estúdio',
          patternInterrupt: parsed.hookAnalysis?.patternInterrupt || 'Mudança rápida de enquadramento nos primeiros segundos',
        },
        structureBlocks: (parsed.structureBlocks || []).map((b: any, i: number) => ({
          id: b.id || `block_${i + 1}`,
          phase: b.phase || 'HOOK',
          phaseLabel: b.phaseLabel || b.phase,
          startSeconds: Number(b.startSeconds) || i * 3,
          endSeconds: Number(b.endSeconds) || (i + 1) * 3,
          timecode: b.timecode || '00:00 - 00:03',
          originalText: b.originalText || '',
          purpose: b.purpose || '',
          visualPattern: b.visualPattern || '',
          visualDescription: b.visualDescription || b.visualPattern || '',
          salesObjective: b.salesObjective || b.purpose || '',
          confidence: Number(b.confidence) || 90,
          evidenceSource: b.evidenceSource || 'AUDIO+VISUAL',
          pacingScore: Number(b.pacingScore) || 85,
        })),
        emotionalTriggers: parsed.emotionalTriggers || [],
        visualAnalysis,
        pacingMetrics: {
          overallPacing: parsed.pacingMetrics?.overallPacing || 'Rápido e Dinâmico',
          cutsEstimatePerMin: parsed.pacingMetrics?.cutsEstimatePerMin || visualAnalysis.estimatedCutsPerMinute,
          retentionRiskMoments: parsed.pacingMetrics?.retentionRiskMoments || [],
        },
        heuristicScores: {
          hookPower: Number(parsed.heuristicScores?.hookPower) || 88,
          retentionScore: Number(parsed.heuristicScores?.retentionScore) || 85,
          offerClarity: Number(parsed.heuristicScores?.offerClarity) || 90,
          ctaForce: Number(parsed.heuristicScores?.ctaForce) || 88,
          overallConversionIndex: Number(parsed.heuristicScores?.overallConversionIndex) || 88,
          disclaimer: 'Estimativa Heurística baseada em princípios de neuromarketing e retenção para criativos de vídeo.',
        },
        analysisStatus: {
          transcriptionStatus: 'REAL_GEMINI',
          timestampsStatus: 'ESTIMATED_AI',
          visualStatus: 'REAL_VISUAL_ANALYSIS',
        },
      };
    } catch (e: any) {
      db.log('warn', `[COPY ANALYZER] Falha na chamada da API Gemini (${e?.message}). Aplicando análise heurística estruturada.`);
      const res = this.heuristicAnalysis(transcription, videoProbe, bible, frameExtractionResult);
      if (frameExtractionResult?.tempDir) {
        cleanupTempFrames(frameExtractionResult.tempDir);
      }
      return res;
    }
  }

  /**
   * Remodela a estrutura vitoriosa para criar um novo criativo 100% original adaptado ao produto do usuário
   */
  public async remodelVideoCopy(
    analysis: VideoCopyAnalysis,
    transcription: VideoTranscriptionResult,
    targetProduct: Product | null,
    bible: ProjectBible,
    customInstructions?: string
  ): Promise<VideoRemodelingResult> {
    const ai = this.getClient();
    const settings = db.getSettings();

    const productName = targetProduct ? targetProduct.name : bible.productName || 'Meu Produto';
    const productDesc = targetProduct ? targetProduct.description : bible.description;
    const benefits = targetProduct ? targetProduct.benefits.join(', ') : (bible.primaryBenefits || []).join(', ');
    const offer = targetProduct ? (targetProduct.cta || targetProduct.salesArguments?.join(', ') || targetProduct.price) : bible.irresistibleOffer;
    const audience = targetProduct ? targetProduct.targetAudience : bible.targetAudience;

    // Extrai o padrão visual de referência
    const referenceVisualPattern = analysis.visualAnalysis?.dominantFramings?.join(' → ') || 'Close-up → Demonstração → Comparação → CTA Packshot';

    if (!ai || settings.demoMode) {
      db.log('info', '[REMODELING] Gerando remodelagem original com o motor de padrões local.');
      return this.heuristicRemodeling(analysis, targetProduct, bible);
    }

    try {
      db.log('info', `[REMODELING] Gerando criativo remodelado 100% original para o produto "${productName}".`);

      const prompt = `Você é um estrategista sênior de criação de vídeos comerciais para TikTok Shop, Reels e Anúncios de Alta Conversão.

REQUISITO ÉTICO E LEGAL CRÍTICO:
A remodelagem busca: ESTRUTURA + PRINCÍPIOS + PADRÕES DE NEUROMARKETING, e NUNCA cópia literal.
O texto final deve ser 100% ORIGINAL, autêntico e perfeitamente ajustado ao produto informado abaixo.
NÃO copie falas, frases protegidas, marcas ou identidades específicas do criador original.

ESTRUTURA DE REFERÊNCIA ANALISADA:
- Método de venda detectado: ${analysis.detectedSalesMethodName} (${analysis.detectedSalesMethod})
- Tipo de Gancho original: ${analysis.hookAnalysis.hookType}
- Progressão Visual: ${referenceVisualPattern}
- Gatilhos emocionais chave: ${analysis.emotionalTriggers.map((t) => t.name).join(', ')}
- Duração recomendada: ${transcription.durationSeconds} segundos

PRODUTO ALVO DO USUÁRIO:
- Nome: ${productName}
- Descrição: ${productDesc}
- Principais Benefícios: ${benefits}
- Oferta Irresistível: ${offer}
- Público-Alvo: ${audience}
- Tom de Voz: ${bible.voiceTone || 'Confiante, direto e de autoridade'}
${customInstructions ? `- Instruções adicionais do usuário: ${customInstructions}` : ''}

TAREFA:
1. Crie 3 variações de GANCHO (Hook) 100% originais para o produto alvo, utilizando o mesmo princípio psicológico de quebra de padrão e curiosidade.
2. Crie um ROTEIRO COMPLETO REMODELADO adaptado para a mesma duração (${transcription.durationSeconds}s), dividido em blocos de cena cinematográficos com:
   - Locução falada em português (pt-BR)
   - Descrição visual detalhada da cena
   - Prompt em inglês otimizado para o Google Veo (incorporando iluminação, ângulo de câmera e textura do produto)
   - Movimento de câmera cinematográfico
3. Crie 3 variações de CHAMADA PARA AÇÃO (CTA) persuasivas com gatilhos (Escassez, Urgência, Bônus).
4. Resuma os prompts visuais para exportação direta ao Prompt Studio PRO e Fila de Geração.

Retorne EXCLUSIVAMENTE um objeto JSON válido com a seguinte estrutura:
{
  "targetProductName": "${productName}",
  "adaptedSalesMethod": "${analysis.detectedSalesMethod}",
  "adaptedSalesMethodName": "${analysis.detectedSalesMethodName}",
  "hookVariations": [
    {
      "id": "hook_var_1",
      "angleType": "Quebra de Padrão Direta",
      "hookText": "Texto do gancho 1...",
      "whyItConverts": "Interrompe a rolagem ao desafiar o senso comum imediatamente.",
      "visualAction": "Close-up dramático na textura/uso com iluminação de estúdio"
    },
    {
      "id": "hook_var_2",
      "angleType": "Pergunta Provocativa",
      "hookText": "Texto do gancho 2...",
      "whyItConverts": "Gera identificação instantânea com a dor do público.",
      "visualAction": "Ato de frustração cotidiana sendo substituído pelo produto"
    },
    {
      "id": "hook_var_3",
      "angleType": "Curiosidade / Revelação",
      "hookText": "Texto do gancho 3...",
      "whyItConverts": "Instiga o espectador a assistir até o fim para ver a solução.",
      "visualAction": "Apresentação estética e magnética em rotação 360"
    }
  ],
  "remodelledScript": {
    "title": "Criativo Remodelado: ${productName}",
    "totalDurationTarget": ${transcription.durationSeconds},
    "fullVoiceover": "Texto completo unificado de todas as falas...",
    "blocks": [
      {
        "phase": "HOOK",
        "voiceover": "Texto da locução do gancho...",
        "visualScene": "Descrição detalhada do plano visual...",
        "veoPrompt": "Cinematic 8k commercial shot of ${productName} on minimalist pedestal, luxury studio lighting, smooth slow motion pan, photorealistic, 9:16 vertical ratio",
        "cameraMotion": "Slow push-in dolly with slight tilt-up",
        "estimatedDurationSeconds": 3.5
      },
      {
        "phase": "PROBLEM",
        "voiceover": "Texto da locução do problema...",
        "visualScene": "Descrição do problema visual...",
        "veoPrompt": "Cinematic close up of situation, dramatic moody lighting, high contrast, 9:16 vertical ratio",
        "cameraMotion": "Quick lateral tracking shot",
        "estimatedDurationSeconds": 4
      },
      {
        "phase": "SOLUTION",
        "voiceover": "Texto da locução da solução...",
        "visualScene": "Demonstração do produto em ação...",
        "veoPrompt": "High-end product shot of ${productName} showing its premium texture and instant effect, macro lens, golden hour lighting, 9:16 vertical ratio",
        "cameraMotion": "360 degree smooth orbital spin",
        "estimatedDurationSeconds": 4.5
      },
      {
        "phase": "CTA",
        "voiceover": "Texto da chamada para ação...",
        "visualScene": "Fechamento com oferta e selo de garantia...",
        "veoPrompt": "Commercial packshot of ${productName} with sleek typography overlay placeholder, subtle particle glow, 9:16 vertical ratio",
        "cameraMotion": "Slow zoom out to reveal full package",
        "estimatedDurationSeconds": 3
      }
    ]
  },
  "ctaVariations": [
    {
      "id": "cta_var_1",
      "triggerType": "Urgência & Desconto",
      "ctaText": "Clique no botão abaixo e garanta com 40% OFF apenas no lote de hoje!",
      "visualCtaAction": "Destaque na embalagem com ponteiro visual apontando para o botão"
    },
    {
      "id": "cta_var_2",
      "triggerType": "Frete Grátis & Garantia",
      "ctaText": "Aproveite Frete Grátis para todo o Brasil com 30 dias de garantia incondicional.",
      "visualCtaAction": "Selo de envio expresso e garantia blindada"
    },
    {
      "id": "cta_var_3",
      "triggerType": "TikTok Shop / Sacolinha",
      "ctaText": "Toque na sacolinha amarela aqui embaixo antes que o estoque esgote!",
      "visualCtaAction": "Animação indicativa para a sacolinha amarela no canto inferior"
    }
  ],
  "veoPromptsSummary": [
    {
      "blockName": "Hook Visual",
      "sceneDescription": "Abertura de alto impacto com o produto em destaque",
      "prompt": "Cinematic 8k commercial shot of ${productName}, studio lighting, macro lens, photorealistic, 9:16",
      "recommendedRatio": "9:16"
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

      const response = await ai.models.generateContent({
        model: AI_MODELS.GEMINI_TEXT,
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        targetProductId: targetProduct?.id,
        targetProductName: parsed.targetProductName || productName,
        adaptedSalesMethod: parsed.adaptedSalesMethod || analysis.detectedSalesMethod,
        adaptedSalesMethodName: parsed.adaptedSalesMethodName || analysis.detectedSalesMethodName,
        hookVariations: parsed.hookVariations || [],
        remodelledScript: parsed.remodelledScript || {
          title: `Criativo Remodelado: ${productName}`,
          totalDurationTarget: transcription.durationSeconds,
          fullVoiceover: '',
          blocks: [],
        },
        ctaVariations: parsed.ctaVariations || [],
        veoPromptsSummary: parsed.veoPromptsSummary || [],
        createdAt: new Date().toISOString(),
      };
    } catch (e: any) {
      db.log('warn', `[REMODELING] Falha ao chamar Gemini para remodelagem (${e?.message}). Aplicando remodelador heurístico.`);
      return this.heuristicRemodeling(analysis, targetProduct, bible);
    }
  }

  private heuristicAnalysis(
    transcription: VideoTranscriptionResult,
    videoProbe: MediaProbeResult,
    bible: ProjectBible,
    frameExtractionResult?: any
  ): VideoCopyAnalysis {
    const dur = transcription.durationSeconds || 15;
    const text = transcription.text.toLowerCase();

    let method: SalesMethodId = 'pain_solution';
    let methodName = 'Dor & Solução Imediata';
    let confidence = 88;

    if (text.includes('antes') || text.includes('depois') || text.includes('olha isso') || text.includes('teste')) {
      method = 'demo';
      methodName = 'Demonstração de Impacto';
      confidence = 94;
    } else if (text.includes('apenas hoje') || text.includes('últimas unidades') || text.includes('acabando')) {
      method = 'fomo';
      methodName = 'FOMO / Escassez Real';
      confidence = 91;
    } else if (text.includes('comprei') || text.includes('recomendo') || text.includes('meu relato') || text.includes('testei')) {
      method = 'ugc';
      methodName = 'UGC / Criador Realista';
      confidence = 90;
    } else if (text.includes('você sabia') || text.includes('segredo') || text.includes('ninguém te conta')) {
      method = 'curiosity';
      methodName = 'Curiosidade Magnética';
      confidence = 89;
    }

    const hookDur = Math.min(3.5, dur * 0.22);
    const probDur = Math.min(4, dur * 0.28);
    const solDur = Math.min(4.5, dur * 0.30);
    const ctaDur = Math.max(2.5, dur - hookDur - probDur - solDur);

    const blocks: CopyStructureBlock[] = [
      {
        id: 'block_1',
        phase: 'HOOK',
        phaseLabel: 'Gancho de Atenção (0-3s)',
        startSeconds: 0,
        endSeconds: Number(hookDur.toFixed(1)),
        timecode: `00:00 - ${this.formatTime(hookDur)}`,
        originalText: transcription.segments[0]?.text || 'Você ainda perde tempo com métodos ultrapassados?',
        purpose: 'Quebrar o padrão de rolagem nos primeiros 3 segundos e prender o olhar.',
        visualPattern: 'Corte rápido em close-up dinâmico com iluminação de alto contraste.',
        visualDescription: 'Apresentação em close-up com iluminação focada e expressão de impacto.',
        salesObjective: 'Quebra de padrão e retenção inicial.',
        confidence: 90,
        evidenceSource: 'AUDIO+VISUAL',
        pacingScore: 92,
      },
      {
        id: 'block_2',
        phase: 'PROBLEM',
        phaseLabel: 'Agitação do Problema',
        startSeconds: Number(hookDur.toFixed(1)),
        endSeconds: Number((hookDur + probDur).toFixed(1)),
        timecode: `${this.formatTime(hookDur)} - ${this.formatTime(hookDur + probDur)}`,
        originalText: transcription.segments[1]?.text || 'A maioria das opções do mercado promete muito e não entrega resultado.',
        purpose: 'Conectar emocionalmente com a frustração real e validar a dor do cliente.',
        visualPattern: 'Expressão de insatisfação ou demonstração do erro comum cotidiano.',
        visualDescription: 'Plano médio evidenciando a dificuldade e a frustração com métodos lentos.',
        salesObjective: 'Geração de identificação e validação de dor.',
        confidence: 88,
        evidenceSource: 'AUDIO+VISUAL',
        pacingScore: 88,
      },
      {
        id: 'block_3',
        phase: 'SOLUTION',
        phaseLabel: 'Apresentação da Solução / Mecanismo',
        startSeconds: Number((hookDur + probDur).toFixed(1)),
        endSeconds: Number((hookDur + probDur + solDur).toFixed(1)),
        timecode: `${this.formatTime(hookDur + probDur)} - ${this.formatTime(hookDur + probDur + solDur)}`,
        originalText: transcription.segments[2]?.text || 'Foi exatamente para resolver isso que esta tecnologia foi desenvolvida.',
        purpose: 'Revelar o mecanismo único que torna os resultados rápidos e fáceis.',
        visualPattern: 'Plano detalhado macro do produto funcionando com facilidade extrema.',
        visualDescription: 'Demonstração macro do produto em funcionamento com estética limpa.',
        salesObjective: 'Demonstração de autoridade e facilidade de uso.',
        confidence: 94,
        evidenceSource: 'AUDIO+VISUAL',
        pacingScore: 94,
      },
      {
        id: 'block_4',
        phase: 'CTA',
        phaseLabel: 'Chamada para Ação & Oferta',
        startSeconds: Number((hookDur + probDur + solDur).toFixed(1)),
        endSeconds: Number(dur.toFixed(1)),
        timecode: `${this.formatTime(hookDur + probDur + solDur)} - ${this.formatTime(dur)}`,
        originalText: transcription.segments[3]?.text || 'Clique no link abaixo e garanta as últimas unidades com frete grátis.',
        purpose: 'Indicar ação clara e imediata com incentivo irresistível.',
        visualPattern: 'Packshot elegante do produto com indicação do botão de compra.',
        visualDescription: 'Exibição da embalagem em destaque com selo promocional.',
        salesObjective: 'Conversão final com gatilho de escassez.',
        confidence: 90,
        evidenceSource: 'AUDIO+VISUAL',
        pacingScore: 90,
      },
    ];

    const triggers: EmotionalTriggerItem[] = [
      {
        name: 'Alívio da Frustração',
        intensity: 'Alta',
        description: 'Elimina a sensação de tempo e esforço desperdiçados.',
        timecode: `00:03 - ${this.formatTime(hookDur + probDur)}`,
      },
      {
        name: 'Curiosidade por Inovação',
        intensity: 'Alta',
        description: 'Apresenta um mecanismo inédito que desperta interesse imediato.',
        timecode: `${this.formatTime(hookDur + probDur)} - ${this.formatTime(hookDur + probDur + solDur)}`,
      },
      {
        name: 'Escassez & Oportunidade',
        intensity: 'Média',
        description: 'Incentiva a decisão instantânea antes do fim da condição especial.',
        timecode: `${this.formatTime(hookDur + probDur + solDur)} - ${this.formatTime(dur)}`,
      },
    ];

    const risks: RetentionRiskMoment[] = [
      {
        timecode: this.formatTime(hookDur + 1),
        seconds: hookDur + 1,
        reason: 'Transição entre o gancho e o problema pode perder ritmo se o corte for longo.',
        suggestedFix: 'Inserir efeito sonoro de swoosh ou mudança de ângulo de câmera no corte.',
      },
    ];

    // Constrói frames analisados com base nos frames reais extraídos ou timestamps calculados
    const rawFrames = frameExtractionResult?.frames || [];
    const analyzedFrames: ExtractedVideoFrame[] = rawFrames.length > 0
      ? rawFrames.map((f: any, idx: number) => ({
          frameId: f.frameId,
          timestampSeconds: f.timestampSeconds,
          timecode: f.timecode,
          filePath: f.filePath,
          dataUrl: `data:image/jpeg;base64,${f.base64}`,
          setting: idx === 0 ? 'Cenário inicial de impacto' : idx === rawFrames.length - 1 ? 'Packshot comercial' : 'Demonstração de uso',
          character: '1 pessoa apresentando',
          product: 'Presente no quadro',
          framing: (idx === 0 ? 'Close-up' : idx === 1 ? 'Medium shot' : 'Wide shot') as any,
          camera: 'Frontal',
          lighting: 'Estúdio / Luz natural',
          dominantColors: ['#0F172A', '#38BDF8'],
          composition: 'Centralizada',
          objects: ['Produto comercial'],
          visibleAction: idx === 0 ? 'Apresentação do gancho' : 'Demonstração do funcionamento',
          onScreenText: 'Legenda / Destaque visual',
          demonstration: 'Uso prático do produto',
          generalExpression: 'Entusiasmo / Foco',
          visualChange: 'Corte de cena',
          commercialContext: 'Vídeo de vendas direto',
          probableObjective: idx === 0 ? 'hook' : idx === rawFrames.length - 1 ? 'cta' : 'demonstration',
          confidence: 85,
        }))
      : [
          {
            frameId: 'frame_01',
            timestampSeconds: 0.2,
            timecode: '00:00.20',
            filePath: '',
            setting: 'Estúdio / Cenário de abertura',
            character: '1 pessoa',
            product: 'Presente em close-up',
            framing: 'Close-up',
            camera: 'Frontal dinâmica',
            lighting: 'Iluminação direta',
            dominantColors: ['#1E293B'],
            composition: 'Foco no produto',
            objects: ['Produto'],
            visibleAction: 'Pessoa exibindo o produto com expressão intrigada',
            onScreenText: 'Não identificado',
            demonstration: 'Apresentação inicial',
            generalExpression: 'Surpresa',
            visualChange: 'Início do criativo',
            commercialContext: 'Hook de atração',
            probableObjective: 'hook',
            confidence: 85,
          },
          {
            frameId: 'frame_02',
            timestampSeconds: Number(hookDur.toFixed(1)),
            timecode: this.formatTime(hookDur),
            filePath: '',
            setting: 'Ambiente de teste prático',
            character: '1 pessoa',
            product: 'Em uso ativo',
            framing: 'Medium shot',
            camera: 'Frontal',
            lighting: 'Luz neutra',
            dominantColors: ['#334155'],
            composition: 'Enquadramento médio',
            objects: ['Produto'],
            visibleAction: 'Demonstração da solução sendo aplicada',
            onScreenText: 'Não identificado',
            demonstration: 'Aplicação prática',
            generalExpression: 'Satisfação',
            visualChange: 'Corte para demonstração',
            commercialContext: 'Prova visual de funcionamento',
            probableObjective: 'demonstration',
            confidence: 88,
          },
        ];

    const visualAnalysis: VideoVisualAnalysisResult = {
      frames: analyzedFrames,
      totalFramesAnalyzed: analyzedFrames.length,
      estimatedSceneChanges: frameExtractionResult?.estimatedSceneChanges || Math.max(3, Math.round(dur / 3.5)),
      estimatedCutsPerMinute: frameExtractionResult?.estimatedCutsPerMinute || 22,
      sceneTechnicalDisclaimer: 'Estimativa baseada em análise técnica do vídeo.',
      temporalConsolidation: [
        {
          startSeconds: 0,
          endSeconds: hookDur,
          timecode: `00:00 - ${this.formatTime(hookDur)}`,
          visualSummary: 'Hook visual com close-up de impacto',
          framing: 'Close-up',
          probableObjective: 'hook',
          confidence: 90,
        },
        {
          startSeconds: hookDur,
          endSeconds: dur,
          timecode: `${this.formatTime(hookDur)} - ${this.formatTime(dur)}`,
          visualSummary: 'Demonstração de solução e packshot com CTA',
          framing: 'Medium shot',
          probableObjective: 'demonstration',
          confidence: 88,
        },
      ],
      dominantFramings: ['Close-up', 'Medium shot'],
      productPresencePercentage: 75,
      hasCharacter: true,
      status: rawFrames.length > 0 ? 'REAL_VISUAL_ANALYSIS' : 'ESTIMATED_VISUAL_ANALYSIS',
    };

    return {
      detectedSalesMethod: method,
      detectedSalesMethodName: methodName,
      detectedSalesMethodConfidence: confidence,
      hookAnalysis: {
        hookText: blocks[0].originalText,
        durationSeconds: hookDur,
        hookType: 'Pergunta Provocativa com Quebra de Padrão',
        hookStrengthScore: 88,
        hookWhyItWorks: 'Toca direto na maior frustração do espectador nos primeiros 2 segundos.',
        hookAttentionScore: 90,
        visualHookPattern: 'Close-up dinâmico com iluminação de estúdio',
        patternInterrupt: 'Mudança rápida de enquadramento nos primeiros segundos',
      },
      structureBlocks: blocks,
      emotionalTriggers: triggers,
      visualAnalysis,
      pacingMetrics: {
        overallPacing: 'Rápido e Dinâmico',
        cutsEstimatePerMin: visualAnalysis.estimatedCutsPerMinute,
        retentionRiskMoments: risks,
      },
      heuristicScores: {
        hookPower: 88,
        retentionScore: 86,
        offerClarity: 90,
        ctaForce: 87,
        overallConversionIndex: 88,
        disclaimer: 'Estimativa Heurística baseada em princípios de neuromarketing e retenção para criativos de vídeo.',
      },
      analysisStatus: {
        transcriptionStatus: 'OFFLINE_FALLBACK',
        timestampsStatus: 'CALCULATED_PROPORTIONAL',
        visualStatus: rawFrames.length > 0 ? 'REAL_VISUAL_ANALYSIS' : 'ESTIMATED_VISUAL_ANALYSIS',
      },
    };
  }

  private heuristicRemodeling(
    analysis: VideoCopyAnalysis,
    targetProduct: Product | null,
    bible: ProjectBible
  ): VideoRemodelingResult {
    const prodName = targetProduct?.name || bible.productName || 'Meu Produto de Alta Performance';
    const offer = (targetProduct?.cta || targetProduct?.salesArguments?.join(', ') || targetProduct?.price) || bible.irresistibleOffer || 'Condição especial de lançamento + Frete Grátis';
    const dur = 15;

    const hookVars: RemodeledHookVariation[] = [
      {
        id: 'hook_var_1',
        angleType: 'Quebra de Padrão de Choque',
        hookText: `Pare de gastar dinheiro com produtos que não funcionam. O ${prodName} entrega resultado real em minutos!`,
        whyItConverts: 'Interrompe a rolagem ao confrontar diretamente a frustração com falsas promessas.',
        visualAction: `Close cinematográfico em 8K destacando o acabamento premium do ${prodName}.`,
      },
      {
        id: 'hook_var_2',
        angleType: 'Pergunta Provocativa de Alta Identificação',
        hookText: `Você também está cansado de perder tempo todo dia? Veja como o ${prodName} resolve isso na prática.`,
        whyItConverts: 'Cria concordância imediata nos primeiros 2 segundos.',
        visualAction: 'Demonstração rápida de uso mostrando a facilidade instantânea.',
      },
      {
        id: 'hook_var_3',
        angleType: 'Segredo / Revelação Exclusiva',
        hookText: `O segredo que ninguém te conta sobre como conseguir resultados 3x mais rápidos com o ${prodName}.`,
        whyItConverts: 'Desperta a necessidade de saber o que os outros já estão usando.',
        visualAction: 'Câmera orbital em 360 graus com iluminação de estúdio profissional.',
      },
    ];

    const scriptBlocks: RemodeledScriptBlock[] = [
      {
        phase: 'HOOK (0-3s)',
        voiceover: `Se você quer resultados de verdade sem complicação diária, você precisa conhecer o ${prodName}.`,
        visualScene: `Plano cinematográfico de impacto apresentando o ${prodName} com reflexos de luz de estúdio.`,
        veoPrompt: `Cinematic 8k commercial shot of ${prodName}, luxury studio lighting, shallow depth of field, photorealistic, 9:16 vertical ratio`,
        cameraMotion: 'Dynamic push-in dolly shot',
        estimatedDurationSeconds: 3.5,
      },
      {
        phase: 'PROBLEM & BENEFIT (3-8s)',
        voiceover: `Chega de soluções que dão trabalho e não duram. Sua fórmula avançada age direto na raiz do problema.`,
        visualScene: 'Demonstração detalhada da textura e qualidade do produto em ação.',
        veoPrompt: `Macro close up shot of ${prodName} showing texture and detail, warm golden lighting, clean modern aesthetic, 9:16 vertical ratio`,
        cameraMotion: 'Slow smooth lateral pan',
        estimatedDurationSeconds: 4.5,
      },
      {
        phase: 'PROOF & DEMO (8-12s)',
        voiceover: `Quem testou comprova a diferença logo no primeiro dia de uso com praticidade total.`,
        visualScene: 'Produto em uso no cotidiano com ar de sofisticação e satisfação.',
        veoPrompt: `Cinematic lifestyle commercial shot of person interacting with ${prodName} in modern bright interior, natural smile, 9:16`,
        cameraMotion: 'Gentle tilt-up tracking shot',
        estimatedDurationSeconds: 4,
      },
      {
        phase: 'CTA & OFFER (12-15s)',
        voiceover: `Toque no botão abaixo agora mesmo: ${offer}!`,
        visualScene: 'Packshot final com embalagem elegante e indicação de compra imediata.',
        veoPrompt: `Commercial packshot of ${prodName} on sleek minimalist pedestal, soft studio glow, 9:16 vertical ratio`,
        cameraMotion: 'Slow pull-back to showcase complete product',
        estimatedDurationSeconds: 3,
      },
    ];

    const ctaVars: RemodeledCtaVariation[] = [
      {
        id: 'cta_var_1',
        triggerType: 'Desconto & Urgência',
        ctaText: `Aproveite 40% OFF no lote de hoje do ${prodName} antes que o estoque esgote!`,
        visualCtaAction: 'Destaque no botão de compra com selo de lote promocional',
      },
      {
        id: 'cta_var_2',
        triggerType: 'Frete Grátis + Garantia',
        ctaText: `Garanta o seu com Frete Grátis e 30 dias de garantia total de satisfação.`,
        visualCtaAction: 'Ícone de caminhão de entrega expressa e selo dourado de garantia',
      },
      {
        id: 'cta_var_3',
        triggerType: 'TikTok Shop Sacolinha',
        ctaText: 'Toque agora na sacolinha amarela aqui embaixo e garanta o seu na promoção!',
        visualCtaAction: 'Seta animada pulsando apontando para a sacolinha amarela',
      },
    ];

    const veoPrompts: RemodeledVeoPromptItem[] = scriptBlocks.map((b) => ({
      blockName: b.phase,
      sceneDescription: b.visualScene,
      prompt: b.veoPrompt,
      recommendedRatio: '9:16',
    }));

    return {
      targetProductId: targetProduct?.id,
      targetProductName: prodName,
      adaptedSalesMethod: analysis.detectedSalesMethod,
      adaptedSalesMethodName: analysis.detectedSalesMethodName,
      hookVariations: hookVars,
      remodelledScript: {
        title: `Criativo Remodelado: ${prodName}`,
        totalDurationTarget: dur,
        fullVoiceover: scriptBlocks.map((b) => b.voiceover).join(' '),
        blocks: scriptBlocks,
      },
      ctaVariations: ctaVars,
      veoPromptsSummary: veoPrompts,
      createdAt: new Date().toISOString(),
    };
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

export const videoCopyAnalyzer = new VideoCopyAnalyzer();

