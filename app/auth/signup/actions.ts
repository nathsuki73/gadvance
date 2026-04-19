"use server";

type VerifyOtpResult =
  | {
      success: true;
      token?: string | null;
      user?: unknown;
      user_profile?: unknown;
      message?: string;
    }
  | {
      success: false;
      error: string;
      attemptsLeft?: number;
      blockSecondsRemaining?: number;
    };

type RegistrationResult =
  | { success: true; message?: string }
  | { success: false; error: string; statusCode?: number; debug?: string };

const apiBaseUrl =
  process.env.API_URL?.replace(/\/$/, "");

function getRequiredApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("Missing API URL. Set API_URL.");
  }

  return apiBaseUrl;
}

export async function handleRegistration(
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<RegistrationResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
      cache: "no-store",
    });

    type RegistrationPayload = {
      success?: boolean;
      error?: string;
      message?: string;
      debug?: string;
      errors?: Record<string, string[] | undefined>;
    };

    let payload: RegistrationPayload = {};
    try {
      payload = (await response.json()) as RegistrationPayload;
    } catch {
      payload = {};
    }

    if (!response.ok || payload.success === false) {
      const firstValidationError = payload.errors
        ? Object.values(payload.errors).find(
            (messages): messages is string[] =>
              Array.isArray(messages) && messages.length > 0,
          )?.[0]
        : undefined;

      return {
        success: false,
        error:
          firstValidationError ||
          payload.error ||
          payload.message ||
          "Failed to send OTP.",
        statusCode: response.status,
        debug: payload.debug,
      };
    }

    return { success: true, message: payload.message };
  } catch (error) {
    console.error("Registration Error:", error);
    return {
      success: false,
      error: "Failed to process registration. Please try again.",
      debug: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function verifyOTP(
  email: string,
  userSubmittedOtp: string,
): Promise<VerifyOtpResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/signup/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        otp: userSubmittedOtp,
      }),
      cache: "no-store",
    });

    const result = (await response.json()) as {
      success?: boolean;
      error?: string;
      message?: string;
      token?: string | null;
      user?: unknown;
      user_profile?: unknown;
      attemptsLeft?: number;
      blockSecondsRemaining?: number;
    };

    if (response.ok && result.success) {
      return {
        success: true,
        token: result.token,
        user: result.user,
        user_profile: result.user_profile,
        message: result.message,
      };
    }

    return {
      success: false,
      error: result.error || result.message || "OTP verification failed.",
      attemptsLeft: result.attemptsLeft,
      blockSecondsRemaining: result.blockSecondsRemaining,
    };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "An error occurred during verification." };
  }
}
