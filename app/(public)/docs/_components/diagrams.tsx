import { BKT_PARAMETERS, traceMastery } from "../_lib/bkt";

/* Shared box used by the flow diagrams. */
function Box({ x, y, w, h, title, sub, tone = "neutral" }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tone?: "brand" | "neutral" | "soft" }) {
  const fill = tone === "brand" ? "#7c3aed" : tone === "soft" ? "#f5f3ff" : "#ffffff";
  const stroke = tone === "brand" ? "#7c3aed" : tone === "soft" ? "#ddd6fe" : "#d4d4d8";
  const ink = tone === "brand" ? "#ffffff" : "#18181b";
  const subInk = tone === "brand" ? "#ede9fe" : "#71717a";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 4 : y + h / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={600} fill={ink}>{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize={11} fill={subInk}>{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, dashed }: { x1: number; y1: number; x2: number; y2: number; label?: string; dashed?: boolean }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a1a1aa" strokeWidth={1.5} markerEnd="url(#gad-arrow)" strokeDasharray={dashed ? "5 4" : undefined} />
      {label && <text x={mx} y={my - 7} textAnchor="middle" fontSize={11} fill="#52525b">{label}</text>}
    </g>
  );
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="gad-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
      </marker>
    </defs>
  );
}

export function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 720 300" role="img" aria-labelledby="arch-title arch-desc" className="h-auto w-full font-sans">
      <title id="arch-title">GADvance architecture</title>
      <desc id="arch-desc">Learners use the GADvance web app and administrators use the Admin Portal. Both talk to the GADvance API, which stores data in a MySQL database and sends email through an email delivery service.</desc>
      <ArrowDefs />
      <Box x={20} y={40} w={200} h={64} title="Learner web app" sub="Courses, lessons, assessments" tone="soft" />
      <Box x={20} y={196} w={200} h={64} title="Admin Portal" sub="Organizations, content, analytics" tone="soft" />
      <Box x={290} y={118} w={170} h={64} title="GADvance API" sub="Auth, BKT engine, data" tone="brand" />
      <Box x={530} y={40} w={170} h={64} title="MySQL database" sub="Accounts, progress, mastery" />
      <Box x={530} y={196} w={170} h={64} title="Email delivery" sub="Verification, resets" />
      <Arrow x1={220} y1={80} x2={288} y2={138} label="HTTPS" />
      <Arrow x1={220} y1={226} x2={288} y2={164} label="HTTPS" />
      <Arrow x1={460} y1={138} x2={528} y2={84} />
      <Arrow x1={460} y1={164} x2={528} y2={222} />
    </svg>
  );
}

export function AssessmentFlowDiagram() {
  return (
    <svg viewBox="0 0 760 230" role="img" aria-labelledby="flow-title flow-desc" className="h-auto w-full font-sans">
      <title id="flow-title">How a module flows</title>
      <desc id="flow-desc">A module starts with a pre-test, then lessons and adaptive checkpoint quizzes. If a checkpoint shows a topic needs more work you are pointed back to lesson content to review. The module ends with a post-test and your results.</desc>
      <ArrowDefs />
      <Box x={10} y={60} w={120} h={60} title="Pre-test" sub="What you know now" />
      <Box x={165} y={60} w={120} h={60} title="Lessons" sub="Pages and content" />
      <Box x={320} y={60} w={140} h={60} title="Checkpoint" sub="Adaptive quiz" tone="brand" />
      <Box x={495} y={60} w={120} h={60} title="Post-test" sub="What you learned" />
      <Box x={650} y={60} w={100} h={60} title="Results" sub="Scores, progress" tone="soft" />
      <Arrow x1={130} y1={90} x2={163} y2={90} />
      <Arrow x1={285} y1={90} x2={318} y2={90} />
      <Arrow x1={460} y1={90} x2={493} y2={90} />
      <Arrow x1={615} y1={90} x2={648} y2={90} />
      <Box x={300} y={160} w={180} h={50} title="Review suggested lessons" tone="soft" />
      <Arrow x1={390} y1={122} x2={390} y2={158} label="needs work" dashed />
      <path d="M 300 185 C 225 185 225 135 225 122" fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="5 4" markerEnd="url(#gad-arrow)" />
    </svg>
  );
}

export function BktUpdateDiagram() {
  return (
    <svg viewBox="0 0 760 170" role="img" aria-labelledby="bkt-title bkt-desc" className="h-auto w-full font-sans">
      <title id="bkt-title">One BKT update</title>
      <desc id="bkt-desc">Your current mastery estimate and your answer are combined using the guess and slip probabilities, then the learning transition probability is applied to produce the new mastery estimate, which decides the next question difficulty.</desc>
      <ArrowDefs />
      <Box x={10} y={50} w={130} h={64} title="Current mastery" sub="e.g. 0.20" />
      <Box x={175} y={50} w={130} h={64} title="Your answer" sub="correct / incorrect" />
      <Box x={340} y={50} w={130} h={64} title="Weigh evidence" sub="guess + slip" tone="soft" />
      <Box x={505} y={50} w={110} h={64} title="Learning" sub="+ transition" tone="soft" />
      <Box x={650} y={50} w={100} h={64} title="New mastery" tone="brand" />
      <Arrow x1={140} y1={82} x2={173} y2={82} />
      <Arrow x1={305} y1={82} x2={338} y2={82} />
      <Arrow x1={470} y1={82} x2={503} y2={82} />
      <Arrow x1={615} y1={82} x2={648} y2={82} />
      <text x={700} y={140} textAnchor="middle" fontSize={11} fill="#52525b">sets next difficulty</text>
    </svg>
  );
}

/** Line chart of a real BKT trace for a sample answer sequence. */
export function MasteryTraceChart({ answers }: { answers: boolean[] }) {
  const trace = traceMastery(answers);
  const width = 720;
  const height = 260;
  const left = 48;
  const right = 20;
  const top = 20;
  const bottom = 46;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const x = (i: number) => left + (i / (trace.length - 1)) * plotW;
  const y = (v: number) => top + (1 - v) * plotH;
  const path = trace.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const summary = trace.map((v, i) => (i === 0 ? `start ${v}` : `${answers[i - 1] ? "correct" : "incorrect"} ${v}`)).join(", ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="trace-title trace-desc" className="h-auto w-full font-sans">
      <title id="trace-title">Mastery estimate after each answer</title>
      <desc id="trace-desc">{`Starting at the initial knowledge value of ${BKT_PARAMETERS.prior}: ${summary}.`}</desc>
      {/* difficulty bands */}
      <rect x={left} y={y(1)} width={plotW} height={y(0.7) - y(1)} fill="#f5f3ff" />
      <rect x={left} y={y(0.7)} width={plotW} height={y(0.4) - y(0.7)} fill="#fafafa" />
      <text x={width - right - 6} y={y(0.97)} textAnchor="end" fontSize={10} fill="#6d28d9">Analyze / Evaluate</text>
      <text x={width - right - 6} y={y(0.67)} textAnchor="end" fontSize={10} fill="#71717a">Apply</text>
      <text x={width - right - 6} y={y(0.37)} textAnchor="end" fontSize={10} fill="#71717a">Remember / Understand</text>
      {[0, 0.4, 0.7, 1].map((v) => (
        <g key={v}>
          <line x1={left} x2={width - right} y1={y(v)} y2={y(v)} stroke="#e4e4e7" strokeWidth={1} />
          <text x={left - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#71717a">{v.toFixed(2)}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinejoin="round" />
      {trace.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r={5} fill={i === 0 ? "#ffffff" : answers[i - 1] ? "#7c3aed" : "#f59e0b"} stroke="#7c3aed" strokeWidth={2} />
          <text x={x(i)} y={y(v) - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill="#18181b">{v.toFixed(2)}</text>
          <text x={x(i)} y={height - 18} textAnchor="middle" fontSize={11} fill="#52525b">{i === 0 ? "Start" : answers[i - 1] ? `Q${i} ✓` : `Q${i} ✗`}</text>
        </g>
      ))}
    </svg>
  );
}
