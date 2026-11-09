/**
 * Mirror of the live BKT update used by gadvance-api (App\Services\BktService)
 * so documentation examples are computed, not typed by hand.
 * Keep these values in sync with the API. A unit test guards the parity.
 */
export const BKT_PARAMETERS = {
  /** P(L0): initial knowledge before any answer. */
  prior: 0.2,
  /** P(T): chance of learning the skill after an opportunity. */
  transit: 0.1,
  /** P(G): chance of answering correctly without knowing the skill. */
  guess: 0.25,
  /** P(S): chance of answering incorrectly despite knowing the skill. */
  slip: 0.1,
} as const;

/** Bloom's Taxonomy tiers served for each mastery band (Student AssessmentController). */
export const DIFFICULTY_BANDS = [
  { range: "below 0.40", label: "Building", levels: ["Remember", "Understand"] },
  { range: "0.40 to below 0.70", label: "Developing", levels: ["Apply"] },
  { range: "0.70 and above", label: "Proficient", levels: ["Analyze", "Evaluate"] },
] as const;

export function updateMastery(
  current: number,
  isCorrect: boolean,
  params: { transit: number; guess: number; slip: number } = BKT_PARAMETERS,
): number {
  const { slip, guess, transit } = params;
  const numerator = isCorrect ? current * (1 - slip) : current * slip;
  const denominator = isCorrect
    ? numerator + (1 - current) * guess
    : numerator + (1 - current) * (1 - guess);
  const posterior = denominator > 0 ? numerator / denominator : current;
  const next = posterior + (1 - posterior) * transit;
  return Math.round(Math.max(0.01, Math.min(0.99, next)) * 1000) / 1000;
}

/** Runs a sequence of answers from the prior and returns every intermediate estimate. */
export function traceMastery(answers: boolean[], start: number = BKT_PARAMETERS.prior): number[] {
  const trace = [start];
  for (const correct of answers) trace.push(updateMastery(trace[trace.length - 1], correct));
  return trace;
}
