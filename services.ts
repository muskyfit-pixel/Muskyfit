import { GoogleGenAI, Type } from "@google/genai";
import { IntakeData, Meal, WorkoutDay, MacroSplit, FoodItem, DailyLog, WeeklyCheckIn } from "../types";

// Initialize AI directly with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generatePerformanceReport(clientName: string, logs: DailyLog[], checkIn: WeeklyCheckIn): Promise<string> {
  const prompt = `
    Analyze fitness data for client "${clientName}".
    Data: ${JSON.stringify(logs.slice(0, 7))}
    Check-in: ${JSON.stringify(checkIn)}
    
    TASK: Write a professional, encouraging coaching report (approx 200 words).
    - Summarize compliance (Calories, Protein, Steps).
    - Provide 3 clear actionable points for next week.
    - Use British English.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Report generation failed.";
  } catch (e) {
    console.error("AI Report Error:", e);
    return "Error generating report. Please check back later.";
  }
}

export async function getMealAlternatives(meal: Meal): Promise<string[]> {
  const prompt = `
    Find 3 alternative meals for "${meal.name}" that have similar macros (Cals:${meal.macros.calories}, P:${meal.macros.p}, C:${meal.macros.c}, F:${meal.macros.f}).
    Keep them simple and healthy. Provide only the names of the 3 alternatives.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text.split('\n').filter(s => s.trim().length > 0).slice(0, 3);
  } catch (e) {
    return ["Grilled Chicken Salad", "Egg & Avocado Wrap", "Lentil Soup"];
  }
}

export async function generatePersonalizedPlan(data: IntakeData): Promise<{ 
  trainingDayMacros: MacroSplit, 
  restDayMacros: MacroSplit, 
  mealPlan: Meal[], 
  workoutSplit: WorkoutDay[],
  coachAdvice: string
}> {
  const systemInstruction = `
    ACT AS THE HEAD COACH OF MUSKYFIT (Elite UK-based coaching). 
    NICHE: Asian Men (30-50) professionals with high-stress desk jobs.

    STRICT PROGRAMMING PILLARS FOR THIS NICHE:
    1. THE "MUSKY V-TAPER": High priority on Medial Delts and Lat Width to create a powerful silhouette.
    2. POSTURAL CORRECTION: Focus on "Desk Hunch" fixes.
    3. CULTURAL NUTRITION: Integrate South Asian/East Asian staples (Dhal, Paneer, Lean Meats, Basmati) in a macro-friendly way.

    COMMUNICATION STYLE: Assertive, professional, British English.
  `;

  const userPrompt = `
    Create a bespoke 4-week "Block 1: Foundation" plan for ${data.name}. 
    Goal: ${data.goal.replace('_', ' ')}. 
    Generate ${data.trainingDaysPerWeek} full sessions.
    Dietary style: ${data.culturalPreference} (${data.dietPreference}).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 12000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trainingDayMacros: {
              type: Type.OBJECT,
              properties: { calories: { type: Type.NUMBER }, p: { type: Type.NUMBER }, c: { type: Type.NUMBER }, f: { type: Type.NUMBER } },
              required: ["calories", "p", "c", "f"]
            },
            restDayMacros: {
              type: Type.OBJECT,
              properties: { calories: { type: Type.NUMBER }, p: { type: Type.NUMBER }, c: { type: Type.NUMBER }, f: { type: Type.NUMBER } },
              required: ["calories", "p", "c", "f"]
            },
            coachAdvice: { type: Type.STRING },
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
                    properties: { calories: { type: Type.NUMBER }, p: { type: Type.NUMBER }, c: { type: Type.NUMBER }, f: { type: Type.NUMBER } }
                  },
                  substitutes: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
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
                        targetRpe: { type: Type.NUMBER },
                        tempo: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        isWarmup: { type: Type.BOOLEAN }
                      }
                    }
                  }
                }
              }
            }
          },
          required: ["trainingDayMacros", "restDayMacros", "mealPlan", "workoutSplit", "coachAdvice"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Plan Generation Error:", e);
    throw e;
  }
}

export async function searchUniversalFood(query: string): Promise<FoodItem | null> {
  const prompt = `Nutritional data for one serving of food: "${query}".`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    const result = JSON.parse(response.text || '{}');
    return { ...result, id: 'ai_' + Date.now(), type: 'WESTERN' };
  } catch (e) {
    return null;
  }
}
