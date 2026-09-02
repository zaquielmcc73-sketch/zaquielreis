import { GoogleGenAI } from '@google/genai';
import { AI_MODELS } from '../config/aiModels';
import { CampaignFormData, GeneratedScript, ProjectBible, SalesMethodId } from '../../src/types';
import { SALES_METHODS } from '../../src/data/salesMethods';
import { veoPromptEngine } from './veoPromptEngine';
import { db } from '../db';

export class SalesScriptEngine {
  public async generateScripts(
    campaign: CampaignFormData,
    bible: ProjectBible,
    quantity: number,
    customApiKey?: string
  ): Promise<GeneratedScript[]> {
    const total = quantity || campaign.videoCount || 1;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY || '';

    // Calculate method distribution
    const distribution = this.computeDistribution(campaign, total);

    db.log('info', `Gerando ${total} roteiros de vendas com distribuição: ${JSON.stringify(distribution)}`);

    // If API key is available and not in pure offline mode, try Gemini generation for maximum creativity
    if (apiKey && apiKey.length > 5) {
      try {
        const geminiScripts = await this.generateWithGemini(campaign, bible, distribution, total, apiKey);
        if (geminiScripts && geminiScripts.length === total) {
          return geminiScripts;
        }
      } catch (err) {
        db.log('warn', 'Falha na geração via Gemini API, utilizando motor algorítmico estruturado local:', err);
      }
    }

    // High-quality procedural deterministic script generator fallback
    return this.generateProceduralScripts(campaign, bible, distribution, total);
  }

  private computeDistribution(campaign: CampaignFormData, total: number): Record<SalesMethodId, number> {
    const rawDist = campaign.methodsDistribution || ({} as Record<SalesMethodId, number>);
    const selectedMethods = Object.keys(rawDist).filter((m) => (rawDist as any)[m] > 0) as SalesMethodId[];

    if (selectedMethods.length > 0) {
      const sum = selectedMethods.reduce((acc, m) => acc + (rawDist[m] || 0), 0);
      if (sum === total) {
        return rawDist;
      }
      // Re-scale proportionally to match total
      const scaled: Record<SalesMethodId, number> = {} as any;
      let allocated = 0;
      selectedMethods.forEach((m, idx) => {
        if (idx === selectedMethods.length - 1) {
          scaled[m] = total - allocated;
        } else {
          const val = Math.max(1, Math.round(((rawDist[m] || 1) / sum) * total));
          scaled[m] = val;
          allocated += val;
        }
      });
      return scaled;
    }

    // Default intelligent distribution based on batch size
    return this.getDefaultDistribution(total);
  }

  public getDefaultDistribution(total: number): Record<SalesMethodId, number> {
    const dist: Partial<Record<SalesMethodId, number>> = {};
    if (total === 1) {
      dist['pov'] = 1;
    } else if (total === 5) {
      dist['china'] = 1;
      dist['drive_thru'] = 1;
      dist['pov'] = 1;
      dist['ugc'] = 1;
      dist['fomo'] = 1;
    } else if (total === 10) {
      dist['china'] = 2;
      dist['drive_thru'] = 2;
      dist['fomo'] = 2;
      dist['pov'] = 2;
      dist['ugc'] = 2;
    } else if (total === 25) {
      dist['china'] = 4;
      dist['drive_thru'] = 4;
      dist['fomo'] = 4;
      dist['pov'] = 5;
      dist['ugc'] = 5;
      dist['pain_solution'] = 3;
    } else if (total === 50) {
      dist['china'] = 8;
      dist['drive_thru'] = 8;
      dist['fomo'] = 7;
      dist['pov'] = 9;
      dist['ugc'] = 9;
      dist['pain_solution'] = 5;
      dist['storytelling'] = 4;
    } else {
      // 75 videos
      dist['china'] = 10;
      dist['drive_thru'] = 10;
      dist['fomo'] = 10;
      dist['pov'] = 15;
      dist['ugc'] = 15;
      dist['storytelling'] = 10;
      dist['demo'] = 5;
    }
    return dist as Record<SalesMethodId, number>;
  }

  private async generateWithGemini(
    campaign: CampaignFormData,
    bible: ProjectBible,
    distribution: Record<SalesMethodId, number>,
    total: number,
    apiKey: string
  ): Promise<GeneratedScript[]> {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Você é o Sales Script Engine do VEO AUTO STUDIO.
Crie exatamente ${total} roteiros de anúncios de vendas para vídeo no Google Veo.
Produto: "${campaign.product || bible.productName}"
Descrição: "${campaign.description || bible.description}"
Público: "${campaign.targetAudience || bible.targetAudience}"
Dor Principal: "${campaign.pain || 'perda de tempo e dinheiro'}"
Desejo: "${campaign.desire || 'resultado rápido e comprovado'}"
Oferta: "${campaign.offer || bible.irresistibleOffer}"
CTA: "${campaign.cta || 'Clique no botão abaixo para garantir o seu'}"

Distribuição dos métodos solicitada:
${JSON.stringify(distribution)}

Regras cruciais:
1. Varie ganchos (Hooks), ângulos, ambientes, situações e diálogos para cada vídeo. Nenhum roteiro pode ser idêntico.
2. Cada roteiro deve ser curto (5 a 10 segundos de vídeo).
3. Responda em JSON puro contendo um array de ${total} objetos com os seguintes campos:
- index (número 0 a ${total - 1})
- title (string)
- method (um dos métodos válidos: ${Object.keys(distribution).join(', ')})
- hook (gancho inicial falado/visível em português)
- scene1 (descrição visual da cena 1)
- scene2 (descrição visual da cena 2)
- scene3 (descrição visual da cena 3)
- scene4 (descrição visual da cena 4)
- dialogue (fala em português brasileiro)
- visualText (texto animado na tela)
- action (ação física do personagem ou produto)
- cta (chamada para ação final)
`;

    const response = await ai.models.generateContent({
      model: AI_MODELS.GEMINI_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, total).map((item, idx) => {
        const methodId = (item.method || 'pov') as SalesMethodId;
        const methodInfo = SALES_METHODS.find((m) => m.id === methodId) || SALES_METHODS[0];
        const scriptId = `script_${Date.now()}_${idx + 1}`;

        const veoPrompt = veoPromptEngine.generateVeoPrompt({
          method: methodId,
          hook: item.hook || `Vídeo ${idx + 1}`,
          action: item.action || item.scene1 || 'Demonstração do produto',
          dialogue: item.dialogue,
          visualText: item.visualText,
          cta: item.cta || campaign.cta,
          campaign,
          bible,
          index: idx,
        });

        return {
          id: scriptId,
          campaignId: campaign.id || 'camp_active',
          index: idx + 1,
          title: item.title || `Criativo #${idx + 1} (${methodInfo.name})`,
          method: methodId,
          methodName: methodInfo.name,
          hook: item.hook || `Descubra como o ${campaign.product} transforma seu dia`,
          scene1: item.scene1 || 'Close dinâmico no produto',
          scene2: item.scene2 || 'Demonstração em uso',
          scene3: item.scene3 || 'Resultado surpreendente',
          scene4: item.scene4 || 'Chamada para ação',
          dialogue: item.dialogue || 'Você ainda não conhecia isso?',
          visualText: item.visualText || campaign.product,
          action: item.action || 'Uso prático do produto',
          cta: item.cta || campaign.cta || 'Garanta o seu com desconto!',
          veoPrompt,
          aspectRatio: campaign.aspectRatio || '9:16',
        };
      });
    }

    throw new Error('Falha no formato retornado pela IA');
  }

  private generateProceduralScripts(
    campaign: CampaignFormData,
    bible: ProjectBible,
    distribution: Record<SalesMethodId, number>,
    total: number
  ): GeneratedScript[] {
    const scripts: GeneratedScript[] = [];
    const prod = campaign.product || bible.productName || 'Produto Premium';
    const pain = campaign.pain || 'o método tradicional que gasta horas';
    const desire = campaign.desire || 'o resultado perfeito em poucos minutos';
    const offer = campaign.offer || bible.irresistibleOffer || 'Condição Exclusiva com Frete Grátis';
    const cta = campaign.cta || 'Toque em Saiba Mais antes que esgote!';

    const hookTemplates = [
      `Se você ainda sofre com ${pain}, pare tudo o que está fazendo!`,
      `Por que ninguém te contou esse segredo sobre ${prod}?`,
      `Como ter ${desire} sem perder tempo nem dinheiro.`,
      `Eu testei o famoso ${prod} por 7 dias e isso aconteceu...`,
      `Atenção: 3 erros que você comete todo dia ao lidar com ${pain}.`,
      `O verdadeiro motivo pelo qual esse produto virou febre na internet.`,
      `Você precisa ver como o ${prod} funciona em câmera lenta!`,
      `Cansado de gastar rios de dinheiro sem ter ${desire}?`,
      `Não compre nenhum outro até assistir essa demonstração até o fim.`,
      `O mecanismo definitivo que resolve ${pain} de uma vez por todas.`,
    ];

    let currentIdx = 0;
    for (const [methodKey, count] of Object.entries(distribution)) {
      const methodId = methodKey as SalesMethodId;
      const methodInfo = SALES_METHODS.find((m) => m.id === methodId) || SALES_METHODS[0];

      for (let i = 0; i < count && currentIdx < total; i++) {
        const hook = hookTemplates[(currentIdx + i) % hookTemplates.length];
        const scriptId = `script_${Date.now()}_${currentIdx + 1}`;

        const scriptData: GeneratedScript = {
          id: scriptId,
          campaignId: campaign.id || 'camp_active',
          index: currentIdx + 1,
          title: `Criativo #${String(currentIdx + 1).padStart(3, '0')} — ${methodInfo.name} (Variação ${i + 1})`,
          method: methodId,
          methodName: methodInfo.name,
          hook,
          scene1: `Gancho de abertura com ${methodInfo.name}: ${hook}`,
          scene2: `Apresentação visual do ${prod} resolvendo o problema de ${pain}.`,
          scene3: `Demonstração do mecanismo e comprovação prática de ${desire}.`,
          scene4: `Apresentação da oferta imperdível: ${offer}.`,
          dialogue: `Se você quer ${desire} de verdade, você precisa testar o ${prod} hoje mesmo.`,
          visualText: `${prod.toUpperCase()} — OFERTA HOJE`,
          action: `Demonstração em ritmo acelerado com foco nos benefícios de ${prod}`,
          cta,
          veoPrompt: '',
          aspectRatio: campaign.aspectRatio || '9:16',
        };

        // Compile specialized Veo prompt
        scriptData.veoPrompt = veoPromptEngine.generateVeoPrompt({
          method: methodId,
          hook: scriptData.hook,
          action: scriptData.action,
          dialogue: scriptData.dialogue,
          visualText: scriptData.visualText,
          cta: scriptData.cta,
          campaign,
          bible,
          index: currentIdx,
        });

        scripts.push(scriptData);
        currentIdx++;
      }
    }

    return scripts;
  }
}

export const salesScriptEngine = new SalesScriptEngine();
