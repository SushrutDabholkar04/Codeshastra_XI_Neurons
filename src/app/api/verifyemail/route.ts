import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Create a PostgreSQL pool connection (reuse this or export from a config file)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Set in .env
});

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { token } = reqBody;
    console.log("Token received:", token);

    const client = await pool.connect();

    try {
      // Find user with valid token and expiry
      const findUserQuery = `
        SELECT * FROM users
        WHERE verify_token = $1 AND verify_token_expiry > NOW()
        LIMIT 1
      `;
      const result = await client.query(findUserQuery, [token]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }

      const user = result.rows[0];
      console.log("User found:", user);

      // Update user to mark as verified
      const updateUserQuery = `
        UPDATE users
        SET is_verified = true,
            verify_token = NULL,
            verify_token_expiry = NULL
        WHERE id = $1
      `;
      await client.query(updateUserQuery, [user.id]);

      return NextResponse.json({
        message: "Email verified successfully",
        success: true,
      });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error verifying email:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
