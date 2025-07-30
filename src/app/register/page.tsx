'use client';

import React, { useState } from 'react';
import { User, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Register = () => {
  const t = useTranslations();
  const [role, setRole] = useState('talent');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false); // for talent
  const [userAgreed, setUserAgreed] = useState(false); // for user
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Map role to uppercase for backend
      const backendRole = role === 'user' ? 'USER' : role === 'talent' ? 'TALENT' : role;
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: backendRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(role === 'user' ? t('auth.userRegisteredSuccess') : t('auth.talentRegisteredSuccess'));
        setName(''); setEmail(''); setPassword('');
        setTimeout(() => {
          router.push('/login');
        }, 1200);
      } else {
        setMessage(data.message || t('auth.registrationError'));
      }
    } catch (err) {
      setMessage(t('auth.serverConnectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
      <div className="w-full max-w-lg bg-indigo-950/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('auth.registerTitle')}</h2>
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setRole('user')} className={`flex flex-col items-center px-6 py-3 rounded-lg border-2 transition-all ${role === 'user' ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 'border-blue-400/30 bg-blue-900/40 text-blue-100 hover:border-orange-400'}`}>
            <User className="mb-1" />
            {t('auth.user')}
          </button>
          <button onClick={() => setRole('talent')} className={`flex flex-col items-center px-6 py-3 rounded-lg border-2 transition-all ${role === 'talent' ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 'border-blue-400/30 bg-blue-900/40 text-blue-100 hover:border-orange-400'}`}>
            <Star className="mb-1" />
            {t('auth.talent')}
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-blue-100">{t('auth.fullName')}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('auth.fullNamePlaceholder')} required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('auth.emailPlaceholder')} required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">{t('auth.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('auth.passwordPlaceholder')} required />
          </div>
          {/* Agreements for talent and user */}
          {role === 'talent' && (
            <div className="bg-blue-900/30 border border-blue-400/20 rounded-lg p-4 mb-2">
              <div className="font-bold text-orange-400 mb-2">اتفاقية وشروط التسجيل للموهبة:</div>
              <ul className="list-disc pr-5 text-sm text-blue-100 space-y-1 mb-2">
                <li>يتم خصم <span className="text-orange-400 font-bold">30%</span> من قيمة كل عملية بيع لصالح المنصة.</li>
                <li>يجب الالتزام بجودة الخدمة المقدمة للعميل.</li>
                <li>يمنع التواصل خارج المنصة بشأن الطلبات.</li>
                <li>يحق للمنصة إيقاف الحساب في حال مخالفة الشروط.</li>
                <li>أي شروط أخرى تراها المنصة ضرورية سيتم إعلامك بها.</li>
              </ul>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="accent-orange-400 w-5 h-5" />
                <span className="text-blue-100 text-sm">أوافق على جميع الشروط والأحكام أعلاه</span>
              </label>
            </div>
          )}
          {role === 'user' && (
            <div className="bg-blue-900/30 border border-blue-400/20 rounded-lg p-4 mb-2">
              <div className="font-bold text-orange-400 mb-2">اتفاقية وشروط التسجيل للمستخدم:</div>
              <ul className="list-disc pr-5 text-sm text-blue-100 space-y-1 mb-2">
                <li>يتم فرض ضريبة بنسبة <span className="text-orange-400 font-bold">15%</span> على قيمة المبلغ المدفوع.</li>
                <li>يجب الالتزام باستخدام المنصة بشكل قانوني وعدم إساءة الاستخدام.</li>
                <li>يحق للمنصة إيقاف الحساب في حال مخالفة الشروط.</li>
                <li>أي شروط أخرى تراها المنصة ضرورية سيتم إعلامك بها.</li>
              </ul>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" checked={userAgreed} onChange={e => setUserAgreed(e.target.checked)} className="accent-orange-400 w-5 h-5" />
                <span className="text-blue-100 text-sm">أوافق على جميع الشروط والأحكام أعلاه</span>
              </label>
            </div>
          )}
          <button type="submit" disabled={loading || (role === 'talent' ? !agreed : role === 'user' ? !userAgreed : false)} className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">{loading ? t('auth.registering') : t('auth.registerBtn')}</button>
        </form>
        {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
        <div className="mt-6 text-center">
          <span className="text-blue-200">{t('auth.alreadyHaveAccount')} </span>
          <a href="/login" className="text-orange-400 hover:underline font-bold">{t('auth.goToLogin')}</a>
        </div>
      </div>
    </div>
  );
};

export default Register; 