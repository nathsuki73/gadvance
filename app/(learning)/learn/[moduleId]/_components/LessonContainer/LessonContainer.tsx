"use client";

import { useEffect, useState } from "react";
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
  onContinue: () => void;
  handleNextSubRow: () => void;
  onBktUpdate?: (lessonBlockId: string, currentPLt: number) => void;
};

export default function LessonContainer({
  lessonItems,
  lessonId,
  activeBlockId,
  handleNextSubRow,
  onContinue,
  onBktUpdate,
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

  const currentEffectiveBlock = activeBlockId || lastActiveBlockId;

  if (activeBlockId && activeBlockId !== lastActiveBlockId) {
    setLastActiveBlockId(activeBlockId);
  }

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

  const knownBlockIds = Object.keys(subtopicsCache);

  // 💡 Updated Next Action Handler:
  // - Clicking "Start Lesson" now correctly moves down into the subtopic sequence (`handleNextSubRow`).
  // - Only when reaching the end of the subtopics/materials will it call `onContinue` (or move to the next lesson/quiz).
  const handleNextAction = () => {
    handleNextSubRow();
  };

  return (
    <div className="flex flex-col min-h-full w-full justify-between p-6">
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
                <MiniQuiz lessonBlockId={blockId} onBktUpdate={onBktUpdate} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Quiz View */}
      <div className={`flex-1 w-full ${isQuiz ? "" : "hidden"}`}>
        <MainLessonQuiz lessonBlockId={lessonId} isActive={isQuiz} />
      </div>

      {/* Persistent Navigation Footer */}
      {!isQuiz && (
        <div className="mt-6 flex justify-center shrink-0">
          <button
            onClick={handleNextAction}
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed] font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 cursor-pointer"
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