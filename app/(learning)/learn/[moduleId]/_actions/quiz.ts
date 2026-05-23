"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

type TrackAnswerParams = {
  backendBlockId: string;
  isCorrect: boolean;
  currentIndex: number;
  totalItems: number;
};

export const submitQuizTelemetry = async ({
  backendBlockId,
  isCorrect,
  currentIndex,
  totalItems,
}: TrackAnswerParams) => {
  const session = await getServerSession(authOptions);

  // 1. Defend the endpoint on the server side
  if (!session?.laravelJwt) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 2. Safe server-to-server POST request straight to your Laravel port / URL
    const response = await fetch(
      `${API_BASE_URL}/learn/blocks/${backendBlockId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.laravelJwt}`,
        },
        body: JSON.stringify({
          interaction_type: "pretest",
          score: isCorrect ? 1.0 : 0.0,
          attempts_count: 1,
          current_index: currentIndex,
          total_items: totalItems,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed syncing answer progress.",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Telemetry server action error:", error);
    return { success: false, error: "Network error encountered on server." };
  }
};
