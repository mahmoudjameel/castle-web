"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const talentId = params?.talentId;
  const userId = searchParams.get("userId");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch {}
  }, []);

  // جلب بيانات الطرف الآخر
  useEffect(() => {
    if (!talentId || !userId || !currentUser) return;
    // إذا كان المستخدم الحالي هو الموهبة
    if (currentUser.id == talentId) {
      // اجلب بيانات المستخدم العادي
      fetch(`/api/accounts?id=${userId}`)
        .then(res => res.json())
        .then(data => setOtherUser(Array.isArray(data) ? data[0] : data));
    } else {
      // اجلب بيانات الموهبة
      fetch(`/api/accounts?id=${talentId}`)
        .then(res => res.json())
        .then(data => setOtherUser(Array.isArray(data) ? data[0] : data));
    }
  }, [talentId, userId, currentUser]);

  // جلب الرسائل
  const fetchMessages = () => {
    if (!talentId || !userId) return;
    fetch(`/api/messages?user1=${talentId}&user2=${userId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false); // تأكد من تعيينها دومًا
      });
  };
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [talentId, userId]);

  // بعد جلب الرسائل، إذا كان هناك رسائل غير مقروءة للطرف الحالي، أرسل PATCH لتحديثها
  useEffect(() => {
    if (!messages.length || !currentUser) return;
    // حدد الرسائل غير المقروءة للطرف الحالي
    const unread = messages.filter(msg => msg.receiverId === currentUser.id && !msg.isRead);
    if (unread.length > 0) {
      unread.forEach(msg => {
        fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: msg.id, isRead: true })
        });
      });
    }
  }, [messages, currentUser]);

  // تمرير للرسائل الأخيرة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة
  const handleSend = async () => {
    const senderId = Number(currentUser?.id);
    const receiverId = Number(currentUser?.id == Number(talentId) ? userId : talentId);
    if (!input.trim() || !senderId || !receiverId) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId,
        receiverId,
        content: input.trim(),
      }),
    });
    const data = await res.json();
    console.log(data); // لمراقبة أي خطأ من الـ API
    setMessages(prev => [...prev, data]); // أضف الرسالة الجديدة مباشرة
    setLoading(false); // عيّن التحميل إلى false بعد الإرسال
    setInput("");
    setSending(false);
    fetchMessages();
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-[60vh] text-blue-200">يجب تسجيل الدخول لعرض المحادثة.</div>;
  }

  // جلب بيانات الطرفين
  const isTalent = currentUser.id == talentId;
  const myData = isTalent ? currentUser : otherUser;
  const otherData = isTalent ? otherUser : currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-8 px-2 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-indigo-950/80 rounded-2xl shadow-lg p-6 border border-blue-400/20 flex flex-col" style={{minHeight:500}}>
        {/* رأس المحادثة */}
        <div className="flex items-center gap-4 mb-6 border-b border-blue-400/20 pb-4">
          <Image
            src={otherUser?.profileImageData ? `data:image/png;base64,${otherUser.profileImageData}` : "/logo.png"}
            alt={otherUser?.name}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover border-2 border-orange-400"
          />
          <div>
            <div className="font-bold text-xl text-orange-300">{otherUser?.name || "..."}</div>
            <div className="text-blue-100 text-sm">محادثة خاصة</div>
          </div>
        </div>
        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4" style={{maxHeight:400}}>
          {loading ? (
            <div className="text-blue-100 text-center">جاري التحميل...</div>
          ) : messages.length === 0 ? (
            <div className="text-blue-200 text-center">لا توجد رسائل بعد.</div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Image
                      src={(isMe ? myData?.profileImageData : otherData?.profileImageData) ? `data:image/png;base64,${isMe ? myData?.profileImageData : otherData?.profileImageData}` : "/logo.png"}
                      alt={isMe ? myData?.name : otherData?.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-400"
                    />
                    <div className={`px-4 py-2 rounded-2xl shadow ${isMe ? 'bg-gradient-to-l from-orange-400 to-pink-500 text-white' : 'bg-blue-900/60 text-blue-100'} font-bold`}>
                      <div className="text-sm mb-1">{isMe ? myData?.name : otherData?.name}</div>
                      <div className="text-base whitespace-pre-line break-words">{msg.content}</div>
                      <div className="text-xs text-blue-200 mt-1 text-left opacity-70">{new Date(msg.createdAt).toLocaleString("ar-EG")}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* إدخال الرسالة */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200"
            placeholder="اكتب رسالتك هنا..."
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
} 