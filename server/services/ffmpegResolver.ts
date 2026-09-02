import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

export interface FFmpegResolvedPaths {
  ffmpegPath: string | null;
  ffprobePath: string | null;
  isAvailable: boolean;
  source: 'installer' | 'custom_env' | 'electron_resources' | 'system_path' | 'user_data' | 'none';
  version?: string;
  error?: string;
}

let cachedResolvedPaths: FFmpegResolvedPaths | null = null;

function sanitizeAsarPath(rawPath: string): string {
  if (!rawPath) return rawPath;
  // If Electron packages app into app.asar, asarUnpack extracts binaries into app.asar.unpacked
  return rawPath.replace(/\bapp\.asar\b/g, 'app.asar.unpacked');
}

export function resolveFFmpegPaths(forceRecheck = false): FFmpegResolvedPaths {
  if (cachedResolvedPaths && !forceRecheck) {
    return cachedResolvedPaths;
  }

  // 1. Check custom environment variables
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    const ffprobeP = process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)
      ? process.env.FFPROBE_PATH
      : null;

    cachedResolvedPaths = {
      ffmpegPath: process.env.FFMPEG_PATH,
      ffprobePath: ffprobeP,
      isAvailable: true,
      source: 'custom_env',
    };
    return cachedResolvedPaths;
  }

  // 2. Check @ffmpeg-installer & @ffprobe-installer with asar sanitization
  try {
    const rawFfmpeg = (ffmpegInstaller && (ffmpegInstaller.path || (ffmpegInstaller as any).default?.path)) || '';
    const rawFfprobe = (ffprobeInstaller && (ffprobeInstaller.path || (ffprobeInstaller as any).default?.path)) || '';

    const sanitizedFfmpeg = sanitizeAsarPath(rawFfmpeg);
    const sanitizedFfprobe = sanitizeAsarPath(rawFfprobe);

    if (sanitizedFfmpeg && fs.existsSync(sanitizedFfmpeg)) {
      cachedResolvedPaths = {
        ffmpegPath: sanitizedFfmpeg,
        ffprobePath: fs.existsSync(sanitizedFfprobe) ? sanitizedFfprobe : null,
        isAvailable: true,
        source: 'installer',
      };
      return cachedResolvedPaths;
    }
  } catch (e) {
    console.warn('[FFmpegResolver] Could not load @ffmpeg-installer paths:', e);
  }

  // 3. Check Electron process.resourcesPath / bin
  try {
    const resourcesPath = (process as any).resourcesPath;
    if (resourcesPath) {
      const isWin = process.platform === 'win32';
      const exeExt = isWin ? '.exe' : '';
      const resFfmpeg = path.join(resourcesPath, 'bin', `ffmpeg${exeExt}`);
      const resFfprobe = path.join(resourcesPath, 'bin', `ffprobe${exeExt}`);

      if (fs.existsSync(resFfmpeg)) {
        cachedResolvedPaths = {
          ffmpegPath: resFfmpeg,
          ffprobePath: fs.existsSync(resFfprobe) ? resFfprobe : null,
          isAvailable: true,
          source: 'electron_resources',
        };
        return cachedResolvedPaths;
      }
    }
  } catch (e) {}

  // 4. Check system PATH
  try {
    const cmd = process.platform === 'win32' ? 'where ffmpeg' : 'which ffmpeg';
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const firstPath = output.split(/\r?\n/)[0]?.trim();
    if (firstPath && fs.existsSync(firstPath)) {
      let firstFfprobe: string | null = null;
      try {
        const probeCmd = process.platform === 'win32' ? 'where ffprobe' : 'which ffprobe';
        const probeOut = execSync(probeCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        firstFfprobe = probeOut.split(/\r?\n/)[0]?.trim() || null;
      } catch {}

      cachedResolvedPaths = {
        ffmpegPath: firstPath,
        ffprobePath: firstFfprobe,
        isAvailable: true,
        source: 'system_path',
      };
      return cachedResolvedPaths;
    }
  } catch (e) {}

  cachedResolvedPaths = {
    ffmpegPath: null,
    ffprobePath: null,
    isAvailable: false,
    source: 'none',
    error: 'Nenhum executável FFmpeg válido foi encontrado no sistema ou empacotamento.',
  };

  return cachedResolvedPaths;
}
