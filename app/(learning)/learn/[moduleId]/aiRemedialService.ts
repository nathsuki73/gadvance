import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export interface RemedialContent {
  summary: string;
  explanation: string;
  analogy: string;
}

export async function generateRemedialExplanation(
  conceptTitle: string,
  blockContent: string,
  masteryProbability: number,
): Promise<RemedialContent | null> {
  let scaffoldingLevel = "foundational";
  if (masteryProbability >= 0.5 && masteryProbability < 0.85) {
    scaffoldingLevel = "intermediate reinforcement";
  } else if (masteryProbability >= 0.85) {
    scaffoldingLevel = "advanced extension";
  }

  const prompt = `
    You are an expert curriculum writer and instructional designer. 
    A student is reviewing a specific content block that they need to master (Current mastery level: ${Math.round(masteryProbability * 100)}%).

    Concept Title: "${conceptTitle}"
    Target Block Text to Explain: "${blockContent}"

    Provide a clear, streamlined explanation tailored strictly to the provided block text:
    - Summary: A clear 1-sentence restatement or core takeaway of the block.
    - Explanation: A concise, intuitive explanation expanding directly on the source block text.
    - Analogy: A simple, concrete real-world comparison to help them understand it instantly.

    Return ONLY a JSON object matching this exact schema:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            explanation: { type: Type.STRING },
            analogy: { type: Type.STRING },
          },
          required: ["summary", "explanation", "analogy"],
        },
      },
    });

    if (!response.text) return null;

    return JSON.parse(response.text) as RemedialContent;
  } catch (error) {
    console.error("Remedial Explanation Generation Error:", error);
    return null;
  }
}
