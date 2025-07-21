"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// تعريف الأنواع
interface Order {
  id: number;
  services: string;
  status: string;
  date?: string;
  message?: string;
}

export default function UserOrdersPage() {
  const [user, setUser] = useState<{id: number; name: string} | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetch(`/api/orders?userId=${u.id}`)
        .then((res) => res.json())
        .then((data) => setOrders(data || []));
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟")) return;
    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setOrders(orders.filter(o => o.id !== id));
      setDeleteMsg("تم حذف الطلب بنجاح.");
      setTimeout(()=>setDeleteMsg(""), 4000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <div className="bg-indigo-950/80 p-8 rounded-2xl shadow-lg border border-blue-400/20">
          <div className="text-2xl font-bold mb-4">يرجى تسجيل الدخول أولاً</div>
          <a href="/login" className="text-orange-400 hover:underline font-bold">تسجيل دخول</a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4 flex flex-col items-center">
      <button onClick={() => router.push('/user')} className="self-start mb-6 flex items-center gap-2 text-orange-400 hover:underline font-bold"><ArrowRight size={20}/> رجوع</button>
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-900/80 to-indigo-950/90 rounded-2xl shadow-xl border border-blue-400/30 p-8">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList size={28} className="text-orange-400" />
          <span className="text-2xl font-bold text-orange-400">طلباتي</span>
        </div>
        {deleteMsg && <div className="mb-4 bg-green-700/80 text-white px-4 py-2 rounded-lg text-center font-bold">{deleteMsg}</div>}
        {orders.length === 0 ? (
          <div className="text-blue-200">لا توجد طلبات بعد.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="p-4 rounded-xl bg-blue-900/40 border border-blue-400/20 flex flex-col gap-2 shadow-md min-h-[160px] break-words overflow-hidden relative group">
                <button onClick={()=>handleDelete(order.id)} title="حذف الطلب" className="absolute top-2 left-2 text-red-400 hover:text-red-600 bg-white/10 rounded-full p-1 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 size={18}/></button>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold">الخدمة:</span>
                  <span className="text-orange-300 font-semibold truncate max-w-[70%]">{(() => { try { return JSON.parse(order.services).map((srv: Record<string, unknown>)=>srv.name).join('، '); } catch { return '-'; } })()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
                  <span className="text-blue-200">الحالة:</span>
                  <span className="font-bold text-orange-400">{
                    (() => {
                      if (order.status === 'new') return 'جديد';
                      if (order.status === 'in_progress') return 'قيد التنفيذ';
                      if (order.status === 'completed') return 'مكتمل';
                      if (order.status === 'rejected') return 'مرفوض';
                      return order.status || 'جديد';
                    })()
                  }</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-blue-100 mb-1">
                  <span>بتاريخ:</span>
                  <span>{order.date || '-'}</span>
                </div>
                {order.message && (
                  <div className="text-blue-200 text-xs mt-1 bg-blue-900/30 rounded-lg px-2 py-1 max-h-24 overflow-y-auto whitespace-pre-line break-words" style={{wordBreak:'break-word'}}>
                    <span className="font-bold text-orange-300">رسالة:</span> {order.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 