"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "../lib/db";

export async function updateProfile({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, error: "Unauthorized" };

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the user ID from the email
    const [userRows]: any = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email],
    );
    const userId = userRows[0].id;

    // 2. Update the profile
    await connection.query(
      "UPDATE profiles SET first_name = ?, last_name = ? WHERE user_id = ?",
      [firstName, lastName, userId],
    );

    // 3. Flip the status to 'active'
    await connection.query("UPDATE users SET status = 'active' WHERE id = ?", [
      userId,
    ]);

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return { success: false };
  } finally {
    connection.release();
  }
}
