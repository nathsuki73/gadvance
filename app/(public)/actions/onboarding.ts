"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

type onboardingParams = {
  firstName: string;
  middleName?: string;
  lastName: string;
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

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboarding`, {
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
