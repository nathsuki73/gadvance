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
    async jwt({ token, user }) {
      if (user) {
        // Fetch both status and profile info in one go
        const [rows]: any = await pool.query(
          `SELECT u.status, p.first_name, p.last_name 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.email = ?`,
          [token.email],
        );

        if (rows.length > 0) {
          token.status = rows[0].status;
          // Combine names into a single string for easy use
          token.name = `${rows[0].first_name} ${rows[0].last_name}`.trim();
        }
      }
      return token;
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
              "SELECT id FROM roles WHERE name = 'user' LIMIT 1",
            );
            const roleId = roleRows[0]?.id || 2;

            // 3. Insert into the existing users table
            const [userResult]: any = await pool.query(
              "INSERT INTO users (email, role_id, status) VALUES (?, ?, 'onboarding')",
              [user.email, roleId],
            );

            // 4. Insert into the existing profiles table using the new user's ID
            const newUserId = userResult.insertId;

            const googleProfile = profile as any;
            await pool.query(
              "INSERT INTO profiles (user_id, first_name, last_name) VALUES (?, ?, ?)",
              [
                newUserId,
                googleProfile?.given_name,
                googleProfile?.family_name,
              ],
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
