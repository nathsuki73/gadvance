"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import TopicOverview from "./Overview/TopicOverview";
import { ModuleStructureItem } from "../../service";
import { fetchOverview } from "./service";
import { Lesson } from "./Overview/types";

type LessonContainerProps = {
  lessonItems?: ModuleStructureItem[];
  lessonId: string;
  activeBlockId: string | undefined;
  onContinue: () => void;
};

export default function LessonContainer({
  lessonItems,
  lessonId,
  activeBlockId,
  onContinue,
}: LessonContainerProps) {
  // 2. State now uses the combined type
  const [overview, setOverview] = useState<ModuleStructureItem>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonOverview = async () => {
      try {
        setLoading(true);
        const fetchedLessons: Lesson[] = await fetchOverview(lessonId);

        // Grab the description from the first item returned (if it exists)
        const apiDescription = fetchedLessons[0]?.description || "";

        // 1. Find the specific lesson item that matches the active lessonId
        const currentLessonItem = lessonItems?.find(
          (item) => item.id === lessonId,
        );

        // 2. Combine the properties of that found item with the API description
        setOverview({
          ...currentLessonItem, // Spreads title, id, etc., from the matched item
          description: apiDescription,
        } as ModuleStructureItem);
      } catch (error) {
        console.error("Failed to fetch lesson overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonOverview();
  }, [lessonId, lessonItems]); // Don't forget to include these in the dependency array!

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  // 4. Checking against 'overview' instead of the undefined 'lesson'
  if (!overview) {
    return (
      <div className="p-8 text-zinc-500">Lesson data could not be found.</div>
    );
  }

  // --- Dynamic View Router Logic ---

  // 1. Show Overview Component
  if (activeBlockId === "overview" || !activeBlockId) {
    // 5. Transform your combined state into the shape expected by TopicOverview
    const formattedLesson = {
      title: overview.title,
      description: overview.description ?? "",
    };

    return (
      <div className="size-full">
        <TopicOverview lesson={formattedLesson} onContinue={onContinue} />{" "}
      </div>
    );
  }

  // 2. Show Lesson Unit Quiz
  if (activeBlockId === "quiz") {
    return <div>quiz</div>;
  }

  // 3. Custom Default
  return <div>lessssson</div>;
}
