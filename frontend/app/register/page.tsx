'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message);

    if (res.status === 201) router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Izveidot kontu</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="relative">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="peer placeholder-transparent px-4 py-3 w-full rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-300 shadow-md transition text-gray-900"
              placeholder="Lietotājvārds"
            />
            <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-pink-500 peer-focus:text-sm">
              Lietotājvārds
            </label>
          </div>

          <div className="relative">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="peer placeholder-transparent px-4 py-3 w-full rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-300 shadow-md transition text-gray-900"
              placeholder="E-pasts"
            />
            <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-purple-500 peer-focus:text-sm">
              E-pasts
            </label>
          </div>

          <div className="relative">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="peer placeholder-transparent px-4 py-3 w-full rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-300 shadow-md transition text-gray-900"
              placeholder="Parole"
            />
            <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-indigo-500 peer-focus:text-sm">
              Parole
            </label>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            Reģistrēties
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-red-500 font-medium">{message}</p>
        )}

        <p className="mt-8 text-center text-gray-500">
          Jau ir konts?{' '}
          <a href="/login" className="text-pink-500 font-semibold hover:underline">Pieslēgties</a>
        </p>
      </div>
    </div>
  );
}
