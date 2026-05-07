import {GoogleGenAI, Type} from '@google/genai';
import {TimelineReport} from '../types';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || ''});

export async function runSimulation(
  city: string,
  context: string,
  files?: {data: string; mimeType: string}[]
): Promise<TimelineReport> {
  const model = 'gemini-3.1-pro-preview';
  
  const systemInstruction = `
    You are Aeon, a Time-Traveling Urban Planner and sustainability expert from the year 2100. 
    Your mission is to evaluate city data against UN SDG 11 (Sustainable Cities and Communities).
    
    When given city data, a map, or a plan:
    1. ANALYZE: Look for "Concrete Heat Islands" vs "Green Corridors".
    2. REASON: Identify specific policies and calculate long-term impact on air quality and equity.
    3. GROUND: Use real-world data about the city if possible.
    
    Respond STRICTLY in the following JSON format:
    {
      "currentVibe": "Descriptive summary.",
      "businessAsUsual2075": "Consequences.",
      "sdgHero2075": "Vision.",
      "advice": ["Action 1", "Action 2", "Action 3"],
      "businessImagePrompt": "A highly detailed image generation prompt for the Business As Usual 2075 scenario. Style: cinematic, atmospheric, showing the specific city's iconic landmarks in decay or struggle.",
      "heroImagePrompt": "A highly detailed image generation prompt for the SDG Hero 2075 scenario. Style: Solarpunk, lush, vibrant, showing the specific city's iconic landmarks transformed into a sustainable paradise."
    }
  `;

  const parts: any[] = [{text: `City: ${city}\n\nUser Notes: ${context}`}];
  
  if (files) {
    files.forEach(f => {
      parts.push({
        inlineData: {
          data: f.data.split(',')[1] || f.data,
          mimeType: f.mimeType
        }
      });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{parts}],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentVibe: {type: Type.STRING},
            businessAsUsual2075: {type: Type.STRING},
            sdgHero2075: {type: Type.STRING},
            advice: {
              type: Type.ARRAY,
              items: {type: Type.STRING}
            },
            businessImagePrompt: {type: Type.STRING},
            heroImagePrompt: {type: Type.STRING}
          },
          required: ['currentVibe', 'businessAsUsual2075', 'sdgHero2075', 'advice', 'businessImagePrompt', 'heroImagePrompt']
        },
        tools: [
          {googleSearch: {}}
        ]
      }
    });

    if (!response.text) {
      throw new Error('Aeon is silent. The timeline is blocked.');
    }

    const reportData = JSON.parse(response.text);
    
    // Generate images in parallel
    const [businessImg, heroImg] = await Promise.all([
      generateImage(reportData.businessImagePrompt),
      generateImage(reportData.heroImagePrompt)
    ]);

    return {
      ...reportData,
      businessImageB64: businessImg,
      heroImageB64: heroImg
    };
  } catch (error) {
    console.error('Simulation Failed:', error);
    throw error;
  }
}

async function generateImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{text: prompt}],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (err) {
    console.error('Image Generation Failed:', err);
  }
  return undefined;
}
