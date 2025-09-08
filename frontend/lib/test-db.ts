import pool from './db';

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('DB connected:', rows);
  } catch (err) {
    console.error('DB connection failed:', err);
  }
}

test();