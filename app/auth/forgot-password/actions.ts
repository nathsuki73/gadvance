"use server";

type ForgotPasswordOtpResult =
  | { success: true; message?: string }
  | { success: false; error: string; statusCode?: number; debug?: string };

type VerifyForgotPasswordOtpResult =
  | {
      success: true;
      message?: string;
      resetToken?: string | null;
      resetTokenExpiresInSeconds?: number | null;
    }
  | {
      success: false;
      error: string;
      attemptsLeft?: number;
      blockSecondsRemaining?: number;
      statusCode?: number;
      debug?: string;
    };

type ChangePasswordResult =
  | { success: true; message?: string }
  | {
      success: false;
      error: string;
      statusCode?: number;
      debug?: string;
    };

const apiBaseUrl =
  process.env.API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getRequiredApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("Missing API URL. Set API_URL or NEXT_PUBLIC_API_URL.");
  }

  return apiBaseUrl;
}

export async function sendForgotPasswordOtp(
  email: string,
): Promise<ForgotPasswordOtpResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/password/change/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
      }),
      cache: "no-store",
    });

    type ForgotPasswordOtpPayload = {
      success?: boolean;
      error?: string;
      message?: string;
      debug?: string;
      errors?: Record<string, string[] | undefined>;
    };

    let payload: ForgotPasswordOtpPayload = {};
    try {
      payload = (await response.json()) as ForgotPasswordOtpPayload;
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
          "Failed to send password reset OTP.",
        statusCode: response.status,
        debug: payload.debug,
      };
    }

    return {
      success: true,
      message: payload.message || "Password reset OTP sent successfully.",
    };
  } catch (error) {
    console.error("Forgot Password OTP Error:", error);

    return {
      success: false,
      error: "Failed to send password reset OTP. Please try again.",
      debug: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string,
): Promise<VerifyForgotPasswordOtpResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/auth/password/change/otp/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
        cache: "no-store",
      },
    );

    type VerifyForgotPasswordOtpPayload = {
      success?: boolean;
      error?: string;
      message?: string;
      debug?: string;
      statusCode?: number;
      attemptsLeft?: number;
      blockSecondsRemaining?: number;
      reset_token?: string | null;
      reset_token_expires_in_seconds?: number | null;
      errors?: Record<string, string[] | undefined>;
    };

    let payload: VerifyForgotPasswordOtpPayload = {};
    try {
      payload = (await response.json()) as VerifyForgotPasswordOtpPayload;
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
          "Invalid OTP. Please try again.",
        attemptsLeft: payload.attemptsLeft,
        blockSecondsRemaining: payload.blockSecondsRemaining,
        statusCode: response.status,
        debug: payload.debug,
      };
    }

    return {
      success: true,
      message: payload.message || "Password reset OTP verified successfully.",
      resetToken: payload.reset_token ?? null,
      resetTokenExpiresInSeconds:
        payload.reset_token_expires_in_seconds ?? null,
    };
  } catch (error) {
    console.error("Forgot Password OTP Verify Error:", error);

    return {
      success: false,
      error: "Failed to verify password reset OTP. Please try again.",
      debug: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function changeForgotPassword(
  email: string,
  resetToken: string,
  password: string,
  passwordConfirmation: string,
): Promise<ChangePasswordResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/password/change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      }),
      cache: "no-store",
    });

    type ChangePasswordPayload = {
      success?: boolean;
      error?: string;
      message?: string;
      debug?: string;
      errors?: Record<string, string[] | undefined>;
    };

    let payload: ChangePasswordPayload = {};
    try {
      payload = (await response.json()) as ChangePasswordPayload;
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
          "Failed to change password.",
        statusCode: response.status,
        debug: payload.debug,
      };
    }

    return {
      success: true,
      message: payload.message || "Password changed successfully.",
    };
  } catch (error) {
    console.error("Forgot Password Change Error:", error);

    return {
      success: false,
      error: "Failed to change password. Please try again.",
      debug: error instanceof Error ? error.message : String(error),
    };
  }
}
