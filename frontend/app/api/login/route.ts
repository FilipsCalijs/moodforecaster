// app/api/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const [rows] = await pool.query(
      'SELECT * FROM users_mood_forecaster WHERE email = ?',
      [email]
    );

    if ((rows as any).length === 0)
      return NextResponse.json({ message: 'Lietotājs nav atrasts' }, { status: 404 });

    const user = (rows as any)[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return NextResponse.json({ message: 'Nepareiza parole' }, { status: 400 });

    const token = btoa(email);
    
    return NextResponse.json({ 
      message: 'Pieslēgšanās veiksmīga', 
      token,
      role: user.role || 'user' 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}
