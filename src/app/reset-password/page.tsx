'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [focusedField, setFocusedField] = useState('');
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // يمكنك هنا التحقق من صحة الرمز إذا لزم الأمر
      setTokenValid(true);
    } else {
      setMessageType('error');
      setMessage('رابط غير صحيح. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.');
    }
    setCheckingToken(false);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('كلمة المرور وتأكيدها غير متطابقين.');
      return;
    }

    if (password.length < 6) {
      setMessageType('error');
      setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessageType('success');
        setMessage(data.message);
        // التوجيه إلى صفحة تسجيل الدخول بعد ثانيتين
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessageType('error');
        setMessage(data.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage('تعذر الاتصال بالخادم.');
    }
    
    setLoading(false);
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">رابط غير صحيح</h2>
            <p className="text-blue-200/80 mb-6">{message}</p>
            <button
              onClick={() => router.push('/forgot-password')}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl text-white font-semibold hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
            >
              طلب رابط جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                إعادة تعيين كلمة المرور
              </h2>
              <p className="text-blue-200/80 text-sm">أدخل كلمة المرور الجديدة</p>
            </div>

            {/* النموذج */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* حقل كلمة المرور الجديدة */}
                <div className="relative">
                  <label className={`absolute right-4 transition-all duration-200 pointer-events-none ${
                    focusedField === 'password' || password 
                      ? 'top-2 text-xs text-orange-400' 
                      : 'top-4 text-base text-blue-200/60'
                  }`}>
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-12 top-4 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-orange-400' : 'text-blue-200/60'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-20 pr-4 pt-6 pb-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      className="absolute left-4 top-4 text-blue-200/60 hover:text-orange-400 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* حقل تأكيد كلمة المرور */}
                <div className="relative">
                  <label className={`absolute right-4 transition-all duration-200 pointer-events-none ${
                    focusedField === 'confirmPassword' || confirmPassword 
                      ? 'top-2 text-xs text-orange-400' 
                      : 'top-4 text-base text-blue-200/60'
                  }`}>
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-12 top-4 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'confirmPassword' ? 'text-orange-400' : 'text-blue-200/60'
                    }`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-20 pr-4 pt-6 pb-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      className="absolute left-4 top-4 text-blue-200/60 hover:text-orange-400 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* زر إعادة تعيين كلمة المرور */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>إعادة تعيين كلمة المرور</span>
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
                  العودة لتسجيل الدخول
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

export default ResetPassword; 