import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;
const laravelAuthExchangeUrl =
  process.env.LARAVEL_AUTH_EXCHANGE_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/auth/google/exchange`
    : undefined);
const laravelAuthRefreshUrl = process.env.LARAVEL_AUTH_REFRESH_URL;
const jwtSharedSecret = process.env.LARAVEL_SSO_SECRET?.trim();
const laravelApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

type SupportedStatus = "onboarding" | "active" | "suspended";

type UserProfilePayload = {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  avatar?: string | null;
};

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
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  userProfile?: UserProfilePayload;
};

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

function buildProfileName(userProfile: Record<string, unknown> | undefined) {
  if (!userProfile) {
    return undefined;
  }

  const firstName =
    typeof userProfile.first_name === "string"
      ? userProfile.first_name.trim()
      : "";
  const middleName =
    typeof userProfile.middle_name === "string"
      ? userProfile.middle_name.trim()
      : "";
  const lastName =
    typeof userProfile.last_name === "string"
      ? userProfile.last_name.trim()
      : "";

  return composeNameParts([firstName, middleName, lastName]);
}

function mapUserProfile(
  userProfile: Record<string, unknown> | undefined,
): UserProfilePayload | undefined {
  if (!userProfile) {
    return undefined;
  }

  return {
    first_name:
      typeof userProfile.first_name === "string"
        ? userProfile.first_name
        : null,
    middle_name:
      typeof userProfile.middle_name === "string"
        ? userProfile.middle_name
        : null,
    last_name:
      typeof userProfile.last_name === "string" ? userProfile.last_name : null,
    city: typeof userProfile.city === "string" ? userProfile.city : null,
    state: typeof userProfile.state === "string" ? userProfile.state : null,
    country: typeof userProfile.country === "string" ? userProfile.country : null,
    avatar:
      typeof userProfile.avatar === "string" ? userProfile.avatar : null,
  };
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
    name: buildProfileName(userProfile),
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
    firstName:
      typeof userProfile?.first_name === "string"
        ? userProfile.first_name
        : undefined,
    middleName:
      typeof userProfile?.middle_name === "string"
        ? userProfile.middle_name
        : null,
    lastName:
      typeof userProfile?.last_name === "string"
        ? userProfile.last_name
        : undefined,
    userProfile: mapUserProfile(userProfile),
  };
}

async function completePasswordSignin(params: {
  email: string;
  password: string;
}): Promise<LaravelIdentity | null> {
  if (!laravelApiBaseUrl) {
    console.warn("Missing API URL. Set NEXT_PUBLIC_API_URL.");
    return null;
  }

  const endpoint = `${laravelApiBaseUrl.replace(/\/$/, "")}/api/auth/signin`;

  try {
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

    let rawData: unknown = {};
    try {
      rawData = await response.json();
    } catch {
      rawData = {};
    }

    const mapped = mapLaravelIdentityResponse(rawData, "active");
    if (!response.ok || !mapped.token) {
      const message =
        rawData && typeof rawData === "object"
          ? ((rawData as Record<string, unknown>).error ??
            (rawData as Record<string, unknown>).message)
          : undefined;

      console.warn("Laravel password sign-in failed", {
        endpoint,
        status: response.status,
        message: typeof message === "string" ? message : undefined,
      });
      return null;
    }

    return {
      token: mapped.token,
      status: mapped.status,
      name: mapped.name,
      email: mapped.email,
      sessionToken: mapped.sessionToken,
      firstName: mapped.firstName,
      middleName: mapped.middleName,
      lastName: mapped.lastName,
      userProfile: mapped.userProfile,
    };
  } catch (error) {
    console.error("Password sign-in request error:", error);
    return null;
  }
}

async function exchangeGoogleForLaravelToken(params: {
  email?: string | null;
  image?: string | null;
  googleId?: string;
  googleIdToken?: string;
}) {
  if (!laravelAuthExchangeUrl || !jwtSharedSecret) {
    console.warn(
      "Missing Laravel handshake config. Set LARAVEL_AUTH_EXCHANGE_URL and LARAVEL_SSO_SECRET.",
    );
    return null;
  }

  try {
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

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Laravel exchange failed (${response.status}) at ${laravelAuthExchangeUrl}: ${text || "empty response"}`,
      );
      return null;
    }

    let rawData: unknown = {};
    try {
      rawData = await response.json();
    } catch {
      rawData = {};
    }

    const data = mapLaravelIdentityResponse(rawData);
    if (!data?.token) {
      console.error("Laravel exchange response missing token field");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Laravel exchange request error:", error);
    return null;
  }
}

async function refreshLaravelIdentity(laravelToken: string) {
  if (!laravelAuthRefreshUrl) {
    return null;
  }

  const response = await fetch(laravelAuthRefreshUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${laravelToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  let rawData: unknown = {};
  try {
    rawData = await response.json();
  } catch {
    rawData = {};
  }

  return mapLaravelIdentityResponse(rawData);
}

async function completeSignupOtp(params: { email: string; otp: string }) {
  if (!laravelApiBaseUrl) {
    console.warn("Missing API URL. Set NEXT_PUBLIC_API_URL.");
    return null;
  }

  const endpoint = `${laravelApiBaseUrl.replace(/\/$/, "")}/api/auth/signup/complete`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      otp: params.otp,
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

  const latestIdentity = await refreshLaravelIdentity(mapped.token);

  return {
    token: mapped.token,
    status:
      normalizeStatus(latestIdentity?.status) ||
      normalizeStatus(mapped.status) ||
      "onboarding",
    name: composeNameParts([
      latestIdentity?.firstName,
      latestIdentity?.middleName,
      latestIdentity?.lastName,
      mapped.firstName,
      mapped.middleName,
      mapped.lastName,
    ]),
    email: latestIdentity?.email || mapped.email,
    sessionToken: latestIdentity?.sessionToken || mapped.sessionToken,
    firstName: latestIdentity?.firstName || mapped.firstName,
    middleName: latestIdentity?.middleName ?? mapped.middleName ?? null,
    lastName: latestIdentity?.lastName || mapped.lastName,
    userProfile: latestIdentity?.userProfile || mapped.userProfile,
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
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const otp = credentials?.otp?.trim();
        const password = credentials?.password;

        if (!email) {
          return null;
        }

        if (otp) {
          const completed = await completeSignupOtp({ email, otp });
          if (!completed) {
            return null;
          }

          const status = completed.status || "onboarding";

          return {
            id: email,
            email: completed.email || email,
            name: composeNameParts([
              completed.firstName,
              completed.middleName,
              completed.lastName,
            ]),
            status,
            firstName: completed.firstName,
            middleName: completed.middleName,
            lastName: completed.lastName,
            user_profile: completed.userProfile,
            laravelAuth: {
              token: completed.token,
              status,
              name: composeNameParts([
                completed.firstName,
                completed.middleName,
                completed.lastName,
              ]),
              email: completed.email || email,
              sessionToken: completed.sessionToken,
            },
          };
        }

        if (!password || password.length === 0) {
          return null;
        }

        const completed = await completePasswordSignin({ email, password });
        if (!completed) {
          return null;
        }

        const status = completed.status || "active";

        return {
          id: email,
          email: completed.email || email,
          name: composeNameParts([
            completed.firstName,
            completed.middleName,
            completed.lastName,
          ]),
          status,
          firstName: completed.firstName,
          middleName: completed.middleName,
          lastName: completed.lastName,
          user_profile: completed.userProfile,
          laravelAuth: {
            token: completed.token,
            status,
            name: composeNameParts([
              completed.firstName,
              completed.middleName,
              completed.lastName,
            ]),
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
          if (!normalizedStatus) {
            console.warn(
              "Laravel auth bridge did not include a valid status; defaulting to onboarding.",
            );
          }

          token.laravelJwt = authBridge.token;
          token.status = normalizedStatus || "onboarding";
          token.email = authBridge.email || token.email;
          token.sessionToken = authBridge.sessionToken;
        }

        const profileUser = user as typeof user & {
          firstName?: string;
          middleName?: string | null;
          lastName?: string;
          user_profile?: UserProfilePayload;
        };

        if (profileUser.user_profile) {
          token.userProfile = profileUser.user_profile;
          token.firstName =
            profileUser.user_profile.first_name || token.firstName;
          token.middleName =
            profileUser.user_profile.middle_name ?? token.middleName;
          token.lastName = profileUser.user_profile.last_name || token.lastName;
          token.avatar = profileUser.user_profile.avatar || token.avatar;
        }

        if (profileUser.firstName) {
          token.firstName = profileUser.firstName;
        }

        if (profileUser.middleName !== undefined) {
          token.middleName = profileUser.middleName;
        }

        if (profileUser.lastName) {
          token.lastName = profileUser.lastName;
        }

        token.name =
          composeNameParts([
            token.firstName,
            token.middleName,
            token.lastName,
          ]) || token.name;
      }

      if (trigger === "update" && token.laravelJwt) {
        const latestIdentity = await refreshLaravelIdentity(token.laravelJwt);
        if (latestIdentity) {
          token.status =
            normalizeStatus(latestIdentity.status) ||
            normalizeStatus(token.status) ||
            "onboarding";
          token.firstName = latestIdentity.firstName || token.firstName;
          token.middleName = latestIdentity.middleName ?? token.middleName;
          token.lastName = latestIdentity.lastName || token.lastName;
          token.userProfile = latestIdentity.userProfile || token.userProfile;
          token.avatar = latestIdentity.userProfile?.avatar || token.avatar;
          token.name =
            composeNameParts([
              token.firstName,
              token.middleName,
              token.lastName,
            ]) || token.name;
          token.email = latestIdentity.email || token.email;
        }
      }

      if (trigger === "update") {
        const sessionUser = session?.user;
        const sessionUserProfile = session?.user_profile;

        if (sessionUser?.status) {
          token.status = normalizeStatus(sessionUser.status) || token.status;
        }

        if (sessionUser?.email) {
          token.email = sessionUser.email;
        }

        if (sessionUser?.firstName) {
          token.firstName = sessionUser.firstName;
        }

        if (sessionUser?.middleName !== undefined) {
          token.middleName = sessionUser.middleName;
        }

        if (sessionUser?.lastName) {
          token.lastName = sessionUser.lastName;
        }

        if (sessionUserProfile) {
          token.userProfile = sessionUserProfile;
          token.firstName = sessionUserProfile.first_name || token.firstName;
          token.middleName = sessionUserProfile.middle_name ?? token.middleName;
          token.lastName = sessionUserProfile.last_name || token.lastName;
          token.avatar = sessionUserProfile.avatar || token.avatar;
        }

        token.name =
          composeNameParts([
            token.firstName,
            token.middleName,
            token.lastName,
          ]) || token.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.status = token.status;
        session.user.name = token.name;
        session.user.firstName = token.firstName;
        session.user.middleName = token.middleName;
        session.user.lastName = token.lastName;
        session.user.avatar = token.avatar;
      }

      session.user_profile = token.userProfile;

      session.laravelJwt = token.laravelJwt;
      session.sessionToken = token.sessionToken;

      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const exchanged = await exchangeGoogleForLaravelToken({
          email: user.email,
          image: user.image,
          googleId: account.providerAccountId,
          googleIdToken: account.id_token,
        });

        if (!exchanged?.token) {
          console.error(
            "Blocked Google sign-in because Laravel handshake did not return a valid token.",
          );
          return false;
        }

        const latestIdentity = await refreshLaravelIdentity(exchanged.token);

        const mutableUser = user as typeof user & {
          user_profile?: UserProfilePayload;
          laravelAuth?: {
            token: string;
            status?: string;
            name?: string;
            email?: string;
            sessionToken?: string;
          };
        };

        mutableUser.user_profile =
          latestIdentity?.userProfile || exchanged.userProfile;

        mutableUser.laravelAuth = {
          token: exchanged.token,
          status:
            normalizeStatus(latestIdentity?.status) ||
            normalizeStatus(exchanged.status),
          name: composeNameParts([
            latestIdentity?.firstName,
            latestIdentity?.middleName,
            latestIdentity?.lastName,
            exchanged.firstName,
            exchanged.middleName,
            exchanged.lastName,
          ]),
          email: latestIdentity?.email || exchanged.email,
          sessionToken: exchanged.sessionToken,
        };

        if (!mutableUser.laravelAuth.status) {
          console.warn(
            "Laravel handshake/refresh response did not return a usable status field.",
          );
        }

        return true;
      }

      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
