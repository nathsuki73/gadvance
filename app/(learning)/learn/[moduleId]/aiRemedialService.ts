import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export interface RemedialContent {
  summary: string;
  explanation: string;
  analogy: string;
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  question: string;
  choices: QuizChoice[];
  correctChoiceId: string;
}

const MODEL_NAME = "gemini-3.5-flash-lite";

/**
 * 1. Generates the initial 3-part structured refresher.
 * Explains assertively without robotic meta-referencing ("This refers to...").
 * Completely excludes statutory citations ("RA", "RA 11313", "Republic Act").
 */
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
    You are an authoritative educator and instructional designer in Philippine Gender and Development (GAD) and safe spaces education.
    A student is reviewing a specific study block (Current estimated mastery: ${Math.round(masteryProbability * 100)}%, Scaffolding: ${scaffoldingLevel}).

    Lesson Context: "${conceptTitle}"
    Target Block Content: "${blockContent}"

    CRITICAL RULES (STRICT):
    - DO NOT cite or mention Republic Acts, article numbers, or legal codes (NEVER write "RA", "RA 11313", or "Republic Act"). Focus purely on the concept, principles, and behavior.
    - Speak with complete confidence and direct authority.
    - NEVER use referential filler or meta-openers like "This refers to...", "This concept is...", "This means...", "This passage defines...", or "Here we see...".
    - State the subject and rule directly as a definitive fact.
      * BAD: "This refers to Gender Expression, which is how someone dresses."
      * GOOD: "Gender Expression is the outward manifestation of a person's gender through behavior, clothing, and presentation."
      * BAD: "This refers to Catcalling under the law."
      * GOOD: "Catcalling consists of unwanted remarks, whistling, or invasive sexual comments in public spaces."

    CONTENT RESOLUTION RULES:
    1. WORD/TERM ONLY: If the block is just a single word or term, immediately define its core meaning and application in safe spaces education.
    2. MEANING/DEFINITION ONLY: If the block is a description without a label, identify the underlying concept and state it assertively as the subject of the sentence. Do not drift into unrelated topics.
    3. MULTIPLE CONCEPTS: If the block contains two or more related ideas (e.g., Sex vs. Gender), clearly delineate both with distinct, parallel statements (e.g., "1. [Concept A]... 2. [Concept B]...").

    OUTPUT REQUIREMENTS:
    - summary: Exactly 1 assertive, standalone sentence delivering the core takeaway or definition.
    - explanation: 2 to 3 concise, authoritative sentences explaining how the concept works in practice.
    - analogy: A concrete, everyday real-world comparison that makes the concept instantly clear.

    Return ONLY a JSON object matching this schema:
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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

/**
 * 2. Streams controlled follow-up text (scenario / simplify / Tagalog).
 * Maintains confident, direct delivery without preamble and without legal statute citations.
 */
export async function generateFollowUpStream(
  conceptTitle: string,
  blockContent: string,
  instructionPrompt: string,
  onChunk: (textSoFar: string) => void,
): Promise<string> {
  const prompt = `
    You are an expert instructional designer in Philippine Gender and Development (GAD) and safe spaces policies.
    Module Context: "${conceptTitle}"
    Target Concept: "${blockContent}"

    Action: ${instructionPrompt}

    DIRECTIVES:
    - DO NOT cite or mention Republic Acts, legal codes, or acronyms like "RA", "RA 11313", or "Republic Act".
    - Deliver the response with immediate confidence and authority.
    - NEVER start with filler like "Sure!", "Here is an explanation:", "This refers to...", or "In this scenario...".
    - Jump directly into the scenario, simplified rule, or explanation.
    - Ground all examples in everyday Philippine school, workplace, or digital environments.
    - Keep it focused and strictly within the scope of this concept.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: prompt,
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Follow-up streaming error:", error);
    const fallback =
      "Unable to generate follow-up explanation. Please continue reading.";
    onChunk(fallback);
    return fallback;
  }
}

/**
 * 3. Generates a quick 1-question check to verify comprehension.
 * Designed to be easy, clear, and beginner-friendly with no legal acronyms.
 */
export async function generateQuickQuiz(
  conceptTitle: string,
  blockContent: string,
): Promise<QuizQuestion> {
  const prompt = `
    Create a 1-question multiple-choice formative check evaluating basic understanding of this Gender and Development (GAD) / safe spaces concept:
    Module Context: "${conceptTitle}"
    Concept / Content: "${blockContent}"

    CRITICAL REQUIREMENTS:
    - DIFFICULTY: EASY. The question must be beginner-friendly, straightforward, and easy to answer for a student who just read the explanation.
    - DO NOT cite or mention legal codes or acronyms (NEVER write "RA", "RA 11313", or "Republic Act").
    - Test simple definition recall or an obvious real-life example (e.g., identifying whether an action is acceptable or respectful).
    - Avoid tricky wording, double negatives, or ambiguous choices.
    - Provide 4 options (IDs: "a", "b", "c", "d").
    - Exactly 1 clearly correct answer and 3 simple, clearly incorrect distractors.
    - Return the exact ID of the correct choice.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ["id", "text"],
            },
          },
          correctChoiceId: { type: Type.STRING },
        },
        required: ["question", "choices", "correctChoiceId"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Empty response from AI for quiz");
  }

  return JSON.parse(response.text) as QuizQuestion;
}
