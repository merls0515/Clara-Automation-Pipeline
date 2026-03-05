import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY or API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateChangelog(v1, v2) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Compare the following v1 and v2 Account Memos.
    Generate a changelog.md that explicitly lists: [Field Name]: [Old Value] -> [New Value] (Reason).
    
    v1 Memo:
    ${JSON.stringify(v1, null, 2)}
    
    v2 Memo:
    ${JSON.stringify(v2, null, 2)}
    
    Output only the Markdown content for the changelog.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
