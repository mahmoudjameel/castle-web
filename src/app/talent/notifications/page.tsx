'use client';
import React, { useEffect, useState } from 'react';

export default function TalentNotifications() {
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any>({});

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        // جلب الطلبات الجديدة
        fetch(`/api/orders?talentId=${u.id}`)
          .then(res => res.json())
          .then(async data => {
            const newOrders = (Array.isArray(data) ? data : []).filter((o:any)=>o.status==='new');
            setOrders(newOrders);
            // جلب بيانات العملاء
            const clientIds = Array.from(new Set((newOrders||[]).map((o:any)=>o.clientId)));
            if (clientIds.length > 0) {
              const res = await fetch('/api/accounts');
              const users = await res.json();
              const clientsMap: any = {};
              users.forEach((u:any) => { if (clientIds.includes(u.id)) clientsMap[u.id] = u; });
              setClients(clientsMap);
            }
          });
        // جلب إشعارات الرسائل الجديدة
        fetch(`/api/notifications?userId=${u.id}`)
          .then(res => res.json())
          .then(data => {
            setNotifications(Array.isArray(data) ? data.filter((n:any)=>!n.read) : []);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  // دالة لتحويل قيمة الموعد إلى نص عربي واضح
  const formatOrderDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const daysAr: Record<string, string> = {
      sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
    };
    const match = dateStr.match(/(\w+):(\d{2}:\d{2})-(\d{2}:\d{2})/);
    if (match) {
      const day = daysAr[match[1]] || match[1];
      return `${day} (${match[2]} - ${match[3]})`;
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-6 md:p-10 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">الإشعارات الجديدة</h2>
        {loading ? (
          <div className="text-blue-100 text-center">جاري التحميل...</div>
        ) : orders.length === 0 && notifications.length === 0 ? (
          <div className="text-blue-200 text-center">لا يوجد إشعارات جديدة حالياً.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* إشعارات الرسائل الجديدة */}
            {notifications.map((notif:any, idx:number) => (
              <div key={"notif-"+idx} className="bg-pink-900/40 rounded-xl border border-pink-400/20 shadow-md p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-pink-900/60 transition-all">
                <div className="flex-1">
                  <div className="font-bold text-pink-300 mb-1">{notif.title || 'محادثة جديدة'}</div>
                  <div className="text-pink-100 mb-1">{notif.body}</div>
                  <div className="text-xs text-pink-200">{new Date(notif.date).toLocaleString('ar-EG')}</div>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                  <span className="bg-pink-500 text-white text-xs font-bold rounded-full px-3 py-1">رسالة</span>
                </div>
              </div>
            ))}
            {/* إشعارات الطلبات الجديدة */}
            {orders.map((order, idx) => {
              let servicesArr = [];
              try { servicesArr = JSON.parse(order.services); } catch {}
              return (
                <div key={idx} className="bg-blue-900/40 rounded-xl border border-blue-400/20 shadow-md p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-blue-900/60 transition-all">
                  <div className="flex-1">
                    <div className="font-bold text-orange-300 mb-1">طلب جديد من: {clients[order.clientId]?.name || order.clientId}</div>
                    <div className="text-blue-100 mb-1">الخدمات المطلوبة:
                      <ul className="flex flex-wrap gap-2 mt-1">
                        {servicesArr.map((srv: any, i: number) => (
                          <li key={i} className="bg-orange-400/20 text-orange-400 font-bold rounded-lg px-2 py-1 text-xs">{srv.name} ({srv.price} ر.س)</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-blue-100 mb-1">الموعد: <span className="font-bold text-orange-200">{formatOrderDate(order.date)}</span></div>
                    <div className="text-blue-100 mb-1">الرسالة: <span className="bg-blue-900/30 rounded-lg px-2 py-1 text-white">{order.message || '-'}</span></div>
                  </div>
                  <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <div className="text-xs text-blue-300">تاريخ الطلب</div>
                    <div className="font-bold text-blue-100">{order.createdAt?.slice(0,10)}</div>
                    <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-3 py-1 mt-2">طلب</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 