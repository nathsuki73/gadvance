"use server";

type RegistrationResult =
  | { success: true; message?: string }
  | { success: false; error: string; statusCode?: number; debug?: string };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

function getRequiredApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("Missing API URL. Set NEXT_PUBLIC_API_URL.");
  }

  return apiBaseUrl;
}

export async function handleRegistration(
  email: string,
  password: string,
  passwordConfirmation: string,
  birthday?: string,
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
        birthday: birthday || null,
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
    console.error("FULL Registration Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.stack || error.message
          : JSON.stringify(error),
    };
  }
}
