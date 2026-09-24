"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAssessmentViewData } from "./Assessment/assessmentService";
import { getPollViewData } from "./Poll/pollService";
import AssessmentView from "./Assessment/AssessmentView";
import PollView from "./Poll/PollView";
import { StartScreen } from "./StartScreen";
import { Loader2 } from "lucide-react";

interface AssessmentContainerProps {
  assessmentId: string;
  sectionItemId?: string;
  itemId?: string; // 👈 Support itemId passed from LearnPage
  moduleId?: string;
  sectionId?: string;
  type?: string;
  isLastItem?: boolean;
  onComplete?: () => void;
  onNext?: () => void;
  onExit?: () => void;
  onNavigate?: (targetId: string, blockId: string) => void;
}

export default function AssessmentContainer({
  assessmentId,
  sectionItemId,
  itemId,
  moduleId,
  isLastItem,
  onComplete,
  onNext,
  onExit,
}: AssessmentContainerProps) {
  // 🛡️ Automatically resolve whichever prop name was provided
  const effectiveSectionItemId = sectionItemId || itemId;
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // 🚀 TanStack Query configuration for state preservation across sidebar navigation
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "assessmentContainer",
      assessmentId,
      effectiveSectionItemId,
      moduleId,
    ],
    queryFn: async () => {
      try {
        const assessmentData = await getAssessmentViewData(
          assessmentId,
          effectiveSectionItemId,
          moduleId,
        );
        if (assessmentData.type === "poll") {
          const pollData = await getPollViewData(
            assessmentId,
            effectiveSectionItemId,
            moduleId,
          );
          return { data: pollData, isPoll: true };
        }
        return { data: assessmentData, isPoll: false };
      } catch (err: any) {
        // Fallback check if it's strictly exposed under polls API route
        const pollData = await getPollViewData(
          assessmentId,
          effectiveSectionItemId,
          moduleId,
        );
        return { data: pollData, isPoll: true };
      }
    },
    enabled: Boolean(assessmentId),
    staleTime: 1000 * 60 * 10, // ⏱️ Keep data fresh in memory for 10 minutes
    gcTime: 1000 * 60 * 30, // 🗑️ Retain unused cache data for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 🛑 Prevents refetching when switching back and forth via sidebar
  });

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-3 text-[#8b5cf6]">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">
            Loading module content...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {(error as any)?.message || "Failed to load content."}
      </div>
    );
  }

  const { data: contentData, isPoll } = data;

  // Auto-skip start screen if the user already completed or has a previous attempt saved in cache
  const shouldAutoStart =
    !isPoll && (contentData.user_has_completed || contentData.previous_attempt);

  // Show generic Start Screen if not yet started
  if (!hasStarted && !shouldAutoStart) {
    return (
      <StartScreen
        title={contentData.title}
        instructions={contentData.instructions}
        totalItems={contentData.questions?.length || 0}
        buttonText={isPoll ? "Start Poll" : "Start Assessment"}
        onStart={() => setHasStarted(true)}
      />
    );
  }

  // Route cleanly to isolated components, preserving their respective cache context
  return isPoll ? (
    <PollView
      pollData={contentData}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
    />
  ) : (
    <AssessmentView
      assessmentData={contentData}
      assessmentId={assessmentId}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
      isLastItem={isLastItem}
      onComplete={onComplete}
      onNext={onNext}
      onExit={onExit}
    />
  );
}
