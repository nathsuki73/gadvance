export interface RemedialContent {
  summary: string;
  explanation: string;
  analogy: string;
}

export interface QuizChoice {
  id: "a" | "b" | "c" | "d";
  text: string;
}

export interface QuizQuestion {
  question: string;
  choices: QuizChoice[];
  correctChoiceId: "a" | "b" | "c" | "d";
}

function parseMarkdownRemedial(text: string): RemedialContent {
  const summaryMatch = text.match(/###\s*SUMMARY\s*([\s\S]*?)(?=###|$)/i);
  const explanationMatch = text.match(
    /###\s*EXPLANATION\s*([\s\S]*?)(?=###|$)/i,
  );
  const analogyMatch = text.match(/###\s*ANALOGY\s*([\s\S]*?)(?=###|$)/i);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : "",
    explanation: explanationMatch ? explanationMatch[1].trim() : "",
    analogy: analogyMatch ? analogyMatch[1].trim() : "",
  };
}

// 1. STREAM REMEDIAL EXPLANATION
export async function generateRemedialExplanationStream(
  conceptTitle: string,
  blockContent: string,
  masteryProbability: number,
  onChunk: (content: RemedialContent, rawText: string) => void,
): Promise<RemedialContent> {
  const res = await fetch("/api/remedial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "explanation",
      conceptTitle,
      blockContent,
      masteryProbability,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Failed to stream remedial explanation (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    onChunk(parseMarkdownRemedial(fullText), fullText);
  }

  return parseMarkdownRemedial(fullText);
}

// 2. STREAM FOLLOW-UP
export async function generateFollowUpStream(
  conceptTitle: string,
  blockContent: string,
  instructionPrompt: string,
  onChunk: (textSoFar: string) => void,
): Promise<string> {
  const res = await fetch("/api/remedial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "followup",
      conceptTitle,
      blockContent,
      instructionPrompt,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream connection failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    onChunk(fullText);
  }

  return fullText;
}

// 3. NON-STREAMING QUIZ
export async function generateQuickQuiz(
  conceptTitle: string,
  blockContent: string,
): Promise<QuizQuestion> {
  const res = await fetch("/api/remedial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "quiz",
      conceptTitle,
      blockContent,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to load quiz (${res.status})`);
  }

  return await res.json();
}
