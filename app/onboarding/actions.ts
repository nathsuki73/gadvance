"use server";

import pool from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function finishOnboarding(data: {
  firstName: string;
  middleName: string;
  lastName: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, error: "Unauthorized" };

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the User ID from the email in the session
    const [userRows]: any = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [session.user.email],
    );
    const userId = userRows[0].id;

    await connection.query(
      `INSERT INTO profiles (user_id, first_name, middle_name, last_name) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       first_name = VALUES(first_name), 
       middle_name = VALUES(middle_name), 
       last_name = VALUES(last_name)`,
      [userId, data.firstName, data.middleName || null, data.lastName],
    );

    // 3. THE CRITICAL STEP: Update the user status to 'active'
    // This is what lets the Gatekeeper know they are finished!
    await connection.query("UPDATE users SET status = 'active' WHERE id = ?", [
      userId,
    ]);

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Onboarding Error:", error);
    return { success: false, error: "Failed to finalize account." };
  } finally {
    connection.release();
  }
}
