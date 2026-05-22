import { DefaultSession } from "next-auth";

declare module "next-auth" {
  type UserProfile = {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    avatar?: string | null;
  };

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      status: "onboarding" | "active" | "suspended";
    } & DefaultSession["user"];

    laravelJwt?: string;

    sessionToken?: string;
  }

  interface User {
    status: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    user_profile?: UserProfile;
    avatar?: string | null;
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
    avatar?: string | null;
    //location?: string;
    userProfile?: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      avatar?: string | null;
    };
    laravelJwt?: string;
    sessionToken?: string;
  }
}
