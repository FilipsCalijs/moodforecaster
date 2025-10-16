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

export async function PUT(
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
      'SELECT id FROM diary_entries WHERE id = ? AND user_id = ?',
      [entryId, userId]
    );

    if ((entries as any).length === 0) {
      return NextResponse.json({ message: 'Ieraksts nav atrasts' }, { status: 404 });
    }

    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ message: 'Teksts ir obligāts' }, { status: 400 });
    }

    const analysisPrompt = `Analyze the sentiment/mood of the following text and respond in JSON format with:
1. "mood" field: must be exactly one of: "positive", "negative", or "neutral"
2. "music" field: one music recommendation based on the mood (in Latvian)
3. "movie" field: one movie recommendation based on the mood (in Latvian)
4. "book" field: one book recommendation based on the mood (in Latvian)

Text to analyze: "${text}"

Respond ONLY with valid JSON, no other text. Example:
{"mood": "positive", "music": "...", "movie": "...", "book": "..."}`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a mood analysis assistant. Always respond with valid JSON only.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!gptResponse.ok) {
      console.error('OpenAI API error:', await gptResponse.text());
      return NextResponse.json({ message: 'Kļūda AI analīzē' }, { status: 500 });
    }

    const gptData = await gptResponse.json();
    const aiResponse = gptData.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return NextResponse.json({ message: 'Nav atbildes no AI' }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse GPT response:', aiResponse);
      return NextResponse.json({ message: 'Kļūda AI atbildes apstrādē' }, { status: 500 });
    }

    const validMoods = ['positive', 'negative', 'neutral'];
    if (!validMoods.includes(analysis.mood)) {
      analysis.mood = 'neutral';
    }

    await pool.query(
      `UPDATE diary_entries 
       SET entry_text = ?, mood = ?, music_recommendation = ?, 
           movie_recommendation = ?, book_recommendation = ?
       WHERE id = ? AND user_id = ?`,
      [
        text,
        analysis.mood,
        analysis.music || 'Nav pieejams',
        analysis.movie || 'Nav pieejams',
        analysis.book || 'Nav pieejams',
        entryId,
        userId
      ]
    );

    return NextResponse.json({
      success: true,
      mood: analysis.mood,
      recommendations: {
        music: analysis.music,
        movie: analysis.movie,
        book: analysis.book
      }
    }, { status: 200 });

  } catch (err) {
    console.error('Error updating entry:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

export async function DELETE(
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
    
    const [result] = await pool.query(
      'DELETE FROM diary_entries WHERE id = ? AND user_id = ?',
      [entryId, userId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Ieraksts nav atrasts' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ieraksts dzēsts' }, { status: 200 });

  } catch (err) {
    console.error('Error deleting entry:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

