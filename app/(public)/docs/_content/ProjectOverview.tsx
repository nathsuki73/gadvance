import { Callout, Figure, H2, P, UL } from "../_components/primitives";
import { ArchitectureDiagram } from "../_components/diagrams";

export default function ProjectOverview() {
  return (
    <>
      <H2 id="background">Background</H2>
      <P>
        Gender and Development (GAD) is the Philippine government&apos;s framework for making gender equality part of
        how institutions plan, budget, and deliver services. Building gender sensitivity takes education that reaches
        people with very different starting points. A single fixed quiz is too hard for some learners and too easy for
        others.
      </P>
      <P>
        GADvance began as an undergraduate research project at the College of Computer Studies, Laguna State
        Polytechnic University &ndash; San Pablo City Campus. The project studied whether adaptive assessment, powered by
        Bayesian Knowledge Tracing, supports GAD learning. That study has concluded, and every learner now receives the
        adaptive experience.
      </P>

      <H2 id="objectives">Core objectives</H2>
      <UL>
        <li>Deliver structured, self-paced GAD lessons that anyone with a browser can take.</li>
        <li>Personalize assessment difficulty from each learner&apos;s estimated mastery.</li>
        <li>Point learners to the specific lesson content they should review.</li>
        <li>Let organizations provide learning plans to their members and follow aggregate progress.</li>
      </UL>

      <H2 id="sdg-alignment">SDG 4 and SDG 5 alignment</H2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">SDG 4</p>
          <p className="mt-2 font-medium text-zinc-900">Quality Education</p>
          <p className="mt-1 text-sm leading-6 text-zinc-600">Accessible online learning that adapts to what each learner already knows.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">SDG 5</p>
          <p className="mt-2 font-medium text-zinc-900">Gender Equality</p>
          <p className="mt-1 text-sm leading-6 text-zinc-600">Course content on gender concepts, roles, and the policies that promote equality.</p>
        </div>
      </div>

      <H2 id="architecture">High-level architecture</H2>
      <P>GADvance is made of three parts that work together:</P>
      <Figure caption="Learners and administrators use separate web apps. Both talk to one API, which holds the BKT engine and stores data in a MySQL database.">
        <ArchitectureDiagram />
      </Figure>
      <UL>
        <li><strong className="font-medium text-zinc-800">Learner web app</strong>: this site, where you browse courses, learn, and take assessments.</li>
        <li><strong className="font-medium text-zinc-800">Admin Portal</strong>: where organization administrators manage learning plans, modules, assessments, and analytics.</li>
        <li><strong className="font-medium text-zinc-800">GADvance API</strong>: handles accounts and sign-in, records your answers, and runs the BKT mastery updates.</li>
      </UL>

      <H2 id="team">Development team</H2>
      <P>
        GADvance was designed and built by student researchers of the College of Computer Studies, LSPU &ndash; San Pablo
        City Campus, as part of their undergraduate thesis.
      </P>
      <Callout title="Research data">
        Data collected during the study is kept for research analysis. Learners who joined after the study are not
        assigned to any research group.
      </Callout>
    </>
  );
}
