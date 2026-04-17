import { DefaultSession } from "next-auth";

declare module "next-auth" {
  type UserProfile = {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
  };

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's custom database status. */
      status: "onboarding" | "active" | "suspended";
      firstName?: string;
      middleName?: string | null;
      lastName?: string;
    } & DefaultSession["user"];
    user_profile?: UserProfile;
    laravelJwt?: string;
    sessionToken?: string;
  }

  interface User {
    status: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    user_profile?: UserProfile;
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
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    userProfile?: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
    };
    laravelJwt?: string;
    sessionToken?: string;
  }
}
