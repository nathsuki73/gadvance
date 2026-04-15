"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

type onboardingParams = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export async function finishOnBoarding(data: any) {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return { success: false, error: "Unauthorized" };
  }

  const res = await fetch(`${process.env.API_URL}/api/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.laravelJwt}`,
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    return { success: false, error: result.error || "Server Error" };
  }

  return { success: true, user: result.user };
}
