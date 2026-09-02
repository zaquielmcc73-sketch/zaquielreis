import {
  Character,
  CharacterWithProductConfig,
  Product,
  PromptPlatform,
  PromptStudioConfig,
  SalesMethodId,
} from '../../src/types';
import { SALES_METHODS } from '../../src/data/salesMethods';

export interface PromptGenerationResult {
  fullPrompt: string;
  negativePrompt: string;
  platform: PromptPlatform;
  model: string;
  metadata: {
    hook?: string;
    action?: string;
    camera?: string;
    lighting?: string;
    style?: string;
    characterConsistency?: string;
    productDetails?: string;
    salesMethod?: string;
  };
}

export abstract class BasePromptProvider {
  abstract readonly platform: PromptPlatform;
  abstract readonly name: string;

  abstract formatPrompt(config: PromptStudioConfig, product?: Product | null, character?: Character | null): PromptGenerationResult;

  abstract formatCharacterWithProduct(
    config: CharacterWithProductConfig,
    product: Product,
    character: Character
  ): PromptGenerationResult;
}

export class VeoPromptProvider extends BasePromptProvider {
  readonly platform: PromptPlatform = 'veo';
  readonly name = 'Google Veo Prompt Engine';

  formatPrompt(config: PromptStudioConfig, product?: Product | null, character?: Character | null): PromptGenerationResult {
    const salesMethod = config.salesMethodId ? SALES_METHODS.find((m) => m.id === config.salesMethodId) : null;

    // Header & Context
    const header = `[Google Veo 4K Commercial Video - ${salesMethod ? salesMethod.name : 'High-Converting Sales Asset'}]`;

    // Perspective & Camera
    const cameraDetail = `Camera: ${config.cameraAngle || 'Eye-level dynamic angle'}, ${config.lens || '35mm prime lens'}, ${config.cameraMovement || 'smooth cinematic dolly motion'}.`;

    // Lighting & Environment
    const lightingDetail = `Lighting: ${config.lighting || 'Ultra-clean commercial studio lighting with soft highlights and balanced rim light'}.`;
    const scenarioDetail = `Setting: ${config.scenario || 'Contemporary modern premium minimalist environment'}.`;

    // Character Detail with Consistency
    let characterDetail = '';
    if (character) {
      characterDetail = `Subject: ${character.appearance}. Wearing ${character.clothing}${character.accessories ? `, with ${character.accessories}` : ''}. Facial expression: ${config.emotion || character.personality || 'confident and genuine'}. ${character.consistencyPrompt ? `Visual consistency rules: ${character.consistencyPrompt}` : ''}`;
    }

    // Product Detail
    let productDetail = '';
    if (product) {
      const topBenefits = product.benefits?.slice(0, 2).join(', ') || '';
      productDetail = `Featured Product: "${product.name}" (${product.materials || 'premium materials'}), color aesthetics matching modern luxury. ${topBenefits ? `Demonstrates value: ${topBenefits}.` : ''}`;
    }

    // Action & Movement
    const actionDetail = `Action & Interaction: ${config.action || 'Smooth, natural and high-engagement demonstration showcasing key product value'}.`;

    // Visual Style & Physics
    const styleDetail = `Visual Aesthetic: ${config.visualStyle || 'Hyper-realistic commercial cinematography, 4k ultra-sharp detail, natural motion physics, zero uncanny artifacts'}.`;

    // CTA & Overlay
    const ctaDetail = config.cta ? `On-screen visual takeaway / CTA: "${config.cta}".` : '';

    // Negative Rules
    const negativePrompt = [
      'blurry textures',
      'distorted hands and extra fingers',
      'bad anatomy',
      'low resolution',
      'washed out colors',
      'CGI plastic skin',
      'text typos',
      'watermarks',
      character?.negativePrompt,
      config.negativeInstructions,
    ]
      .filter(Boolean)
      .join(', ');

    const fullPrompt = [
      header,
      scenarioDetail,
      characterDetail,
      productDetail,
      actionDetail,
      cameraDetail,
      lightingDetail,
      styleDetail,
      ctaDetail,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      fullPrompt,
      negativePrompt,
      platform: 'veo',
      model: config.model || 'veo-3.1-lite-generate-preview',
      metadata: {
        action: config.action,
        camera: cameraDetail,
        lighting: lightingDetail,
        style: styleDetail,
        characterConsistency: character?.consistencyPrompt,
        productDetails: product?.name,
        salesMethod: salesMethod?.name,
      },
    };
  }

  formatCharacterWithProduct(
    config: CharacterWithProductConfig,
    product: Product,
    character: Character
  ): PromptGenerationResult {
    const framingText = {
      close_up: 'Tight close-up shot focusing on hands and product interaction',
      medium_shot: 'Medium waist-up commercial shot showing subject and product clearly',
      cowboy_shot: 'Three-quarter cowboy shot balancing subject posture and product presence',
      wide_shot: 'Full dynamic shot showing subject interacting in complete environment',
      macro_detail: 'Extreme macro probe lens detailing product texture and exact finger grip',
    }[config.framing] || 'Medium commercial shot';

    const movementText = {
      static: 'Locked-off static high-precision camera',
      smooth_pan: 'Smooth horizontal cinematic pan tracking the product',
      orbit_360: 'Fluid 180-degree circular orbit around subject and product',
      dolly_in: 'Slow dramatic dolly push-in towards the product in action',
      handheld_organic: 'Organic handheld smartphone camera with natural slight micro-movements',
    }[config.cameraMovement] || 'Smooth tracking camera';

    const lightingText = {
      studio_clean: 'Clean high-key commercial studio light with crisp reflections',
      golden_hour: 'Warm cinematic sunset golden hour light with gentle sunflare',
      neon_accent: 'Modern vibrant rim lighting with subtle cyan and warm amber accents',
      natural_window: 'Soft diffused natural daylight pouring through a large window',
      dramatic_chiaroscuro: 'High-contrast cinematic shadows sculpting product contours and facial geometry',
    }[config.lighting] || 'Commercial studio light';

    const expressionText = {
      enthusiastic: 'Genuinely enthusiastic and delighted facial expression with a warm smile',
      focused: 'Intensely focused and satisfied demeanor demonstrating mastery',
      amazed: 'Astonished eyebrow raise and pleasantly surprised reaction',
      confident: 'Calm, authoritative and confident posture with direct charismatic eye contact',
      relieved: 'Visible sigh of relief and satisfaction as product instantly solves the problem',
    }[config.expression] || 'Engaged and confident';

    const header = `[Google Veo - Character with Product Interaction]`;
    const subjectSection = `Subject: ${character.name} (${character.appearance}). Dressed in ${character.clothing}. Expression: ${expressionText}. Character Consistency: ${character.consistencyPrompt}`;
    const productSection = `Product in Hand: "${product.name}". Exact physical attributes: ${product.materials || 'engineered build'}, dimensions: ${product.dimensions || 'ergonomic standard'}. Real features: ${product.features?.join(', ') || product.description}.`;
    const interactionSection = `Physical Interaction & Grip: Subject naturally holds and operates the product with precise, clean hand placement (${config.action}). Natural tactile feedback and realistic finger grip without occlusion or clipping.`;
    const sceneSection = `Environment: ${config.scenario || 'Aesthetic modern lifestyle setting'}. ${framingText}. ${movementText}. ${lightingText}.`;
    const qualitySection = `Aesthetic: Flawless commercial realism, 4K clarity, tactile depth of field, true-to-life skin pores and authentic material reflections.`;

    const negativePrompt = [
      'distorted hands',
      'extra fingers or missing fingers',
      'floating objects',
      'unrealistic grip',
      'mutated fingers',
      'incorrect product proportions',
      'low quality',
      'blurry face',
      'CGI wax skin',
      character.negativePrompt,
      config.customNegativePrompt,
    ]
      .filter(Boolean)
      .join(', ');

    const fullPrompt = [
      header,
      subjectSection,
      productSection,
      interactionSection,
      sceneSection,
      qualitySection,
    ].join(' ');

    return {
      fullPrompt,
      negativePrompt,
      platform: 'veo',
      model: 'veo-3.1-lite-generate-preview',
      metadata: {
        action: config.action,
        camera: `${framingText}, ${movementText}`,
        lighting: lightingText,
        style: qualitySection,
        characterConsistency: character.consistencyPrompt,
        productDetails: product.name,
      },
    };
  }
}

export class TikTokPromptProvider extends BasePromptProvider {
  readonly platform: PromptPlatform = 'tiktok_ugc';
  readonly name = 'TikTok & Reels UGC Engine';

  formatPrompt(config: PromptStudioConfig, product?: Product | null, character?: Character | null): PromptGenerationResult {
    const header = `[Viral TikTok / Instagram Reels UGC Native Ad - 9:16 Vertical]`;
    const creator = character
      ? `Real Brazilian UGC Creator: ${character.appearance}, wearing casual ${character.clothing}. Natural candid selfie angle.`
      : `Relatable everyday creator holding smartphone at chest level in natural selfie angle.`;

    const productLine = product
      ? `Holding and showcasing "${product.name}" directly to the phone camera lens. Explaining: "${product.pains?.[0] || 'solving common problem'}" with relief.`
      : `Showcasing product dynamically to camera.`;

    const hookAction = `Action & Pacing: Fast-paced native smartphone vertical video, slight organic handheld micro-shake, instant hook in first 2 seconds (${config.action || 'immediate problem-solving demo'}).`;
    const lightingScene = `Setting & Light: ${config.scenario || 'Real aesthetic bedroom/kitchen with ring-light front illumination and cozy ambient window light'}.`;
    const style = `Style: Authentic smartphone recording (iPhone 4K 60fps), vibrant saturated social media color profile, energetic body language, zero artificial glossy 3D look.`;
    const cta = config.cta ? `Visual prompt overlay text: "${config.cta}".` : '';

    const fullPrompt = [header, creator, productLine, hookAction, lightingScene, style, cta]
      .filter(Boolean)
      .join(' ');

    return {
      fullPrompt,
      negativePrompt: 'corporate commercial look, stiff actor, 3d render, unnatural robotic speech, washed out, low frame rate',
      platform: 'tiktok_ugc',
      model: config.model || 'veo-3.1-lite-generate-preview',
      metadata: {
        action: config.action,
        camera: 'Vertical 9:16 handheld smartphone selfie camera',
        lighting: 'Ring light + natural ambient',
        style: 'Authentic UGC social video',
      },
    };
  }

  formatCharacterWithProduct(
    config: CharacterWithProductConfig,
    product: Product,
    character: Character
  ): PromptGenerationResult {
    const fullPrompt = `[TikTok UGC Creator Testimonial & Demo] Creator ${character.name} (${character.appearance}, ${character.consistencyPrompt}) is recording a casual high-energy TikTok video holding "${product.name}" (${product.materials}). Creator enthusiastically demonstrates ${config.action} in ${config.scenario || 'their bright cozy home'}. Handheld vertical camera, quick natural gestures, sparkling genuine excitement, crisp macro focus on product label.`;

    return {
      fullPrompt,
      negativePrompt: 'overly polished commercial, bad hands, deformed fingers, low resolution, robotic facial expression',
      platform: 'tiktok_ugc',
      model: 'veo-3.1-lite-generate-preview',
      metadata: {
        action: config.action,
        productDetails: product.name,
        characterConsistency: character.consistencyPrompt,
      },
    };
  }
}

export class ImagePromptProvider extends BasePromptProvider {
  readonly platform: PromptPlatform = 'imagen';
  readonly name = 'High-Definition Image / Reference Engine';

  formatPrompt(config: PromptStudioConfig, product?: Product | null, character?: Character | null): PromptGenerationResult {
    const header = `[Ultra-Realistic High-Definition Commercial Photography - 8K Resolution]`;
    const subject = character
      ? `Photographic portrait of ${character.appearance}, ${character.clothing}, ${character.skinTone} skin with realistic fine pores and micro-textures.`
      : `Professional advertising still photograph.`;
    const item = product ? `Featuring "${product.name}" with exact physical finishes: ${product.materials}.` : '';
    const comp = `Composition: ${config.cameraAngle || 'Editorial portrait'}, ${config.lighting || 'Chiaroscuro studio lighting with soft diffused key light'}. Shot on Hasselblad H6D-100c with 85mm f/1.4 lens.`;
    const fullPrompt = [header, subject, item, config.scenario, config.action, comp]
      .filter(Boolean)
      .join(' ');

    return {
      fullPrompt,
      negativePrompt: 'blurry, painted, digital illustration, extra limbs, low resolution, grain, oversaturated',
      platform: 'imagen',
      model: 'imagen-3.0-generate-002',
      metadata: {
        camera: 'Hasselblad 85mm portrait',
        lighting: 'Studio key light',
      },
    };
  }

  formatCharacterWithProduct(
    config: CharacterWithProductConfig,
    product: Product,
    character: Character
  ): PromptGenerationResult {
    const fullPrompt = `[High-End Commercial Photography] Masterpiece studio photograph of ${character.name} (${character.appearance}, wearing ${character.clothing}) elegantly holding "${product.name}" (${product.materials}). Sharp crisp focus on fingers and product branding. ${config.scenario}. Shot on 50mm f/1.8 lens, exquisite natural studio lighting, true-to-life colors.`;

    return {
      fullPrompt,
      negativePrompt: 'deformed hands, multiple products, blurry, low res, CGI look',
      platform: 'imagen',
      model: 'imagen-3.0-generate-002',
      metadata: {
        productDetails: product.name,
      },
    };
  }
}

export class GenericVideoPromptProvider extends BasePromptProvider {
  readonly platform: PromptPlatform = 'generic_video';
  readonly name = 'Universal AI Video Prompt Engine';

  formatPrompt(config: PromptStudioConfig, product?: Product | null, character?: Character | null): PromptGenerationResult {
    const parts = [
      `Cinematic video scene:`,
      character ? `${character.appearance} wearing ${character.clothing}.` : '',
      product ? `Prominently showcasing "${product.name}" (${product.description}).` : '',
      `Action: ${config.action || 'product demonstration'}.`,
      `Location: ${config.scenario || 'modern interior'}.`,
      `Camera: ${config.cameraMovement || 'slow tracking motion'}, ${config.cameraAngle || 'eye-level'}.`,
      `Lighting: ${config.lighting || 'balanced cinematic light'}.`,
      `Aesthetic: photorealistic 4k video, 60fps, high fidelity motion.`,
    ];

    return {
      fullPrompt: parts.filter(Boolean).join(' '),
      negativePrompt: 'deformed, blurry, low quality, static, cartoon',
      platform: 'generic_video',
      model: config.model || 'generic-video-v1',
      metadata: {
        action: config.action,
      },
    };
  }

  formatCharacterWithProduct(
    config: CharacterWithProductConfig,
    product: Product,
    character: Character
  ): PromptGenerationResult {
    const fullPrompt = `Cinematic video: ${character.name} (${character.appearance}) is interacting with "${product.name}". ${config.action} in ${config.scenario}. Camera: ${config.cameraMovement}. Lighting: ${config.lighting}. High quality, crisp detail, realistic physics.`;

    return {
      fullPrompt,
      negativePrompt: 'deformed hands, missing fingers, artifacts',
      platform: 'generic_video',
      model: 'generic-video-v1',
      metadata: {},
    };
  }
}

export const promptProviders: Record<PromptPlatform, BasePromptProvider> = {
  veo: new VeoPromptProvider(),
  tiktok_ugc: new TikTokPromptProvider(),
  imagen: new ImagePromptProvider(),
  generic_video: new GenericVideoPromptProvider(),
};
