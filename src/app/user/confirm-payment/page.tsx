"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConfirmPayment() {
  const sp = useSearchParams();
  const baseAmount = Number(sp.get('amount') || '0');
  const [service, setService] = useState(sp.get('service') || '');
  const [date, setDate] = useState(sp.get('date') || '');
  const [method, setMethod] = useState<'CARD'|'APPLE_PAY'>((sp.get('method') as any) || 'CARD');
  const talentId = sp.get('talentId') || '';
  const clientId = sp.get('clientId') || '';
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const details = useMemo(() => {
    const tax = Math.round(baseAmount * 0.15);
    const fee = Math.round(baseAmount * 0.20);
    const total = baseAmount + tax + fee;
    return { baseAmount, tax, fee, total };
  }, [baseAmount]);

  // جلب بيانات الطلب الأحدث لعرض اسم الخدمة والموعد إذا لم تُمرّر
  useEffect(() => {
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) setCurrentUser(JSON.parse(uStr));
    } catch {}
  }, []);

  useEffect(() => {
    if (service && date) return;
    if (!talentId || !clientId) return;
    fetch(`/api/orders?talentId=${talentId}&clientId=${clientId}`)
      .then(res => res.json())
      .then(arr => {
        if (Array.isArray(arr) && arr.length > 0) {
          const order = arr[0];
          if (!service) {
            try {
              const svcs = JSON.parse(order.services || '[]');
              if (Array.isArray(svcs) && svcs.length) setService(svcs.map((s:any)=>s.name || s).join(', '));
            } catch {}
          }
          if (!date && order.date) setDate(order.date);
        }
      }).catch(()=>{});
  }, [service, date, talentId, clientId]);

  const handleConfirm = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/paymob-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: details.total,
          user: {
            email: currentUser?.email,
            firstName: currentUser?.name?.split(' ')[0] || 'User',
            lastName: currentUser?.name?.split(' ')[1] || 'Name',
            phone: currentUser?.phone || ''
          },
          paymentMethod: method,
          metadata: {
            talentId,
            clientId,
            service: service || undefined,
            date: date || undefined,
            baseAmount,
            tax: details.tax,
            fee: details.fee,
            total: details.total
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.iframe) throw new Error(data?.error || 'failed');
      window.location.href = data.iframe;
    } catch (e:any) {
      setError(e?.message || 'تعذر إنشاء رابط الدفع.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-10 px-4 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-indigo-950/90 rounded-2xl shadow-2xl border border-blue-400/20 p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">تأكيد تفاصيل الطلب</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-80">الخدمة</div>
              <div className="mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2">{service || '—'}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">الموعد</div>
              <div className="mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2">{date || '—'}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-80">السعر الأساسي</div>
              <div className="mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2">{Math.round(baseAmount)} ر.س</div>
            </div>
            <div>
              <div className="text-sm opacity-80">طريقة الدفع</div>
              <div className="mt-1"></div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>setMethod('CARD')} className={`px-3 py-2 rounded-lg border ${method==='CARD'?'border-yellow-400 bg-yellow-400/10':'border-white/20 bg-white/5'}`}>Visa/Mastercard</button>
                <button onClick={()=>setMethod('APPLE_PAY')} className={`px-3 py-2 rounded-lg border ${method==='APPLE_PAY'?'border-yellow-400 bg-yellow-400/10':'border-white/20 bg-white/5'}`}>Apple Pay</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm opacity-80">الضريبة 15%</div>
              <div className="mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2">{details.tax} ر.س</div>
            </div>
            <div>
              <div className="text-sm opacity-80">رسوم الخدمة 20%</div>
              <div className="mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2">{details.fee} ر.س</div>
            </div>
            <div>
              <div className="text-sm opacity-80">الإجمالي</div>
              <div className="mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 font-bold">{details.total} ر.س</div>
            </div>
          </div>
          <div className="text-xs text-blue-200/80">يشمل الإجمالي ضريبة 15% ورسوم خدمة 20%.</div>
          {error && <div className="mt-3 text-center text-red-300">{error}</div>}
          <div className="flex justify-center mt-6">
            <button onClick={handleConfirm} disabled={loading} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white border border-emerald-500 disabled:opacity-60">
              {loading ? 'جاري التحويل...' : 'تأكيد والانتقال للدفع'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


