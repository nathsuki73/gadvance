"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/**
 * Shared helper to securely inject the logged-in user's JWT bearer token
 * into headers without code duplication.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (session?.laravelJwt) {
    headers["Authorization"] = `Bearer ${session.laravelJwt}`;
  }

  return headers;
}

export async function fetchLiveKCMastery(
  lessonId: string,
): Promise<Record<string, number>> {
  const authHeaders = await getAuthHeaders(); // Reuse your existing authorization token builder

  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonId}/live-mastery`,
    {
      method: "GET",
      headers: authHeaders,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error(
      "live-mastery fetch failed:",
      response.status,
      await response.text(),
    );
    return {};
  }
  const json = await response.json();
  return json.data ?? {}; // Expected structure format: { "block-uuid-1": 0.89, "block-uuid-2": 0.42 }
}
