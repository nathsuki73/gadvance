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

export async function verifyOTP(email: string, userSubmittedOtp: string) {
  try {
    // 1. Fetch the stored OTP from Redis
    const storedOtp = await redis.get(`otp:${email}`);

    // 2. Check if the OTP exists (it might be null if 5 mins passed)
    if (!storedOtp) {
      return {
        success: false,
        error: "OTP has expired. Please request a new one.",
      };
    }

    // 3. Compare the stored OTP with the one from the user
    if (String(storedOtp).trim() === String(userSubmittedOtp).trim()) {
      // SUCCESS: Clear the OTP from Redis so it can't be reused
      await redis.del(`otp:${email}`);

      // Here you would usually create a session/JWT or update the DB
      return { success: true };
    } else {
      return {
        success: false,
        error: "Invalid code. Please check your email and try again.",
      };
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "An error occurred during verification." };
  }
}
