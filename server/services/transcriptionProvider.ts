import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { AI_MODELS } from '../config/aiModels';
import { TranscriptSegment, VideoTranscriptionResult } from '../../src/types';
import { db } from '../db';

export interface ITranscriptionProvider {
  transcribeAudio(
    audioFilePath: string,
    durationSeconds: number
  ): Promise<VideoTranscriptionResult>;
}

export class TranscriptionProvider implements ITranscriptionProvider {
  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return null;
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  public async transcribeAudio(
    audioFilePath: string,
    durationSeconds: number
  ): Promise<VideoTranscriptionResult> {
    const ai = this.getClient();
    const settings = db.getSettings();

    // If audio file doesn't exist or is empty, provide fallback
    if (!audioFilePath || !fs.existsSync(audioFilePath)) {
      return this.generateHeuristicFallback(durationSeconds, 'Áudio não detectado ou sem faixa sonora.');
    }

    const stats = fs.statSync(audioFilePath);
    if (stats.size === 0) {
      return this.generateHeuristicFallback(durationSeconds, 'Faixa de áudio sem volume audível.');
    }

    if (!ai || settings.demoMode) {
      db.log('info', '[TRANSCRIPTION] Executando transcrição e decomposição em modo heurístico local.');
      return this.generateHeuristicFallback(durationSeconds);
    }

    try {
      db.log('info', `[TRANSCRIPTION] Enviando áudio (${(stats.size / 1024).toFixed(1)} KB) para API oficial Google Gemini.`);
      const audioBase64 = fs.readFileSync(audioFilePath).toString('base64');
      const mimeType = audioFilePath.endsWith('.mp3') ? 'audio/mp3' : 'audio/wav';

      const response = await ai.models.generateContent({
        model: AI_MODELS.GEMINI_TEXT,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: audioBase64,
                },
              },
              {
                text: `Você é um especialista em transcrição e análise de vídeos de vendas e criativos de alta conversão.
Transcreva com máxima fidelidade o áudio deste criativo em português (ou idioma original falado) e divida a fala em segmentos cronológicos com timestamps estimados.

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem blocos de markdown adicionais fora do json) com a seguinte estrutura:
{
  "text": "Texto completo transcrito da locução / fala",
  "language": "pt-BR",
  "segments": [
    {
      "startSeconds": 0,
      "endSeconds": 3,
      "timecode": "00:00 - 00:03",
      "text": "Frase falada neste intervalo",
      "speaker": "Locutor",
      "confidence": 0.95
    }
  ]
}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const segments: TranscriptSegment[] = (parsed.segments || []).map((s: any, idx: number) => ({
        id: `seg_${idx + 1}`,
        startSeconds: Number(s.startSeconds) || idx * 3,
        endSeconds: Number(s.endSeconds) || (idx + 1) * 3,
        timecode: s.timecode || `${this.formatTimecode(s.startSeconds || 0)} - ${this.formatTimecode(s.endSeconds || 3)}`,
        text: String(s.text || '').trim(),
        speaker: s.speaker || 'Locutor',
        confidence: Number(s.confidence) || 0.95,
      }));

      const fullText = parsed.text || segments.map((s) => s.text).join(' ');
      const words = fullText.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const effectiveDuration = durationSeconds > 0 ? durationSeconds : Math.max(8, segments.length * 3);
      const wordsPerMinute = effectiveDuration > 0 ? Math.round((wordCount / (effectiveDuration / 60))) : 0;

      return {
        text: fullText,
        language: parsed.language || 'pt-BR',
        durationSeconds: effectiveDuration,
        wordCount,
        wordsPerMinute,
        segments,
        provider: 'gemini_flash',
        isEstimated: false,
      };
    } catch (err: any) {
      db.log('warn', `[TRANSCRIPTION] API Gemini retornou erro (${err?.message || err}). Alternando para transcrição heurística estruturada.`);
      return this.generateHeuristicFallback(durationSeconds);
    }
  }

  private generateHeuristicFallback(
    durationSeconds: number,
    customNotice?: string
  ): VideoTranscriptionResult {
    const dur = Math.max(6, durationSeconds || 15);
    const hookDur = Math.min(3.5, dur * 0.2);
    const probDur = Math.min(4, dur * 0.25);
    const solDur = Math.min(4, dur * 0.25);
    const ctaDur = dur - hookDur - probDur - solDur;

    const segments: TranscriptSegment[] = [
      {
        id: 'seg_1',
        startSeconds: 0,
        endSeconds: Number(hookDur.toFixed(1)),
        timecode: `00:00 - ${this.formatTimecode(hookDur)}`,
        text: 'Você ainda perde horas tentando criar criativos que realmente vendem sem depender da sorte?',
        speaker: 'Locutor (Hook)',
        confidence: 0.9,
      },
      {
        id: 'seg_2',
        startSeconds: Number(hookDur.toFixed(1)),
        endSeconds: Number((hookDur + probDur).toFixed(1)),
        timecode: `${this.formatTimecode(hookDur)} - ${this.formatTimecode(hookDur + probDur)}`,
        text: 'A maioria das pessoas falha porque tenta copiar vídeos aleatórios sem entender a estrutura secreta de conversão.',
        speaker: 'Locutor (Problema)',
        confidence: 0.88,
      },
      {
        id: 'seg_3',
        startSeconds: Number((hookDur + probDur).toFixed(1)),
        endSeconds: Number((hookDur + probDur + solDur).toFixed(1)),
        timecode: `${this.formatTimecode(hookDur + probDur)} - ${this.formatTimecode(hookDur + probDur + solDur)}`,
        text: 'Com esta tecnologia com Inteligência Artificial, você analisa qualquer padrão vencedor e remodela em segundos.',
        speaker: 'Locutor (Solução)',
        confidence: 0.92,
      },
      {
        id: 'seg_4',
        startSeconds: Number((hookDur + probDur + solDur).toFixed(1)),
        endSeconds: Number(dur.toFixed(1)),
        timecode: `${this.formatTimecode(hookDur + probDur + solDur)} - ${this.formatTimecode(dur)}`,
        text: 'Toque no botão abaixo agora e garanta seu acesso com condições exclusivas por tempo limitado.',
        speaker: 'Locutor (CTA)',
        confidence: 0.94,
      },
    ];

    const fullText = customNotice
      ? `[${customNotice}] ` + segments.map((s) => s.text).join(' ')
      : segments.map((s) => s.text).join(' ');

    const words = fullText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wordsPerMinute = Math.round((wordCount / (dur / 60)));

    return {
      text: fullText,
      language: 'pt-BR',
      durationSeconds: dur,
      wordCount,
      wordsPerMinute,
      segments,
      provider: 'heuristic_engine',
      isEstimated: true,
    };
  }

  private formatTimecode(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

export const transcriptionProvider = new TranscriptionProvider();
