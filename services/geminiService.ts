
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, ChatMessage, AlternateHistoryResult } from '../types';

let manualApiKey: string | null = null;

export const setManualApiKey = (key: string) => {
  manualApiKey = key;
};

export const hasGlobalApiKey = (): boolean => {
  return !!(process.env.API_KEY || manualApiKey);
};

const getClient = () => {
  const apiKey = manualApiKey || process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// --- Connection Test ---
export const testApiKey = async (): Promise<boolean> => {
  const ai = getClient();
  if (!ai) return false;
  try {
    // Minimal ping to check if billing/key is active
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'ping',
    });
    return true;
  } catch (e) {
    console.error("API Connection Test Failed. Check API Key or Billing.", e);
    return false;
  }
};

// Generic Image Generator for Mentors/Pivots
export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Generic Image Gen Error", e);
  }
  return null;
};

export const generateDailyHeadline = async (): Promise<NewsArticle | null> => {
  const ai = getClient();
  const fallbackImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Gandhi_spinning.jpg/640px-Gandhi_spinning.jpg";

  if (!ai) return null;

  const textPrompt = `
    You are the editor of a 1920s mystical newspaper called "Timension".
    Generate a front-page headline and a short story (approx 60 words) focused on a random fascinating historical event from the 20th century.
    The date should be historically accurate for the event chosen.
    Also provide a "Weather of Time" forecast (e.g., "Winds of Change, 32°C").
    
    IMPORTANT: 
    - Headline must be punchy, uppercase, and dramatic (e.g., "NATION WAKES UP").
    - Content should sound like a vintage dispatch.
  `;

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            date: { type: Type.STRING },
            content: { type: Type.STRING },
            weather: { type: Type.STRING },
          },
          required: ["headline", "date", "content", "weather"],
        }
      }
    });

    const text = textResponse.text;
    if (!text) return null;
    const article = JSON.parse(text) as NewsArticle;

    try {
      const imagePrompt = `A vintage, black and white newspaper photograph from the era depicting: ${article.headline}. The scene should look like grainy photojournalism, high contrast, historical setting.`;
      const generatedUrl = await generateImage(imagePrompt, "4:3");
      article.imageUrl = generatedUrl || fallbackImage;

    } catch (imgError) {
      console.warn("Image generation failed", imgError);
      article.imageUrl = fallbackImage;
    }

    return article;
  } catch (error) {
    console.error("Error generating headline:", error);
    return null;
  }
};

export const chatWithMentor = async (
  mentorName: string,
  mentorEra: string,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const ai = getClient();

  if (!ai) {
    return "The chronometer is out of sync. Please configure your Telegraph Key (API Key) to communicate across time.";
  }

  const conversation = history.map(h => `${h.sender === 'user' ? 'Student' : mentorName}: ${h.text}`).join('\n');

  const prompt = `
    System: You are roleplaying as ${mentorName} from ${mentorEra}.
    You are speaking to a student from the future (2025) via a magical newspaper interface.
    
    CONTEXT:
    - You are incredibly curious about the future (2025). 
    - You often ask the user clarifying questions about technology, politics, or society in 2025, comparing it to your own time.
    - Keep your responses concise (under 80 words).
    - Maintain a vintage, wise, slightly dramatic tone.
    - Do not break character.
    
    Conversation History:
    ${conversation}
    
    Student: ${newMessage}
    
    ${mentorName}:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "...";
  } catch (error) {
    console.error("Chat error:", error);
    return "The ink is smudged... I cannot hear you clearly.";
  }
};

// --- CHRONOSCOPE FEATURES ---

// 1. Generate Vintage Map
export const generateVintageMap = async (location: string): Promise<string | null> => {
  const imagePrompt = `
        A highly detailed, antique map of ${location} from the year 1920.
        Top-down cartographic view, sepia paper texture, vintage typography, intricate street lines.
        Looks like an authentic historical artifact from a 1920s atlas.
    `;
  return await generateImage(imagePrompt, "1:1");
};

// 2. Generate Trivia (Grounded with Google Maps)
export const generateLocationTrivia = async (location: string): Promise<string[]> => {
  const ai = getClient();
  if (!ai) return ["Telegraph signal lost. Please check API Key configuration."];

  const prompt = `
        Find 3 distinct, fascinating, and historically accurate trivia facts about ${location} specifically from the early 20th century (1900-1950).
        Focus on events, architecture, or cultural shifts that a time traveler would find interesting.
        Use Google Maps data to verify the location's significance.
        Format the output as a simple list of 3 facts, separated by newlines. Do not use JSON.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Re-enabled Google Maps for paid/billing-enabled usage
        tools: [{ googleMaps: {} }],
        // Note: responseSchema/MimeType is NOT allowed with googleMaps tool
      }
    });

    // Manual Parsing since we can't use JSON Schema with Maps tool easily
    const text = response.text;
    if (text) {
      // Split by newlines and filter empty or short lines
      const lines = text.split('\n').filter(line => line.length > 10).slice(0, 3);
      // Cleanup numbering if present (e.g. "1. Fact")
      return lines.map(l => l.replace(/^\d+[\.\)]\s*/, ''));
    }
  } catch (e) {
    console.error("Trivia Gen Error", e);
  }
  return [`Historical records for ${location} are currently fragmented.`];
};

// 3. Generate Historical Photos (Returns 2)
export const generateHistoricalPhotos = async (location: string): Promise<string[]> => {
  const images: string[] = [];
  const prompts = [
    `A realistic vintage black and white photograph of ${location} in 1924. Street level view, showing people in 1920s fashion, vintage cars. High contrast, film grain.`,
    `A faded sepia photograph of a landmark in ${location} from 1930. Bustling atmosphere, period accurate architecture, steam or smoke. Old camera aesthetic.`
  ];

  // Run in parallel for speed
  await Promise.all(prompts.map(async (p) => {
    const url = await generateImage(p, "4:3");
    if (url) images.push(url);
  }));

  return images;
};


export const simulateAlternateHistory = async (event: string, originalOutcome: string, userChange: string): Promise<AlternateHistoryResult | null> => {
  const ai = getClient();

  const fallback: AlternateHistoryResult = {
    timelineSteps: [
      "The Time Stream is unresponsive.",
      "Please ensure the Chrono-Key (API Key) is inserted.",
      "Simulation aborted."
    ],
    finalHeadline: "CONNECTION FAILED"
  };

  if (!ai) return fallback;

  const prompt = `
    You are an Alternate History Simulator.
    
    Historical Event: "${event}"
    Original Outcome: "${originalOutcome}"
    The Time Traveler's Change: "${userChange}"
    
    Predict the causal chain of events resulting from this change.
    Provide exactly 3 distinct steps in the timeline shift:
    1. The Immediate Consequence (1940s-1950s).
    2. The Ripple Effect (1970s-1990s).
    3. The Modern Outcome (2020s).
    
    Style: Write in a gripping, narrative tone. Not too short, but not an essay. About 2-3 compelling sentences per step.
    
    Also generate a sensational newspaper headline from this new present day.
    
    Return valid JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timelineSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            finalHeadline: { type: Type.STRING }
          },
          required: ["timelineSteps", "finalHeadline"]
        }
      }
    });

    let text = response.text;
    if (!text) return fallback;

    // Clean Markdown fences if the model adds them (e.g., ```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text) as AlternateHistoryResult;

    try {
      const imagePrompt = `
            Cinematic concept art depicting the alternate history result of: ${result.finalHeadline}. 
            Scene description based on: ${result.timelineSteps[2]}. 
            Retro-futuristic or dystopian aesthetic depending on the outcome. Highly detailed, atmospheric.
        `;
      const url = await generateImage(imagePrompt, "16:9");
      if (url) result.imageUrl = url;
    } catch (imgError) {
      console.warn("Alt History Image Gen Failed", imgError);
    }

    return result;

  } catch (error) {
    console.error("Alt History Error:", error);
    return fallback;
  }
};
