export type SalesMethodId =
  | 'china'
  | 'drive_thru'
  | 'fomo'
  | 'challenger'
  | 'command_message'
  | 'conceptual_selling'
  | 'consultative_selling'
  | 'customer_centric'
  | 'gap_selling'
  | 'inbound'
  | 'meddic'
  | 'neat'
  | 'sandler'
  | 'snap'
  | 'spin'
  | 'social_selling'
  | 'solution_selling'
  | 'tas'
  | 'value_selling'
  | 'heros_journey'
  | 'sparklines'
  | 'four_w'
  | 'conflict_turnaround'
  | 'product_placement'
  | 'case_study'
  | 'what_if'
  | 'fala'
  | 'pain_solution'
  | 'direct_benefit'
  | 'curiosity'
  | 'storytelling'
  | 'testimonial'
  | 'ugc'
  | 'pov'
  | 'demo'
  | 'offer'
  | 'viral'
  | 'comparison'
  | 'status_desire'
  | 'emotional_transformation'
  | 'custom_method';

export interface SalesMethodInfo {
  id: SalesMethodId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  category: 'direct' | 'story' | 'organic' | 'psychology';
  structure: string[];
  customConfig?: Record<string, any>;
}

export interface ProjectBible {
  productName: string;
  slogan?: string;
  description: string;
  brandColors: string;
  logoDescription?: string;
  logoPlacement?: string;
  keyFeatures?: string[];
  materials: string;
  primaryBenefits?: string[];
  irresistibleOffer: string;
  targetAudience: string;
  pains?: string[];
  desires?: string[];
  objections?: string[];
  brandTone?: string;
  voiceTone?: string;
  visualRules?: string;
  negativeRules?: string;
  negativePromptRules?: string;
  updatedAt?: string;
}

export interface POVConfig {
  perspective: 'first_person';
  characterGender: 'man' | 'woman' | 'custom';
  customCharacter?: string;
  environment: 'gym' | 'home' | 'kitchen' | 'street' | 'store' | 'work' | 'restaurant' | 'car' | 'custom';
  customEnvironment?: string;
  motionStyle: 'natural' | 'energetic' | 'cinematic';
  showHands: boolean;
  showFace: boolean;
  hasVoice: boolean;
  hasDialogue: boolean;
  language: 'pt_BR';
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      selectDirectory: () => Promise<string | null>;
      openPath: (folderPath: string) => Promise<boolean>;
      showItemInFolder: (filePath: string) => Promise<boolean>;
      saveApiKeySecurely: (key: string) => Promise<any>;
      getApiKeySecurely: () => Promise<any>;
      onLog: (callback: (val: any) => void) => void;
    };
  }
}

export interface UGCConfig {
  creatorGender: 'man' | 'woman' | 'any';
  ageRange: '18-24' | '25-34' | '35-49' | '50+';
  environment: 'bedroom' | 'kitchen' | 'car' | 'office' | 'outdoor' | 'unboxing_desk';
  speechStyle: 'casual_friend' | 'excited_reviewer' | 'expert_recommendation' | 'secret_leak';
  emotionalTone: 'relieved' | 'astonished' | 'confident' | 'obsessed';
}

export interface ChinaMethodConfig {
  hook: string;
  problem: string;
  mechanism: string;
  benefit: string;
  proof: string;
  offer: string;
  cta: string;
}

export interface DriveThruConfig {
  fastHook: string;
  problem: string;
  solution: string;
  mainBenefit: string;
  offer: string;
  cta: string;
}

export interface FOMOConfig {
  hook: string;
  opportunity: string;
  desire: string;
  riskOfLoss: string;
  urgency: string;
  offer: string;
  cta: string;
  hasRealScarcity: boolean;
  realUnitsRemaining?: number;
  realDeadline?: string;
  realPromoPrice?: string;
}

// ==========================================
// MÓDULO 1: CENTRAL DE MÍDIA TYPES
// ==========================================
export type MediaType = 'IMAGE' | 'VIDEO' | 'PRODUCT' | 'CHARACTER_REFERENCE' | 'LOGO' | 'OTHER';

export interface MediaAsset {
  id: string;
  name: string;
  originalFileName: string;
  type: MediaType;
  mimeType: string;
  sizeBytes: number;
  filePath: string;
  relativeUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  tags?: string[];
  associatedProductId?: string;
  associatedCampaignId?: string;
  associatedCharacterId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MÓDULO 2: PRODUTO TYPES
// ==========================================
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  benefits: string[];
  differentials: string[];
  features: string[];
  materials: string;
  dimensions?: string;
  targetAudience: string;
  pains: string[];
  desires: string[];
  objections: string[];
  salesArguments: string[];
  cta: string;
  mainMediaId?: string;
  mainImageUrl?: string;
  additionalMediaIds?: string[];
  additionalImageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MÓDULO 3: PERSONAGEM TYPES
// ==========================================
export type CharacterAgeGroup = '18-24' | '25-34' | '35-49' | '50+' | 'custom';
export type CharacterStyle =
  | 'ugc_casual'
  | 'cinematic_actor'
  | 'executive_professional'
  | 'fitness_creator'
  | 'streetwear_modern'
  | 'tech_reviewer'
  | 'lifestyle_influencer'
  | 'dermatology_specialist'
  | 'custom';

export interface Character {
  id: string;
  name: string;
  referenceMediaId?: string;
  referenceImageUrl?: string;
  ageGroup: CharacterAgeGroup;
  customAge?: string;
  appearance: string;
  hair: string;
  eyes: string;
  skinTone: string;
  clothing: string;
  accessories?: string;
  personality: string;
  profession: string;
  style: CharacterStyle;
  customStyle?: string;
  voiceTone: string;
  language: string;
  distinctiveFeatures: string;
  consistencyPrompt: string;
  negativePrompt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MÓDULO 4 & 5: PROMPT STUDIO PRO TYPES
// ==========================================
export type PromptPlatform = 'veo' | 'tiktok_ugc' | 'imagen' | 'generic_video';

export type PromptPresetType =
  | 'ugc'
  | 'pov'
  | 'direct_ad'
  | 'demo'
  | 'testimonial'
  | 'storytelling'
  | 'transformation'
  | 'comparison'
  | 'offer'
  | 'viral'
  | 'tiktok_shop'
  | 'live'
  | 'premium_product';

export interface CharacterWithProductConfig {
  productId: string;
  productImageMediaId?: string;
  productImageUrl?: string;
  characterId: string;
  scenario: string;
  action: string;
  framing: 'close_up' | 'medium_shot' | 'cowboy_shot' | 'wide_shot' | 'macro_detail';
  cameraMovement: 'static' | 'smooth_pan' | 'orbit_360' | 'dolly_in' | 'handheld_organic';
  lighting: 'studio_clean' | 'golden_hour' | 'neon_accent' | 'natural_window' | 'dramatic_chiaroscuro';
  expression: 'enthusiastic' | 'focused' | 'amazed' | 'confident' | 'relieved';
  customNegativePrompt?: string;
}

export interface PromptStudioConfig {
  platform: PromptPlatform;
  preset?: PromptPresetType;
  model: string;
  objective?: 'direct_sales' | 'brand_awareness' | 'viral_retention' | 'ugc_conversion' | 'product_demo';
  productId?: string;
  characterId?: string;
  visualReferenceMediaId?: string;
  targetAudience?: string;
  salesMethodId?: SalesMethodId;
  scenario: string;
  action: string;
  cameraAngle: string;
  lens: string;
  cameraMovement: string;
  lighting: string;
  visualStyle: string;
  emotion: string;
  durationSeconds: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution?: '720p' | '1080p';
  language?: string;
  voiceTone?: string;
  cta?: string;
  negativeInstructions?: string;
}

export interface PromptTemplate {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  presetType?: PromptPresetType;
  config: PromptStudioConfig;
  previewPrompt?: string;
  templatePrompt?: string;
  createdAt: string;
}

export interface CampaignFormData {
  id?: string;
  productId?: string;
  name: string;
  product: string;
  description: string;
  price: string;
  promoPrice: string;
  offer: string;
  targetAudience: string;
  pain: string;
  desire: string;
  benefits: string;
  differentials: string;
  socialProof: string;
  guarantee: string;
  cta: string;
  videoCount: 1 | 5 | 10 | 25 | 50 | 75;
  selectedModel: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  povConfig: POVConfig;
  ugcConfig: UGCConfig;
  chinaConfig: ChinaMethodConfig;
  driveThruConfig: DriveThruConfig;
  fomoConfig: FOMOConfig;
  methodsDistribution: Record<SalesMethodId, number>;
}

export interface GeneratedScript {
  id: string;
  campaignId: string;
  index: number;
  title: string;
  method: SalesMethodId;
  methodName: string;
  hook: string;
  scene1: string;
  scene2: string;
  scene3: string;
  scene4: string;
  dialogue: string;
  visualText: string;
  action: string;
  cta: string;
  veoPrompt: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
}

export type JobOrigin =
  | 'AI_GENERATION'
  | 'LOCAL_VIDEO_PROCESSING'
  | 'TIKTOK_SCRIPT'
  | 'TIKTOK_PROMPT'
  | 'TIKTOK_VIDEO'
  | 'LIVE_SCRIPT'
  | 'TIKTOK_PUBLISH';

export type JobStatus =
  | 'waiting'
  | 'generating'
  | 'polling'
  | 'saving'
  | 'completed'
  | 'error'
  | 'cancelled'
  | 'paused';

export interface GenerationJob {
  id: string;
  jobOrigin?: JobOrigin;
  campaignId: string;
  campaignName: string;
  scriptId: string;
  index: number;
  totalInBatch: number;
  method: SalesMethodId;
  methodName: string;
  hook: string;
  prompt: string;
  model: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  durationSeconds: number;
  status: JobStatus;
  progress: number;
  operationName?: string;
  videoUri?: string;
  localVideoPath?: string;
  localVideoUrl?: string;
  errorMessage?: string;
  errorSolution?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  // Local processing specific fields
  joinConfig?: VideoJoinerConfig;
  multiplierMetadata?: {
    variationId: string;
    hookName: string;
    bodyName: string;
    ctaName: string;
    hookSource: string;
    bodySource: string;
    ctaSource: string;
  };
}

// ==========================================
// FASE 2: JUNTADOR DE VÍDEOS (TYPES)
// ==========================================
export type VideoTransitionType = 'none' | 'fade' | 'dissolve' | 'wipeleft' | 'wiperight' | 'slideup';

export interface VideoJoinerClip {
  id: string;
  mediaAssetId?: string;
  filePath: string;
  url: string;
  name: string;
  durationSeconds: number;
  trimStartSeconds: number;
  trimEndSeconds: number;
  effectiveDuration: number;
  volumePercent: number; // 0 to 200
  isMuted: boolean;
  transitionToNext?: VideoTransitionType;
  transitionDurationSeconds?: number;
  textOverlay?: {
    text: string;
    position: 'top' | 'middle' | 'bottom';
    fontSize?: number;
    fontColor?: string;
    backgroundColor?: string;
  };
}

export interface AudioTrackConfig {
  mediaAssetId?: string;
  filePath?: string;
  url?: string;
  name?: string;
  volumePercent: number; // 0 to 200
  loop: boolean;
  fadeInSeconds: number;
  fadeOutSeconds: number;
}

export type VideoJoinerPreset =
  | 'tiktok'
  | 'tiktok_shop'
  | 'reels'
  | 'shorts'
  | 'direct_ad'
  | 'ugc'
  | 'product_demo'
  | 'custom';

export interface VideoJoinerConfig {
  title: string;
  outputFileName?: string;
  preset: VideoJoinerPreset;
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  fps: 30 | 60;
  clips: VideoJoinerClip[];
  backgroundAudio?: AudioTrackConfig;
  overallVolumePercent?: number;
  targetDurationSeconds?: number;
}

// ==========================================
// FASE 2: MULTIPLICADOR DE VÍDEOS (TYPES)
// ==========================================
export type MultiplierSlotType = 'HOOK' | 'BODY' | 'CTA';

export interface MultiplierBlock {
  id: string;
  slotType: MultiplierSlotType;
  label: string;
  mediaAssetId?: string;
  filePath: string;
  url: string;
  durationSeconds: number;
  trimStartSeconds?: number;
  trimEndSeconds?: number;
  volumePercent?: number;
  isMuted?: boolean;
}

export interface MultiplierMatrixItem {
  id: string; // e.g. V001
  index: number;
  name: string;
  hookBlock: MultiplierBlock;
  bodyBlock: MultiplierBlock;
  ctaBlock: MultiplierBlock;
  estimatedDurationSeconds: number;
  isSelected: boolean;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'error';
  jobId?: string;
  outputFilePath?: string;
  outputUrl?: string;
  errorMessage?: string;
}

export type MultiplierDistributionStrategy = 'sequential' | 'balanced_random' | 'unique_pairs';

export interface MultiplierConfig {
  campaignName: string;
  namingPrefix: string;
  maxCampaignVideos: 1 | 5 | 10 | 25 | 50 | 75;
  distributionStrategy: MultiplierDistributionStrategy;
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  fps: 30 | 60;
  hooks: MultiplierBlock[];
  bodies: MultiplierBlock[];
  ctas: MultiplierBlock[];
  backgroundAudio?: AudioTrackConfig;
  transitionBetweenBlocks: VideoTransitionType;
  productId?: string;
}


export interface SavedVideoItem {
  id: string;
  jobId: string;
  campaignId: string;
  campaignName: string;
  number: number;
  method: SalesMethodId;
  methodName: string;
  hook: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  resolution: string;
  durationSeconds: number;
  videoUrl: string;
  localPath: string;
  fileSizeBytes?: number;
  status: 'ready' | 'archived';
  createdAt: string;
  scriptSummary?: {
    dialogue: string;
    action: string;
    cta: string;
  };
}

export interface AppSettings {
  apiKeyConfigured: boolean;
  hasEnvKey: boolean;
  selectedModel: string;
  outputDirectory: string;
  maxConcurrency: number;
  maxRetries: number;
  defaultAspectRatio: '9:16' | '16:9' | '1:1';
  defaultResolution: '720p' | '1080p';
  demoMode: boolean;
  testVideoVerified: boolean;
  onboardingCompleted?: boolean;
}

export interface AnalyticsData {
  totalVideosGenerated: number;
  completedVideos: number;
  failedVideos: number;
  inProgressVideos: number;
  waitingVideos: number;
  completionRatePercent: number;
  avgGenerationTimeSeconds: number;
  methodsUsedCount: Record<string, number>;
  recentCampaignsCount: number;
  totalMediaAssets?: number;
  totalProducts?: number;
  totalCharacters?: number;
  totalTikTokCreatives?: number;
  totalLiveScripts?: number;
  totalPublishedVideos?: number;
}

// ==========================================
// FASE 3: TIKTOK SHOP SALES FACTORY TYPES
// ==========================================

export type TikTokVideoType =
  | 'ugc'
  | 'pov'
  | 'demo'
  | 'testimonial'
  | 'storytelling'
  | 'transformation'
  | 'comparison'
  | 'offer'
  | 'pain_solution'
  | 'curiosity'
  | 'direct_benefit'
  | 'social_proof'
  | 'status_desire'
  | 'viral'
  | 'tiktok_shop';

export type TikTokHookCategory =
  | 'pain'
  | 'problem_solution'
  | 'benefit'
  | 'surprise'
  | 'demo'
  | 'comparison'
  | 'common_error'
  | 'before_after'
  | 'proof'
  | 'objection'
  | 'urgency'
  | 'question'
  | 'pattern_interrupt'
  | 'curiosity'
  | 'contrarian'
  | 'controversy'
  | 'secret_tip'
  | 'storytelling'
  | 'status'
  | 'economy'
  | 'transformation'
  | 'unboxing'
  | 'aesthetic';

export interface TikTokHook {
  id: string;
  text: string;
  category: TikTokHookCategory;
  categoryLabel: string;
  dominantEmotion?: string;
  objective?: string;
  salesMethodId?: SalesMethodId;
  salesMethodName?: string;
  visualSuggestion?: string;
  openingSuggestion?: string;
  recommendedCta?: string;
  score?: number;
  retentionScore?: number;
  retentionLevel?: 'ALTO' | 'MUITO_ALTO' | 'EXPLOSIVO' | string;
  audioEffect?: string;
  estimatedDurationSeconds?: number;
}

export type TikTokCtaCategory =
  | 'immediate_purchase'
  | 'yellow_cart'
  | 'limited_offer'
  | 'free_shipping'
  | 'coupon'
  | 'benefit'
  | 'urgency'
  | 'scarcity'
  | 'curiosity'
  | 'proof'
  | 'offer'
  | 'tiktok_shop'
  | 'click_product'
  | 'view_product'
  | 'enjoy_condition'
  | 'last_opportunity';

export interface TikTokCta {
  id: string;
  text: string;
  category: TikTokCtaCategory;
  categoryLabel: string;
  dominantEmotion: string;
  placement: 'on_screen_text' | 'voiceover' | 'both';
  complianceNote?: string; // Ensures real non-fabricated scarcity
}

export type TikTokScriptDuration = 15 | 30 | 45 | 60;

export type TikTokScriptBlockType =
  | 'HOOK'
  | 'PROBLEMA'
  | 'AGITACAO'
  | 'SOLUCAO'
  | 'DEMONSTRACAO'
  | 'BENEFICIOS'
  | 'PROVA'
  | 'OBJECAO'
  | 'OFERTA'
  | 'CTA';

export interface TikTokScriptBlock {
  id: string;
  type: TikTokScriptBlockType;
  title: string;
  durationSeconds: number;
  spokenText: string;
  visualAction: string;
  onScreenText?: string;
  audioEffect?: string;
}

export interface TikTokScript {
  id: string;
  productId?: string;
  productName: string;
  title: string;
  targetAudience: string;
  salesMethodId: SalesMethodId;
  salesMethodName: string;
  videoType: TikTokVideoType;
  duration: TikTokScriptDuration;
  aspectRatio: '9:16' | '16:9' | '1:1';
  hook: TikTokHook;
  cta: TikTokCta;
  characterId?: string;
  characterName?: string;
  scenario: string;
  visualStyle: string;
  tone: string;
  blocks: TikTokScriptBlock[];
  estimatedTotalDuration: number;
  fullDialogue: string;
  fullVeoPrompt: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// FASE 3: LIVE SALES FACTORY TYPES
// ==========================================

export type LiveSalesDuration = 5 | 15 | 30 | 60;

export type LiveBlockType =
  | 'opening'
  | 'hook'
  | 'presentation'
  | 'problem'
  | 'product'
  | 'demonstration'
  | 'benefits'
  | 'proof'
  | 'objections'
  | 'offer'
  | 'cta'
  | 'interaction'
  | 'strategic_repetition'
  | 'new_angle'
  | 'new_hook'
  | 'new_demo'
  | 'new_cta'
  | 'closing';

export interface LiveBlock {
  id: string;
  type: LiveBlockType;
  title: string;
  durationMinutes: number;
  objective: string;
  speakerSpeech: string;
  action: string;
  productName: string;
  benefitHighlight: string;
  offerHighlight: string;
  cta: string;
  audienceQuestionPrompt: string;
  onScreenText: string;
  speakerNotes: string;
  orderIndex: number;
}

export interface LiveInteractionPrompt {
  id: string;
  category:
    | 'questions'
    | 'objections'
    | 'demonstration'
    | 'product'
    | 'benefit'
    | 'price'
    | 'offer'
    | 'comparison'
    | 'cta'
    | 'retention'
    | 'comments'
    | 'follow_profile';
  categoryLabel: string;
  promptText: string;
  suggestedAction: string;
  targetMoment: string;
}

export interface LiveSalesScript {
  id: string;
  title: string;
  productId?: string;
  productName: string;
  durationMinutes: LiveSalesDuration;
  targetAudience: string;
  offerDetails: string;
  blocks: LiveBlock[];
  interactionPrompts: LiveInteractionPrompt[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// FASE 3: TIKTOK SHOP CENTER & CREATIVES TYPES
// ==========================================

export type TikTokCreativeStatus =
  | 'DRAFT'
  | 'READY'
  | 'GENERATING'
  | 'GENERATED'
  | 'PROCESSING'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'PUBLISH_FAILED'
  | 'PUBLISH_NOT_AVAILABLE'
  | 'API_NOT_CONNECTED'
  | 'SIMULATION'
  | 'PREPARED'
  | 'FAILED';

export interface TikTokCreative {
  id: string;
  productId?: string;
  productName: string;
  campaignId?: string;
  campaignName?: string;
  title: string;
  script?: TikTokScript;
  prompt: string;
  videoUrl?: string;
  localVideoPath?: string;
  hookText: string;
  ctaText: string;
  methodId: SalesMethodId;
  methodName: string;
  durationSeconds: number;
  format: '9:16' | '16:9' | '1:1';
  version: string;
  status: TikTokCreativeStatus;
  publishedTikTokVideoId?: string; // Preenchido EXCLUSIVAMENTE quando houver confirmação real da API oficial
  localPublishAttemptId?: string; // Identificador interno local (ex: "local_prep_...")
  isSimulated?: boolean;
  publishErrorDetails?: string;
  publishedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type TikTokAccountStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'AUTH_REQUIRED'
  | 'API_NOT_AVAILABLE'
  | 'TOKEN_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'ERROR';

export interface TikTokAccountInfo {
  status: TikTokAccountStatus;
  sellerName?: string;
  shopId?: string;
  region?: string;
  openApiAvailable: boolean;
  activeScopes: string[];
  lastConnectedAt?: string;
  errorMessage?: string;
  environment: 'sandbox' | 'production';
  documentationUrl?: string;
}

export type TikTokProductSyncStatus =
  | 'LOCAL_ONLY'
  | 'SYNCED'
  | 'SYNC_FAILED'
  | 'SYNC_NOT_AVAILABLE'
  | 'SYNC_PENDING';

export interface TikTokShopProduct {
  id: string;
  localProductId: string;
  sku: string;
  tikTokShopProductId?: string; // Preenchido EXCLUSIVAMENTE quando confirmado pela API oficial do TikTok Shop
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  currency: string;
  imageUrl?: string;
  benefits: string[];
  differentials: string[];
  offer: string;
  cta: string;
  stockAvailable?: number;
  syncStatus: TikTokProductSyncStatus;
  isLocalOnly: boolean;
  lastSyncedAt?: string;
}

export interface TikTokPublishConfig {
  creativeId: string;
  title: string;
  caption: string;
  hashtags?: string[];
  privacyLevel: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  disableDuet?: boolean;
  disableStitch?: boolean;
  disableComment?: boolean;
  allowDuet?: boolean;
  allowStitch?: boolean;
  allowComments?: boolean;
  anchorProductId?: string;
  videoCoverTimestampMs?: number;
  brandContentToggle?: boolean;
  brandOrganicToggle?: boolean;
  isSimulation?: boolean; // Permite executar validação de payload sem fingir publicação oficial
}

// ==========================================
// FASE 4: VIDEO COPIER PRO & VIDEO COPY ANALYZER
// ==========================================

export interface TranscriptSegment {
  id: string;
  startSeconds: number;
  endSeconds: number;
  timecode: string;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface VideoTranscriptionResult {
  text: string;
  language: string;
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  segments: TranscriptSegment[];
  provider: 'gemini_flash' | 'heuristic_engine';
  isEstimated?: boolean;
}

export interface ExtractedVideoFrame {
  frameId: string;
  timestampSeconds: number;
  timecode: string;
  filePath: string;
  dataUrl?: string;
  setting: string;
  character: string;
  product: string;
  framing: 'Close-up' | 'Medium shot' | 'Wide shot' | 'Macro' | 'Over-the-shoulder' | 'Não identificado';
  camera: string;
  lighting: string;
  dominantColors: string[];
  composition: string;
  objects: string[];
  visibleAction: string;
  onScreenText: string;
  demonstration: string;
  generalExpression: string;
  visualChange: string;
  commercialContext: string;
  probableObjective: string;
  confidence: number;
}

export interface TemporalSceneConsolidation {
  startSeconds: number;
  endSeconds: number;
  timecode: string;
  visualSummary: string;
  framing: string;
  probableObjective: string;
  confidence: number;
}

export interface VideoVisualAnalysisResult {
  frames: ExtractedVideoFrame[];
  totalFramesAnalyzed: number;
  estimatedSceneChanges: number;
  estimatedCutsPerMinute: number;
  sceneTechnicalDisclaimer: string;
  temporalConsolidation: TemporalSceneConsolidation[];
  dominantFramings: string[];
  productPresencePercentage: number;
  hasCharacter: boolean;
  status: 'REAL_VISUAL_ANALYSIS' | 'ESTIMATED_VISUAL_ANALYSIS';
}

export interface CopyStructureBlock {
  id: string;
  phase: 'HOOK' | 'PROBLEM' | 'PAIN' | 'AGITATION' | 'SOLUTION' | 'MECHANISM' | 'BENEFIT' | 'PROOF' | 'OFFER' | 'CTA';
  phaseLabel: string;
  startSeconds: number;
  endSeconds: number;
  timecode: string;
  originalText: string;
  purpose: string;
  visualPattern: string;
  visualDescription?: string;
  salesObjective?: string;
  confidence?: number;
  evidenceSource: 'AUDIO' | 'VISUAL' | 'AUDIO+VISUAL' | 'INFERRED';
  pacingScore: number; // 0-100
}

export interface EmotionalTriggerItem {
  name: string;
  intensity: 'Alta' | 'Média' | 'Baixa';
  description: string;
  timecode?: string;
}

export interface RetentionRiskMoment {
  timecode: string;
  seconds: number;
  reason: string;
  suggestedFix: string;
}

export interface VideoCopyAnalysis {
  detectedSalesMethod: SalesMethodId;
  detectedSalesMethodName: string;
  detectedSalesMethodConfidence: number; // 0-100%
  hookAnalysis: {
    hookText: string;
    durationSeconds: number;
    hookType: string;
    hookStrengthScore: number; // 0-100 (Heurística)
    hookWhyItWorks: string;
    hookAttentionScore: number;
    visualHookPattern?: string;
    patternInterrupt?: string;
  };
  structureBlocks: CopyStructureBlock[];
  emotionalTriggers: EmotionalTriggerItem[];
  visualAnalysis?: VideoVisualAnalysisResult;
  pacingMetrics: {
    overallPacing: 'Rápido e Dinâmico' | 'Equilibrado' | 'Denso/Rápido' | 'Calmo/Explicativo';
    cutsEstimatePerMin: number;
    retentionRiskMoments: RetentionRiskMoment[];
  };
  heuristicScores: {
    hookPower: number; // 0-100
    retentionScore: number; // 0-100
    offerClarity: number; // 0-100
    ctaForce: number; // 0-100
    overallConversionIndex: number; // 0-100
    disclaimer: string;
  };
  analysisStatus: {
    transcriptionStatus: 'REAL_GEMINI' | 'OFFLINE_FALLBACK';
    timestampsStatus: 'ESTIMATED_AI' | 'CALCULATED_PROPORTIONAL';
    visualStatus: 'REAL_VISUAL_ANALYSIS' | 'ESTIMATED_VISUAL_ANALYSIS';
  };
}

export interface RemodeledHookVariation {
  id: string;
  angleType: string;
  hookText: string;
  whyItConverts: string;
  visualAction: string;
}

export interface RemodeledScriptBlock {
  phase: string;
  voiceover: string;
  visualScene: string;
  veoPrompt: string;
  cameraMotion: string;
  estimatedDurationSeconds: number;
}

export interface RemodeledCtaVariation {
  id: string;
  triggerType: string;
  ctaText: string;
  visualCtaAction: string;
}

export interface RemodeledVeoPromptItem {
  blockName: string;
  sceneDescription: string;
  prompt: string;
  recommendedRatio: '9:16' | '16:9' | '1:1';
}

export interface VideoRemodelingResult {
  targetProductId?: string;
  targetProductName: string;
  adaptedSalesMethod: SalesMethodId;
  adaptedSalesMethodName: string;
  hookVariations: RemodeledHookVariation[];
  remodelledScript: {
    title: string;
    totalDurationTarget: number;
    fullVoiceover: string;
    blocks: RemodeledScriptBlock[];
  };
  ctaVariations: RemodeledCtaVariation[];
  veoPromptsSummary: RemodeledVeoPromptItem[];
  createdAt: string;
}

export interface VideoAnalysisItem {
  id: string;
  videoTitle: string;
  originalFileName: string;
  videoPath: string;
  videoUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  audioExtractedPath?: string;
  audioExtractedUrl?: string;
  transcription: VideoTranscriptionResult;
  analysis: VideoCopyAnalysis;
  remodeling?: VideoRemodelingResult;
  status: 'ANALYZED' | 'REMODELED' | 'PROCESSING' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// FASE 5: ORQUESTRADOR AVANÇADO DE CAMPANHAS
// ==========================================

export type CampaignDuration = 15 | 30 | 45 | 60;
export type CampaignBatchQuantity = 1 | 5 | 10 | 25 | 50 | 75;

export interface CampaignICP {
  targetAudience: string;
  ageRange: string;
  gender: string;
  profession: string;
  dailyRoutine: string;
  location: string;
  incomeLevel: string;
  lifestyle: string;
  desires: string[];
  pains: string[];
  objections: string[];
  triggers: string[];
  awarenessLevel: 'Inconsciente' | 'Consciente do Problema' | 'Consciente da Solução' | 'Consciente do Produto' | 'Totalmente Consciente';
  buyingIntent: 'Exploratório' | 'Comparativo' | 'Imediato / Urgente' | 'Fundo de Funil';
  isAiGenerated?: boolean;
  aiHypothesisDisclaimer?: string;
}

export interface CampaignOffer {
  mainOffer: string;
  primaryBenefit: string;
  secondaryBenefit: string;
  bonuses: string[];
  guarantee: string;
  price: string;
  originalPrice?: string; // Preenchido EXCLUSIVAMENTE quando fornecido pelo usuário
  realDiscountPercent?: number; // Preenchido EXCLUSIVAMENTE quando verdadeiro
  realScarcityText?: string; // Somente escassez legítima sem invenção de estoque
  realUrgencyText?: string; // Somente urgência legítima sem falsos prazos
  cta: string;
  isAiGenerated?: boolean;
  truthfulDisclaimer?: string;
}

export type AngleCategory =
  | 'Dor'
  | 'Desejo'
  | 'Economia'
  | 'Facilidade'
  | 'Transformação'
  | 'Status'
  | 'Prova'
  | 'Comparação'
  | 'Demonstração'
  | 'Curiosidade'
  | 'Objeção'
  | 'Urgência legítima'
  | 'Conveniência'
  | 'Identificação'
  | 'Antes/depois'
  | 'Problema cotidiano'
  | 'Resultado percebido';

export interface CampaignAngle {
  id: string;
  category: AngleCategory;
  name: string;
  description: string;
  hookConcept: string;
  promise: string;
  scriptCore: string;
  suggestedCta: string;
  suggestedPrompt: string;
  salesMethodId: SalesMethodId;
}

export type HookCategory =
  | 'Dor'
  | 'Benefício'
  | 'Curiosidade'
  | 'Surpresa'
  | 'Demonstração'
  | 'Comparação'
  | 'Erro comum'
  | 'Antes e depois'
  | 'Prova'
  | 'Objeção'
  | 'Urgência'
  | 'Pergunta'
  | 'Pattern Interrupt'
  | 'Status'
  | 'Desejo'
  | 'FOMO'
  | 'UGC'
  | 'POV';

export interface CampaignHook {
  id: string;
  text: string;
  category: HookCategory;
  angle: string;
  salesMethodId: SalesMethodId;
  salesMethodName: string;
  objective: string;
  retentionHeuristicScore: number; // 0-100 (Estimativa heurística interna)
  visualActionPrompt: string;
}

export interface CampaignScriptScene {
  order: number;
  phase: 'HOOK' | 'PROBLEMA' | 'AGITACAO' | 'SOLUCAO' | 'PRODUTO' | 'BENEFICIOS' | 'PROVA' | 'OFERTA' | 'CTA';
  title: string;
  spokenText: string;
  visualAction: string;
  onScreenText?: string;
  cameraDirection?: string;
  estimatedSeconds: number;
}

export interface CampaignScript {
  id: string;
  title: string;
  hookId?: string;
  hookText: string;
  angleId?: string;
  angleCategory?: string;
  salesMethodId: SalesMethodId;
  salesMethodName: string;
  durationSeconds: CampaignDuration;
  productName: string;
  emotion: string;
  scenes: CampaignScriptScene[];
  fullDialogue: string;
  ctaText: string;
  visualPrompt: string;
  estimatedDurationSeconds: number;
}

export interface CampaignCreativeScore {
  overallScore: number; // 0-100 (Score Heurístico Interno)
  hookPower: number;
  promiseClarity: number;
  painConnection: number;
  benefitClarity: number;
  demoStrength: number;
  productClarity: number;
  ctaForce: number;
  coherence: number;
  durationFit: number;
  platformFit: number;
  disclaimer: string;
}

export type OrchestratedCreativeStatus =
  | 'DRAFT'
  | 'READY'
  | 'GENERATING'
  | 'GENERATED'
  | 'PROCESSING'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'PUBLISH_FAILED'
  | 'PUBLISH_NOT_AVAILABLE';

export interface CampaignCreativeItem {
  id: string; // Creative ID
  campaignId: string; // Campaign ID
  productId: string; // Product ID
  productName: string;
  version: string; // "version 1", "version 2", etc.
  parentCreativeId?: string; // Para tracking de duplicações
  hookText: string;
  salesMethodId: SalesMethodId;
  salesMethodName: string;
  angleCategory: string;
  scriptId: string;
  scriptTitle: string;
  script: CampaignScript;
  ctaText: string;
  prompt: string;
  characterId?: string;
  characterName?: string;
  videoFilePath?: string;
  videoUrl?: string;
  durationSeconds: number;
  format: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  score: CampaignCreativeScore;
  status: OrchestratedCreativeStatus;
  jobId?: string;
  publishedTikTokId?: string;
  publishStatusDetails?: string;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoOrchestrationStepStatus {
  step: 'PRODUCT' | 'ICP' | 'OFFER' | 'ANGLES' | 'HOOKS' | 'SCRIPTS' | 'PROMPTS' | 'QUEUE' | 'GENERATION' | 'PROCESSING' | 'LIBRARY' | 'CREATIVES';
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progressCount?: number;
  totalCount?: number;
  detail?: string;
}

export interface OrchestratedCampaign {
  id: string;
  name: string;
  productId: string;
  productName: string;
  mode: 'AUTOMATIC' | 'MANUAL';
  targetDuration: CampaignDuration;
  batchLimit: CampaignBatchQuantity;
  selectedMethods: SalesMethodId[];
  isAutoMethods: boolean;
  recommendedMethodReasoning?: string;
  characterId?: string;
  characterType: 'existing' | 'new' | 'generic' | 'pov_no_character';
  icp: CampaignICP;
  offer: CampaignOffer;
  angles: CampaignAngle[];
  hooks: CampaignHook[];
  scripts: CampaignScript[];
  creatives: CampaignCreativeItem[];
  currentStepIndex: number;
  autoSteps?: AutoOrchestrationStepStatus[];
  overviewMetrics: {
    plannedCount: number;
    generatedCount: number;
    processedCount: number;
    readyCount: number;
    errorCount: number;
    progressPercentage: number;
  };
  status: 'DRAFT' | 'ORCHESTRATING' | 'READY' | 'ENQUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

