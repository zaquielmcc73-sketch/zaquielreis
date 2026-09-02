export interface VideoGenerateParams {
  prompt: string;
  model: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution?: '720p' | '1080p';
  durationSeconds?: number;
  imageBytes?: string;
  imageMimeType?: string;
}

export interface OperationStatusResult {
  done: boolean;
  videoUri?: string;
  error?: string;
  rawResponse?: any;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  provider: string;
  models?: string[];
  requiresBilling?: boolean;
}

export interface VideoGenerationProvider {
  readonly name: string;
  testConnection(apiKey?: string): Promise<ConnectionTestResult>;
  generateVideo(params: VideoGenerateParams, apiKey?: string): Promise<{ operationName: string }>;
  checkOperationStatus(operationName: string, apiKey?: string): Promise<OperationStatusResult>;
  downloadVideo(videoUri: string, outputPath: string, apiKey?: string): Promise<string>;
}
