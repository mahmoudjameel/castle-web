"use client";

import { useEffect, useState } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'paid', label: 'مدفوعة' },
  { value: 'cancelled', label: 'ملغاة' },
];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(10);

  useEffect(() => {
    // جلب النسبة من السيرفر (أو متغير بيئة)
    const fetchRate = async () => {
      try {
        const res = await fetch('/api/commission-rate');
        if (res.ok) {
          const data = await res.json();
          setCommissionRate(Number(data.rate) || 10);
        }
      } catch {}
    };
    fetchRate();
  }, []);

  const handleRateChange = async (val:number) => {
    setCommissionRate(val);
    try {
      await fetch('/api/commission-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: val })
      });
    } catch {}
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('فشل في جلب الفواتير');
        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه الفاتورة؟')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في حذف الفاتورة');
      setInvoices((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvoices = statusFilter
    ? invoices.filter((o) => o.status === statusFilter)
    : invoices;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-10 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center">إدارة الفواتير والمدفوعات</h1>
        {/* إعداد نسبة العمولة */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 bg-white/80 p-4 rounded-xl shadow border border-blue-200 max-w-lg mx-auto">
          <label className="font-bold text-blue-900">نسبة العمولة (%):</label>
          <input
            type="number"
            min={0}
            max={100}
            value={commissionRate}
            onChange={e => handleRateChange(Number(e.target.value))}
            className="rounded-lg px-4 py-2 border border-blue-300 text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
          />
          <span className="text-blue-700">سيتم خصم هذه النسبة من كل عملية لصاحب الموهبة</span>
        </div>
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
                  <th className="py-3 px-4 font-bold text-blue-900">العميل</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الموهبة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">المبلغ</th>
                  <th className="py-3 px-4 font-bold text-blue-900">العمولة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">صافي الربح</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الحالة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">تاريخ الفاتورة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">تفاصيل</th>
                  <th className="py-3 px-4 font-bold text-blue-900">حذف</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, idx) => {
                  const commission = Math.round((invoice.amount * commissionRate) / 100);
                  const net = invoice.amount - commission;
                  return (
                    <tr key={invoice.id} className="border-b border-blue-100 hover:bg-blue-50/60 transition">
                      <td className="py-2 px-4 font-bold text-blue-700">{invoice.id}</td>
                      <td className="py-2 px-4">{invoice.client?.name || invoice.clientId}</td>
                      <td className="py-2 px-4">{invoice.talent?.name || invoice.talentId}</td>
                      <td className="py-2 px-4 font-bold text-orange-600">{invoice.amount} ر.س</td>
                      <td className="py-2 px-4 font-bold text-pink-600">{commission} ر.س ({commissionRate}%)</td>
                      <td className="py-2 px-4 font-bold text-green-700">{net} ر.س</td>
                      <td className="py-2 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{invoice.status}</span>
                      </td>
                      <td className="py-2 px-4">{invoice.date || invoice.createdAt?.slice(0, 10)}</td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition text-xs font-bold"
                          onClick={() => setSelectedInvoice(invoice)}
                        >عرض</button>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          className={`bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition text-xs font-bold flex items-center gap-1 ${deletingId === invoice.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deletingId === invoice.id}
                          title="حذف الفاتورة"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* نافذة التفاصيل */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative text-blue-900">
              <button
                className="absolute top-3 left-3 text-red-500 font-bold text-2xl"
                onClick={() => setSelectedInvoice(null)}
                aria-label="إغلاق"
              >×</button>
              <h2 className="text-2xl font-bold mb-4 text-blue-900 text-center">تفاصيل الفاتورة #{selectedInvoice.id}</h2>
              <div className="mb-4">
                <h3 className="font-bold text-blue-700 mb-2">بيانات العميل:</h3>
                <div className="mb-1">الاسم: <span className="font-bold text-blue-900">{selectedInvoice.client?.name || '-'}</span></div>
                <div className="mb-1">الإيميل: <span className="font-bold text-blue-900">{selectedInvoice.client?.email || '-'}</span></div>
                <div className="mb-1">رقم الهاتف: <span className="font-bold text-blue-900">{selectedInvoice.client?.phone || '-'}</span></div>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-indigo-700 mb-2">بيانات الموهبة:</h3>
                <div className="mb-1">الاسم: <span className="font-bold text-blue-900">{selectedInvoice.talent?.name || '-'}</span></div>
                <div className="mb-1">الإيميل: <span className="font-bold text-blue-900">{selectedInvoice.talent?.email || '-'}</span></div>
                <div className="mb-1">رقم الهاتف: <span className="font-bold text-blue-900">{selectedInvoice.talent?.phone || '-'}</span></div>
              </div>
              <div className="mb-2">
                <h3 className="font-bold text-pink-700 mb-2">تفاصيل إضافية:</h3>
                <div>المبلغ: <span className="font-bold text-orange-600">{selectedInvoice.amount}</span> ر.س</div>
                <div>العمولة: <span className="font-bold text-pink-600">{Math.round(selectedInvoice.amount * commissionRate / 100)}</span> ر.س ({commissionRate}%)</div>
                <div>صافي الربح: <span className="font-bold text-green-700">{selectedInvoice.amount - Math.round(selectedInvoice.amount * commissionRate / 100)}</span> ر.س</div>
                <div>الحالة: <span className="font-bold">{selectedInvoice.status}</span></div>
                <div>تاريخ الفاتورة: <span className="font-bold">{selectedInvoice.date || selectedInvoice.createdAt?.slice(0, 10)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 