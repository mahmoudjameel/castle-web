'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Login = () => {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [focusedField, setFocusedField] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من وجود بيانات الدخول
    if (loginMethod === 'email' && !email) {
      setMessage('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (loginMethod === 'phone' && !phone) {
      setMessage('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!password) {
      setMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const loginData = loginMethod === 'email' 
        ? { email, password, loginMethod }
        : { phone, password, loginMethod };
        
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // تأخير قصير لضمان حفظ cookies
        setTimeout(() => {
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
        }, 100);
      } else {
        setMessage(data.message || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      setMessage('تعذر الاتصال بالخادم.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* خلفية مؤثرات بصرية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* البطاقة الرئيسية */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* الهيدر */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                <Lock className="w-8 h-8 text-white transform -rotate-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('auth.loginTitle')}
              </h2>
              <p className="text-blue-200/80 text-sm">{t('auth.welcomeBack')}</p>
            </div>

            {/* اختيار طريقة الدخول */}
            <div className="px-8 pb-6">
              <div className="flex gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setLoginMethod('email')} 
                  className={`flex-1 flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                    loginMethod === 'email' 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105' 
                      : 'text-blue-200/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className={`w-5 h-5 mb-1 transition-transform duration-300 ${loginMethod === 'email' ? 'scale-110' : ''}`} />
                  <span className="text-xs font-semibold">البريد الإلكتروني</span>
                </button>
                <button 
                  onClick={() => setLoginMethod('phone')} 
                  className={`flex-1 flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                    loginMethod === 'phone' 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105' 
                      : 'text-blue-200/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Phone className={`w-5 h-5 mb-1 transition-transform duration-300 ${loginMethod === 'phone' ? 'scale-110' : ''}`} />
                  <span className="text-xs font-semibold">رقم الهاتف</span>
                </button>
              </div>
            </div>

            {/* النموذج */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* حقل البريد الإلكتروني أو رقم الهاتف */}
                <div className="relative">
                  <label className="block text-sm font-medium text-blue-200/80 mb-2 text-right">
                    {loginMethod === 'email' ? t('auth.email') : 'رقم الهاتف'}
                  </label>
                  <div className="relative">
                    {loginMethod === 'email' ? (
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200/60" />
                    ) : (
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200/60" />
                    )}
                    <input
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      value={loginMethod === 'email' ? email : phone}
                      onChange={(e) => loginMethod === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)}
                      onFocus={() => setFocusedField('loginField')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 text-right placeholder:text-blue-200/40 placeholder:text-sm"
                      placeholder={loginMethod === 'email' ? 'example@email.com' : '+966 50 123 4567'}
                      required
                      dir={loginMethod === 'email' ? 'ltr' : 'ltr'}
                    />
                  </div>
                </div>

                {/* حقل كلمة المرور */}
                <div className="relative">
                  <label className="block text-sm font-medium text-blue-200/80 mb-2 text-right">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-20 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 text-right placeholder:text-blue-200/40 placeholder:text-sm"
                      required
                      placeholder="أدخل كلمة المرور"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200/60 hover:text-orange-400 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* رابط نسيان كلمة المرور */}
                <div className="text-right">
                  <a 
                    href="/forgot-password" 
                    className="text-orange-400 hover:text-pink-400 text-sm transition-colors duration-200 hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </a>
                </div>

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{t('auth.loginBtn')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* رسالة الخطأ */}
              {message && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-orange-300 text-center text-sm animate-fade-in">
                  {message}
                </div>
              )}

              {/* رابط التسجيل */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-blue-200/60 text-sm">{t('auth.or')}</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                <p className="text-blue-200/80 text-sm">
                  {t('auth.noAccount')}
                  <a 
                    href="/register" 
                    className="text-orange-400 hover:text-pink-400 font-semibold mr-2 transition-colors duration-200 hover:underline"
                  >
                    {t('auth.goToRegister')}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* إضافة بعض التفاصيل الجمالية */}
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-orange-400/40 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400/40 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-blue-400/40 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>

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

export default Login;