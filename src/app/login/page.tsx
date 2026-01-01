'use client';

import React, { useEffect, useState } from 'react';
import { login } from '../../../actions/login';
import { Input, Button } from '../components/ui';
import { User, Lock, PartyPopper } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [cardVisible, setCardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setTimeout(() => setCardVisible(true), 100);
  }, []);

  const handleLogin = async () => {
    localStorage.clear();
    setLoading(true);
    setToast(null);
    try {
      const user = await login(name, password);
      localStorage.setItem('user', JSON.stringify(user));
      setToast({ message: 'Login successful 🎉', type: 'success' });
      router.push('/dashboard');
    } catch (e) {
      setToast({ message: `Invalid credentials ${e}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/finance-bg.svg')] bg-cover bg-center flex items-center justify-center">
      {toast && (
        <div
          className={
            'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-semibold text-lg shadow-lg ' +
            (toast.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-lime-300 text-slate-900' : 'bg-gradient-to-r from-rose-500 to-yellow-400 text-slate-900')
          }
        >
          {toast.message}
        </div>
      )}

      <div
        className={`max-w-md w-full min-h-[38rem] rounded-2xl shadow-2xl py-12 px-8 text-center text-slate-50 flex flex-col justify-center transition-all duration-700 ${
          cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } bg-gradient-to-br from-sky-900/10 to-emerald-900/10`}
      >
        <PartyPopper size={48} className="mx-auto mb-4 text-yellow-400" />
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">Manage Your Personal Finances</h1>
        <p className="text-sky-100 mb-6">Track your budget and spending, set goals, and stay in control of your money.</p>

        <div className="mb-4 relative">
          <User size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        <div className="mb-6 relative">
          <Lock size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleLogin}
          className="w-full bg-brand text-slate-100 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <div className="inline-block w-5 h-5 border-4 border-sky-200 border-t-yellow-400 rounded-full animate-spin" />
          ) : null}
          {loading ? 'Logging in...' : 'Log In'}
        </Button>

        <div className="mt-auto text-sky-100 text-sm cursor-pointer mt-6" onClick={() => router.push('/register')}>
          <span>New here? </span>
          <span className="text-yellow-400 font-semibold underline">Create an account</span>
        </div>
      </div>
    </div>
  );
}
