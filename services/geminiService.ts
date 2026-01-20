
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMove = async (fen: string, history: string[]): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Analyze this chess position (FEN: ${fen}). 
  The move history is: ${history.join(', ')}.
  Provide a professional analysis in JSON format as if you were a Grandmaster-turned-Data-Analyst.
  The analysis should include an evaluation (e.g., +1.2), the best next move, a brief commentary on the strategic implications, and a suggested follow-up line of 3 moves.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: { type: Type.STRING },
            bestMove: { type: Type.STRING },
            commentary: { type: Type.STRING },
            suggestedLine: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["evaluation", "bestMove", "commentary", "suggestedLine"],
        },
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      evaluation: "N/A",
      bestMove: "Unable to calculate",
      commentary: "An error occurred during data processing.",
      suggestedLine: []
    };
  }
};
