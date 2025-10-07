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
  const [amount, setAmount] = useState<string>("");
  const [sendingPayment, setSendingPayment] = useState(false);
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
    // الاشتراك في SSE لتحديث فوري
    let es: EventSource | undefined;
    try {
      es = new EventSource(`/api/messages/stream?user1=${talentId}&user2=${userId}`);
      es.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          if (evt?.type === 'message') {
            setMessages(prev => {
              // تجنب التكرار
              if (prev.some(m => m.id === evt.payload.id)) return prev;
              const next = [...prev, evt.payload];
              // حد أعلى بسيط للذاكرة
              if (next.length > 500) next.shift();
              return next;
            });
          }
        } catch {}
      };
      es.onerror = () => {
        // fallback للتحديث الدوري عند انقطاع السيل
        fetchMessages();
      };
    } catch {}
    return () => {
      if (es) es.close();
    };
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

  // إرسال رابط الدفع (للموهبة)
  const sendPaymentRequest = async () => {
    if (sendingPayment) return;
    const base = Number(amount);
    if (!base || isNaN(base) || base <= 0) return;
    if (!currentUser || !otherUser) return;
    setSendingPayment(true);
    try {
      // فقط أرسل طلب الدفع للمستخدم لصفحة التأكيد
      const senderId = Number(currentUser?.id);
      const receiverId = Number(currentUser?.id == Number(talentId) ? userId : talentId);
      const content = `[PAYMENT_LINK]|${Math.round(base)}||`;
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, content })
      });
      setAmount("");
    } catch {
    } finally {
      setSendingPayment(false);
    }
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
            alt={otherUser?.name || 'صورة المستخدم'}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover border border-orange-400/60"
            loading="lazy"
          />
          <div>
            <div className="font-bold text-xl text-orange-300">{otherUser?.name || "..."}</div>
            <div className="text-blue-100 text-sm flex items-center gap-2">
              محادثة خاصة
              {messages.some(msg => msg.content.startsWith('[رسالة من الإدارة]:')) && (
                <span className="text-yellow-300 text-xs bg-yellow-400/20 px-2 py-1 rounded-full">
                  🏢 تحتوي على رسائل من الإدارة
                </span>
              )}
            </div>
          </div>
        </div>
        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{maxHeight:400}}>
          {loading ? (
            <div className="text-blue-100 text-center">جاري التحميل...</div>
          ) : messages.length === 0 ? (
            <div className="text-blue-200 text-center">لا توجد رسائل بعد.</div>
          ) : (
            <>
              {/* إشعار بوجود رسائل من الإدارة */}
              {messages.some(msg => msg.content.startsWith('[رسالة من الإدارة]:')) && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400/20 to-blue-500/20 border border-green-400/30 rounded-lg px-4 py-2">
                    <span className="text-green-400">🏢</span>
                    <span className="text-green-400 text-sm">هذه المحادثة تحتوي على ردود من إدارة المنصة</span>
                  </div>
                </div>
                            )}
              {messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                const isAdminMessage = typeof msg.content === 'string' && msg.content.startsWith('[رسالة من الإدارة]:');
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] ${isMe ? 'text-right' : 'text-left'}`}>
                      {/* محتوى الرسالة (مبسّط + دعم رابط الدفع) */}
                      {typeof msg.content === 'string' && msg.content.startsWith('[PAYMENT_LINK]|') ? (
                        (() => {
                          const parts = String(msg.content).split('|');
                          const amt = parts[1];
                          const payUrl = parts[2];
                          const svc = parts[3] || '';
                          const dt = parts[4] || '';
                          const method = parts[5] || '';
                          const clientId = currentUser?.id == Number(talentId) ? (otherUser?.id || '') : (currentUser?.id || '');
                          const confirmUrl = `/user/confirm-payment?amount=${encodeURIComponent(amt)}&service=${encodeURIComponent(svc)}&date=${encodeURIComponent(dt)}&method=${encodeURIComponent(method)}&talentId=${encodeURIComponent(String(talentId||''))}&clientId=${encodeURIComponent(String(clientId))}`;
                          return (
                            <div className="px-3 py-2 rounded-xl bg-emerald-700 text-white">
                              <div className="text-[11px] opacity-80 mb-1">رابط دفع من الموهبة</div>
                              <div className="text-base font-bold">المبلغ: {amt} ر.س</div>
                              {svc && <div className="text-sm opacity-90 mt-1">الخدمة: {svc}</div>}
                              {dt && <div className="text-sm opacity-90 mt-1">الموعد: {dt}</div>}
                              <a
                                href={confirmUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-md bg-emerald-50 text-emerald-800 text-sm font-bold border-2 border-emerald-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                style={{ WebkitAppearance: 'none', color: '#065f46', backgroundColor: '#ecfdf5', WebkitTextFillColor: '#065f46' }}
                              >
                                {/* بطاقة دفع SVG لضمان الظهور على سفاري */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#047857" strokeWidth="2" fill="none"/>
                                  <rect x="2" y="8" width="20" height="3" fill="#047857"/>
                                  <rect x="5" y="14" width="6" height="2" fill="#047857"/>
                                </svg>
                                <span>إتمام الدفع</span>
                              </a>
                              <div className="text-[10px] opacity-70 mt-1">أُرسل هذا الرابط من أجل إتمام الطلب</div>
                              <div className="text-[10px] opacity-60 mt-1">{new Date(msg.createdAt).toLocaleString("ar-EG")}</div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className={`px-3 py-2 rounded-xl font-medium ${
                          isAdminMessage
                            ? 'bg-green-600 text-white'
                            : isMe
                              ? 'bg-orange-600 text-white'
                              : 'bg-blue-800 text-blue-100'
                        }`}>
                          {/* اسم المرسل */}
                          <div className="text-[11px] mb-1 opacity-80">
                            {isAdminMessage ? 'إدارة المنصة' : (isMe ? myData?.name : otherData?.name)}
                          </div>
                          {/* محتوى الرسالة */}
                          <div className="text-base whitespace-pre-line break-words">
                            {isAdminMessage ? String(msg.content).replace('[رسالة من الإدارة]: ', '') : msg.content}
                          </div>
                          {/* الوقت */}
                          <div className="text-[10px] opacity-60 mt-1">
                            {new Date(msg.createdAt).toLocaleString("ar-EG")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* إرسال رابط الدفع (الموهبة فقط) */}
        {currentUser?.id == Number(talentId) && (
          <div className="flex gap-2 mt-2 mb-2">
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-40 px-3 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="المبلغ (ر.س)"
              disabled={sendingPayment}
            />
            <button
              onClick={sendPaymentRequest}
              disabled={sendingPayment || !amount}
              className="px-4 py-2 bg-emerald-600 rounded-lg text-white font-bold shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              إرسال للمستخدم للتأكيد
            </button>
          </div>
        )}

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
      {/* لم يعد هناك تأكيد من الموهبة؛ التأكيد يظهر لدى المستخدم */}
      {/* تحسينات Safari: خلفيات صلبة وتباين أعلى */}
      <style jsx>{`
        @supports (-webkit-touch-callout: none) {
          .bg-indigo-950\/80 { background-color: rgba(15, 23, 42, 0.95) !important; }
          .bg-blue-800 { background-color: #1e40af !important; }
          .bg-orange-600 { background-color: #ea580c !important; }
          .bg-green-600 { background-color: #16a34a !important; }
          .border-blue-400\/20 { border-color: rgba(96, 165, 250, 0.35) !important; }
        }
      `}</style>
    </div>
  );
} 