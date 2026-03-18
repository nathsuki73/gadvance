"use server";

import { redis } from "@/app/lib/redis";
import { generateOTP } from "@/app/lib/utils";
import { sendOTPEmail } from "@/app/lib/mail";

export async function handleRegistration(email: string) {
  try {
    // 1. Generate a secure 6-digit OTP
    const otp = generateOTP();

    // 2. Store in Upstash Redis (Key: otp:email | Expiry: 300s / 5m)
    await redis.set(`otp:${email}`, otp, { ex: 300 });

    // 3. Trigger the Mail Service
    // This will print the OTP in your VS Code terminal for now
    await sendOTPEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return {
      success: false,
      error: "Failed to process registration. Please try again.",
    };
  }
}
