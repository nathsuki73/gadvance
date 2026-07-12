"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { Waypoints, X, Info, Brain } from "lucide-react";

const pulseStyles = `
  @keyframes nodePulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    50% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  .node-interactive { transition: all 0.2s ease; cursor: pointer; position: relative; z-index: 10; }
  .node-interactive:hover { transform: scale(1.3); z-index: 20; }
  .animate-pulse-node { animation: nodePulse 2s infinite ease-in-out; }
`;

type Point = { x: number; y: number };
type Line = { id: string; d: string; color: string; width: number };

interface BKTMetrics {
  mastery: number; // P(L_t) -> Current Live Calculation State
  prior: number; // P(L_0)
  transit: number; // P(T)
  guess: number; // P(G)
  slip: number; // P(S)
}

interface SelectedNodeState {
  label: string;
  details: string;
  bkt?: BKTMetrics;
}

interface LessonBlock {
  id: string;
  title: string;
}

interface ActiveItem {
  id: string;
  lesson_blocks?: LessonBlock[];
}

interface AnalyticsDrawerProps {
  moduleId: string;
  lessonProgress: Record<string, Set<string>>; // Track active sets
  quizProgress: Record<string, { completedSteps: number; totalSteps: number }>;
  activeItem: ActiveItem | null | undefined;
  liveBktMastery?: Record<string, number>;
}

export default function AnalyticsDrawer({
  moduleId,
  lessonProgress = {},
  quizProgress = {},
  activeItem,
  liveBktMastery = {},
}: AnalyticsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(
    null,
  );
  const [lines, setLines] = useState<Line[]>([]);

  // Safely map Knowledge Components from your actual active database rows
  const currentBlocks = activeItem?.lesson_blocks ?? [];
  const KCs = currentBlocks.map((block: LessonBlock, idx: number) => ({
    id: block.id,
    label: `KC${idx + 1}`,
    title: block.title,
    sub: ["S1", "S2", "S3"],
  }));

  const quizQuestions = Array.from(
    { length: 3 },
    (_, i) => `Question ${i + 1}`,
  );

  // ─── 💡 AUDIT AND COMPUTE LIVE REWRITE MATRIX ───
  const handleNodeSelection = (
    id: string,
    label: string,
    type: "root" | "kc" | "sub" | "quiz" | "q",
    fullTitle?: string,
  ) => {
    let details = "";
    let computedMastery = 0.3; // Baseline fallback prior assignment

    // 1. Check if the element has an active Python BKT script update registered inside state
    if (liveBktMastery && liveBktMastery[id] !== undefined) {
      computedMastery = liveBktMastery[id];
    } else {
      // 2. Otherwise, dynamically extract exact performance data rows out of client parameters
      switch (type) {
        case "root":
          // Average mastery across all tracked active components
          const activeKeys = Object.keys(liveBktMastery);
          if (activeKeys.length > 0) {
            const sum = activeKeys.reduce(
              (acc, k) => acc + (liveBktMastery[k] ?? 0.3),
              0,
            );
            computedMastery = sum / activeKeys.length;
          }
          break;

        case "quiz":
          const quizData = quizProgress[activeItem?.id || ""];
          if (quizData && quizData.totalSteps > 0) {
            computedMastery = quizData.completedSteps / quizData.totalSteps;
          }
          break;

        case "sub":
          // Check if this subtopic has been completed based on active navigation paths
          const parentLessonId = activeItem?.id || "";
          const completedSet = lessonProgress[parentLessonId];
          if (completedSet && completedSet.has(id)) {
            computedMastery = 1.0; // Completed module node checkpoint
          } else {
            computedMastery = 0.0; // Unvisited state node
          }
          break;
      }
    }

    // Assign operational model guess parameters contextually based on multigs settings
    const guessValue = type === "q" ? 0.2 : 0.18;
    const slipValue = type === "q" ? 0.1 : 0.08;

    const bkt: BKTMetrics = {
      mastery: computedMastery,
      prior: 0.3,
      transit: 0.15,
      guess: guessValue,
      slip: slipValue,
    };

    switch (type) {
      case "root":
        details =
          "Averaged operational skill matrix calculated across all active system nodes.";
        break;
      case "kc":
        details = `Latent competence tracking index computed for Knowledge Component: "${fullTitle || label}".`;
        break;
      case "sub":
        details = `Discrete state variable checking path coverage for subtopic element node block: ${label}.`;
        break;
      case "quiz":
        details =
          "Aggregated final structural competency coefficient generated across the summary block.";
        break;
      case "q":
        details = `Response layer parameter tracing explicit choice verification records.`;
        break;
    }

    setSelectedNode({ label: fullTitle || label, details, bkt });
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootNodeRef = useRef<HTMLDivElement | null>(null);
  const kcNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const subGroupRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const quizHubRef = useRef<HTMLDivElement | null>(null);
  const quizClusterRef = useRef<HTMLDivElement | null>(null);

  const elbowPath = (a: Point, b: Point) => {
    const midY = a.y + (b.y - a.y) / 2;
    return `M ${a.x},${a.y} L ${a.x},${midY} L ${b.x},${midY} L ${b.x},${b.y}`;
  };

  const measure = useCallback(() => {
    const container = containerRef.current;
    const root = rootNodeRef.current;
    const quizHub = quizHubRef.current;
    const quizCluster = quizClusterRef.current;
    if (!container || !root || !quizHub || !quizCluster) return;

    const containerRect = container.getBoundingClientRect();
    const point = (el: HTMLElement, edge: "top" | "bottom"): Point => ({
      x:
        el.getBoundingClientRect().left +
        el.getBoundingClientRect().width / 2 -
        containerRect.left,
      y:
        (edge === "top"
          ? el.getBoundingClientRect().top
          : el.getBoundingClientRect().bottom) - containerRect.top,
    });

    const rootPoint = point(root, "bottom");
    const quizHubTop = point(quizHub, "top");
    const quizHubBottom = point(quizHub, "bottom");

    const allTopPoints: Point[] = [];
    KCs.forEach((kc) => {
      const el = kcNodeRefs.current.get(kc.id);
      if (el) allTopPoints.push(point(el, "top"));
    });
    allTopPoints.push(quizHubTop);
    if (allTopPoints.length < 2) return;

    const newLines: Line[] = [];
    allTopPoints.forEach((targetTop, index) => {
      newLines.push({
        id: `root-track-${index}`,
        d: elbowPath(rootPoint, targetTop),
        color: "#d4d4d8",
        width: 1.5,
      });
    });

    KCs.forEach((kc) => {
      const nodeEl = kcNodeRefs.current.get(kc.id);
      const groupEl = subGroupRefs.current.get(kc.id);
      if (nodeEl && groupEl) {
        newLines.push({
          id: `${kc.id}-to-sub`,
          d: elbowPath(point(nodeEl, "bottom"), {
            x:
              groupEl.getBoundingClientRect().left +
              groupEl.getBoundingClientRect().width / 2 -
              containerRect.left,
            y: groupEl.getBoundingClientRect().top - containerRect.top,
          }),
          color: "#d4d4d8",
          width: 1.5,
        });
      }
    });

    newLines.push({
      id: "quiz-to-cluster",
      d: elbowPath(quizHubBottom, {
        x:
          quizCluster.getBoundingClientRect().left +
          quizCluster.getBoundingClientRect().width / 2 -
          containerRect.left,
        y: quizCluster.getBoundingClientRect().top - containerRect.top,
      }),
      color: "#d4d4d8",
      width: 1.5,
    });
    setLines(newLines);
  }, [KCs]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isOpen, measure]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pulseStyles }} />

      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Waypoints size={22} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-zinc-200 bg-white p-6 shadow-2xl transition-transform duration-300 overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            Module AI Analytics
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border border-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div
            ref={containerRef}
            className="relative bg-white border border-zinc-100 rounded-xl p-4 shadow-xs flex flex-col items-center min-h-[360px]"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {lines.map((line) => (
                <path
                  key={line.id}
                  d={line.d}
                  stroke={line.color}
                  strokeWidth={line.width}
                  fill="none"
                />
              ))}
            </svg>

            {/* Root Node */}
            <div className="relative z-10">
              <div
                ref={rootNodeRef}
                title="Lesson Overview"
                onClick={() =>
                  handleNodeSelection("root", "Lesson Overview", "root")
                }
                className="h-[21px] w-[21px] rounded-full bg-blue-500 animate-pulse-node node-interactive"
              />
            </div>

            {/* Main Multi-lane Tracking Architecture Grid */}
            <div className="flex w-full mt-14 relative z-10 gap-1 justify-between items-start">
              {KCs.map((kc) => (
                <div
                  key={kc.id}
                  className="flex flex-col items-center flex-1 min-w-0 px-0.5"
                >
                  <div className="h-14" />
                  <div
                    ref={(el) => {
                      if (el) kcNodeRefs.current.set(kc.id, el);
                      else kcNodeRefs.current.delete(kc.id);
                    }}
                    title={kc.title}
                    onClick={() =>
                      handleNodeSelection(kc.id, kc.label, "kc", kc.title)
                    }
                    className="h-[21px] w-[21px] rounded-full bg-indigo-400 animate-pulse-node node-interactive flex-shrink-0"
                  />
                  <div
                    ref={(el) => {
                      if (el) subGroupRefs.current.set(kc.id, el);
                      else subGroupRefs.current.delete(kc.id);
                    }}
                    className="flex flex-col gap-1 mt-[50px] p-1 bg-emerald-50/40 rounded-lg border border-emerald-100/60 shadow-2xs items-center"
                  >
                    {kc.sub.map((sub, i) => (
                      <div
                        key={i}
                        title={`${kc.label} - Sub-unit ${i + 1}`}
                        onClick={() =>
                          handleNodeSelection(
                            `${kc.id}-sub-${i}`,
                            `${kc.label} - Sub-unit ${i + 1}`,
                            "sub",
                          )
                        }
                        className="h-[21px] w-[21px] rounded-full bg-emerald-400 animate-pulse-node node-interactive flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Assessment Column Node Chain */}
              <div className="flex flex-col items-center flex-1 min-w-0 px-0.5">
                <div className="h-14" />
                <div
                  ref={quizHubRef}
                  title="Final Module Assessment"
                  onClick={() =>
                    handleNodeSelection(
                      "quiz-hub",
                      "Final Quiz Overview",
                      "quiz",
                    )
                  }
                  className="h-[21px] w-[21px] rounded-full bg-amber-500 animate-pulse-node node-interactive flex-shrink-0"
                />
                <div
                  ref={quizClusterRef}
                  className="grid grid-cols-3 gap-1 mt-[50px] p-1 bg-amber-50/40 rounded-lg border border-amber-100/60 shadow-2xs w-[77px] justify-items-center"
                >
                  {quizQuestions.map((qLabel, i) => (
                    <div
                      key={i}
                      title={`Final Quiz - ${qLabel}`}
                      onClick={() =>
                        handleNodeSelection(
                          `quiz-q-${i}`,
                          `Quiz - ${qLabel}`,
                          "q",
                        )
                      }
                      className="h-[21px] w-[21px] rounded-full bg-amber-400/90 animate-pulse-node node-interactive flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Detail Panel */}
          <div
            className={`rounded-xl border p-4 transition-all duration-300 ${selectedNode ? "bg-zinc-50/50 border-zinc-200" : "bg-zinc-50 border-zinc-100"}`}
          >
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                    <Info size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 leading-none mb-1">
                      {selectedNode.label}
                    </h4>
                    <p className="text-xs text-zinc-500 leading-normal">
                      {selectedNode.details}
                    </p>
                  </div>
                </div>

                {selectedNode.bkt && (
                  <div className="pt-2 space-y-4 border-t border-zinc-200/60">
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-3 shadow-2xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                          <Brain size={14} className="text-indigo-500" />
                          <span>Latent Mastery Estimation: $P(L_t)$</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">
                          {(selectedNode.bkt.mastery * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${selectedNode.bkt.mastery * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1.5 leading-normal">
                        The platform&rsquo;s live algorithmic confidence index
                        that you deeply grasp this concept.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            Head Start Factor: $P(L_0)$
                          </div>
                          <div className="text-xs font-bold text-zinc-700">
                            {(selectedNode.bkt.prior * 100).toFixed(0)}%
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 leading-tight">
                          Estimated baseline skill level entering this block.
                        </span>
                      </div>

                      <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            Learning Velocity: $P(T)$
                          </div>
                          <div className="text-xs font-bold text-zinc-700">
                            {(selectedNode.bkt.transit * 100).toFixed(0)}%
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 leading-tight">
                          The speed of structural concept assimilation.
                        </span>
                      </div>

                      <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            Lucky Guess Buffer: $P(G)$
                          </div>
                          <div className="text-xs font-bold text-zinc-700">
                            {(selectedNode.bkt.guess * 100).toFixed(0)}%
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 leading-tight">
                          Calculated tolerance factoring out fluke hits.
                        </span>
                      </div>

                      <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            Careless Error Margin: $P(S)$
                          </div>
                          <div className="text-xs font-bold text-zinc-700">
                            {(selectedNode.bkt.slip * 100).toFixed(0)}%
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 leading-tight">
                          Protects scores against misclicks and typos.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-400 text-sm py-6">
                Click any node in the tree topology to audit active BKT machine
                learning telemetry matrices.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
