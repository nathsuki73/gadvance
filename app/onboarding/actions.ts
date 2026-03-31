"use server";

import pool from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function submitOnboardingToLaravel(data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  token: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/profile/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    // This catches Laravel validation errors (422) or server errors (500)
    throw new Error(result.message || "Failed to save profile");
  }

  return result;
}
