import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';
import { checkAdminRole } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: 'Nav autorizācijas' }, { status: 401 });
    }

    const email = atob(token);
    
    const isAdmin = await checkAdminRole(email);
    if (!isAdmin) {
      return NextResponse.json({ 
        message: 'Piekļuve liegta. Nepieciešamas administratora tiesības.' 
      }, { status: 403 });
    }


    const [usersCount] = await pool.query(
      'SELECT COUNT(*) as total FROM users_mood_forecaster'
    );
    const totalUsers = (usersCount as any)[0].total;

    const [entriesCount] = await pool.query(
      'SELECT COUNT(*) as total FROM diary_entries'
    );
    const totalEntries = (entriesCount as any)[0].total;

    const [moodDistribution] = await pool.query(`
      SELECT 
        mood,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM diary_entries), 2) as percentage
      FROM diary_entries
      GROUP BY mood
    `);

    const [activeUsers] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM diary_entries
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const activeUsersCount = (activeUsers as any)[0].count;

    const [avgLength] = await pool.query(`
      SELECT ROUND(AVG(CHAR_LENGTH(entry_text)), 2) as avgLength
      FROM diary_entries
    `);
    const averageTextLength = (avgLength as any)[0].avgLength || 0;

    const [entriesByDay] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM diary_entries
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const [topUsers] = await pool.query(`
      SELECT 
        u.username,
        u.email,
        COUNT(d.id) as entries_count
      FROM users_mood_forecaster u
      LEFT JOIN diary_entries d ON u.id = d.user_id
      GROUP BY u.id
      ORDER BY entries_count DESC
      LIMIT 5
    `);

    const [recentEntries] = await pool.query(`
      SELECT 
        d.id,
        d.entry_text,
        d.mood,
        d.created_at,
        u.username
      FROM diary_entries d
      JOIN users_mood_forecaster u ON d.user_id = u.id
      ORDER BY d.created_at DESC
      LIMIT 10
    `);

    const [allTexts] = await pool.query('SELECT entry_text FROM diary_entries');
    const words: { [key: string]: number } = {};
    const stopWords = ['un', 'ir', 'es', 'kas', 'bet', 'ar', 'par', 'vai', 'ka', 'uz', 'no', 'tā', 'tas', 'šī', 'šis', 'to', 'ko'];
    
    (allTexts as any).forEach((row: any) => {
      const text = row.entry_text.toLowerCase();
      const textWords = text.match(/\b[a-zāčēģīķļņšūž]{3,}\b/gi) || [];
      textWords.forEach((word: string) => {
        if (!stopWords.includes(word)) {
          words[word] = (words[word] || 0) + 1;
        }
      });
    });

    const topWords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return NextResponse.json({
      summary: {
        totalUsers,
        totalEntries,
        activeUsersWeek: activeUsersCount,
        averageTextLength
      },
      moodDistribution,
      entriesByDay,
      topUsers,
      recentEntries,
      topWords
    }, { status: 200 });

  } catch (err) {
    console.error('Error in admin stats endpoint:', err);
    return NextResponse.json({ message: 'Servera kļūda' }, { status: 500 });
  }
}

