import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
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
      analysis.mood = 'neutral'; // fallback
    }

    const [result] = await pool.query(
      `INSERT INTO diary_entries 
       (user_id, entry_text, mood, music_recommendation, movie_recommendation, book_recommendation) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        text,
        analysis.mood,
        analysis.music || 'Nav pieejams',
        analysis.movie || 'Nav pieejams',
        analysis.book || 'Nav pieejams'
      ]
    );

    const entryId = (result as any).insertId;

    return NextResponse.json({
      success: true,
      entryId,
      mood: analysis.mood,
      recommendations: {
        music: analysis.music,
        movie: analysis.movie,
        book: analysis.book
      }
    }, { status: 201 });

  } catch (err) {
    console.error('Error in analyze endpoint:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

