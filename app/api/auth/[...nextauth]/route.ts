import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getJwtExpiration, shouldRefreshLaravelToken } from "../jwt-helpers";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;
const laravelAuthExchangeUrl =
  process.env.LARAVEL_AUTH_EXCHANGE_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/auth/google/exchange`
    : undefined);
const laravelAuthRefreshUrl =
  process.env.LARAVEL_AUTH_REFRESH_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/auth/refresh`
    : undefined);
const jwtSharedSecret = process.env.LARAVEL_SSO_SECRET?.trim();
const laravelApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

type SupportedStatus = "onboarding" | "active" | "suspended";

type LaravelAuthPayload = {
  token?: string;
  access_token?: string;
  status?: string;
  user_status?: string;
  email?: string;
  sessionToken?: string;
  session_token?: string;
  user?: Record<string, unknown>;
  user_profile?: Record<string, unknown>;
};

type LaravelIdentity = {
  token: string;
  status?: SupportedStatus;
  name?: string;
  email?: string;
  sessionToken?: string;
};

function pickFirstString(
  source: Record<string, unknown> | undefined,
  keys: string[],
) {
  if (!source) {
    return undefined;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function normalizeStatus(value: unknown): SupportedStatus | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (
    normalized === "onboarding" ||
    normalized === "active" ||
    normalized === "suspended"
  ) {
    return normalized;
  }

  return undefined;
}

function composeNameParts(parts: Array<string | null | undefined>) {
  const fullName = parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

  return fullName || undefined;
}

function buildResolvedName(
  sources: Array<Record<string, unknown> | undefined>,
) {
  const directName = sources
    .map((source) => pickFirstString(source, ["name", "full_name", "fullName"]))
    .find(Boolean);

  if (directName) {
    return directName;
  }

  const firstName = sources
    .map((source) => pickFirstString(source, ["first_name", "firstName"]))
    .find(Boolean);
  const middleName = sources
    .map((source) => pickFirstString(source, ["middle_name", "middleName"]))
    .find(Boolean);
  const lastName = sources
    .map((source) => pickFirstString(source, ["last_name", "lastName"]))
    .find(Boolean);

  return composeNameParts([firstName, middleName, lastName]);
}

function mapLaravelIdentityResponse(
  data: unknown,
  fallbackStatus?: SupportedStatus,
): Partial<LaravelIdentity> {
  if (!data || typeof data !== "object") {
    return {};
  }

  const payload = data as LaravelAuthPayload;
  const user = payload.user;
  const userProfile = payload.user_profile;
  const normalizedStatus =
    normalizeStatus(payload.status) ||
    normalizeStatus(payload.user_status) ||
    normalizeStatus(user?.status) ||
    normalizeStatus(userProfile?.status);

  return {
    token:
      typeof payload.token === "string"
        ? payload.token
        : typeof payload.access_token === "string"
          ? payload.access_token
          : undefined,
    status: normalizedStatus || fallbackStatus,
    name: buildResolvedName([userProfile, user]),
    email:
      typeof payload.email === "string"
        ? payload.email
        : typeof user?.email === "string"
          ? user.email
          : typeof userProfile?.email === "string"
            ? userProfile.email
            : undefined,
    sessionToken:
      typeof payload.sessionToken === "string"
        ? payload.sessionToken
        : typeof payload.session_token === "string"
          ? payload.session_token
          : undefined,
  };
}

async function completePasswordSignin(params: {
  email: string;
  password: string;
}): Promise<LaravelIdentity> {
  if (!laravelApiBaseUrl) {
    throw new Error("Missing API URL. Set NEXT_PUBLIC_API_URL.");
  }

  const endpoint = `${laravelApiBaseUrl.replace(/\/$/, "")}/api/auth/signin`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
    }),
  });

  let rawData: any = {};
  try {
    rawData = await response.json();
  } catch {
    rawData = {};
  }

  // 🛑 Capture Laravel errors (including 429 rate limit or 401 invalid credentials)
  if (!response.ok) {
    const errorMessage =
      rawData?.error || rawData?.message || "Invalid email or password.";
    throw new Error(errorMessage);
  }

  const mapped = mapLaravelIdentityResponse(rawData, "active");
  if (!mapped.token) {
    throw new Error("Authentication token was not generated.");
  }

  return {
    token: mapped.token,
    status: mapped.status,
    name: mapped.name,
    email: mapped.email,
    sessionToken: mapped.sessionToken,
  };
}

async function exchangeGoogleForLaravelToken(params: {
  email?: string | null;
  image?: string | null;
  googleId?: string;
  googleIdToken?: string;
}) {
  if (!laravelAuthExchangeUrl || !jwtSharedSecret) {
    throw new Error("Missing Laravel handshake configuration.");
  }

  const response = await fetch(laravelAuthExchangeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SSO-Secret": jwtSharedSecret,
    },
    body: JSON.stringify({
      provider: "google",
      email: params.email,
      image: params.image,
      google_id: params.googleId,
      google_id_token: params.googleIdToken,
    }),
  });

  let rawData: unknown = {};
  try {
    rawData = await response.json();
  } catch {
    rawData = {};
  }

  if (!response.ok) {
    const errorPayload = rawData as Record<string, unknown>;
    const errorMessage =
      typeof errorPayload.error === "string"
        ? errorPayload.error
        : typeof errorPayload.message === "string"
          ? errorPayload.message
          : "Authentication failed with the server.";

    throw new Error(errorMessage);
  }

  const data = mapLaravelIdentityResponse(rawData);
  if (!data?.token) {
    throw new Error("Laravel exchange response missing token field.");
  }

  return data;
}

async function refreshLaravelToken(laravelToken: string) {
  if (!laravelAuthRefreshUrl) {
    console.warn(
      "Missing Laravel refresh URL. Set LARAVEL_AUTH_REFRESH_URL or NEXT_PUBLIC_API_URL.",
    );
    return null;
  }

  try {
    const response = await fetch(laravelAuthRefreshUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${laravelToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    let rawData: unknown = {};

    try {
      rawData = await response.json();
    } catch {
      rawData = {};
    }

    if (!response.ok) {
      console.warn("Laravel JWT refresh failed.", {
        status: response.status,
        response: rawData,
      });

      return null;
    }

    const data = mapLaravelIdentityResponse(rawData);

    if (!data.token) {
      console.error(
        "Laravel JWT refresh response did not contain a new token.",
      );

      return null;
    }

    return data;
  } catch (error) {
    console.error("Laravel JWT refresh request error:", error);
    return null;
  }
}

async function completeSignupOtp(params: {
  email: string;
  otp: string;
  dateOfBirth?: string;
}) {
  if (!laravelApiBaseUrl) {
    console.warn("Missing API URL. Set NEXT_PUBLIC_API_URL.");
    return null;
  }

  const endpoint = `${laravelApiBaseUrl.replace(
    /\/$/,
    "",
  )}/api/auth/signup/complete`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      otp: params.otp,
      date_of_birth: params.dateOfBirth,
    }),
  });

  let rawData: unknown = {};

  try {
    rawData = await response.json();
  } catch {
    rawData = {};
  }

  const mapped = mapLaravelIdentityResponse(rawData, "onboarding");

  if (!response.ok || !mapped.token) {
    return null;
  }

  return {
    token: mapped.token,
    status: normalizeStatus(mapped.status) || "onboarding",
    name: mapped.name,
    email: mapped.email || params.email,
    sessionToken: mapped.sessionToken,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        password: { label: "Password", type: "password" },
        dateOfBirth: { label: "Birthday", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const otp = credentials?.otp?.trim();
        const password = credentials?.password;
        const dateOfBirth = credentials?.dateOfBirth;

        if (!email) {
          throw new Error("Email address is required.");
        }

        if (otp) {
          const completed = await completeSignupOtp({
            email,
            otp,
            dateOfBirth,
          });
          if (!completed) {
            throw new Error("Invalid verification code.");
          }

          const status = completed.status || "onboarding";

          return {
            id: email,
            email: completed.email || email,
            name: completed.name,
            status,
            laravelAuth: {
              token: completed.token,
              status,
              name: completed.name,
              email: completed.email || email,
              sessionToken: completed.sessionToken,
            },
          };
        }

        if (!password || password.length === 0) {
          throw new Error("Password is required.");
        }

        // 🚀 This will now safely bubble up Laravel errors (including 429 rate limits)
        const completed = await completePasswordSignin({ email, password });
        const status = completed.status || "active";

        return {
          id: email,
          email: completed.email || email,
          name: completed.name,
          status,
          laravelAuth: {
            token: completed.token,
            status,
            name: completed.name,
            email: completed.email || email,
            sessionToken: completed.sessionToken,
          },
        };
      },
    }),
    GoogleProvider({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret,
    }),
  ],
  secret: nextAuthSecret,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 14 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const authBridge = (
          user as typeof user & {
            laravelAuth?: Partial<LaravelIdentity>;
          }
        ).laravelAuth as Partial<LaravelIdentity> | undefined;

        if (authBridge?.token) {
          const normalizedStatus = normalizeStatus(authBridge.status);
          token.laravelJwt = authBridge.token;
          token.status = normalizedStatus || "onboarding";
          token.email = authBridge.email || token.email;
          token.sessionToken = authBridge.sessionToken;
          token.name = authBridge.name || token.name;
        }

        if (typeof user.name === "string" && user.name.trim().length > 0) {
          token.name = user.name;
        }

        delete token.laravelJwtError;
        return token;
      }

      if (trigger === "update") {
        const sessionUser = session?.user;

        if (sessionUser?.status) {
          token.status = normalizeStatus(sessionUser.status) || token.status;
        }

        if (sessionUser?.email) {
          token.email = sessionUser.email;
        }

        if (sessionUser?.name) {
          token.name = sessionUser.name;
        }

        if (session?.sessionToken) {
          token.sessionToken = session.sessionToken;
        }

        if (session?.user?.laravelJwt) {
          token.laravelJwt = session.user.laravelJwt;
        }
      }

      if (typeof token.laravelJwt === "string") {
        if (shouldRefreshLaravelToken(token.laravelJwt)) {
          const refreshed = await refreshLaravelToken(token.laravelJwt);

          if (refreshed?.token) {
            token.laravelJwt = refreshed.token;
            delete token.laravelJwtError;
          } else {
            token.laravelJwtError = "RefreshAccessTokenError";
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.status = token.status;
        session.user.name = token.name;
        if (token.email) {
          session.user.email = token.email;
        }
      }

      session.laravelJwt = token.laravelJwt;
      session.sessionToken = token.sessionToken;
      session.error = token.laravelJwtError;

      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const exchanged = await exchangeGoogleForLaravelToken({
            email: user.email,
            image: user.image,
            googleId: account.providerAccountId,
            googleIdToken: account.id_token,
          });

          if (!exchanged?.token) {
            return `/auth/error?error=AccessDenied&message=${encodeURIComponent("Authentication token was not generated.")}`;
          }

          const mutableUser = user as typeof user & {
            laravelAuth?: {
              token: string;
              status?: SupportedStatus;
              name?: string;
              email?: string;
              sessionToken?: string;
            };
          };

          mutableUser.laravelAuth = {
            token: exchanged.token,
            status: normalizeStatus(exchanged.status),
            name: exchanged.name || user.name || undefined,
            email: exchanged.email || user.email || undefined,
            sessionToken: exchanged.sessionToken,
          };

          return true;
        } catch (error: any) {
          const message = encodeURIComponent(
            error.message || "Authentication failed.",
          );
          return `/auth/error?error=AccessDenied&message=${message}`;
        }
      }

      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
