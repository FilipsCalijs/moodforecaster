'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Entry {
  id: number;
  entry_text: string;
  mood: string;
  created_at: string;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Kļūda');
        return;
      }

      setEntries(data.entries);
    } catch (err) {
      console.error(err);
      setError('Servera kļūda');
    } finally {
      setLoading(false);
    }
  };

  const loadEntryDetails = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/entry/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedEntry(data.entry);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Верхняя панель */}
        <div className="flex justify-between items-center p-4 bg-white shadow-md">
          <h1 className="text-2xl font-bold text-purple-600">Noskaņojumu Vēsture</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Galvenā lapa
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Ielādē...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Jums vēl nav ierakstu</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                Izveidot pirmo ierakstu
              </button>
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => loadEntryDetails(entry.id)}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">
                        {getMoodEmoji(entry.mood)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-800">
                            {getMoodText(entry.mood)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 line-clamp-2">
                          {entry.entry_text}
                        </p>
                      </div>
                    </div>
                    <button className="text-purple-500 hover:text-purple-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно с деталями */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{getMoodEmoji(selectedEntry.mood)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {getMoodText(selectedEntry.mood)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedEntry.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Jūsu ieraksts:</h4>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedEntry.text}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Ieteikumi:</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎵</span>
                      <h5 className="font-semibold text-purple-700">Mūzika</h5>
                    </div>
                    <p className="text-gray-700">{selectedEntry.recommendations.music}</p>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎬</span>
                      <h5 className="font-semibold text-pink-700">Filma</h5>
                    </div>
                    <p className="text-gray-700">{selectedEntry.recommendations.movie}</p>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📚</span>
                      <h5 className="font-semibold text-indigo-700">Grāmata</h5>
                    </div>
                    <p className="text-gray-700">{selectedEntry.recommendations.book}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

