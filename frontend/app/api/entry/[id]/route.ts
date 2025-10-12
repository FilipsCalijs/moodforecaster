import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const entryId = params.id;
    
    const [entries] = await pool.query(
      `SELECT id, entry_text, mood, music_recommendation, movie_recommendation, 
              book_recommendation, created_at 
       FROM diary_entries 
       WHERE id = ? AND user_id = ?`,
      [entryId, userId]
    );

    if ((entries as any).length === 0) {
      return NextResponse.json({ message: 'Ieraksts nav atrasts' }, { status: 404 });
    }

    const entry = (entries as any)[0];

    return NextResponse.json({ 
      entry: {
        id: entry.id,
        text: entry.entry_text,
        mood: entry.mood,
        recommendations: {
          music: entry.music_recommendation,
          movie: entry.movie_recommendation,
          book: entry.book_recommendation
        },
        createdAt: entry.created_at
      }
    }, { status: 200 });

  } catch (err) {
    console.error('Error in entry endpoint:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

