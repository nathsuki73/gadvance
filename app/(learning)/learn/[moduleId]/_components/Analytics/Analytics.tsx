"use client";

import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { Network, X, Info, RefreshCw } from "lucide-react";
import { fetchLiveKCMastery } from "./service";

const nodeStyles = `
  .node-interactive { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; position: relative; z-index: 10; }
  .node-interactive:hover { transform: scale(1.2); z-index: 20; }
  .node-interactive:focus-visible { outline: 2px solid #3B5BDB; outline-offset: 2px; }
  .node-selected { box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.25); }
`;

type Point = { x: number; y: number };
type Line = { id: string; d: string; color: string; width: number };

interface BKTMetrics {
  mastery: number;
  prior: number;
  transit: number;
  guess: number;
  slip: number;
}

interface SelectedNodeState {
  id: string;
  label: string;
  details: string;
  type: "root" | "kc" | "sub" | "quiz" | "q";
  bkt?: BKTMetrics;
}

interface LessonBlock {
  id: string;
  title: string;
}

interface ActiveItem {
  id: string;
  title?: string;
  lesson_blocks?: LessonBlock[];
}

interface AnalyticsDrawerProps {
  moduleId: string;
  lessonProgress: Record<string, Set<string>>;
  quizProgress: Record<string, { completedSteps: number; totalSteps: number }>;
  activeItem: ActiveItem | null | undefined;
  liveBktMastery?: Record<string, number>;
}

const QUIZ_QUESTION_COUNT = 12;

// Node fill by mastery band. Knowledge components and sub-units use
// blue shades; the final quiz keeps its own amber accent (see JSX).
function masteryColor(value: number | undefined): string {
  const v = value ?? 0;
  if (v > 0.85) return "bg-blue-600";
  if (v > 0.5) return "bg-blue-500";
  if (v > 0.1) return "bg-blue-300";
  return "bg-zinc-300";
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

  // 1. Maintain both the data and a snapshot of the prop used to seed it
  const [localBktState, setLocalBktState] =
    useState<Record<string, number>>(liveBktMastery);
  const [prevLiveBktMastery, setPrevLiveBktMastery] =
    useState<Record<string, number>>(liveBktMastery);

  // 2. If the parent prop reference changes, update local state immediately during render
  if (liveBktMastery !== prevLiveBktMastery) {
    setPrevLiveBktMastery(liveBktMastery);
    setLocalBktState(liveBktMastery);
  }

  const activeItemId = activeItem?.id;

  // 3. Keep your data-fetching callback clean and explicit
  const refreshLiveTelemetry = useCallback(async () => {
    if (!activeItemId) return;

    try {
      const freshData = await fetchLiveKCMastery(activeItemId);
      setLocalBktState(freshData);

      setSelectedNode((prev) => {
        if (prev && prev.type === "kc") {
          const liveVal = freshData[prev.id] ?? 0;
          return {
            ...prev,
            bkt: prev.bkt ? { ...prev.bkt, mastery: liveVal } : undefined,
          };
        }
        return prev;
      });
    } catch (e) {
      console.error("Failed to refresh mastery data:", e);
    }
  }, [activeItemId]);

  // 4. This effect performs an external asynchronous fetch on open safely without linter warnings
  useEffect(() => {
    if (!isOpen) return;

    const triggerFetch = async () => {
      await refreshLiveTelemetry();
    };

    triggerFetch();
  }, [isOpen, refreshLiveTelemetry]);

  const currentBlocks = activeItem?.lesson_blocks ?? [];
  const KCs = currentBlocks.map((block: LessonBlock, idx: number) => ({
    id: block.id,
    label: `KC${idx + 1}`,
    title: block.title,
    sub: ["S1", "S2", "S3"],
  }));

  const quizQuestions = Array.from(
    { length: QUIZ_QUESTION_COUNT },
    (_, i) => `Question ${i + 1}`,
  );

  const handleNodeSelection = (
    id: string,
    label: string,
    type: "root" | "kc" | "sub" | "quiz" | "q",
    fullTitle?: string,
  ) => {
    let details = "";
    let computedMastery = 0;

    if (localBktState && localBktState[id] !== undefined) {
      computedMastery = localBktState[id];
    } else {
      switch (type) {
        case "root": {
          const activeKeys = Object.keys(localBktState);
          if (activeKeys.length > 0) {
            const sum = activeKeys.reduce(
              (acc, k) => acc + (localBktState[k] ?? 0),
              0,
            );
            computedMastery = sum / activeKeys.length;
          }
          break;
        }
        case "kc":
          computedMastery = localBktState[id] ?? 0;
          break;
        case "quiz": {
          const quizData = quizProgress[activeItem?.id || ""];
          if (quizData && quizData.totalSteps > 0) {
            computedMastery = quizData.completedSteps / quizData.totalSteps;
          }
          break;
        }
        case "sub": {
          const parentLessonId = activeItem?.id || "";
          const completedSet = lessonProgress[parentLessonId];
          computedMastery = completedSet?.has(id) ? 1.0 : 0.0;
          break;
        }
      }
    }

    const guessValue = type === "q" ? 0.2 : 0.18;
    const slipValue = type === "q" ? 0.1 : 0.08;

    const bkt: BKTMetrics = {
      mastery: computedMastery,
      prior: 0,
      transit: 0.15,
      guess: guessValue,
      slip: slipValue,
    };

    switch (type) {
      case "root":
        details =
          "Average mastery across every knowledge component in this lesson.";
        break;
      case "kc":
        details = `Estimated mastery for "${fullTitle || label}", based on your responses so far.`;
        break;
      case "sub":
        details = `Whether this sub-unit of ${label.split(" - ")[0]} has been completed.`;
        break;
      case "quiz":
        details = "Combined score across all questions in the final quiz.";
        break;
      case "q":
        details =
          "How this question's answer contributes to the mastery estimate.";
        break;
    }

    setSelectedNode({ id, label: fullTitle || label, details, type, bkt });
  };

  const containerRef = useRef<HTMLDivElement | null>(null); // Stays div (attached to container div)
  const rootNodeRef = useRef<HTMLButtonElement | null>(null); // Fixed to button
  const kcNodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); // Fixed to button
  const subGroupRefs = useRef<Map<string, HTMLDivElement>>(new Map()); // Stays div (attached to sub-unit wrapper div)
  const quizHubRef = useRef<HTMLButtonElement | null>(null); // Fixed to button
  const quizClusterRef = useRef<HTMLDivElement | null>(null); // Stays div (attached to quiz wrapper div)

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
        color: "#e4e4e7",
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
          color: "#e4e4e7",
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
      color: "#e4e4e7",
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
      <style dangerouslySetInnerHTML={{ __html: nodeStyles }} />

      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open lesson analytics"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-colors hover:bg-zinc-800"
      >
        <Network size={20} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-zinc-200 bg-white p-6 shadow-xl transition-transform duration-300 overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-base font-semibold text-zinc-900 truncate">
              {activeItem?.title || "Lesson progress"}
            </h3>
            <button
              onClick={refreshLiveTelemetry}
              aria-label="Refresh mastery data"
              title="Refresh"
              className="p-1 rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50 shrink-0"
            >
              <RefreshCw size={13} />
            </button>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="p-1 rounded-md border border-zinc-200 hover:bg-zinc-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Knowledge component list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Knowledge components
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {KCs.map((kc) => {
                const liveMastery = localBktState[kc.id] ?? 0;
                return (
                  <button
                    key={kc.id}
                    onClick={() =>
                      handleNodeSelection(kc.id, kc.label, "kc", kc.title)
                    }
                    className="text-left flex flex-col p-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="min-w-0 pr-2">
                        <span className="inline-block text-[10px] font-semibold text-zinc-500 bg-zinc-100 rounded px-1.5 py-0.5 mb-1">
                          {kc.label}
                        </span>
                        <h5 className="text-xs font-medium text-zinc-800 truncate">
                          {kc.title}
                        </h5>
                      </div>
                      <span className="text-xs font-semibold text-zinc-700 shrink-0">
                        {(liveMastery * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${liveMastery * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tree diagram */}
          <div
            ref={containerRef}
            className="relative bg-white border border-zinc-100 rounded-lg p-4 flex flex-col items-center min-h-[380px]"
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

            {/* Root node */}
            <div className="relative z-10">
              <button
                ref={rootNodeRef}
                title="Lesson overview"
                onClick={() =>
                  handleNodeSelection("root", "Lesson overview", "root")
                }
                className={`h-[18px] w-[18px] rounded-full bg-indigo-600 node-interactive ${selectedNode?.id === "root" ? "node-selected" : ""}`}
              />
            </div>

            <div className="flex w-full mt-14 relative z-10 gap-1 justify-between items-start">
              {KCs.map((kc) => {
                const nodeMastery = localBktState[kc.id];
                return (
                  <div
                    key={kc.id}
                    className="flex flex-col items-center flex-1 min-w-0 px-0.5"
                  >
                    <div className="h-14" />
                    <button
                      ref={(el) => {
                        if (el) kcNodeRefs.current.set(kc.id, el);
                        else kcNodeRefs.current.delete(kc.id);
                      }}
                      title={kc.title}
                      onClick={() =>
                        handleNodeSelection(kc.id, kc.label, "kc", kc.title)
                      }
                      className={`h-[18px] w-[18px] rounded-full ${masteryColor(nodeMastery)} node-interactive flex-shrink-0 ${selectedNode?.id === kc.id ? "node-selected" : ""}`}
                    />
                    <div
                      ref={(el) => {
                        if (el) subGroupRefs.current.set(kc.id, el);
                        else subGroupRefs.current.delete(kc.id);
                      }}
                      className="flex flex-col gap-1 mt-[50px] p-1 bg-blue-50/40 rounded-md border border-blue-100 items-center"
                    >
                      {kc.sub.map((sub, i) => {
                        const subId = `${kc.id}-sub-${i}`;
                        return (
                          <button
                            key={i}
                            title={`${kc.label} - Sub-unit ${i + 1}`}
                            onClick={() =>
                              handleNodeSelection(
                                subId,
                                `${kc.label} - Sub-unit ${i + 1}`,
                                "sub",
                              )
                            }
                            className={`h-[18px] w-[18px] rounded-full bg-blue-400 node-interactive flex-shrink-0 ${selectedNode?.id === subId ? "node-selected" : ""}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Quiz column */}
              <div className="flex flex-col items-center flex-1 min-w-0 px-0.5">
                <div className="h-14" />
                <button
                  ref={quizHubRef}
                  title="Final quiz"
                  onClick={() =>
                    handleNodeSelection(
                      "quiz-hub",
                      "Final quiz overview",
                      "quiz",
                    )
                  }
                  className={`h-[18px] w-[18px] rounded-full bg-amber-500 node-interactive flex-shrink-0 ${selectedNode?.id === "quiz-hub" ? "node-selected" : ""}`}
                />
                <div
                  ref={quizClusterRef}
                  className="grid grid-cols-3 gap-1 mt-[50px] p-1.5 bg-amber-50/40 rounded-md border border-amber-100 w-[72px] justify-items-center"
                >
                  {quizQuestions.map((qLabel, i) => {
                    const qId = `quiz-q-${i}`;
                    return (
                      <button
                        key={i}
                        title={`Final quiz - ${qLabel}`}
                        onClick={() =>
                          handleNodeSelection(qId, `Quiz - ${qLabel}`, "q")
                        }
                        className={`h-[15px] w-[15px] rounded-full bg-amber-400/90 node-interactive flex-shrink-0 ${selectedNode?.id === qId ? "node-selected" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div className="pt-2 transition-colors duration-300">
            {selectedNode ? (
              <div className="space-y-5">
                {/* Header and Details Description */}
                <div>
                  <h4 className="font-bold text-base text-zinc-900 mb-1">
                    {selectedNode.label}
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {selectedNode.details}
                  </p>
                </div>

                {selectedNode.bkt && (
                  <div className="space-y-5">
                    {/* Main Progress Indicator */}
                    <div>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs font-semibold text-zinc-800">
                          Mastery estimate
                        </span>
                        <span className="text-base font-black text-zinc-950">
                          {(selectedNode.bkt.mastery * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            selectedNode.type === "quiz" ||
                            selectedNode.type === "q"
                              ? "bg-amber-500"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${selectedNode.bkt.mastery * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <hr className="border-zinc-100" />

                    {/* Clean, Frameless Param Rows Instead of Boxes */}
                    <div className="space-y-3.5">
                      <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        BKT Parameter Breakdown
                      </h5>

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="block text-xs font-medium text-zinc-700">
                            Prior knowledge
                          </span>
                          <span className="block text-[11px] text-zinc-400 mt-0.5 leading-normal">
                            Skill level before starting.
                          </span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 tabular-nums">
                          {(selectedNode.bkt.prior * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="block text-xs font-medium text-zinc-700">
                            Learning rate
                          </span>
                          <span className="block text-[11px] text-zinc-400 mt-0.5 leading-normal">
                            Growth velocity per interaction.
                          </span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 tabular-nums">
                          {(selectedNode.bkt.transit * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="block text-xs font-medium text-zinc-700">
                            Guess threshold
                          </span>
                          <span className="block text-[11px] text-zinc-400 mt-0.5 leading-normal">
                            Chance of a lucky guess.
                          </span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 tabular-nums">
                          {(selectedNode.bkt.guess * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="block text-xs font-medium text-zinc-700">
                            Slip safety
                          </span>
                          <span className="block text-[11px] text-zinc-400 mt-0.5 leading-normal">
                            Buffer margin for misclicks.
                          </span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 tabular-nums">
                          {(selectedNode.bkt.slip * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-400 text-xs py-12 border border-dashed border-zinc-200 rounded-xl">
                Select a node in the diagram above to reveal learning analytics.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
