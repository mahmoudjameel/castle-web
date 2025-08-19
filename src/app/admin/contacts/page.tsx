"use client";

import React, { useEffect, useState } from 'react';
import { Mail, User, Calendar, MessageSquare } from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/contact')
      .then(res => res.json())
      .then((data: ContactMessage[]) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-purple-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">تواصلات واستفسارات</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-blue-200">لا توجد رسائل حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-400" />
                    <span className="font-semibold">{msg.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-200 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(msg.createdAt).toLocaleString('ar-SA')}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-200 mb-3">
                  <Mail className="w-4 h-4" />
                  <a className="hover:text-orange-400" href={`mailto:${msg.email}`}>{msg.email}</a>
                </div>
                <div className="flex items-start gap-2 text-blue-100 bg-white/5 rounded-xl p-3 border border-white/10">
                  <MessageSquare className="w-4 h-4 text-pink-400 mt-0.5" />
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

