import Link from "next/link";
import { BookOpenCheck, Building2, Gauge, GraduationCap } from "lucide-react";
import { Callout, Figure, H2, P, UL } from "../_components/primitives";
import { AssessmentFlowDiagram } from "../_components/diagrams";

export default function Introduction() {
  return (
    <>
      <H2 id="what-is-gadvance">What is GADvance?</H2>
      <P>
        GADvance is an adaptive e-learning platform for gender sensitivity and Gender and Development (GAD) education.
        You learn through structured courses made of modules and lessons, and your understanding is checked with
        assessments that adjust to you.
      </P>
      <P>
        Behind the assessments is <strong className="font-medium text-zinc-900">Bayesian Knowledge Tracing (BKT)</strong>,
        a well-established model that estimates how likely it is that you have mastered a topic. GADvance updates that
        estimate after every answer and uses it to choose the difficulty of the next question.
      </P>

      <H2 id="who-it-is-for">Who it is for</H2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { icon: GraduationCap, title: "Students and individual learners", text: "Build a working understanding of GAD concepts at your own pace." },
          { icon: Building2, title: "Organizations", text: "Schools, offices, and agencies can give their members a shared set of learning plans and follow their progress." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-zinc-200 p-5">
            <Icon size={22} className="text-primary" aria-hidden="true" />
            <p className="mt-3 font-medium text-zinc-900">{title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{text}</p>
          </div>
        ))}
      </div>

      <H2 id="how-it-works">How it works at a glance</H2>
      <P>Most courses follow the same pattern:</P>
      <Figure caption="A typical module: a pre-test, lessons with adaptive checkpoints, then a post-test. Checkpoints can send you back to related lessons for review.">
        <AssessmentFlowDiagram />
      </Figure>
      <UL>
        <li><strong className="font-medium text-zinc-800">Pre-test</strong> records what you already know.</li>
        <li><strong className="font-medium text-zinc-800">Lessons</strong> teach the material in short pages.</li>
        <li><strong className="font-medium text-zinc-800">Checkpoint quizzes</strong> adapt their questions to your estimated mastery.</li>
        <li><strong className="font-medium text-zinc-800">Post-test</strong> shows how far you have come.</li>
      </UL>

      <H2 id="using-these-docs">Using these docs</H2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { icon: BookOpenCheck, href: "/docs/getting-started", title: "Getting started", text: "Set up your account and begin your first course." },
          { icon: Gauge, href: "/docs/how-bkt-works", title: "How BKT works", text: "Understand what your mastery estimate means." },
        ].map(({ icon: Icon, href, title, text }) => (
          <Link key={href} href={href} className="rounded-2xl border border-zinc-200 p-5 transition-colors hover:border-violet-200 hover:bg-violet-50/40">
            <Icon size={22} className="text-primary" aria-hidden="true" />
            <p className="mt-3 font-medium text-zinc-900">{title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{text}</p>
          </Link>
        ))}
      </div>
      <Callout kind="tip" title="Looking for something specific?">
        Use the search box in the documentation menu. It searches article titles, descriptions, and section headings.
      </Callout>
    </>
  );
}
