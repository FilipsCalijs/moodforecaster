
import pool from './db';

export async function checkAdminRole(email: string): Promise<boolean> {
  try {
    const [rows] = await pool.query(
      'SELECT role FROM users_mood_forecaster WHERE email = ?',
      [email]
    );
    
    if ((rows as any).length === 0) {
      return false;
    }
    
    const user = (rows as any)[0];
    return user.role === 'admin';
  } catch (err) {
    console.error('Error checking admin role:', err);
    return false;
  }
}

export async function getUserRole(email: string): Promise<string | null> {
  try {
    const [rows] = await pool.query(
      'SELECT role FROM users_mood_forecaster WHERE email = ?',
      [email]
    );
    
    if ((rows as any).length === 0) {
      return null;
    }
    
    return (rows as any)[0].role || 'user';
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
}

