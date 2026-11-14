import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  httpReferer: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  appTitle: "Gadvance",
});

const MODEL_NAME = "meta-llama/llama-3.3-70b-instruct";
const FALLBACK_MODELS = ["google/gemini-2.0-flash-001", "openai/gpt-4o-mini"];

// Each request spends the project's OpenRouter credit, so the route is limited
// to signed-in learners, bounded inputs, and a per-learner request rate.
const MAX_TITLE_LENGTH = 300;
const MAX_CONTENT_LENGTH = 4000;
const MAX_INSTRUCTION_LENGTH = 300;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

// In-memory, so it applies per server instance. It stops a single account
// from looping the endpoint; it is not a substitute for an OpenRouter budget.
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);

  if (requestLog.size > 5000) {
    for (const [k, times] of requestLog) {
      if (times.every((time) => now - time >= RATE_LIMIT_WINDOW_MS)) {
        requestLog.delete(k);
      }
    }
  }
  return false;
}

/** Trims and caps text sent to the model; long lesson blocks are cut, not refused. */
function boundedText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

// Helper to pipe OpenRouter chunks into a Web Response stream
function createStreamingResponse(stream: any) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream as AsyncIterable<{
          choices?: Array<{ delta?: { content?: string } }>;
        }>) {
          const text = chunk.choices?.[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables buffering on Hostinger/Nginx
    },
  });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || typeof token.laravelJwt !== "string" || token.laravelJwtError) {
    return NextResponse.json({ error: "Sign in to use this feature." }, { status: 401 });
  }

  if (isRateLimited(String(token.email ?? token.sub ?? "unknown"))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const action = body?.action;
    const conceptTitle = boundedText(body?.conceptTitle, MAX_TITLE_LENGTH);
    const blockContent = boundedText(body?.blockContent, MAX_CONTENT_LENGTH);
    const instructionPrompt =
      action === "followup"
        ? boundedText(body?.instructionPrompt, MAX_INSTRUCTION_LENGTH)
        : "";
    const rawMastery = Number(body?.masteryProbability);
    const masteryProbability = Number.isFinite(rawMastery)
      ? Math.min(1, Math.max(0, rawMastery))
      : 0.3;

    if (action !== "explanation" && action !== "followup" && action !== "quiz") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!blockContent || (action === "followup" && !instructionPrompt)) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // ==========================================
    // ACTION 1: STREAMING REMEDIAL EXPLANATION
    // ==========================================
    if (action === "explanation") {
      const masteryPercent = Math.round(masteryProbability * 100);

      const systemPrompt = `You are a precision instructional designer in Philippine Gender and Development (GAD) and foundational values education.

STRICT MICRO-FOCUS MANDATE:
1. TARGET ISOLATION: The user prompt provides a general "Module Context" and a specific "Target Text to Explain". You must anchor 100% of your response solely to the specific "Target Text to Explain". The Module Context is provided ONLY to disambiguate terminology.
2. DO NOT GENERALIZE: If the target text discusses a specific item (e.g., "pregnancy as a biological sex role" or "child-rearing as a shared gender role"), focus entirely on that exact specific item. NEVER deliver a generic sermon on sex vs. gender, human diversity, or general equality unless the target text explicitly asks for it.
3. ABSOLUTE CONFIDENCE: State the truth directly as an authoritative fact. Strictly eliminate meta-openers (NEVER write "This refers to", "This concept means", "Here we see", "This statement shows", or "Understanding this is crucial").
4. ZERO LEGAL STATUTES: Under no circumstance cite or reference Republic Acts, law numbers, or acronyms ("RA", "RA 11313", "Republic Act").
5. MASTERY CALIBRATION: The student is at ${masteryPercent}% mastery. Make the explanation crystal clear, concrete, and grounded in common everyday reality.

OUTPUT FORMAT:
Output ONLY the following three sections with exact headers and no conversational preamble:
### SUMMARY
[Exactly 1 assertive, definitive sentence explaining the single core truth of the target text.]

### EXPLANATION
[Exactly 2 concise sentences explaining the practical reason why this specific concept works this way in everyday life.]

### ANALOGY
[Exactly 1 concrete, relatable everyday comparison tailored specifically to this exact concept.]`;

      const userPrompt = `Module Context: "${conceptTitle}"
Target Text to Explain: "${blockContent}"
Student Mastery: ${masteryPercent}%`;

      const stream = await openRouter.chat.send({
        chatRequest: {
          model: MODEL_NAME,
          models: FALLBACK_MODELS,
          temperature: 0.2,
          maxTokens: 350,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
      });

      return createStreamingResponse(stream);
    }

    // ==========================================
    // ACTION 2: STREAMING FOLLOW-UP (Tagalog/Simplify)
    // ==========================================
    if (action === "followup") {
      const systemPrompt = `You are an expert instructional designer in Philippine Gender and Development (GAD) and safe spaces policies.

STRICT MICRO-FOCUS MANDATE:
- Focus solely and strictly on the provided "Target Concept". Do not drift into general module themes.
- NEVER cite or mention legal codes, republic acts, or acronyms ("RA", "RA 11313", "Republic Act").
- Jump immediately into the explanation without any pleasantries ("Sure!", "Here is...", "Sa madaling salita...").
- Keep the response strictly to 2 to 3 sentences maximum.
- Ground scenarios strictly in realistic Philippine school, family, commute, or social environments.
- If requested to explain in Tagalog, use natural, modern conversational Tagalog/Taglish understood by students.`;

      const userPrompt = `Module Context: "${conceptTitle}"
Target Concept: "${blockContent}"
Action Requested: ${instructionPrompt}`;

      const stream = await openRouter.chat.send({
        chatRequest: {
          model: MODEL_NAME,
          models: FALLBACK_MODELS,
          temperature: 0.4,
          maxTokens: 300,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
      });

      return createStreamingResponse(stream);
    }

    // ==========================================
    // ACTION 3: NON-STREAMING QUIZ (Strict JSON)
    // ==========================================
    if (action === "quiz") {
      const systemPrompt = `You create 1-question formative comprehension checks for safe spaces and GAD education.

STRICT MICRO-FOCUS MANDATE:
- The question must test exclusively the specific "Target Concept" provided. Do NOT ask a broad or generic module question.
- DIFFICULTY: EASY. Straightforward formative check on the specific distinction or fact stated in the Target Concept.
- NEVER cite or mention legal statutes, Republic Acts, or "RA".
- Provide exactly 4 choices with IDs "a", "b", "c", "d".
- Exactly 1 clearly correct choice, and 3 realistic but simple distractors.
- Return the exact ID of the correct answer in correctChoiceId.`;

      const userPrompt = `Module Context: "${conceptTitle}"
Target Concept: "${blockContent}"`;

      const response = await openRouter.chat.send({
        chatRequest: {
          model: MODEL_NAME,
          models: FALLBACK_MODELS,
          temperature: 0.2,
          maxTokens: 250,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          responseFormat: {
            type: "json_schema",
            jsonSchema: {
              name: "QuizQuestion",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  choices: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", enum: ["a", "b", "c", "d"] },
                        text: { type: "string" },
                      },
                      required: ["id", "text"],
                      additionalProperties: false,
                    },
                  },
                  correctChoiceId: {
                    type: "string",
                    enum: ["a", "b", "c", "d"],
                  },
                },
                required: ["question", "choices", "correctChoiceId"],
                additionalProperties: false,
              },
            },
          },
        },
      });

      if (response instanceof ReadableStream) {
        throw new Error("Unexpected stream returned");
      }

      const content = response.choices?.[0]?.message?.content;
      return NextResponse.json(content ? JSON.parse(content as string) : null);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    // Provider errors can include account details, so they stay in the log.
    console.error("API remedial error:", err);
    return NextResponse.json(
      { error: "The explanation could not be generated. Please try again." },
      { status: 500 },
    );
  }
}
