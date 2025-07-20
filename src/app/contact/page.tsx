'use client';

import { Mail, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">تواصل معنا</h1>
        <p className="text-lg text-blue-100 mb-8">لأي استفسار أو دعم، يمكنك التواصل معنا عبر النموذج أو المعلومات التالية.</p>
      </div>
      <div className="max-w-2xl mx-auto bg-indigo-800/30 rounded-xl p-8 border border-blue-400/30 mb-8">
        <form className="space-y-6">
          <div>
            <label className="block mb-2 text-blue-100">الاسم</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="اسمك" required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">البريد الإلكتروني</label>
            <input type="email" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="example@email.com" required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">رسالتك</label>
            <textarea className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" rows={4} placeholder="اكتب رسالتك هنا..." required />
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all">إرسال</button>
        </form>
      </div>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-8 text-blue-100">
          <div className="flex items-center gap-2 justify-center">
            <Mail className="text-orange-400" />
            info@tawq.sa
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Phone className="text-orange-400" />
            +966 12 345 6789
          </div>
        </div>
      </div>
    </div>
  );
} 