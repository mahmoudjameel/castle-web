"use client";

import { useEffect, useState } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'new', label: 'جديد' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'rejected', label: 'مرفوض' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('فشل في جلب الطلبات');
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب؟')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في حذف الطلب');
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-10 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center">إدارة الطلبات</h1>
        {/* تصفية حسب الحالة */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <label className="font-bold text-blue-100">تصفية حسب الحالة:</label>
          <select
            className="rounded-lg px-4 py-2 border border-blue-300 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 font-bold"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ backgroundColor: 'white', color: '#171717' }}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={opt.value === statusFilter ? { background: 'white', color: '#171717', fontWeight: 'bold' } : {}}>{opt.label}</option>
            ))}
          </select>
        </div>
        {loading && <div className="text-center text-blue-200">جاري التحميل...</div>}
        {error && <div className="text-center text-red-400 font-bold">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-blue-400/20 bg-white/90 backdrop-blur-md">
            <table className="min-w-full text-right text-blue-900">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100">
                <tr>
                  <th className="py-3 px-4 font-bold text-blue-900">#</th>
                  <th className="py-3 px-4 font-bold text-blue-900">المستخدم</th>
                  <th className="py-3 px-4 font-bold text-blue-900">صاحب الموهبة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الخدمات</th>
                  <th className="py-3 px-4 font-bold text-blue-900">المبلغ</th>
                  <th className="py-3 px-4 font-bold text-blue-900">تاريخ البداية</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الحالة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">تفاصيل</th>
                  <th className="py-3 px-4 font-bold text-blue-900">حذف</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr key={order.id} className="border-b border-blue-100 hover:bg-blue-50/60 transition">
                    <td className="py-2 px-4 font-bold text-blue-700">{order.id}</td>
                    <td className="py-2 px-4">{order.client?.name || order.clientId}</td>
                    <td className="py-2 px-4">{order.talent?.name || order.talentId}</td>
                    <td className="py-2 px-4 text-xs">
                      {order.services && Array.isArray(JSON.parse(order.services)) ? (
                        <ul className="list-disc pr-3 space-y-1">
                          {JSON.parse(order.services).map((srv: any, i: number) => (
                            <li key={i} className="text-blue-900/90">{srv.name} <span className="text-orange-500 font-bold">({srv.price} ر.س)</span></li>
                          ))}
                        </ul>
                      ) : order.services}
                    </td>
                    <td className="py-2 px-4 font-bold text-orange-600">
                      {order.services && Array.isArray(JSON.parse(order.services))
                        ? JSON.parse(order.services).reduce((sum: number, s: any) => sum + Number(s.price || 0), 0)
                        : '-'}
                    </td>
                    <td className="py-2 px-4">{order.date || order.createdAt?.slice(0, 10)}</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition text-xs font-bold"
                        onClick={() => setSelectedOrder(order)}
                      >عرض</button>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className={`bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition text-xs font-bold flex items-center gap-1 ${deletingId === order.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => handleDelete(order.id)}
                        disabled={deletingId === order.id}
                        title="حذف الطلب"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* نافذة التفاصيل */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative text-blue-900">
              <button
                className="absolute top-3 left-3 text-red-500 font-bold text-2xl"
                onClick={() => setSelectedOrder(null)}
                aria-label="إغلاق"
              >×</button>
              <h2 className="text-2xl font-bold mb-4 text-blue-900 text-center">تفاصيل الطلب #{selectedOrder.id}</h2>
              <div className="mb-4">
                <h3 className="font-bold text-blue-700 mb-2">بيانات المستخدم (العميل):</h3>
                <div className="mb-1">الاسم: <span className="font-bold text-blue-900">{selectedOrder.client?.name || '-'}</span></div>
                <div className="mb-1">الإيميل: <span className="font-bold text-blue-900">{selectedOrder.client?.email || '-'}</span></div>
                <div className="mb-1">رقم الهاتف: <span className="font-bold text-blue-900">{selectedOrder.client?.phone || '-'}</span></div>
                <div className="mb-1">العنوان: <span className="font-bold text-blue-900">{selectedOrder.address || selectedOrder.client?.address || '-'}</span></div>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-indigo-700 mb-2">بيانات صاحب الموهبة:</h3>
                <div className="mb-1">الاسم: <span className="font-bold text-blue-900">{selectedOrder.talent?.name || '-'}</span></div>
                <div className="mb-1">الإيميل: <span className="font-bold text-blue-900">{selectedOrder.talent?.email || '-'}</span></div>
                <div className="mb-1">رقم الهاتف: <span className="font-bold text-blue-900">{selectedOrder.talent?.phone || '-'}</span></div>
                <div className="mb-1">العنوان: <span className="font-bold text-blue-900">{selectedOrder.talent?.address || '-'}</span></div>
              </div>
              <div className="mb-2">
                <h3 className="font-bold text-pink-700 mb-2">تفاصيل إضافية:</h3>
                <div>الخدمات: <span className="font-bold">{selectedOrder.services && Array.isArray(JSON.parse(selectedOrder.services)) ? JSON.parse(selectedOrder.services).map((srv: any) => srv.name).join(', ') : selectedOrder.services}</span></div>
                <div>المبلغ: <span className="font-bold text-orange-600">{selectedOrder.services && Array.isArray(JSON.parse(selectedOrder.services)) ? JSON.parse(selectedOrder.services).reduce((sum: number, s: any) => sum + Number(s.price || 0), 0) : '-'}</span> ر.س</div>
                <div>الحالة: <span className="font-bold">{selectedOrder.status}</span></div>
                <div>تاريخ البداية: <span className="font-bold">{selectedOrder.date || selectedOrder.createdAt?.slice(0, 10)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 