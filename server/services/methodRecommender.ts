import { GoogleGenAI } from '@google/genai';
import { AI_MODELS } from '../config/aiModels';
import { CampaignFormData, ProjectBible, SalesMethodId } from '../../src/types';
import { SALES_METHODS } from '../../src/data/salesMethods';

export interface MethodRecommendation {
  methodId: SalesMethodId;
  methodName: string;
  count: number;
  reason: string;
}

export interface RecommendationResponse {
  distribution: Record<SalesMethodId, number>;
  recommendations: MethodRecommendation[];
  strategySummary: string;
}

export class MethodRecommender {
  public async recommendMethods(
    campaign: CampaignFormData,
    bible: ProjectBible,
    quantity: number,
    customApiKey?: string
  ): Promise<RecommendationResponse> {
    const total = quantity || campaign.videoCount || 75;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY || '';

    if (apiKey && apiKey.length > 5) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const prompt = `Você é o estrategista chefe de vídeo ads do VEO AUTO STUDIO.
Analise os dados do produto e recomende a melhor distribuição de métodos de venda para uma campanha de exatamente ${total} vídeos.

Dados do Produto:
- Nome: ${campaign.product || bible.productName}
- Descrição: ${campaign.description || bible.description}
- Preço: ${campaign.price} (Promo: ${campaign.promoPrice})
- Público-Alvo: ${campaign.targetAudience || bible.targetAudience}
- Dor Principal: ${campaign.pain}
- Desejo Principal: ${campaign.desire}
- Oferta: ${campaign.offer || bible.irresistibleOffer}
- Quantidade Total de Vídeos: ${total}

Métodos Disponíveis:
${SALES_METHODS.map((m) => `${m.id} (${m.name}): ${m.tagline}`).join('\n')}

Responda EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "strategySummary": "Resumo em 1-2 frases da estratégia recomendada para este produto",
  "allocations": [
    {
      "methodId": "nome_do_id",
      "count": 10,
      "reason": "Justificativa estratégica do porquê esse método converte para esse público"
    }
  ]
}
Importante: A soma dos campos "count" em allocations deve ser EXATAMENTE ${total}.
`;

        const response = await ai.models.generateContent({
          model: AI_MODELS.GEMINI_TEXT,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed && Array.isArray(parsed.allocations) && parsed.allocations.length > 0) {
          const distribution: Record<SalesMethodId, number> = {} as any;
          const recommendations: MethodRecommendation[] = [];

          let allocated = 0;
          parsed.allocations.forEach((item: any, idx: number) => {
            const mId = (item.methodId || 'pov') as SalesMethodId;
            const info = SALES_METHODS.find((m) => m.id === mId) || SALES_METHODS[0];
            let c = Number(item.count) || 1;

            if (idx === parsed.allocations.length - 1) {
              c = Math.max(1, total - allocated);
            }
            allocated += c;

            distribution[mId] = (distribution[mId] || 0) + c;
            recommendations.push({
              methodId: mId,
              methodName: info.name,
              count: c,
              reason: item.reason || 'Ideal para gerar forte identificação e desejo imediato.',
            });
          });

          return {
            distribution,
            recommendations,
            strategySummary: parsed.strategySummary || `Estratégia multiformato otimizada para ${campaign.product || 'o produto'}.`,
          };
        }
      } catch (e) {
        console.warn('Fallback to heuristic recommendation:', e);
      }
    }

    // Heuristic fallbacks for 1, 5, 10, 25, 50, 75
    return this.getHeuristicRecommendation(campaign, total);
  }

  private getHeuristicRecommendation(campaign: CampaignFormData, total: number): RecommendationResponse {
    const isHighTicket = Number(campaign.price?.replace(/\D/g, '') || 0) > 300;
    const isPhysical = !campaign.product.toLowerCase().includes('curso') && !campaign.product.toLowerCase().includes('ebook');

    const distribution: Record<SalesMethodId, number> = {} as any;
    const recommendations: MethodRecommendation[] = [];

    if (total === 1) {
      const primary: SalesMethodId = isPhysical ? 'pov' : 'pain_solution';
      distribution[primary] = 1;
      recommendations.push({
        methodId: primary,
        methodName: SALES_METHODS.find((m) => m.id === primary)?.name || 'POV',
        count: 1,
        reason: 'Máximo impacto visual em primeira pessoa para teste inicial rápido.',
      });
    } else if (total === 5) {
      distribution['china'] = 1;
      distribution['drive_thru'] = 1;
      distribution['pov'] = 1;
      distribution['ugc'] = 1;
      distribution['fomo'] = 1;
    } else if (total === 10) {
      distribution['china'] = 2;
      distribution['drive_thru'] = 2;
      distribution['fomo'] = 2;
      distribution['pov'] = 2;
      distribution['ugc'] = 2;
    } else if (total === 25) {
      distribution['china'] = 4;
      distribution['drive_thru'] = 4;
      distribution['fomo'] = 4;
      distribution['pov'] = 5;
      distribution['ugc'] = 5;
      distribution['pain_solution'] = 3;
    } else if (total === 50) {
      distribution['china'] = 8;
      distribution['drive_thru'] = 8;
      distribution['fomo'] = 7;
      distribution['pov'] = 9;
      distribution['ugc'] = 9;
      distribution['pain_solution'] = 5;
      distribution['storytelling'] = 4;
    } else {
      // 75 videos
      distribution['china'] = 10;
      distribution['drive_thru'] = 10;
      distribution['fomo'] = 10;
      distribution['pov'] = 15;
      distribution['ugc'] = 15;
      distribution['storytelling'] = 10;
      distribution['demo'] = 5;
    }

    if (recommendations.length === 0) {
      for (const [mId, cnt] of Object.entries(distribution)) {
        const info = SALES_METHODS.find((m) => m.id === mId) || SALES_METHODS[0];
        recommendations.push({
          methodId: mId as SalesMethodId,
          methodName: info.name,
          count: cnt,
          reason: `Combinação estratégica de ${info.name} para cobrir diferentes perfis de compradores e níveis de consciência.`,
        });
      }
    }

    return {
      distribution,
      recommendations,
      strategySummary: `Mix otimizado para ${campaign.product || 'o produto'} com foco em alta retenção em redes sociais e conversão direta.`,
    };
  }
}

export const methodRecommender = new MethodRecommender();
