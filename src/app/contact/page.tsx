'use client';

import { Mail, Phone } from 'lucide-react';
import React, { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setStatus('error');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">تواصل معنا</h1>
        <p className="text-lg text-blue-100 mb-8">لأي استفسار أو دعم، يمكنك التواصل معنا عبر النموذج أو المعلومات التالية.</p>
      </div>
      <div className="max-w-2xl mx-auto bg-indigo-800/30 rounded-xl p-8 border border-blue-400/30 mb-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block mb-2 text-blue-100">الاسم</label>
            <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="اسمك" required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">البريد الإلكتروني</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="example@email.com" required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">رسالتك</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" rows={4} placeholder="اكتب رسالتك هنا..." required />
          </div>
          <button disabled={status==='loading'} type="submit" className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60">{status==='loading' ? 'جارٍ الإرسال...' : 'إرسال'}</button>
          {status==='success' && <div className="mt-3 text-green-300">تم إرسال رسالتك بنجاح.</div>}
          {status==='error' && <div className="mt-3 text-red-300">حدث خطأ أثناء الإرسال. حاول مرة أخرى.</div>}
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