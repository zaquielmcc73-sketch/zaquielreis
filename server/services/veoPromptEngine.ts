import { CampaignFormData, ProjectBible, SalesMethodId } from '../../src/types';

export interface PromptEngineInput {
  method: SalesMethodId;
  hook: string;
  action: string;
  dialogue?: string;
  visualText?: string;
  cta: string;
  campaign: CampaignFormData;
  bible: ProjectBible;
  index: number;
  variationSeed?: number;
}

export class VeoPromptEngine {
  public generateVeoPrompt(input: PromptEngineInput): string {
    const { method, hook, action, visualText, campaign, bible, index } = input;
    const isPOV = method === 'pov';
    const isUGC = method === 'ugc';
    const isDriveThru = method === 'drive_thru';
    const isChina = method === 'china';
    const isDemo = method === 'demo';

    let perspectivePart = '';
    let cameraPart = '';
    let lightingPart = '';
    let characterPart = '';
    let environmentPart = '';
    let motionPart = '';
    let stylePart = '';

    if (isPOV) {
      const pov = campaign.povConfig;
      perspectivePart = 'True first-person POV shot from the eyes of the user. Camera is firmly positioned at eye-level.';
      characterPart = `${pov.showHands ? 'Hands and forearms of a user' : 'User perspective'} (${pov.characterGender === 'man' ? 'masculine hands' : pov.characterGender === 'woman' ? 'feminine hands with natural manicure' : 'clean groomed hands'}) interacting directly with the item.`;
      cameraPart = 'Handheld immersive camera movement, ultra-stable gimbal first-person perspective, natural head tilt and seamless physical interaction.';
      lightingPart = 'Warm natural ambient lighting, clean reflections on the product surface, photorealistic depth of field.';
      environmentPart = `Location: ${pov.environment === 'gym' ? 'modern high-end fitness center' : pov.environment === 'car' ? 'luxury car interior with sunlight through windshield' : pov.environment === 'kitchen' ? 'minimalist modern kitchen countertop' : 'sleek contemporary living room interior'}.`;
      stylePart = 'Hyper-realistic 4K commercial, tactile micro-textures, crisp focus on the hands and product.';
    } else if (isUGC) {
      const ugc = campaign.ugcConfig;
      perspectivePart = 'Authentic vertical TikTok / Reels UGC smartphone camera style.';
      characterPart = `Charismatic relatable Brazilian creator (${ugc.creatorGender === 'man' ? 'young man' : ugc.creatorGender === 'woman' ? 'young woman' : 'creator'}, age ${ugc.ageRange}) looking directly at the camera with ${ugc.emotionalTone === 'obsessed' ? 'intense genuine enthusiasm' : 'delighted facial expressions'}.`;
      cameraPart = 'Natural vertical handheld selfie camera, slight organic handheld shake, quick zoom-in on product demonstration.';
      lightingPart = 'Ring-light soft front illumination combined with cozy indoor ambient light.';
      environmentPart = `Real lived-in space: ${ugc.environment === 'unboxing_desk' ? 'wooden desk with unboxing parcels' : ugc.environment === 'kitchen' ? 'bright kitchen with morning light' : 'modern aesthetic bedroom'}.`;
      stylePart = 'Native viral social media video, rich color grading, zero artificial uncanny CGI look, authentic human expressions.';
    } else if (isDriveThru) {
      perspectivePart = 'Fast-paced, hyper-dynamic commercial ad.';
      characterPart = 'Enthusiastic presenter making rapid, punchy gestures.';
      cameraPart = 'Whip pans, quick punch-in zooms, 60fps snappy motion blur transitions.';
      lightingPart = 'High-contrast studio lighting, vibrant accent rim lights in cyan and warm amber.';
      environmentPart = 'Ultra-clean modern minimalist studio set with floating graphics aesthetic.';
      stylePart = 'High-energy e-commerce sales ad, crisp sharpness, rapid visual dopamine flow.';
    } else if (isChina) {
      perspectivePart = 'Extreme clarity product demonstration and mechanism dissection.';
      characterPart = 'Expert hands demonstrating the exact internal engineering and instant problem-solving function.';
      cameraPart = 'Smooth macro probe lens sliding over technical details, 45-degree angled split-screen or instant before/after reveal.';
      lightingPart = 'Ultra-bright high-definition clinical commercial lighting showcasing every material finish.';
      environmentPart = 'Clean testing tabletop with stark contrast surface highlighting the product.';
      stylePart = 'Top-tier e-commerce product video, zero fluff, satisfying tactile mechanics.';
    } else if (isDemo) {
      perspectivePart = 'Macro product showcase and stress-test proof.';
      characterPart = 'Hands performing a rigorous real-world test or application.';
      cameraPart = 'Slow-motion 120fps macro dolly shot focusing on material durability and precision mechanics.';
      lightingPart = 'Chiaroscuro studio rim lighting illuminating the edges and contours.';
      environmentPart = 'Sleek dark gradient backdrop with subtle particle dust and soft ground reflections.';
      stylePart = 'Luxury product showcase commercial, 8k textures, pristine glass and metal refraction.';
    } else {
      perspectivePart = 'Cinematic narrative advertisement.';
      characterPart = `Engaged protagonist experiencing a pivotal moment of relief and satisfaction.`;
      cameraPart = 'Cinematic 35mm lens, smooth tracking dolly shot, shallow depth of field (f/1.8).';
      lightingPart = 'Golden hour cinematic sunlight streaming through large windows, soft lens flare.';
      environmentPart = 'Polished modern lifestyle environment reflecting success and convenience.';
      stylePart = 'Award-winning commercial film aesthetic, Kodak 500T color science, photorealistic realism.';
    }

    const productDescription = `The hero product "${campaign.product || bible.productName}" (${bible.materials || 'premium materials with sleek finish'}, brand colors: ${bible.brandColors || 'modern minimalist'}) is prominently featured.`;
    const actionPart = `Visual Action: ${action || hook}.`;
    const textOverlayPart = visualText ? `Bold modern animated on-screen caption reads: "${visualText}".` : '';
    const negativeRules = bible.negativePromptRules ? `Avoid: ${bible.negativePromptRules}.` : '';

    const fullPrompt = [
      `[Scene ${index + 1} - ${method.toUpperCase()} Sales Video]`,
      perspectivePart,
      characterPart,
      productDescription,
      actionPart,
      cameraPart,
      lightingPart,
      environmentPart,
      textOverlayPart,
      stylePart,
      negativeRules,
    ]
      .filter(Boolean)
      .join(' ');

    return fullPrompt;
  }
}

export const veoPromptEngine = new VeoPromptEngine();
