"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import TopicOverview from "./Overview/TopicOverview";
import { ModuleStructureItem } from "../../service";
import { fetchOverview, fetchSubtopics } from "./service";
import { Lesson } from "./Overview/types";
import Subtopic, { SubtopicItem } from "./SubTopic/Subtopic";

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  // Get current data from cache
  const currentOverview = overviewsCache[lessonId];
  if (!activeBlockId) return;
  const currentSubtopic = subtopicsCache[activeBlockId];
  console.log("");

  if (activeBlockId === "overview" || !activeBlockId) {
    return (
      <div className="flex flex-col min-h-full w-full justify-between p-6">
        <div className="flex-1 w-full">
          <TopicOverview
            overview={currentOverview} // Pass the cached data down
            onContinue={onContinue}
          />
        </div>

        <div className="mt-6 flex justify-center shrink-0">
          <button
            onClick={handleNextSubRow}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
          >
            {activeBlockId === "quiz" ? "Next Lesson" : "Next Step"}
          </button>
        </div>
      </div>
    );
  }

  // 2. Show Lesson Unit Quiz
  if (activeBlockId === "quiz") {
    return (
      <div className="flex flex-col min-h-full w-full justify-between p-6">
        <div className="flex-1 w-full">quiz</div>

        <div className="mt-6 flex justify-center shrink-0">
          <button
            onClick={handleNextSubRow}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
          >
            Next Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full w-full justify-between p-6">
      <div className="flex-1 w-full">
        <Subtopic subtopics={currentSubtopic} />
      </div>

      <div className="mt-6 flex justify-center shrink-0">
        <button
          onClick={handleNextSubRow}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
        >
          {activeBlockId === "quiz" ? "Next Lesson" : "Next Step"}
        </button>
      </div>
    </div>
  );
}
