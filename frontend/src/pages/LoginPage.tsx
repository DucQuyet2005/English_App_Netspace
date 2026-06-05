import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onSwitch: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitch }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setError('');
  };

  return (
    <div className="w-full max-w-md rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-900/5 p-8 sm:p-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
          <LogIn className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email</label>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3">
            <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mật khẩu</label>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3">
            <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Đăng nhập ngay
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Chưa có tài khoản?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-2">
          Đăng ký
          <UserPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};