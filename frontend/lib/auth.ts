
export function getUserIdFromToken(token: string): string | null {
  try {
    const email = atob(token);
    return email;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}


export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  const role = localStorage.getItem('userRole');
  return role === 'admin';
}


export function saveUserRole(role: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
  }
}


export function clearUserRole(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
  }
}
