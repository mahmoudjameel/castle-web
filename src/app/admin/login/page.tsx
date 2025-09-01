'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          loginMethod: 'email' 
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.user) {
        // التحقق من أن المستخدم مدير
        if (data.user.role !== 'admin') {
          setMessage('هذا الحساب ليس لديه صلاحيات المدير');
          return;
        }
        
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        router.push('/admin');
      } else {
        setMessage(data.message || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setMessage('تعذر الاتصال بالخادم.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
      <div className="w-full max-w-md bg-indigo-950/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">تسجيل دخول الإدارة</h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-blue-100">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200/60" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" 
                placeholder="admin@email.com" 
                required 
              />
            </div>
          </div>
          
          <div className="relative">
            <label className="block mb-2 text-blue-100">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200/60" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" 
                placeholder="••••••••" 
                required 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-orange-400 transition-colors" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'دخول'
            )}
          </button>
        </form>

        {/* رسالة الخطأ */}
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-orange-300 text-center text-sm">
            {message}
          </div>
        )}

        {/* معلومات تسجيل الدخول */}
        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-400/20">
          <h3 className="text-sm font-semibold text-blue-200 mb-2">بيانات تسجيل الدخول للتجربة:</h3>
          <div className="text-xs text-blue-300 space-y-1">
            <div>📧 admin@admin</div>
            <div>🔑 admin</div>
            <div>📧 a@a.com</div>
            <div>🔑 123456</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 