'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Login = () => {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        // التوجيه حسب الدور
        if (data.user.role === 'talent') {
          router.push('/talent');
        } else if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'user') {
          router.push('/user');
        } else {
          router.push('/');
        }
      } else {
        setMessage(data.message || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      setMessage('تعذر الاتصال بالخادم.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
      <div className="w-full max-w-md bg-indigo-950/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('auth.loginTitle')}</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-blue-100">{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('auth.emailPlaceholder')} required />
          </div>
          <div className="relative">
            <label className="block mb-2 text-blue-100">{t('auth.password')}</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('auth.passwordPlaceholder')} required />
            <button type="button" className="absolute top-9 left-3 text-blue-200" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">{loading ? t('auth.loggingIn') : t('auth.loginBtn')}</button>
        </form>
        {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
        <div className="mt-6 text-center">
          <span className="text-blue-200">{t('auth.noAccount')} </span>
          <a href="/register" className="text-orange-400 hover:underline font-bold">{t('auth.goToRegister')}</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 