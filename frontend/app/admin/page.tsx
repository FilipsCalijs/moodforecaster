'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Stats {
  summary: {
    totalUsers: number;
    totalEntries: number;
    activeUsersWeek: number;
    averageTextLength: number;
  };
  moodDistribution: Array<{ mood: string; count: number; percentage: number }>;
  entriesByDay: Array<{ date: string; count: number }>;
  topUsers: Array<{ username: string; email: string; entries_count: number }>;
  recentEntries: Array<{ id: number; entry_text: string; mood: string; created_at: string; username: string }>;
  topWords: Array<{ word: string; count: number }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      router.push('/');
      return;
    }
    setIsAdmin(true);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Kļūda');
        return;
      }

      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Servera kļūda');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    if (mood === 'positive') return '😊';
    if (mood === 'negative') return '😔';
    return '😐';
  };

  const getMoodText = (mood: string) => {
    if (mood === 'positive') return 'Pozitīvs';
    if (mood === 'negative') return 'Negatīvs';
    return 'Neitrāls';
  };

  const getMoodColor = (mood: string) => {
    if (mood === 'positive') return 'bg-green-100 text-green-800';
    if (mood === 'negative') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return <div>Ielādē...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">👑 Administratora Panelis</h1>
              <p className="text-sm text-gray-600">Sistēmas statistika un pārskats</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              ← Galvenā lapa
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Ielādē statistiku...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Kopā lietotāji</p>
                      <p className="text-3xl font-bold text-indigo-600">{stats.summary.totalUsers}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Kopā ieraksti</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.summary.totalEntries}</p>
                    </div>
                    <div className="text-4xl">📝</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Aktīvi (7 dienas)</p>
                      <p className="text-3xl font-bold text-green-600">{stats.summary.activeUsersWeek}</p>
                    </div>
                    <div className="text-4xl">⚡</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Vid. teksta garums</p>
                      <p className="text-3xl font-bold text-orange-600">{Math.round(stats.summary.averageTextLength)}</p>
                    </div>
                    <div className="text-4xl">📏</div>
                  </div>
                </div>
              </div>

              {/* Распределение настроений */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Noskaņojumu sadalījums</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.moodDistribution.map((mood) => (
                    <div key={mood.mood} className={`p-4 rounded-lg ${getMoodColor(mood.mood)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                        <span className="text-2xl font-bold">{mood.percentage}%</span>
                      </div>
                      <p className="font-semibold">{getMoodText(mood.mood)}</p>
                      <p className="text-sm opacity-75">{mood.count} ieraksti</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ieraksti pēdējās 7 dienās</h2>
                <div className="space-y-2">
                  {stats.entriesByDay.length > 0 ? (
                    stats.entriesByDay.map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{new Date(day.date).toLocaleDateString('lv-LV')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-indigo-500 h-3 rounded-full"
                              style={{ width: `${Math.min(day.count * 10, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-indigo-600">{day.count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nav ierakstu pēdējās 7 dienās</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Aktīvākie lietotāji</h2>
                  <div className="space-y-3">
                    {stats.topUsers.map((user, index) => (
                      <div key={user.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                          {user.entries_count} ieraksti
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">🔤 Biežākie vārdi</h2>
                  <div className="flex flex-wrap gap-2">
                    {stats.topWords.map((word) => (
                      <span 
                        key={word.word}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {word.word} ({word.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Jaunākie ieraksti</h2>
                <div className="space-y-3">
                  {stats.recentEntries.map((entry) => (
                    <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{entry.username}</p>
                            <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMoodColor(entry.mood)}`}>
                          {getMoodText(entry.mood)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{entry.entry_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

