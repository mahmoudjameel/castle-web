'use client';
import React, { useEffect, useState } from 'react';
// أزل استيراد react-icons

export default function TalentBookings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<any>({});
  const [updatingId, setUpdatingId] = useState<number|null>(null);
  const [socialLinks, setSocialLinks] = useState<any>({});

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        fetch(`/api/orders?talentId=${u.id}`)
          .then(res => res.json())
          .then(async data => {
            setOrders(Array.isArray(data) ? data : []);
            // جلب بيانات العملاء
            const clientIds = Array.from(new Set((data||[]).map((o:any)=>o.clientId)));
            if (clientIds.length > 0) {
              const res = await fetch('/api/accounts');
              const users = await res.json();
              const clientsMap: any = {};
              users.forEach((u:any) => { if (clientIds.includes(u.id)) clientsMap[u.id] = u; });
              setClients(clientsMap);
            }
            // جلب بيانات الموهبة نفسها (لروابط السوشيال)
            const res2 = await fetch(`/api/accounts?id=${u.id}`);
            const talents = await res2.json();
            let links = {};
            try { if (talents[0]?.socialLinks) links = JSON.parse(talents[0].socialLinks); } catch {}
            setSocialLinks(links);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setOrders(orders => orders.map(o => o.id === id ? { ...o, status } : o));
    setUpdatingId(null);
  };

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
      <div className="max-w-5xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-6 md:p-10 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">الحجوزات الواردة</h2>
        {loading ? (
          <div className="text-blue-100 text-center">جاري التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="text-blue-200 text-center">لا يوجد طلبات بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-center border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-900/60">
                  <th className="text-blue-200 font-bold py-3 rounded-tl-xl">اسم العميل</th>
                  <th className="text-blue-200 font-bold py-3">الخدمات المطلوبة</th>
                  <th className="text-blue-200 font-bold py-3">الموعد</th>
                  <th className="text-blue-200 font-bold py-3">الرسالة</th>
                  <th className="text-blue-200 font-bold py-3">الحالة</th>
                  <th className="text-blue-200 font-bold py-3">تاريخ الطلب</th>
                  <th className="text-blue-200 font-bold py-3 rounded-tr-xl">تتبع الطلب</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  let servicesArr = [];
                  try { servicesArr = JSON.parse(order.services); } catch {}
                  const client = clients[order.clientId];
                  return (
                    <tr key={order.id} className={idx%2===0?"bg-blue-900/30":"bg-blue-900/10"}>
                      <td className="py-3 font-bold text-orange-300">{client?.name || order.clientId}
                        {order.phone && <div className="text-blue-200 text-xs mt-1">📞 {order.phone}</div>}
                        {order.address && <div className="text-blue-200 text-xs">📍 {order.address}</div>}
                      </td>
                      <td>{servicesArr.map((srv:any,i:number)=>(<div key={i}>{srv.name} <span className="text-orange-400 font-bold">({srv.price} ر.س)</span></div>))}</td>
                      <td>{order.date||"-"}</td>
                      <td className="max-w-xs break-words">{order.message||"-"}</td>
                      <td>
                        <select
                          value={order.status}
                          disabled={updatingId===order.id}
                          onChange={e=>handleStatusChange(order.id, e.target.value)}
                          className="rounded-lg px-2 py-1 bg-blue-900/40 border border-blue-400/20 text-white"
                        >
                          <option value="new">جديد</option>
                          <option value="in_progress">قيد التنفيذ</option>
                          <option value="completed">مكتمل</option>
                          <option value="rejected">مرفوض</option>
                        </select>
                      </td>
                      <td>{order.createdAt?new Date(order.createdAt).toLocaleDateString("ar-EG"):"-"}</td>
                      <td>...</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 