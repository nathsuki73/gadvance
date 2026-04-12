"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

type onboardingParams = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export async function finishOnBoarding(data: onboardingParams) {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return { success: false, error: "Unauthorized" };
  }

  const res = await fetch(`${process.env.API_URL}/api/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.laravelJwt}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}
