import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import { resolveFFmpegPaths } from './ffmpegResolver';
import { VideoJoinerClip, VideoJoinerConfig, AudioTrackConfig } from '../../src/types';

export interface MediaProbeResult {
  hasVideo: boolean;
  hasAudio: boolean;
  width: number;
  height: number;
  aspectRatio: string;
  fps: number;
  durationSeconds: number;
  codecVideo?: string;
  codecAudio?: string;
  fileSizeBytes: number;
}

export interface JoinProcessResult {
  success: boolean;
  outputPath: string;
  outputUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  error?: string;
}

/**
 * Execute FFprobe to gather media stream information
 */
export async function extractAudioFromVideo(
  videoPath: string,
  outputAudioPath: string
): Promise<{ success: boolean; audioPath: string; durationSeconds: number; error?: string }> {
  const { ffmpegPath } = resolveFFmpegPaths();
  const probe = await probeMedia(videoPath);

  if (!fs.existsSync(videoPath)) {
    return { success: false, audioPath: '', durationSeconds: 0, error: 'Arquivo de vídeo não encontrado.' };
  }

  // Ensure directory for output audio exists
  const outDir = path.dirname(outputAudioPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve) => {
    // If input video doesn't have an audio stream or ffmpeg isn't available
    if (!probe.hasAudio) {
      // Create empty/silent audio fallback so pipeline doesn't break
      return resolve({
        success: true,
        audioPath: '',
        durationSeconds: probe.durationSeconds,
        error: 'O vídeo não contém faixa de áudio.',
      });
    }

    if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
      return resolve({
        success: false,
        audioPath: '',
        durationSeconds: probe.durationSeconds,
        error: 'FFmpeg executável não encontrado para extração de áudio.',
      });
    }

    const args = [
      '-i', videoPath,
      '-vn',
      '-acodec', 'libmp3lame',
      '-ab', '192k',
      '-ar', '44100',
      '-y',
      outputAudioPath,
    ];

    const proc = spawn(ffmpegPath, args);
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputAudioPath)) {
        resolve({
          success: true,
          audioPath: outputAudioPath,
          durationSeconds: probe.durationSeconds,
        });
      } else {
        resolve({
          success: false,
          audioPath: '',
          durationSeconds: probe.durationSeconds,
          error: `Falha ao extrair áudio com FFmpeg (código ${code}): ${stderr.slice(-200)}`,
        });
      }
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        audioPath: '',
        durationSeconds: probe.durationSeconds,
        error: `Erro ao iniciar processo FFmpeg: ${err.message}`,
      });
    });
  });
}

/**
 * Execute FFprobe to gather media stream information
 */
export async function probeMedia(filePath: string): Promise<MediaProbeResult> {
  const { ffprobePath } = resolveFFmpegPaths();
  const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
  const defaultRes: MediaProbeResult = {
    hasVideo: true,
    hasAudio: true,
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    fps: 30,
    durationSeconds: 8,
    fileSizeBytes: stats ? stats.size : 0,
  };

  if (!ffprobePath || !fs.existsSync(ffprobePath) || !stats) {
    return defaultRes;
  }

  return new Promise((resolve) => {
    const args = [
      '-v', 'error',
      '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,duration:format=duration,size',
      '-of', 'json',
      filePath,
    ];

    const proc = spawn(ffprobePath, args);
    let rawJson = '';

    proc.stdout.on('data', (d) => {
      rawJson += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && rawJson) {
        try {
          const parsed = JSON.parse(rawJson);
          const vStream = parsed.streams?.find((s: any) => s.codec_type === 'video');
          const aStream = parsed.streams?.find((s: any) => s.codec_type === 'audio');

          let width = vStream?.width || 1080;
          let height = vStream?.height || 1920;
          let duration = parseFloat(parsed.format?.duration || vStream?.duration || '8');
          if (isNaN(duration) || duration <= 0) duration = 8;

          let fps = 30;
          if (vStream?.r_frame_rate) {
            const [num, den] = vStream.r_frame_rate.split('/').map(Number);
            if (num && den) fps = Math.round(num / den);
          }

          const ratio = width / height;
          let aspect = '9:16';
          if (Math.abs(ratio - 16 / 9) < 0.1) aspect = '16:9';
          else if (Math.abs(ratio - 1) < 0.1) aspect = '1:1';

          resolve({
            hasVideo: !!vStream,
            hasAudio: !!aStream,
            width,
            height,
            aspectRatio: aspect,
            fps: fps || 30,
            durationSeconds: duration,
            codecVideo: vStream?.codec_name,
            codecAudio: aStream?.codec_name,
            fileSizeBytes: stats.size,
          });
          return;
        } catch (e) {}
      }
      resolve(defaultRes);
    });

    proc.on('error', () => {
      resolve(defaultRes);
    });
  });
}

function getTargetDimensions(aspectRatio: '9:16' | '16:9' | '1:1', resolution: '720p' | '1080p'): { width: number; height: number } {
  if (aspectRatio === '9:16') {
    return resolution === '1080p' ? { width: 1080, height: 1920 } : { width: 720, height: 1280 };
  } else if (aspectRatio === '16:9') {
    return resolution === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
  } else {
    return resolution === '1080p' ? { width: 1080, height: 1080 } : { width: 720, height: 720 };
  }
}

/**
 * Normalizes an individual video clip into an intermediate standardized MP4:
 * - Specific target resolution with proper aspect ratio scaling & black padding (letterbox/pillarbox)
 * - Standardized frame rate (30fps or 60fps)
 * - Pixel format yuv420p
 * - Safe trimming (start and end)
 * - Audio volume adjustment or silent track injection if clip has no audio
 */
async function normalizeClip(
  clip: VideoJoinerClip,
  index: number,
  tempDir: string,
  targetWidth: number,
  targetHeight: number,
  targetFps: number,
  ffmpegPath: string
): Promise<string> {
  const intermediatePath = path.join(tempDir, `norm_clip_${index}.mp4`);
  const probe = await probeMedia(clip.filePath);

  const trimStart = Math.max(0, clip.trimStartSeconds || 0);
  const effectiveDur = clip.effectiveDuration > 0
    ? clip.effectiveDuration
    : Math.max(0.5, (probe.durationSeconds || 8) - trimStart - (clip.trimEndSeconds || 0));

  const volumeMult = clip.isMuted ? 0 : Math.max(0, (clip.volumePercent || 100) / 100);

  // Video filter: scale to fit inside target box, then pad to exact target box
  const videoFilter = `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${targetFps}`;

  return new Promise((resolve, reject) => {
    let args: string[] = [];

    // Seek before input for fast & accurate trimming
    if (trimStart > 0) {
      args.push('-ss', trimStart.toFixed(3));
    }
    args.push('-i', clip.filePath);
    args.push('-t', effectiveDur.toFixed(3));

    if (probe.hasAudio && !clip.isMuted && volumeMult > 0) {
      // Input has audio -> scale video & filter audio
      args.push(
        '-vf', videoFilter,
        '-af', `volume=${volumeMult.toFixed(2)},aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '22',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-y',
        intermediatePath
      );
    } else {
      // No audio or muted -> generate silent audio track to prevent concat sync issues
      args.push(
        '-f', 'lavfi',
        '-t', effectiveDur.toFixed(3),
        '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
        '-vf', videoFilter,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '22',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-shortest',
        '-y',
        intermediatePath
      );
    }

    const proc = spawn(ffmpegPath, args);
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(intermediatePath)) {
        resolve(intermediatePath);
      } else {
        reject(new Error(`Falha na normalização do clipe #${index + 1} (${clip.name}): ${stderr.slice(-300)}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main Video Joiner & Multiplier Assembler
 */
export async function processVideoJoin(
  config: VideoJoinerConfig,
  outputDir: string,
  onProgress?: (percent: number, stepText: string) => void
): Promise<JoinProcessResult> {
  const { ffmpegPath, isAvailable, error: resolverError } = resolveFFmpegPaths();

  if (!isAvailable || !ffmpegPath) {
    throw new Error(resolverError || 'FFmpeg não está disponível no ambiente.');
  }

  if (!config.clips || config.clips.length === 0) {
    throw new Error('Nenhum clipe informado para a junção.');
  }

  // Create isolated temp directory
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tempDir = path.join(os.tmpdir(), 'veo_studio_temp', jobId);
  fs.mkdirSync(tempDir, { recursive: true });

  const { width, height } = getTargetDimensions(config.aspectRatio, config.resolution);
  const fps = config.fps || 30;

  try {
    // 1. Normalize all clips in parallel / sequence
    onProgress?.(10, `Normalizando ${config.clips.length} clipes para ${width}x${height} @ ${fps}fps...`);
    const normalizedPaths: string[] = [];

    for (let i = 0; i < config.clips.length; i++) {
      const clip = config.clips[i];
      const progressPercent = 10 + Math.round(((i + 1) / config.clips.length) * 45);
      onProgress?.(progressPercent, `Processando clipe ${i + 1} de ${config.clips.length}: ${clip.name}`);

      const normPath = await normalizeClip(clip, i, tempDir, width, height, fps, ffmpegPath);
      normalizedPaths.push(normPath);
    }

    // 2. Build concat list
    const concatListFile = path.join(tempDir, 'concat_list.txt');
    const fileEntries = normalizedPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    fs.writeFileSync(concatListFile, fileEntries, 'utf-8');

    // 3. Concatenate clips
    onProgress?.(60, 'Concatenando blocos de vídeo e equalizando áudio...');
    const concatenatedRawPath = path.join(tempDir, 'concatenated_raw.mp4');

    await new Promise<void>((resolve, reject) => {
      const args = [
        '-f', 'concat',
        '-safe', '0',
        '-i', concatListFile,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-y',
        concatenatedRawPath,
      ];

      const proc = spawn(ffmpegPath, args);
      let errStr = '';
      proc.stderr.on('data', (d) => {
        errStr += d.toString();
      });

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(concatenatedRawPath)) {
          resolve();
        } else {
          reject(new Error(`Falha na concatenação dos clipes: ${errStr.slice(-300)}`));
        }
      });
      proc.on('error', (err) => reject(err));
    });

    // 4. Handle Background Audio track if provided
    let finalProcessedPath = concatenatedRawPath;
    if (config.backgroundAudio && config.backgroundAudio.filePath && fs.existsSync(config.backgroundAudio.filePath)) {
      onProgress?.(80, 'Mixando trilha sonora e aplicando fade...');
      const withAudioPath = path.join(tempDir, 'with_bg_audio.mp4');
      const bgVol = Math.max(0.05, (config.backgroundAudio.volumePercent || 30) / 100);
      const bgFadeIn = config.backgroundAudio.fadeInSeconds || 0.5;
      const bgFadeOut = config.backgroundAudio.fadeOutSeconds || 1.5;

      const rawProbe = await probeMedia(concatenatedRawPath);
      const totalDur = rawProbe.durationSeconds;
      const fadeOutStart = Math.max(0, totalDur - bgFadeOut);

      await new Promise<void>((resolve, reject) => {
        const args = [
          '-i', concatenatedRawPath,
          '-stream_loop', '-1',
          '-i', config.backgroundAudio!.filePath!,
          '-filter_complex',
          `[1:a]volume=${bgVol.toFixed(2)},afade=t=in:ss=0:d=${bgFadeIn},afade=t=out:st=${fadeOutStart.toFixed(2)}:d=${bgFadeOut}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
          '-map', '0:v:0',
          '-map', '[aout]',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-shortest',
          '-y',
          withAudioPath,
        ];

        const proc = spawn(ffmpegPath, args);
        let errStr = '';
        proc.stderr.on('data', (d) => { errStr += d.toString(); });
        proc.on('close', (code) => {
          if (code === 0 && fs.existsSync(withAudioPath)) {
            finalProcessedPath = withAudioPath;
            resolve();
          } else {
            console.warn('[VideoProcessor] Could not mix background audio:', errStr);
            // Fallback to raw video without failing entire job
            resolve();
          }
        });
        proc.on('error', () => resolve());
      });
    }

    // 5. Move final file to output directory
    onProgress?.(95, 'Finalizando gravação do arquivo e gerando metadados...');
    fs.mkdirSync(outputDir, { recursive: true });
    const cleanTitle = (config.outputFileName || config.title || 'video_unificado')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const finalFileName = `${cleanTitle}_${Date.now()}.mp4`;
    const finalDestPath = path.join(outputDir, finalFileName);

    fs.copyFileSync(finalProcessedPath, finalDestPath);

    const finalStats = fs.statSync(finalDestPath);
    const finalProbe = await probeMedia(finalDestPath);

    onProgress?.(100, 'Vídeo finalizado com sucesso!');

    return {
      success: true,
      outputPath: finalDestPath,
      outputUrl: `/output/${finalFileName}`,
      durationSeconds: finalProbe.durationSeconds,
      fileSizeBytes: finalStats.size,
    };
  } finally {
    // 6. Clean up temporary files
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn('[VideoProcessor] Could not remove temp dir:', tempDir, e);
    }
  }
}

export interface ExtractedRawFrame {
  frameId: string;
  timestampSeconds: number;
  timecode: string;
  filePath: string;
  base64: string;
}

export interface FrameExtractionResult {
  success: boolean;
  frames: ExtractedRawFrame[];
  tempDir: string;
  durationSeconds: number;
  estimatedSceneChanges: number;
  estimatedCutsPerMinute: number;
  sceneDisclaimer: string;
  error?: string;
}

/**
 * Determina quantidade adaptativa de frames com base na duração do vídeo:
 * - até 15s: 6 frames
 * - 16–30s: 8 frames
 * - 31–60s: 10 frames
 * - 61–120s: 12 frames
 * - acima de 120s: máximo 16 frames
 */
export function calculateAdaptiveFrameCount(durationSeconds: number): number {
  if (durationSeconds <= 15) return 6;
  if (durationSeconds <= 30) return 8;
  if (durationSeconds <= 60) return 10;
  if (durationSeconds <= 120) return 12;
  return 16;
}

/**
 * Formata segundos em timecode mm:ss.ms
 */
export function formatFrameTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frac = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frac).padStart(2, '0')}`;
}

/**
 * Detecta mudanças de cena técnicas estimadas via FFmpeg
 */
export async function detectSceneChanges(
  videoPath: string,
  durationSeconds: number
): Promise<{ estimatedSceneChanges: number; estimatedCutsPerMinute: number }> {
  const { ffmpegPath } = resolveFFmpegPaths();
  const fallbackCuts = Math.max(1, Math.round(durationSeconds / 3));
  const cutsPerMin = durationSeconds > 0 ? Math.round((fallbackCuts / durationSeconds) * 60) : 20;

  if (!ffmpegPath || !fs.existsSync(ffmpegPath) || !fs.existsSync(videoPath)) {
    return {
      estimatedSceneChanges: fallbackCuts,
      estimatedCutsPerMinute: cutsPerMin,
    };
  }

  return new Promise((resolve) => {
    // Analisa até 60s para eficiência
    const maxAnalyzeSec = Math.min(60, durationSeconds || 15);
    const args = [
      '-ss', '0',
      '-t', maxAnalyzeSec.toString(),
      '-i', videoPath,
      '-filter_complex', "select='gt(scene,0.35)',metadata=print",
      '-f', 'null',
      '-',
    ];

    const proc = spawn(ffmpegPath, args);
    let output = '';

    proc.stderr.on('data', (d) => {
      output += d.toString();
    });

    const timeout = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (e) {}
      resolve({
        estimatedSceneChanges: fallbackCuts,
        estimatedCutsPerMinute: cutsPerMin,
      });
    }, 15000);

    proc.on('close', () => {
      clearTimeout(timeout);
      const matches = output.match(/pts_time:([0-9.]+)/g) || [];
      const sampleCount = matches.length;
      
      let estimatedSceneChanges = sampleCount;
      if (durationSeconds > maxAnalyzeSec && maxAnalyzeSec > 0) {
        estimatedSceneChanges = Math.round((sampleCount / maxAnalyzeSec) * durationSeconds);
      }
      
      if (estimatedSceneChanges <= 0) {
        estimatedSceneChanges = Math.max(1, Math.round(durationSeconds / 3.5));
      }

      const calculatedCutsPerMin = durationSeconds > 0
        ? Math.round((estimatedSceneChanges / durationSeconds) * 60)
        : 20;

      resolve({
        estimatedSceneChanges,
        estimatedCutsPerMinute: Math.max(6, Math.min(60, calculatedCutsPerMin)),
      });
    });

    proc.on('error', () => {
      clearTimeout(timeout);
      resolve({
        estimatedSceneChanges: fallbackCuts,
        estimatedCutsPerMinute: cutsPerMin,
      });
    });
  });
}

/**
 * Extrai frames representativos do vídeo de forma adaptativa e otimizada
 */
export async function extractVideoFrames(
  videoPath: string,
  options?: { customFrameCount?: number; targetWidth?: number }
): Promise<FrameExtractionResult> {
  const { ffmpegPath } = resolveFFmpegPaths();
  const probe = await probeMedia(videoPath);
  const dur = Math.max(1, probe.durationSeconds || 8);
  const frameCount = options?.customFrameCount || calculateAdaptiveFrameCount(dur);
  const targetWidth = options?.targetWidth || 720; // Otimizado para banda e análise

  const tempDir = path.join(os.tmpdir(), `vc_frames_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const sceneResult = await detectSceneChanges(videoPath, dur);

  if (!ffmpegPath || !fs.existsSync(ffmpegPath) || !fs.existsSync(videoPath)) {
    return {
      success: false,
      frames: [],
      tempDir,
      durationSeconds: dur,
      estimatedSceneChanges: sceneResult.estimatedSceneChanges,
      estimatedCutsPerMinute: sceneResult.estimatedCutsPerMinute,
      sceneDisclaimer: 'Estimativa baseada em análise técnica do vídeo.',
      error: 'FFmpeg ou arquivo de vídeo não encontrado para extração de frames.',
    };
  }

  // Gera timestamps distribuídos uniformemente
  const timestamps: number[] = [];
  if (frameCount === 1) {
    timestamps.push(Math.min(1, dur * 0.5));
  } else {
    const step = dur / frameCount;
    for (let i = 0; i < frameCount; i++) {
      // Pequeno offset inicial para pegar o primeiro frame significativo (ex: 0.2s)
      const t = Math.max(0.1, Math.min(dur - 0.2, (i * step) + (step * 0.2)));
      timestamps.push(Number(t.toFixed(2)));
    }
  }

  const frames: ExtractedRawFrame[] = [];

  // Extrai frames em fila sequencial / lotes controlados para não sobrecarregar memória/disco
  for (let idx = 0; idx < timestamps.length; idx++) {
    const ts = timestamps[idx];
    const frameIndexStr = String(idx + 1).padStart(2, '0');
    const frameFileName = `frame_${frameIndexStr}_${ts.toFixed(2)}s.jpg`;
    const frameOutPath = path.join(tempDir, frameFileName);

    await new Promise<void>((resolveFrame) => {
      const args = [
        '-ss', ts.toString(),
        '-i', videoPath,
        '-vframes', '1',
        '-q:v', '3',
        '-vf', `scale=${targetWidth}:-1`,
        '-y',
        frameOutPath,
      ];

      const proc = spawn(ffmpegPath, args);
      
      const frameTimeout = setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch (e) {}
        resolveFrame();
      }, 8000);

      proc.on('close', (code) => {
        clearTimeout(frameTimeout);
        if (code === 0 && fs.existsSync(frameOutPath)) {
          try {
            const buf = fs.readFileSync(frameOutPath);
            const base64 = buf.toString('base64');
            frames.push({
              frameId: `frame_${frameIndexStr}`,
              timestampSeconds: ts,
              timecode: formatFrameTimecode(ts),
              filePath: frameOutPath,
              base64,
            });
          } catch (e) {}
        }
        resolveFrame();
      });

      proc.on('error', () => {
        clearTimeout(frameTimeout);
        resolveFrame();
      });
    });
  }

  return {
    success: frames.length > 0,
    frames,
    tempDir,
    durationSeconds: dur,
    estimatedSceneChanges: sceneResult.estimatedSceneChanges,
    estimatedCutsPerMinute: sceneResult.estimatedCutsPerMinute,
    sceneDisclaimer: 'Estimativa baseada em análise técnica do vídeo.',
  };
}

/**
 * Limpa arquivos temporários de frames com segurança
 */
export function cleanupTempFrames(tempDir: string): void {
  try {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn('[VideoProcessor] Erro ao limpar temp frames:', tempDir, e);
  }
}
