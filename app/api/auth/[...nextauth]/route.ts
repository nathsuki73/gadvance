import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;
const laravelAuthExchangeUrl = process.env.LARAVEL_AUTH_EXCHANGE_URL;
const laravelAuthRefreshUrl = process.env.LARAVEL_AUTH_REFRESH_URL;
const jwtSharedSecret = process.env.LARAVEL_SSO_SECRET?.trim();

type LaravelExchangeResponse = {
  token: string;
  status?: "onboarding" | "active" | "suspended";
  name?: string;
  email?: string;
  sessionToken?: string;
};

async function exchangeGoogleForLaravelToken(params: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  googleId?: string;
  googleIdToken?: string;
}) {
  if (!laravelAuthExchangeUrl || !jwtSharedSecret) {
    console.error(
      "Missing Laravel handshake config. Set LARAVEL_AUTH_EXCHANGE_URL and JWT_SECRET.",
    );
    return null;
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
      name: params.name,
      image: params.image,
      google_id: params.googleId,
      google_id_token: params.googleIdToken,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Laravel exchange failed (${response.status}): ${text || "empty response"}`,
    );
  }

  const data = (await response.json()) as Partial<LaravelExchangeResponse>;
  if (!data?.token) {
    throw new Error("Laravel exchange response missing token field");
  }

  return data;
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

  const data = (await response.json()) as Partial<LaravelExchangeResponse>;
  return data;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const authBridge = (
          user as typeof user & {
            laravelAuth?: Partial<LaravelExchangeResponse>;
          }
        ).laravelAuth as Partial<LaravelExchangeResponse> | undefined;

        if (authBridge?.token) {
          token.laravelJwt = authBridge.token;
          token.status = authBridge.status || "onboarding";
          token.name = authBridge.name || token.name || "New Student";
          token.email = authBridge.email || token.email;
          token.sessionToken = authBridge.sessionToken;
        }
      }

      if (trigger === "update") {
        const sessionUser = session?.user;

        if (sessionUser?.status) {
          token.status = sessionUser.status;
        }

        if (sessionUser?.name) {
          token.name = sessionUser.name;
        }

        if (sessionUser?.email) {
          token.email = sessionUser.email;
        }
      }

      if (trigger === "update" && token.laravelJwt) {
        const latestIdentity = await refreshLaravelIdentity(token.laravelJwt);
        if (latestIdentity) {
          token.status = latestIdentity.status || token.status || "onboarding";
          token.name = latestIdentity.name || token.name;
          token.email = latestIdentity.email || token.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.status = token.status;
        session.user.name = token.name;
      }

      session.laravelJwt = token.laravelJwt;
      session.sessionToken = token.sessionToken;

      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const exchanged = await exchangeGoogleForLaravelToken({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            googleIdToken: account.id_token,
          });

          if (!exchanged?.token) {
            return false;
          }

          const mutableUser = user as typeof user & {
            laravelAuth?: {
              token: string;
              status?: string;
              name?: string;
              email?: string;
              sessionToken?: string;
            };
          };

          mutableUser.laravelAuth = {
            token: exchanged.token,
            status: exchanged.status,
            name: exchanged.name,
            email: exchanged.email,
            sessionToken: exchanged.sessionToken,
          };

          return true;
        } catch (error) {
          console.error("Laravel SSO exchange failed:", error);
          return false;
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
