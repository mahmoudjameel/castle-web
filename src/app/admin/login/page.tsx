'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يمكن إضافة تحقق فعلي لاحقاً
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
      <div className="w-full max-w-md bg-indigo-950/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">تسجيل دخول الإدارة</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-blue-100">اسم المستخدم أو البريد الإلكتروني</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="admin@email.com" required />
          </div>
          <div className="relative">
            <label className="block mb-2 text-blue-100">كلمة المرور</label>
            <input type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="••••••••" required />
            <button type="button" className="absolute top-9 left-3 text-blue-200" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all">دخول</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 