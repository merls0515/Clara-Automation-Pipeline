import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY or API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const MEMO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    account_id: { type: Type.STRING },
    company_name: { type: Type.STRING },
    business_hours: { type: Type.STRING },
    office_address: { type: Type.STRING },
    services_supported: { type: Type.STRING },
    emergency_definition: { type: Type.STRING },
    emergency_routing_rules: { type: Type.STRING },
    non_emergency_routing_rules: { type: Type.STRING },
    call_transfer_rules: { type: Type.STRING },
    integration_constraints: { type: Type.STRING },
    after_hours_flow_summary: { type: Type.STRING },
    office_hours_flow_summary: { type: Type.STRING },
    questions_or_unknowns: { type: Type.STRING },
    notes: { type: Type.STRING },
  },
  required: ["account_id", "company_name"],
};

const RETELL_SPEC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent_name: { type: Type.STRING },
    system_prompt: { type: Type.STRING },
    voice: { type: Type.STRING },
    llm_model: { type: Type.STRING },
  },
};

export async function extractAccountData(transcript, accountId, existingMemo = null) {
  const model = "gemini-3.1-pro-preview";
  
  let prompt = `
    Extract structured account information from the following transcript.
    Account ID: ${accountId}
    
    STRICT RULES:
    1. If a field is missing from the transcript, place it in 'questions_or_unknowns'. DO NOT HALLUCINATE.
    2. Output must be a valid JSON object matching the schema.
    
    Transcript:
    ${transcript}
  `;

  if (existingMemo) {
    prompt += `
      CONTEXT: This is an onboarding update. Compare the new transcript with the existing v1 memo below.
      Update fields, resolve conflicts, and output the new v2 JSON.
      
      Existing v1 Memo:
      ${JSON.stringify(existingMemo, null, 2)}
    `;
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: MEMO_SCHEMA,
    },
  });

  return JSON.parse(response.text);
}

export async function generateRetellSpec(memo) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Generate a Retell Agent Draft Spec (JSON) based on this Account Memo.
    
    SYSTEM PROMPT GUIDELINES:
    - Business Hours: Greet → Ask Purpose → Collect Name/Number → Transfer/Route → Fallback if transfer fails → "Anything else?" → Close.
    - After Hours: Greet → Ask Purpose → Confirm Emergency → (If Emergency) Collect Name, Number, AND Address immediately → Attempt Transfer → Fallback (apologize/assure follow-up).
    - CONSTRAINT: Never mention "tools" or "function calls" to the caller.
    - Use the company name: ${memo.company_name}
    - Address: ${memo.office_address}
    - Emergency Rules: ${memo.emergency_routing_rules}
    
    Memo:
    ${JSON.stringify(memo, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: RETELL_SPEC_SCHEMA,
    },
  });

  return JSON.parse(response.text);
}
