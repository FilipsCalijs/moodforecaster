import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: 'Nav autorizācijas' }, { status: 401 });
    }

    const email = atob(token);
    
    const [userRows] = await pool.query(
      'SELECT id FROM users_mood_forecaster WHERE email = ?',
      [email]
    );
    
    if ((userRows as any).length === 0) {
      return NextResponse.json({ message: 'Lietotājs nav atrasts' }, { status: 404 });
    }
    
    const userId = (userRows as any)[0].id;
    
    const [entries] = await pool.query(
      `SELECT id, entry_text, mood, created_at 
       FROM diary_entries 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ entries }, { status: 200 });

  } catch (err) {
    console.error('Error in history endpoint:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: 'Nav autorizācijas' }, { status: 401 });
    }

    const email = atob(token);
    
    const [userRows] = await pool.query(
      'SELECT id FROM users_mood_forecaster WHERE email = ?',
      [email]
    );
    
    if ((userRows as any).length === 0) {
      return NextResponse.json({ message: 'Lietotājs nav atrasts' }, { status: 404 });
    }
    
    const userId = (userRows as any)[0].id;
    
    const [result] = await pool.query(
      'DELETE FROM diary_entries WHERE user_id = ?',
      [userId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Visa vēsture dzēsta',
      deletedCount: (result as any).affectedRows
    }, { status: 200 });

  } catch (err) {
    console.error('Error deleting history:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

