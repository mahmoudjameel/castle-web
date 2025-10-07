"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function UserChats() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        fetch(`/api/messages?userId=${u.id}`)
          .then(res => res.json())
          .then(data => setConversations(data))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  // فتح محادثة تلقائياً إذا وصل openWith
  useEffect(() => {
    const openWith = searchParams?.get('openWith');
    if (!openWith || !user) return;
    router.push(`/chat/${openWith}?userId=${(user as any).id}`);
  }, [searchParams, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">المحادثات</h2>
        {loading ? (
          <div className="text-blue-100 text-center">جاري التحميل...</div>
        ) : conversations.length === 0 ? (
          <div className="text-blue-200 text-center">لا توجد محادثات بعد.</div>
        ) : (
          <div className="space-y-4">
            {conversations.map(conv => (
              <div key={String((conv as { userId: string | number }).userId)} className="flex items-center justify-between bg-blue-900/40 rounded-lg px-6 py-4 border border-blue-400/20 hover:bg-blue-900/60 transition-all cursor-pointer" onClick={() => {
                router.push(`/chat/${(conv as { userId: string | number }).userId}?userId=${user?.id}`);
              }}>
                <div className="flex items-center gap-4">
                  <Image
                    src={(conv as { profileImageData?: string }).profileImageData ? `data:image/png;base64,${(conv as { profileImageData: string }).profileImageData}` : "/logo.png"}
                    alt={String((conv as { name?: string }).name || '')}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
                  />
                  <div>
                    <div className="font-bold text-lg text-orange-300">{String((conv as { name?: string }).name || '')}</div>
                    <div className="text-blue-100 text-sm">{String((conv as { lastMessage?: string }).lastMessage || '')}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-blue-200">{String((conv as { lastDate?: string }).lastDate || '')}</div>
                  {Number((conv as { unreadCount?: number }).unreadCount) > 0 && (
                    <span className="inline-block bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5 mt-1 animate-bounce">{String((conv as { unreadCount?: number }).unreadCount)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 