"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAssessmentViewData,
  retakeAssessment,
} from "./Assessment/assessmentService";
import { getPollViewData } from "./Poll/pollService";
import AssessmentView from "./Assessment/AssessmentView";
import PollView from "./Poll/PollView";
import { StartScreen } from "./StartScreen";
import { Loader2 } from "lucide-react";
import { useAssessmentActions } from "../../_hooks/useAssessmentActions";

interface AssessmentContainerProps {
  assessmentId: string;
  sectionItemId?: string;
  itemId?: string;
  moduleId?: string;
  sectionId?: string;
  type?: string;
  isLastItem?: boolean;
  onComplete?: () => void;
  onNext?: () => void;
  onExit?: () => void;
  onNavigate?: (targetId: string, blockId: string) => void;
  onQuestionActiveChange?: (isActive: boolean) => void;
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
  onQuestionActiveChange,
}: AssessmentContainerProps) {
  const queryClient = useQueryClient();
  const effectiveSectionItemId = sectionItemId || itemId;
  const [hasStarted, setHasStarted] = useState<boolean | null>(null);

  const { handleRetake } = useAssessmentActions();

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
      } catch (err) {
        const pollData = await getPollViewData(
          assessmentId,
          effectiveSectionItemId,
          moduleId,
        );
        return { data: pollData, isPoll: true };
      }
    },
    enabled: Boolean(assessmentId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

  const isCompleted = Boolean(
    contentData.user_has_completed || contentData.previous_attempt,
  );

  const hasLocalDraft =
    typeof window !== "undefined" &&
    effectiveSectionItemId &&
    Boolean(
      localStorage.getItem(
        `assessment_local_draft_${assessmentId}_${effectiveSectionItemId}`,
      ),
    );

  const hasServerDraft =
    contentData.draft_answers &&
    Object.keys(contentData.draft_answers).length > 0;

  const hasStartedState =
    hasStarted === true || isCompleted || hasLocalDraft || hasServerDraft;

  const showStartScreen = !isPoll && !hasStartedState;

  if (showStartScreen) {
    return (
      <StartScreen
        title={contentData.title}
        instructions={contentData.instructions}
        totalItems={contentData.questions?.length || 0}
        buttonText={"Start Assessment"}
        onStart={() => setHasStarted(true)}
      />
    );
  }

  return isPoll ? (
    <PollView
      pollData={contentData}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
      isLastItem={isLastItem}
      onComplete={onComplete}
      onNext={onNext}
      onExit={onExit}
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
      onQuestionActiveChange={onQuestionActiveChange}
      onRetake={async () => {
        if (!effectiveSectionItemId) return;

        const res = await handleRetake(
          contentData.id,
          effectiveSectionItemId,
          moduleId,
        );

        if (res.success) {
          await queryClient.invalidateQueries({
            queryKey: [
              "assessmentContainer",
              assessmentId,
              effectiveSectionItemId,
              moduleId,
            ],
          });
          setHasStarted(false);
        }
      }}
    />
  );
}
