"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

type onboardingParams = {
  firstName: string;
  middleName?: string;
  lastName: string;
  avatar?: string | null;
  icon?: string | null;
};

type OnboardingResponse = {
  message?: string;
  user?: {
    id?: number;
    status?: "onboarding" | "active" | "suspended";
    name?: string;
    email?: string;
  };
  user_profile?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
  } | null;
};

export async function finishOnBoarding(data: onboardingParams) {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return { success: false, error: "Unauthorized" };
  }

  const apiBaseUrl =
    // process.env.API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiBaseUrl) {
    return {
      success: false,
      error: "Missing API URL. Set API_URL or NEXT_PUBLIC_API_URL.",
    };
  }

  const res = await fetch(`${apiBaseUrl}/api/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.laravelJwt}`,
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = (await res.json()) as OnboardingResponse;

  if (!res.ok) {
    return { success: false, error: result.message || "Server Error" };
  }

  return {
    success: true,
    user: result.user,
    userProfile: result.user_profile,
  };
}
