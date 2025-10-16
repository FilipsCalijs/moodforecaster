'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from "@/components/LogoutButton";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    mood: string;
    recommendations: {
      music: string;
      movie: string;
      book: string;
    };
  } | null>(null);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const welcomeMessage = 'Sveiki! Ierakstiet savu noskaņojumu zemāk.';
  const footerText = '© 2025 Noskaņojumu Dienasgrāmata';
  const defaultMood = 'neutral';

  const clearText = () => {
    setText('');
    setError('');
    setResult(null);
  };

  const getTextLength = (input: string) => {
    return input.length;
  };

  const getRandomEmoji = () => {
    const emojis = ['😄', '😎', '🤔', '😴', '😇'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const isTextEmpty = (input: string) => {
    return input.trim() === '';
  };

  const capitalizeText = (input: string) => {
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setIsAdmin(userRole === 'admin');
  }, []);

  const handleAnalyze = async () => {
    const maxEntryLength = 500;

    if (isTextEmpty(text)) {
      setError('Lūdzu, ievadiet tekstu');
      return;
    }

    if (getTextLength(text) > maxEntryLength) {
      setError(`Ieraksts nevar pārsniegt ${maxEntryLength} simbolus`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Kļūda');
        return;
      }

      setResult({
        ...data,
        mood: data.mood || defaultMood,
        recommendations: {
          music: capitalizeText(data.recommendations.music),
          movie: capitalizeText(data.recommendations.movie),
          book: capitalizeText(data.recommendations.book)
        }
      });

      setText(''); 
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
    return getRandomEmoji();
  };

  const getMoodText = (mood: string) => {
    if (mood === 'positive') return 'Pozitīvs';
    if (mood === 'negative') return 'Negatīvs';
    return 'Neitrāls';
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex justify-between items-center p-4 bg-white shadow-md">
          <h1 className="text-2xl font-bold text-purple-600">Noskaņojuma Dienasgrāmata</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/history')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Vēsture
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition flex items-center gap-2"
              >
                Admin
              </button>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="text-gray-600 mb-4">
            <p className="text-gray-500 mb-2">{welcomeMessage}</p>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Kā jums šodien klājas?
            </h2>
            <p className="text-gray-600 mb-4">
              Aprakstiet savu dienu un mēs analizēsim jūsu noskaņojumu
            </p>

            <textarea
              value={text}
              onChange={(e) => {
                const input = e.target.value;
                setText(capitalizeText(input));
                setError(isTextEmpty(input) ? 'Lūdzu, ievadiet tekstu' : '');
              }}
              placeholder="Rakstiet šeit par savu dienu..."
              className="w-full h-40 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none text-gray-800"
              disabled={loading}
            />

            <div className="flex justify-between mt-2 text-gray-500 text-sm">
              <span>{isTextEmpty(text) ? '❗ Ieraksts ir tukšs' : '✔ Teksts ievadīts'}</span>
              <span>{`Simboli: ${getTextLength(text)}/500`}</span>
              <span>{getRandomEmoji()}</span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || isTextEmpty(text)}
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Analizē...' : 'Analizēt noskaņojumu'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{getMoodEmoji(result.mood)}</div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Jūsu noskaņojums: {getMoodText(result.mood || defaultMood)}
                </h3>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">
                  Ieteikumi jums:
                </h4>

                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎵</span>
                      <h5 className="font-semibold text-purple-700">Mūzika</h5>
                    </div>
                    <p className="text-gray-700">{result.recommendations.music}</p>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎬</span>
                      <h5 className="font-semibold text-pink-700">Filma</h5>
                    </div>
                    <p className="text-gray-700">{result.recommendations.movie}</p>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📚</span>
                      <h5 className="font-semibold text-indigo-700">Grāmata</h5>
                    </div>
                    <p className="text-gray-700">{result.recommendations.book}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={clearText}
                className="mt-6 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Jauns ieraksts
              </button>
            </div>
          )}
        </div>
        <p className="text-black text-center py-4">{footerText}</p>
      </div>
    </ProtectedRoute>
  );
}
