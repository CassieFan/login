
import { GoogleGenAI } from "@google/genai";
import { LoginLog } from "../types";

export const getAIInsights = async (logs: LoginLog[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a summary of the data for the AI
  const summary = logs.slice(0, 50).map(l => ({
    time: l.timestamp,
    status: l.status,
    location: l.location,
    device: l.device,
    user: l.username
  }));

  const prompt = `
    Analyze the following recent login activity data and provide 3-4 professional business insights.
    Focus on security anomalies, peak usage patterns, and user experience trends.
    Format the response in clean Markdown with emojis.
    
    Data Summary:
    ${JSON.stringify(summary)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI insights at this time. Please check your connectivity or API key.";
  }
};
