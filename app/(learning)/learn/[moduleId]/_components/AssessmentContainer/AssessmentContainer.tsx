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

  // 🚀 TanStack Query handles caching and prevents duplicate requests on StrictMode / re-mounts
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
    staleTime: 1000 * 60 * 5, // Cache result for 5 minutes
    refetchOnWindowFocus: false,
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

  // Auto-skip start screen if the user already completed or has an ongoing state
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

  // Route cleanly to isolated folders once started, passing the correct sectionItemId
  return isPoll ? (
    <PollView
      pollData={contentData}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
    />
  ) : (
    <AssessmentView
      assessmentData={contentData}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
      isLastItem={isLastItem}
      onComplete={onComplete}
      onNext={onNext}
      onExit={onExit}
    />
  );
}
