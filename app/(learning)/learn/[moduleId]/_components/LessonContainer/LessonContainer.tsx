"use client";

import { useEffect, useRef, useState } from "react";
import TopicOverview from "./Overview/TopicOverview";
import { ModuleStructureItem } from "../../service";
import { fetchOverview, fetchSubtopics } from "./service";
import { Lesson } from "./Overview/types";
import Subtopic, { SubtopicItem } from "./SubTopic/Subtopic";
import { LessonQuiz as MainLessonQuiz } from "./Quiz/LessonQuiz";
import { LessonQuiz as MiniQuiz } from "./SubTopic/MiniQuiz/LessonQuiz";
import { ArrowRight, PlayCircle } from "lucide-react";

type LessonContainerProps = {
  lessonItems?: ModuleStructureItem[];
  lessonId: string;
  activeBlockId: string | undefined;
  onContinueAction: () => void;
  handleNextSubRowAction: () => void;
  onLessonStepCompleteAction?: (lessonId: string, stepId: string) => void;
  onBktUpdateAction?: (lessonBlockId: string, currentPLt: number) => void;
};

export default function LessonContainer({
  lessonItems,
  lessonId,
  activeBlockId,
  onContinueAction,
  handleNextSubRowAction,
  onLessonStepCompleteAction,
  onBktUpdateAction,
}: LessonContainerProps) {
  // Cache the overviews in an object keyed by lessonId
  const [overviewsCache, setOverviewsCache] = useState<
    Record<string, ModuleStructureItem>
  >({});

  const [subtopicsCache, setSubtopicsCache] = useState<
    Record<string, SubtopicItem[]>
  >({});

  const [lastActiveBlockId, setLastActiveBlockId] =
    useState<string>("overview");
  const [isMainQuizCompleted, setIsMainQuizCompleted] = useState(false);
  const [completedMiniQuizBlocks, setCompletedMiniQuizBlocks] = useState<
    Set<string>
  >(new Set());
  const topAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMainQuizCompleted(false);
    setCompletedMiniQuizBlocks(new Set());

    const isMainCompletedLocal =
      localStorage.getItem(`main_quiz_completed_${lessonId}`) === "true";
    if (isMainCompletedLocal) {
      setIsMainQuizCompleted(true);
    }
  }, [lessonId]);

  const currentEffectiveBlock = activeBlockId || lastActiveBlockId;

  if (activeBlockId && activeBlockId !== lastActiveBlockId) {
    setLastActiveBlockId(activeBlockId);
  }

  // 💡 FIX 1: Restore completion status from localStorage when activeBlockId changes/mounts
  useEffect(() => {
    if (!currentEffectiveBlock || currentEffectiveBlock === "overview" || currentEffectiveBlock === "quiz") {
      return;
    }

    const isCompletedInStorage =
      localStorage.getItem(`quiz_completed_${currentEffectiveBlock}`) === "true" ||
      !!localStorage.getItem(`quiz_result_${currentEffectiveBlock}`);

    if (isCompletedInStorage) {
      setCompletedMiniQuizBlocks((prev) => {
        if (prev.has(currentEffectiveBlock)) return prev;
        const next = new Set(prev);
        next.add(currentEffectiveBlock);
        return next;
      });
    }
  }, [currentEffectiveBlock]);

  useEffect(() => {
    // If we already have the data for this lessonId, don't refetch
    if (overviewsCache[lessonId]) return;

    const fetchLessonOverview = async () => {
      try {
        const fetchedLessons: Lesson[] = await fetchOverview(lessonId);
        const apiDescription = fetchedLessons[0]?.description || "";

        const currentLessonItem = lessonItems?.find(
          (item) => item.id === lessonId,
        );

        // Store the combined item in cache
        setOverviewsCache((prev) => ({
          ...prev,
          [lessonId]: {
            ...currentLessonItem,
            description: apiDescription,
          } as ModuleStructureItem,
        }));
      } catch (error) {
        console.error("Failed to fetch lesson overview:", error);
      }
    };

    fetchLessonOverview();
  }, [lessonId, lessonItems, overviewsCache]);

  useEffect(() => {
    if (
      !activeBlockId ||
      activeBlockId === "overview" ||
      activeBlockId === "quiz" ||
      subtopicsCache[activeBlockId]
    ) {
      return;
    }

    const fetchLessonSubtopics = async () => {
      try {
        const data: SubtopicItem[] = await fetchSubtopics(activeBlockId);
        setSubtopicsCache((prev) => ({
          ...prev,
          [activeBlockId]: data,
        }));
      } catch (error) {
        console.error("Failed to fetch subtopics:", error);
      }
    };

    fetchLessonSubtopics();
  }, [activeBlockId, subtopicsCache, lessonId]);

  const currentOverview = overviewsCache[lessonId];
  const currentSubtopic = subtopicsCache[activeBlockId || ""] ?? [];

  const isOverview = currentEffectiveBlock === "overview";
  const isQuiz = currentEffectiveBlock === "quiz";
  const isSubtopic =
    currentEffectiveBlock &&
    currentEffectiveBlock !== "overview" &&
    currentEffectiveBlock !== "quiz";
  const isCurrentMiniQuizCompleted =
    isSubtopic && currentEffectiveBlock
      ? completedMiniQuizBlocks.has(currentEffectiveBlock)
      : true;
  const isNextStepDisabled = Boolean(isSubtopic && !isCurrentMiniQuizCompleted);

  const knownBlockIds = Object.keys(subtopicsCache);

  const scrollToTopOfSection = () => {
    requestAnimationFrame(() => {
      topAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  const handleNextAction = () => {
    const currentStepId = currentEffectiveBlock || "overview";
    if (currentStepId !== "quiz") {
      onLessonStepCompleteAction?.(lessonId, currentStepId);
    }
    handleNextSubRowAction();
    scrollToTopOfSection();
  };

  // 💡 FIX 2: Helper function to register completion in state AND localStorage
  const handleMiniQuizCompletion = (blockId: string, currentPLt?: number) => {
    localStorage.setItem(`quiz_completed_${blockId}`, "true");
    setCompletedMiniQuizBlocks((prev) => {
      if (prev.has(blockId)) return prev;
      const next = new Set(prev);
      next.add(blockId);
      return next;
    });

    if (currentPLt !== undefined && onBktUpdateAction) {
      onBktUpdateAction(blockId, currentPLt);
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full justify-between p-6">
      <div ref={topAnchorRef} />

      {/* 1. Overview View */}
      <div className={`flex-1 w-full ${isOverview ? "" : "hidden"}`}>
        <TopicOverview overview={currentOverview} onContinue={handleNextAction} />
      </div>

      {/* 2. Subtopic View */}
      <div className={`flex-1 w-full space-y-6 ${isSubtopic ? "" : "hidden"}`}>
        <Subtopic subtopics={currentSubtopic} />

        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-10 border-t border-zinc-200">
          <div
            className={
              currentSubtopic && currentSubtopic.length > 0 ? "" : "hidden"
            }
          >
            <h3 className="text-xl font-semibold text-zinc-800 text-center mb-8">
              You&rsquo;ve reached the end of the lesson!
            </h3>

            {knownBlockIds.map((blockId) => (
              <div
                key={blockId}
                className={currentEffectiveBlock === blockId ? "" : "hidden"}
              >
                <MiniQuiz
                  lessonBlockId={blockId}
                  onBktUpdate={(bId, score) => handleMiniQuizCompletion(bId, score)}
                  completedAction={() => handleMiniQuizCompletion(blockId)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Quiz View */}
      <div className={`flex-1 w-full ${isQuiz ? "" : "hidden"}`}>
        <MainLessonQuiz
          lessonBlockId={lessonId}
          isActive={isQuiz}
          action={() => {
            localStorage.setItem(`main_quiz_completed_${lessonId}`, "true");
            setIsMainQuizCompleted(true);
            onLessonStepCompleteAction?.(lessonId, "quiz");
          }}
        />

        {isMainQuizCompleted && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onContinueAction}
              className="group inline-flex items-center gap-2 rounded-lg bg-[#8b5cf6] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 cursor-pointer"
            >
              <span>Next Lesson</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Persistent Navigation Footer */}
      {!isQuiz && (
        <div className="mt-6 flex justify-center shrink-0">
          <button
            disabled={isNextStepDisabled}
            onClick={handleNextAction}
            className={`group inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 ${
              isNextStepDisabled
                ? "cursor-not-allowed bg-zinc-300 text-zinc-500"
                : "cursor-pointer bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            }`}
          >
            <span>{isOverview ? "Start Lesson" : "Next Step"}</span>

            {isOverview ? (
              <PlayCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
            ) : (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}