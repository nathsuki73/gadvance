import React, { useEffect, useState } from "react";
import { getAssessmentViewData } from "./Assessment/assessmentService";
import { getPollViewData } from "./Poll/pollService";
import AssessmentView from "./Assessment/AssessmentView";
import PollView from "./Poll/PollView";
import { StartScreen } from "./StartScreen";

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

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isPoll, setIsPoll] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        setError(null);

        // Try loading as standard assessment first to inspect mode/type
        try {
          const assessmentData = await getAssessmentViewData(
            assessmentId,
            effectiveSectionItemId,
            moduleId,
          );
          if (assessmentData.type === "poll") {
            setIsPoll(true);
            const pollData = await getPollViewData(
              assessmentId,
              effectiveSectionItemId,
              moduleId,
            );
            setData(pollData);
          } else {
            setIsPoll(false);
            setData(assessmentData);

            // Auto-skip start screen if the user already completed or has an ongoing state
            if (
              assessmentData.user_has_completed ||
              assessmentData.previous_attempt
            ) {
              setHasStarted(true);
            }
          }
        } catch (err: any) {
          // Fallback check if it's strictly exposed under polls API route
          const pollData = await getPollViewData(
            assessmentId,
            effectiveSectionItemId,
            moduleId,
          );
          setIsPoll(true);
          setData(pollData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) {
      loadContent();
    }
  }, [assessmentId, effectiveSectionItemId, moduleId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading module content...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">No content available.</div>
    );
  }

  // Show generic Start Screen if not yet started
  if (!hasStarted) {
    return (
      <StartScreen
        title={data.title}
        instructions={data.instructions}
        totalItems={data.questions?.length || 0}
        buttonText={isPoll ? "Start Poll" : "Start Assessment"}
        onStart={() => setHasStarted(true)}
      />
    );
  }

  // Route cleanly to isolated folders once started, passing the correct sectionItemId
  return isPoll ? (
    <PollView
      pollData={data}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
    />
  ) : (
    <AssessmentView
      assessmentData={data}
      sectionItemId={effectiveSectionItemId}
      moduleId={moduleId}
      isLastItem={isLastItem}
      onComplete={onComplete}
      onNext={onNext}
      onExit={onExit}
    />
  );
}
