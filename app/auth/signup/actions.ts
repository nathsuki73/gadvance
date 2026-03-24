"use server";

import { redis } from "@/app/lib/redis";
import { generateOTP } from "@/app/lib/utils";
import { sendOTPEmail } from "@/app/lib/mail";

const OTP_MAX_ATTEMPTS = 5;
const OTP_BLOCK_SECONDS = 300;

type VerifyOtpResult =
  | { success: true }
  | {
      success: false;
      error: string;
      attemptsLeft?: number;
      blockSecondsRemaining?: number;
    };

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

export async function verifyOTP(
  email: string,
  userSubmittedOtp: string,
): Promise<VerifyOtpResult> {
  try {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp:attempts:${email}`;
    const blockKey = `otp:blocked:${email}`;

    const isBlocked = await redis.get<string>(blockKey);
    if (isBlocked) {
      const ttl = await redis.ttl(blockKey);
      const secondsLeft = ttl > 0 ? ttl : OTP_BLOCK_SECONDS;
      const minutesLeft = Math.ceil(secondsLeft / 60);

      return {
        success: false,
        error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        blockSecondsRemaining: secondsLeft,
      };
    }

    // 1. Fetch the stored OTP from Redis
    const storedOtp = await redis.get(otpKey);

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
      await redis.del(otpKey);
      await redis.del(attemptsKey);
      await redis.del(blockKey);

      // Here you would usually create a session/JWT or update the DB
      return { success: true };
    } else {
      const failedAttempts = await redis.incr(attemptsKey);

      if (failedAttempts === 1) {
        await redis.expire(attemptsKey, OTP_BLOCK_SECONDS);
      }

      if (failedAttempts >= OTP_MAX_ATTEMPTS) {
        await redis.set(blockKey, "1", { ex: OTP_BLOCK_SECONDS });
        await redis.del(attemptsKey);

        return {
          success: false,
          error: "Too many failed attempts. You are blocked for 5 minutes.",
          attemptsLeft: 0,
          blockSecondsRemaining: OTP_BLOCK_SECONDS,
        };
      }

      const attemptsLeft = OTP_MAX_ATTEMPTS - failedAttempts;

      return {
        success: false,
        error: `Invalid code. ${attemptsLeft} attempt(s) left.`,
        attemptsLeft,
      };
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "An error occurred during verification." };
  }
}
