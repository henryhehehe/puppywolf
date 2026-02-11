import { GoogleGenAI } from "@google/genai";
import { Difficulty } from '../types';

let aiClient: GoogleGenAI | null = null;

// Initialize strictly with env var as per instructions, but safely
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

export const generateSecretWord = async (difficulty: Difficulty): Promise<string> => {
  if (!aiClient) {
    console.warn("No API Key found, using fallback word.");
    const fallbacks = ["Moon", "Silver", "Forest", "Castle", "Mirror", "Wolf", "Village", "Seer"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  try {
    const prompt = `
      Generate a single secret noun for a guessing game called Werewords.
      Difficulty Level: ${difficulty}.
      
      - Easy: Common household objects, animals, or foods. Simple concepts.
      - Medium: Slightly more abstract concepts, professions, or less common objects.
      - Hard: Abstract concepts, specific scientific terms, or obscure objects.

      Output ONLY the word. No punctuation, no explanation.
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const word = response.text?.trim() || "Village";
    // Remove any accidental periods or extra spaces
    return word.replace(/[^a-zA-Z]/g, '');
  } catch (error) {
    console.error("Gemini generation failed", error);
    const fallbacks = ["Moon", "Silver", "Forest", "Castle", "Mirror"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};