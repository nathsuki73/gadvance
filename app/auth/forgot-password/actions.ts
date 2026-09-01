const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getRequiredApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("Missing API URL. Set NEXT_PUBLIC_API_URL.");
  }

  return apiBaseUrl;
}

type ForgotPasswordLinkResult =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      error: string;
      statusCode?: number;
      debug?: string;
    };

type ChangePasswordResult =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      error: string;
      statusCode?: number;
      debug?: string;
    };

/**
 * Request a password reset email.
 *
 * The backend should always return a generic response
 * to prevent email enumeration.
 */
export async function sendForgotPasswordLink(
  email: string,
): Promise<ForgotPasswordLinkResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();

    const response = await fetch(`${baseUrl}/api/auth/password/forgot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
      cache: "no-store",
    });

    type ForgotPasswordPayload = {
      success?: boolean;
      message?: string;
      error?: string;
      debug?: string;
    };

    let payload: ForgotPasswordPayload = {};

    try {
      payload = (await response.json()) as ForgotPasswordPayload;
    } catch {
      payload = {};
    }

    if (!response.ok || payload.success === false) {
      return {
        success: false,
        error:
          payload.error ||
          payload.message ||
          "Failed to send password reset link.",
        statusCode: response.status,
        debug: payload.debug,
      };
    }

    return {
      success: true,
      message:
        payload.message ||
        "If an account exists for this email, a password reset link has been sent.",
    };
  } catch (error) {
    console.error("Forgot Password Link Error:", error);

    return {
      success: false,
      error: "Failed to send password reset link. Please try again.",
      debug: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Change the user's password using the reset token
 * received from the password reset email.
 */
export async function changeForgotPassword(
  resetId: string,
  token: string,
  password: string,
  passwordConfirmation: string,
): Promise<ChangePasswordResult> {
  try {
    const baseUrl = getRequiredApiBaseUrl();

    const response = await fetch(`${baseUrl}/api/auth/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        reset_id: resetId,
        token: token,
        password,
        password_confirmation: passwordConfirmation,
      }),
      cache: "no-store",
    });

    type ChangePasswordPayload = {
      success?: boolean;
      message?: string;
      error?: string;
      debug?: string;
    };

    let payload: ChangePasswordPayload = {};

    try {
      payload = (await response.json()) as ChangePasswordPayload;
    } catch {
      payload = {};
    }

    if (!response.ok || payload.success === false) {
      return {
        success: false,
        error: payload.error || payload.message || "Failed to change password.",
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
