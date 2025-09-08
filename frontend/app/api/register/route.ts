import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const [existing] = await pool.query(
      'SELECT * FROM users_mood_forecaster WHERE email = ?',
      [email]
    );

    if ((existing as any).length > 0) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users_mood_forecaster (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
