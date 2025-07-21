"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// تعريف واجهة المحادثة
interface Conversation {
  userId: number;
  name: string;
  profileImageData?: string;
  unreadCount?: number;
}

export default function TalentChats() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // جلب بيانات الموهبة من localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        fetch(`/api/messages?talentId=${u.id}`)
          .then(res => res.json())
          .then(data => setConversations(Array.isArray(data) ? data : []))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">المحادثات</h2>
        {loading ? (
          <div className="text-blue-100 text-center">جاري التحميل...</div>
        ) : conversations.length === 0 ? (
          <div className="text-blue-200 text-center">لا توجد محادثات بعد.</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            {conversations.map((conv) => (
              <div key={conv.userId} className="flex items-center justify-between bg-blue-900/40 rounded-lg px-6 py-4 border border-blue-400/20 hover:bg-blue-900/60 transition-all cursor-pointer min-h-[80px]" onClick={() => {
                router.push(`/chat/${user?.id}?userId=${conv.userId}`);
              }}>
                <div className="flex items-center gap-4">
                  <Image
                    src={conv.profileImageData ? `data:image/png;base64,${conv.profileImageData}` : "/logo.png"}
                    alt={conv.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-400 mr-2"
                  />
                  <div>
                    <div className="font-bold text-lg text-orange-300">{conv.name}</div>
                    {conv.unreadCount ? (
                      <div className="text-xs text-pink-300 font-bold">({conv.unreadCount} رسالة جديدة)</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 