
import { GoogleGenAI, Type, Modality } from "@google/genai";

const parseGeminiJson = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing Error:", e);
    return null;
  }
};

// Use gemini-3-pro-preview for complex reasoning tasks like creating a bespoke training/meal plan
export async function generatePersonalizedPlan(data: any): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are an elite fitness coach for Asian men in the UK. 
    Create a bespoke 12-week V-Taper programme for: ${data.name}, Goal: ${data.goal}, Diet: ${data.dietPreference}.
    Requirements:
    - Use UK English and metric units.
    - Focus on high-protein versions of Asian staples (e.g., Tandoori Lean Meats, specialized Lentil prep).
    - Address specific lifestyle factors for UK-based professionals.
    - Return JSON with: trainingDayMacros, restDayMacros, mealPlan (array), workoutSplit (array), coachAdvice.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          trainingDayMacros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              p: { type: Type.NUMBER },
              c: { type: Type.NUMBER },
              f: { type: Type.NUMBER }
            },
            required: ["calories", "p", "c", "f"]
          },
          restDayMacros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              p: { type: Type.NUMBER },
              c: { type: Type.NUMBER },
              f: { type: Type.NUMBER }
            },
            required: ["calories", "p", "c", "f"]
          },
          mealPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mealType: { type: Type.STRING },
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    p: { type: Type.NUMBER },
                    c: { type: Type.NUMBER },
                    f: { type: Type.NUMBER }
                  }
                }
              },
              required: ["mealType", "name", "ingredients", "instructions"]
            }
          },
          workoutSplit: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                day: { type: Type.STRING },
                title: { type: Type.STRING },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      sets: { type: Type.NUMBER },
                      reps: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          coachAdvice: { type: Type.STRING }
        },
        required: ["trainingDayMacros", "restDayMacros", "mealPlan", "workoutSplit", "coachAdvice"]
      }
    }
  });
  return JSON.parse(response.text);
}

// Use gemini-3-flash-preview for quick data retrieval tasks
export async function searchUniversalFood(query: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide nutrition data for: ${query}. Focus on UK/Asian food profiles.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          servingSize: { type: Type.STRING }
        },
        required: ["name", "calories", "protein", "carbs", "fats", "servingSize"]
      }
    }
  });
  return JSON.parse(response.text);
}

// Use gemini-3-flash-preview for multimodal vision tasks
export async function analyzeMealPhoto(base64: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64 } }, 
        { text: 'Analyze this meal. Provide nutrition in JSON format including name, calories, protein, carbs, and fats.' }
      ] 
    },
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER }
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
      }
    }
  });
  return JSON.parse(response.text);
}

// Use gemini-3-flash-preview for chat tasks requiring grounding
export async function groundedConciergeChat(prompt: string, context: string): Promise<{ text: string, sources: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Context: ${context}\n\nClient Query: ${prompt}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are the MUSKYFIT Head Coach. You specialize in the Asian male physique and UK lifestyle. Be direct, authoritative, and motivating."
    },
  });
  return { 
    text: response.text || "", 
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
  };
}

// Use gemini-3-pro-image-preview for high-quality fitness visualizations
export async function generateGoalVisualization(goal: string, biometrics: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `Photorealistic fitness visualization of a professional Asian male achieving: ${goal}. Based on: ${biometrics}. High-end luxury gym setting, moody lighting, focus on V-taper silhouette.` }] },
    config: { imageConfig: { aspectRatio: "3:4", imageSize: "1K" } }
  });
  
  // Iterate parts to find the image as per @google/genai guidelines
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

// Use gemini-2.5-flash-preview-tts for single-speaker audio briefings
export async function generateWeeklyAudioBriefing(text: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
}

// Use gemini-2.5-flash for maps grounding support
export async function findEliteResources(query: string, lat: number, lng: number): Promise<{ text: string, sources: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find local elite fitness resources for: ${query}. Location: ${lat}, ${lng}.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
    },
  });
  return { 
    text: response.text || "", 
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
  };
}

// Live API session setup for real-time coaching
export async function connectLiveCoach(callbacks: any): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: callbacks.onopen,
      onmessage: callbacks.onmessage,
      onerror: callbacks.onerror || ((e: any) => console.error('Live session error', e)),
      onclose: callbacks.onclose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are the MUSKYFIT Head Coach. You specialize in the Asian male physique and UK lifestyle. Be direct, authoritative, and motivating.',
    },
  });
}

// Manual PCM encoding implementation as per @google/genai guidelines
export function encodePCM(data: Float32Array): string {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}

// Manual base64 decoding implementation as per @google/genai guidelines
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}

// Raw PCM decoding implementation as per @google/genai guidelines
export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
