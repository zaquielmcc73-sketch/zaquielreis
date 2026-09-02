/**
 * Centralized AI Model Configurations for Veo Auto Studio
 * Single Source of Truth for all Google GenAI and Google Veo model identifiers.
 * 
 * Validated against official @google/genai guidelines and SDK documentation.
 */

export const AI_MODELS = {
  /**
   * Primary text & copywriting model for structured JSON schemas, ICP, offers, angles, hooks, and scripts.
   * Official recommended model for text tasks in Google GenAI SDK.
   */
  GEMINI_TEXT: 'gemini-3.7-flash',

  /**
   * Advanced reasoning model for deep complex analysis or heavy STEM/code tasks.
   */
  GEMINI_REASONING: 'gemini-3.1-pro-preview',

  /**
   * Multimodal vision and video frame analyzer for Video Copier and scene inspection.
   */
  GEMINI_MULTIMODAL_VISION: 'gemini-3.7-flash',

  /**
   * Audio transcription model for video audio extraction.
   */
  GEMINI_AUDIO_TRANSCRIBE: 'gemini-3.5-transcribe',

  /**
   * Standard fast video generation model for Veo jobs.
   */
  VEO_VIDEO_LITE: 'veo-3.1-lite-generate-preview',

  /**
   * High-quality video generation model for 4K and multi-reference assets.
   */
  VEO_VIDEO_HQ: 'veo-3.1-generate-preview',

  /**
   * Legacy stable video generation model.
   */
  VEO_VIDEO_LEGACY: 'veo-2.0-generate-001',
} as const;

export type AiModelKey = keyof typeof AI_MODELS;
export type AiModelIdentifier = (typeof AI_MODELS)[AiModelKey];
