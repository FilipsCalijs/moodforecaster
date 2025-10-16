'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.role) {
          localStorage.setItem('userRole', data.role);
        }
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Laipni lūdzam atpakaļ</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-pasts
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-4 w-full rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-md transition text-gray-900 text-base"
              placeholder="ievadiet savu e-pastu"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parole
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-4 w-full rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:outline-none shadow-md transition text-gray-900 text-base"
              placeholder="ievadiet savu paroli"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform text-base"
          >
            Pieslēgties
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-red-500 font-medium">{message}</p>
        )}

        <p className="mt-8 text-center text-gray-500">
          Nav konta?{' '}
          <Link href="/register" className="text-pink-500 font-semibold hover:underline">
            Reģistrēties
          </Link>
        </p>
      </div>
    </div>
  );
}
