import pool from "@/app/lib/db";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;

function toSingleHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function inferDeviceName(
  userAgent: string,
  platformHint: string | null,
): string {
  const ua = userAgent.toLowerCase();
  const platform = (platformHint || "").replace(/"/g, "").trim();

  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Android Device";
  if (ua.includes("windows")) return "Windows PC";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "Mac";
  if (ua.includes("linux")) return "Linux PC";

  return platform || "Unknown Device";
}

async function getRequestMetadata() {
  const h = await headers();

  const userAgent = h.get("user-agent") || "unknown";
  const forwardedFor = toSingleHeaderValue(h.get("x-forwarded-for"));
  const realIp = toSingleHeaderValue(h.get("x-real-ip"));
  const cfIp = toSingleHeaderValue(h.get("cf-connecting-ip"));
  const ipAddress = forwardedFor || realIp || cfIp || "unknown";

  const platformHint = h.get("sec-ch-ua-platform");
  const deviceName = inferDeviceName(userAgent, platformHint);

  return {
    deviceName,
    ipAddress,
    userAgent,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: nextAuthSecret,
  callbacks: {
    async jwt({ token, user, profile, trigger }) {
      // 1. Initial Login
      if (user) {
        const [rows]: any = await pool.query(
          `SELECT u.id, u.status, p.first_name, p.last_name 
          FROM users u 
          LEFT JOIN profiles p ON u.id = p.user_id 
          WHERE u.email = ?`,
          [user.email],
        );

        const userId = rows[0]?.id;

        // Assign user info to JWT token
        token.status = rows[0]?.status || "onboarding";
        token.name =
          rows[0]?.first_name && rows[0]?.last_name
            ? `${rows[0].first_name} ${rows[0].last_name}`
            : profile
              ? `${(profile as any).given_name || profile.name || ""} ${(profile as any).family_name || ""}`.trim()
              : "New Student";

        // -----------------------------
        // CREATE user_session record
        // -----------------------------
        if (userId) {
          const sessionToken = randomUUID(); // unique session ID
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // session valid for 7 days
          const { deviceName, ipAddress, userAgent } =
            await getRequestMetadata();

          await pool.query(
            `INSERT INTO user_sessions 
              (user_id, session_token, device_name, ip_address, user_agent, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, sessionToken, deviceName, ipAddress, userAgent, expiresAt],
          );

          // Attach session token to JWT so frontend can reference it
          token.sessionToken = sessionToken;
        }
      }

      // Session update from the client (e.g., after onboarding) should refresh
      // status/name from DB without creating a new user_session row.
      if (trigger === "update" && token?.email) {
        const [rows]: any = await pool.query(
          `SELECT u.status, p.first_name, p.last_name
           FROM users u
           LEFT JOIN profiles p ON u.id = p.user_id
           WHERE u.email = ?
           LIMIT 1`,
          [token.email],
        );

        if (rows?.length) {
          token.status = rows[0].status || token.status || "onboarding";
          if (rows[0].first_name && rows[0].last_name) {
            token.name = `${rows[0].first_name} ${rows[0].last_name}`;
          }
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
