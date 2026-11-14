import Link from "next/link";
import { Callout, Figure, H2, P, UL } from "../_components/primitives";
import { AssessmentFlowDiagram } from "../_components/diagrams";

export default function AssessmentsAndResults() {
  return (
    <>
      <H2 id="types">Types of assessments</H2>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Assessment</th>
              <th scope="col" className="px-4 py-3 font-semibold">Purpose</th>
              <th scope="col" className="px-4 py-3 font-semibold">Adaptive?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-600">
            <tr><td className="px-4 py-3 font-medium text-zinc-900">Pre-test</td><td className="px-4 py-3">Records what you know before the module.</td><td className="px-4 py-3">No, fixed questions</td></tr>
            <tr><td className="px-4 py-3 font-medium text-zinc-900">Checkpoint quiz</td><td className="px-4 py-3">Checks understanding during the module.</td><td className="px-4 py-3">Yes, when the course enables it</td></tr>
            <tr><td className="px-4 py-3 font-medium text-zinc-900">Post-test</td><td className="px-4 py-3">Measures what you learned.</td><td className="px-4 py-3">No, fixed questions</td></tr>
            <tr><td className="px-4 py-3 font-medium text-zinc-900">Poll or survey</td><td className="px-4 py-3">Collects your opinion or feedback.</td><td className="px-4 py-3">Not graded</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="assessment-flow">How a module flows</H2>
      <Figure caption="Pre-test, lessons with adaptive checkpoints, then a post-test. When a checkpoint shows a topic needs work, you are pointed to lessons to review.">
        <AssessmentFlowDiagram />
      </Figure>

      <H2 id="checkpoints">Adaptive checkpoint quizzes</H2>
      <P>Adaptive checkpoints are different from a regular quiz in three ways:</P>
      <UL>
        <li><strong className="font-medium text-zinc-800">One question at a time.</strong> Each answer is recorded before the next question is chosen.</li>
        <li><strong className="font-medium text-zinc-800">Difficulty follows your mastery.</strong> Questions come from the Bloom&apos;s Taxonomy level that fits your current estimate.</li>
        <li><strong className="font-medium text-zinc-800">Length can vary.</strong> If your mastery is already high you may get fewer questions; if it is low you get more practice, within limits set by the course.</li>
      </UL>
      <P>
        The details are in <Link href="/docs/how-bkt-works" className="text-primary underline">How BKT works</Link>.
      </P>

      <H2 id="passing">Passing scores and moving on</H2>
      <P>
        Every graded assessment has a passing score, set as a percentage by the course. Your score is the share of points
        you earned. Some assessments must be passed before you can continue to the next part of the module; the
        assessment tells you when that is the case.
      </P>
      <Callout title="Score and mastery are separate">
        Your score says how many questions you got right in this attempt. Your mastery estimate is GADvance&apos;s
        running estimate of how well you know the topic, built from all your answers. You can pass with a modest mastery
        estimate, and the estimate keeps improving as you practice.
      </Callout>

      <H2 id="review">Remedial review</H2>
      <P>
        After a checkpoint, GADvance looks at the questions you missed and the topics with the lowest mastery estimates,
        and suggests the related lesson pages to review. Reviewing them before a retake or the post-test is the fastest
        way to improve.
      </P>

      <H2 id="retakes">Retakes and saved progress</H2>
      <UL>
        <li>Your answers are saved as you go. If you close the page, you can resume an assessment that is still in progress.</li>
        <li>Where the course allows it, you can retake an assessment. Retakes start a new attempt and keep your earlier attempts on record.</li>
        <li>Each answer in an adaptive checkpoint is counted once, even if you double-click or your connection drops and the answer is sent again.</li>
      </UL>
    </>
  );
}
