import { Callout, Figure, H2, H3, P, UL } from "../_components/primitives";
import { BktUpdateDiagram, MasteryTraceChart } from "../_components/diagrams";
import { BKT_PARAMETERS, DIFFICULTY_BANDS, traceMastery } from "../_lib/bkt";

const SAMPLE_ANSWERS = [true, true, false, true, true];

export default function HowBktWorks() {
  const trace = traceMastery(SAMPLE_ANSWERS);
  const p = BKT_PARAMETERS;

  return (
    <>
      <H2 id="idea">The idea in one minute</H2>
      <P>
        Bayesian Knowledge Tracing treats &quot;has this learner mastered the topic?&quot; as a probability between 0 and 1.
        Every time you answer a question on a topic, GADvance updates that probability. A correct answer usually raises
        it and an incorrect answer usually lowers it, but not by a fixed amount. BKT accounts for lucky guesses and
        careless slips, so one answer never decides everything.
      </P>
      <Figure caption="Each answer is weighed against the guess and slip probabilities, then a small learning step is applied. The result sets the difficulty of the next question.">
        <BktUpdateDiagram />
      </Figure>

      <H2 id="parameters">The four parameters</H2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { name: "Initial Knowledge", symbol: "P(L₀)", value: p.prior, text: "How likely you are to know a topic before answering anything about it." },
          { name: "Transition Probability", symbol: "P(T)", value: p.transit, text: "The chance you learn the topic from each opportunity to practice it." },
          { name: "Guess Probability", symbol: "P(G)", value: p.guess, text: "The chance of answering correctly without knowing the topic." },
          { name: "Slip Probability", symbol: "P(S)", value: p.slip, text: "The chance of answering incorrectly even though you know the topic." },
        ].map((param) => (
          <div key={param.name} className="rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-zinc-900">{param.name}</p>
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-mono text-xs text-primary">{param.symbol} = {param.value.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{param.text}</p>
          </div>
        ))}
      </div>
      <P>These are the values GADvance currently uses for every topic.</P>

      <H2 id="update">How an answer updates mastery</H2>
      <P>Each update has two steps. With current mastery <em>L</em>:</P>
      <H3>Step 1: weigh the evidence</H3>
      <div className="mt-3 space-y-2 rounded-2xl bg-zinc-50 p-5 font-mono text-sm text-zinc-800">
        <p>If correct: L&apos; = L(1 &minus; S) &divide; [L(1 &minus; S) + (1 &minus; L)G]</p>
        <p>If incorrect: L&apos; = L&middot;S &divide; [L&middot;S + (1 &minus; L)(1 &minus; G)]</p>
      </div>
      <H3>Step 2: allow for learning</H3>
      <div className="mt-3 rounded-2xl bg-zinc-50 p-5 font-mono text-sm text-zinc-800">
        <p>New mastery = L&apos; + (1 &minus; L&apos;) &times; T</p>
      </div>
      <P>The result is kept between 0.01 and 0.99 and rounded to three decimal places.</P>

      <H2 id="worked-example">Worked example</H2>
      <P>
        A learner starts a topic at the initial knowledge value of {p.prior.toFixed(2)} and answers five questions: correct,
        correct, incorrect, correct, correct. These numbers are computed with the same formula GADvance uses.
      </P>
      <Figure caption="Mastery after each answer. Shaded bands show which question difficulty the learner would be served next.">
        <MasteryTraceChart answers={SAMPLE_ANSWERS} />
      </Figure>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Question</th>
              <th scope="col" className="px-4 py-3 font-semibold">Answer</th>
              <th scope="col" className="px-4 py-3 font-semibold">Mastery after</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-600">
            {SAMPLE_ANSWERS.map((correct, i) => (
              <tr key={i}>
                <td className="px-4 py-3">Q{i + 1}</td>
                <td className="px-4 py-3">{correct ? "Correct" : "Incorrect"}</td>
                <td className="px-4 py-3 font-mono text-zinc-900">{trace[i].toFixed(3)} &rarr; {trace[i + 1].toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        Notice that the incorrect answer on Q3 lowers mastery a lot but does not reset it, and two more correct answers
        bring it back up.
      </P>

      <H2 id="difficulty">Choosing question difficulty</H2>
      <P>Checkpoint questions are tagged with a Bloom&apos;s Taxonomy level. Your current mastery decides which level you see next:</P>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {DIFFICULTY_BANDS.map((band) => (
          <div key={band.label} className="rounded-2xl border border-zinc-200 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{band.label}</p>
            <p className="mt-2 text-sm text-zinc-500">Mastery {band.range}</p>
            <p className="mt-2 font-medium text-zinc-900">{band.levels.join(" / ")}</p>
          </div>
        ))}
      </div>

      <H2 id="length">How long a checkpoint is</H2>
      <P>
        Each adaptive checkpoint has a minimum and maximum number of questions, set by the course. GADvance picks a
        length between them from your average mastery across the topics the checkpoint covers:
      </P>
      <UL>
        <li>Average mastery of 0.50 or lower: the maximum number of questions, for more practice.</li>
        <li>Average mastery of 0.90 or higher: the minimum number of questions.</li>
        <li>In between: proportionally fewer questions as your mastery rises.</li>
      </UL>

      <H2 id="mastery-vs-score">Mastery is not your score</H2>
      <Callout title="Two different numbers">
        Your <strong>score</strong> is the percentage of points you earned in one attempt, and it decides whether you
        pass. Your <strong>mastery estimate</strong> is a probability that GADvance keeps updating across all your
        answers on a topic. It decides question difficulty and review suggestions, not whether you pass.
      </Callout>
    </>
  );
}
