'use client';

import React, { useState } from 'react';
import { User, Star, Mail, Lock, UserPlus, CheckCircle, ArrowRight } from 'lucide-react';
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
  const [focusedField, setFocusedField] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setMessage(t('auth.termsRequired'));
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowSuccessModal(true);
        setName(''); setEmail(''); setPassword('');
        setAcceptedTerms(false);
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* خلفية مؤثرات بصرية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-400/8 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-400/8 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400/8 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-purple-400/8 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* البطاقة الرئيسية */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* الهيدر */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                <UserPlus className="w-8 h-8 text-white transform -rotate-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('auth.registerTitle')}
              </h2>
              <p className="text-blue-200/80 text-sm">{t('auth.createNewAccount')}</p>
            </div>

            {/* اختيار نوع الحساب */}
            <div className="px-8 pb-6">
              <div className="flex gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setRole('user')} 
                  className={`flex-1 flex flex-col items-center px-4 py-4 rounded-xl transition-all duration-300 ${
                    role === 'user' 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105' 
                      : 'text-blue-200/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className={`w-6 h-6 mb-2 transition-transform duration-300 ${role === 'user' ? 'scale-110' : ''}`} />
                  <span className="text-sm font-semibold">{t('auth.user')}</span>
                </button>
                <button 
                  onClick={() => setRole('talent')} 
                  className={`flex-1 flex flex-col items-center px-4 py-4 rounded-xl transition-all duration-300 ${
                    role === 'talent' 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105' 
                      : 'text-blue-200/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Star className={`w-6 h-6 mb-2 transition-transform duration-300 ${role === 'talent' ? 'scale-110' : ''}`} />
                  <span className="text-sm font-semibold">{t('auth.talent')}</span>
                </button>
              </div>
            </div>

            {/* النموذج */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* حقل الاسم */}
                <div className="relative">
                  <label className={`absolute right-4 transition-all duration-200 pointer-events-none ${
                    focusedField === 'name' || name 
                      ? 'top-2 text-xs text-orange-400' 
                      : 'top-4 text-base text-blue-200/60'
                  }`}>
                    {t('auth.fullName')}
                  </label>
                  <div className="relative">
                    <User className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'name' ? 'text-orange-400' : 'text-blue-200/60'
                    }`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-12 pr-4 pt-6 pb-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* حقل البريد الإلكتروني */}
                <div className="relative">
                  <label className={`absolute right-4 transition-all duration-200 pointer-events-none ${
                    focusedField === 'email' || email 
                      ? 'top-2 text-xs text-orange-400' 
                      : 'top-4 text-base text-blue-200/60'
                  }`}>
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'email' ? 'text-orange-400' : 'text-blue-200/60'
                    }`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-12 pr-4 pt-6 pb-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* حقل كلمة المرور */}
                <div className="relative">
                  <label className={`absolute right-4 transition-all duration-200 pointer-events-none ${
                    focusedField === 'password' || password 
                      ? 'top-2 text-xs text-orange-400' 
                      : 'top-4 text-base text-blue-200/60'
                  }`}>
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-orange-400' : 'text-blue-200/60'
                    }`} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-12 pr-4 pt-6 pb-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* الموافقة على الشروط */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-orange-400 bg-white/5 border border-white/10 rounded focus:ring-orange-400/50 focus:ring-2"
                  />
                  <label htmlFor="terms" className="text-sm text-blue-200/80 leading-relaxed cursor-pointer">
                    {t('auth.termsText')}
                  </label>
                </div>

                {/* زر التسجيل */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`group w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-500/50 opacity-60 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600'
                  }`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{t('auth.registerBtn')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* رسالة النجاح/الخطأ */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg border text-center text-sm animate-fade-in ${
                  message.includes('success') || message.includes('نجح') 
                    ? 'bg-green-500/10 border-green-400/20 text-green-300' 
                    : 'bg-red-500/10 border-red-400/20 text-orange-300'
                }`}>
                  {message}
                </div>
              )}

              {/* رابط تسجيل الدخول */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-blue-200/60 text-sm">{t('auth.or')}</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                <p className="text-blue-200/80 text-sm">
                  {t('auth.alreadyHaveAccount')}
                  <a 
                    href="/login" 
                    className="text-orange-400 hover:text-pink-400 font-semibold mr-2 transition-colors duration-200 hover:underline"
                  >
                    {t('auth.goToLogin')}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* النقاط الزخرفية */}
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-orange-400/40 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400/40 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-blue-400/40 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>

      {/* موديل النجاح */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* خلفية داكنة */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          ></div>
          
          {/* محتوى الموديل */}
          <div className="relative w-full max-w-md mx-auto modal-fade-in">
            <div className="relative bg-gradient-to-br from-indigo-900/95 to-purple-900/95 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              {/* الهيدر */}
              <div className="px-8 pt-8 pb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {t('auth.successTitle')}
                </h3>
                <p className="text-blue-200/80 text-sm">
                  {t('auth.successMessage')}
                </p>
              </div>
              
              {/* الأزرار */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/login');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <span>{t('auth.continueToLogin')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Register;