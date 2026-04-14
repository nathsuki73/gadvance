import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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

type LaravelExchangeResponse = {
  token: string;
  status?: string;
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
        name: params.name,
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

    const data = (await response.json()) as Partial<LaravelExchangeResponse>;
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

  const data = (await response.json()) as Partial<LaravelExchangeResponse>;
  return data;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret,
    }),
  ],
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      token.status = token.status || "onboarding";

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
        const exchanged = await exchangeGoogleForLaravelToken({
          email: user.email,
          name: user.name,
          image: user.image,
          googleId: account.providerAccountId,
          googleIdToken: account.id_token,
        });

        if (exchanged?.token) {
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
        }

        // Do not block Google sign-in when Laravel exchange is temporarily unavailable.
        return true;
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
