'use client';

import React, { useEffect, useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const ForgotPassword = () => {
  const t = useTranslations();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();

  useEffect(() => {
    try {
      const storedLang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
      setLang((storedLang === 'en' || storedLang === 'ar') ? storedLang : 'ar');
    } catch {
      setLang('ar');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessageType('success');
        setMessage(data.message || (lang === 'ar' ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.' : 'Password reset link sent to your email.'));
      } else {
        setMessageType('error');
        setMessage(data.message || (lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب.' : 'An error occurred while sending the request.'));
      }
    } catch (err) {
      setMessageType('error');
      setMessage(lang === 'ar' ? 'تعذر الاتصال بالخادم.' : 'Unable to reach the server.');
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
                <Mail className="w-8 h-8 text-white transform -rotate-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {lang === 'ar' ? 'نسيان كلمة المرور' : 'Forgot Password'}
              </h2>
              <p className="text-blue-200/80 text-sm">{lang === 'ar' ? 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور' : 'Enter your email to reset your password'}</p>
            </div>

            {/* النموذج */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* حقل البريد الإلكتروني */}
                <div className="relative">
                  <label className={`absolute right-4 transition-all duration-200 pointer-events-none ${
                    focusedField === 'email' || email 
                      ? 'top-2 text-xs text-orange-400' 
                      : 'top-4 text-base text-blue-200/60'
                  }`}>
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
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
                      dir="ltr"
                      style={{ textAlign: 'left' }}
                    />
                  </div>
                </div>

                {/* زر إرسال الطلب */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{lang === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send reset link'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* رسالة النتيجة */}
              {message && (
                <div className={`mt-4 p-4 rounded-lg border text-center text-sm animate-fade-in flex items-center justify-center gap-2 ${
                  messageType === 'success' 
                    ? 'bg-green-500/10 border-green-400/20 text-green-300' 
                    : 'bg-red-500/10 border-red-400/20 text-orange-300'
                }`}>
                  {messageType === 'success' && <CheckCircle className="w-5 h-5" />}
                  {message}
                </div>
              )}

              {/* رابط العودة */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center gap-2 text-blue-200/80 hover:text-orange-400 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </button>
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

export default ForgotPassword; 