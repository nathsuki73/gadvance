import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 1. Extend the types correctly
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      status?: string; // Add the '?' here
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    status: string;
    id: string; // NextAuth User must have an id
  }
}

// 2. Ensure your JWT type also knows about these properties
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    status: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Laravel",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
            {
              method: "GET", // Explicitly set GET
              headers: {
                Authorization: `Bearer ${credentials.token}`,
                Accept: "application/json",
              },
            },
          );

          const data = await res.json();

          // If Laravel wraps response in 'data', use data.data
          const userData = data.data ? data.data : data;

          if (res.ok && userData) {
            // NextAuth NEEDS an 'id' string.
            // We map Laravel's id and attach the token.
            return {
              ...userData,
              id: userData.id.toString(),
              accessToken: credentials.token,
            };
          }
        } catch (error) {
          console.error("Auth Error:", error);
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.status = user.status;
      }

      if (trigger === "update" && token?.accessToken) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            Accept: "application/json",
          },
        });
        const updatedData = await res.json();
        const updatedUser = updatedData.data ? updatedData.data : updatedData;

        if (res.ok) {
          token.status = updatedUser.status;
          token.name = updatedUser.name;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.accessToken = token.accessToken;
        session.user.status = token.status;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
