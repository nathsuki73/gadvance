import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      status: "onboarding" | "active" | "suspended";
      googleImage?: string | null;
    } & DefaultSession["user"];

    laravelJwt?: string;

    sessionToken?: string;
  }

  interface User {
    status: string;
    laravelAuth?: {
      token: string;
      status?: string;
      name?: string;
      email?: string;
      sessionToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    status: "onboarding" | "active" | "suspended";
    laravelJwt?: string;
    sessionToken?: string;
  }
}
