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
      // Profile name extensions
      firstName?: string;
      first_name?: string;
      middleName?: string;
      middle_name?: string;
      lastName?: string;
      last_name?: string;
    } & DefaultSession["user"];

    laravelJwt?: string;
    sessionToken?: string;
    error?: string;
  }

  interface User {
    status: string;
    firstName?: string;
    first_name?: string;
    middleName?: string;
    middle_name?: string;
    lastName?: string;
    last_name?: string;
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
    laravelJwtError?: string;
    sessionToken?: string;
    firstName?: string;
    first_name?: string;
    middleName?: string;
    middle_name?: string;
    lastName?: string;
    last_name?: string;
  }
}
