"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuizTelemetry } from "../_actions/quiz"; // Import the Server Action

type TelemetryPayload = {
  backendBlockId: string;
  isCorrect: boolean;
  currentIndex: number;
  totalItems: number;
};

export const useQuizTelemetry = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const trackAnswer = async ({
    backendBlockId,
    isCorrect,
    currentIndex,
    totalItems,
  }: TelemetryPayload) => {
    setIsSyncing(true);
    setError(null);

    // Call our server action instead of hitting a raw fetch in the browser
    const result = await submitQuizTelemetry({
      backendBlockId,
      isCorrect,
      currentIndex,
      totalItems,
    });

    if (!result.success) {
      setError(result.error || "An error occurred");
      console.error("Telemetry Sync Error:", result.error);
      setIsSyncing(false);
      return { success: false, error: result.error };
    }

    // Unlocks the parent navigation button instantly if this is the final question
    if (currentIndex === totalItems) {
      router.refresh();
    }

    setIsSyncing(false);
    return { success: true, data: result.data };
  };

  return { trackAnswer, isSyncing, error };
};
