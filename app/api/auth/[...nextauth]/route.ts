import pool from "@/app/lib/db";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: nextAuthSecret,
  callbacks: {
    async jwt({ token, user, trigger, session, profile }) {
      // 1. Initial Login
      if (user) {
        const [rows]: any = await pool.query(
          `SELECT u.status, p.first_name, p.last_name 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.email = ?`,
          [user.email],
        );

        if (rows.length > 0 && rows[0].first_name) {
          // User already exists in DB with a profile
          token.status = rows[0].status;
          token.name = `${rows[0].first_name} ${rows[0].last_name}`;
        } else {
          // NEW USER or NO PROFILE YET:
          // Grab names from the Google Profile to populate the form
          const googleProfile = profile as any;
          token.status = rows[0]?.status || "onboarding";

          // We set the token name from Google so Onboarding.tsx can see it
          if (googleProfile) {
            token.name = `${googleProfile.given_name} ${googleProfile.family_name}`;
          } else {
            token.name = "New Student";
          }
        }
      }

      // 2. Handle the 'update' trigger (No changes needed here)
      if (trigger === "update") {
        const [rows]: any = await pool.query(
          `SELECT u.status, p.first_name, p.last_name 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.email = ?`,
          [token.email],
        );

        if (rows[0]) {
          token.status = rows[0].status;
          token.name = `${rows[0].first_name} ${rows[0].last_name}`;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.status = token.status; // Now frontend can see 'onboarding'
        session.user.name = token.name; // Fixes the 'null' name issue
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // 1. Check if user exists in your EXISTING table
          const [rows]: any = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [user.email],
          );

          // 2. If the array is empty, they are a new user
          if (rows.length === 0) {
            // Get the 'user' role ID (usually 2 based on your previous SQL)
            const [roleRows]: any = await pool.query(
              "SELECT id FROM roles WHERE name = 'student' LIMIT 1",
            );
            const roleId = roleRows[0]?.id || 2;

            // 3. Insert into the existing users table
            const [userResult]: any = await pool.query(
              "INSERT INTO users (email, role_id, status) VALUES (?, ?, 'onboarding')",
              [user.email, roleId],
            );
          }

          return true; // Authentication successful
        } catch (error) {
          console.error("Database Error during SSO:", error);
          return false; // Deny access if DB is down
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
