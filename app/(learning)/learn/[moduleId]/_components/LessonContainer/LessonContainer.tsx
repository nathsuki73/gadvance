"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import TopicOverview from "./Overview/TopicOverview";
import { ModuleStructureItem } from "../../service";
import { fetchOverview, fetchSubtopics } from "./service";
import { Lesson } from "./Overview/types";
import Subtopic, { SubtopicItem } from "./SubTopic/Subtopic";
import { LessonQuiz as MainLessonQuiz } from "./Quiz/LessonQuiz";
import { LessonQuiz as MiniQuiz } from "./SubTopic/MiniQuiz/LessonQuiz";

type LessonContainerProps = {
  lessonItems?: ModuleStructureItem[];
  lessonId: string;
  activeBlockId: string | undefined;
  onContinue: () => void;
  handleNextSubRow: () => void;
};

export default function LessonContainer({
  lessonItems,
  lessonId,
  activeBlockId,
  handleNextSubRow,
  onContinue,
}: LessonContainerProps) {
  const [loading, setLoading] = useState(false);
  // Cache the overviews in an object keyed by lessonId
  const [overviewsCache, setOverviewsCache] = useState<
    Record<string, ModuleStructureItem>
  >({});

  const [subtopicsCache, setSubtopicsCache] = useState<
    Record<string, SubtopicItem[]>
  >({});

  const [miniQuizStates, setMiniQuizStates] = useState<Record<string, boolean>>(
    {},
  );

  const [lastActiveBlockId, setLastActiveBlockId] =
    useState<string>("overview");

  useEffect(() => {
    // If we already have the data for this lessonId, don't refetch
    if (overviewsCache[lessonId]) return;

    const fetchLessonOverview = async () => {
      try {
        setLoading(true); // Turn loading ON before fetch
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
      } finally {
        setLoading(false);
      }
    };

    fetchLessonOverview();
  }, [lessonId, lessonItems, overviewsCache]);

  useEffect(() => {
    if (
      activeBlockId &&
      activeBlockId !== "overview" &&
      activeBlockId !== "quiz"
    ) {
      setLastActiveBlockId(activeBlockId);
    } else if (activeBlockId) {
      setLastActiveBlockId(activeBlockId);
    }
  }, [activeBlockId]);

  useEffect(() => {
    // Only run if we have a valid activeBlockId, and it's not a generic view or already cached
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
        setLoading(true);
        console.log("ACTIVE BLOCK ID:" + activeBlockId);
        console.log("LESSON ID:" + lessonId);
        // Fetch subtopics specific to this active block item
        const data: SubtopicItem[] = await fetchSubtopics(activeBlockId);
        console.log("DATA: a" + data);
        setSubtopicsCache((prev) => ({
          ...prev,
          [activeBlockId]: data,
        }));
      } catch (error) {
        console.error("Failed to fetch subtopics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonSubtopics();
  }, [activeBlockId, subtopicsCache]);

  // if (loading) {
  //   return (
  //     <div className="flex h-full items-center justify-center p-8">
  //       <Loader2 className="animate-spin text-primary" size={28} />
  //     </div>
  //   );
  // }

  const currentOverview = overviewsCache[lessonId];
  const currentSubtopic = subtopicsCache[activeBlockId || ""] ?? [];

  const isOverview = lastActiveBlockId === "overview";
  const isQuiz = lastActiveBlockId === "quiz";
  const isSubtopic =
    lastActiveBlockId &&
    lastActiveBlockId !== "overview" &&
    lastActiveBlockId !== "quiz";

  const showMiniQuiz = !!miniQuizStates[lastActiveBlockId];
  const knownBlockIds = Object.keys(subtopicsCache);
  return (
    <div className="flex flex-col min-h-full w-full justify-between p-6">
      {/* 1. Overview View */}
      <div className={`flex-1 w-full ${isOverview ? "" : "hidden"}`}>
        <TopicOverview overview={currentOverview} onContinue={onContinue} />
      </div>

      {/* 2. Subtopic View */}
      <div className={`flex-1 w-full space-y-6 ${isSubtopic ? "" : "hidden"}`}>
        <Subtopic subtopics={currentSubtopic} />

        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-10 border-t border-zinc-200">
          <div
            className={`text-center space-y-4 ${
              currentSubtopic && currentSubtopic.length > 0 && !showMiniQuiz
                ? ""
                : "hidden"
            }`}
          >
            <h3 className="text-xl font-semibold text-zinc-800">
              You&rsquo;ve reached the end of the lesson!
            </h3>
            <p className="text-zinc-600">
              Ready to test what you&rsquo;ve learned?
            </p>
            <button
              onClick={() =>
                lastActiveBlockId &&
                setMiniQuizStates((prev) => ({
                  ...prev,
                  [lastActiveBlockId]: true,
                }))
              }
              className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition"
            >
              Start Quiz
            </button>
          </div>

          {knownBlockIds.map((blockId) => {
            const isThisQuizActive =
              miniQuizStates[blockId] && lastActiveBlockId === blockId;
            return (
              <div key={blockId} className={isThisQuizActive ? "" : "hidden"}>
                <MiniQuiz lessonBlockId={blockId} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Quiz View (Stays mounted, retains state) */}
      <div className={`flex-1 w-full ${isQuiz ? "" : "hidden"}`}>
        <MainLessonQuiz lessonBlockId={lessonId} />
      </div>

      {/* Persistent Navigation Footer */}
      <div className="mt-6 flex justify-center shrink-0">
        <button
          onClick={handleNextSubRow}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
        >
          {isQuiz ? "Next Lesson" : "Next Step"}
        </button>
      </div>
    </div>
  );
}
