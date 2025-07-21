"use client";
import React, { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

// تعريف الأنواع
interface Wallet {
  id: number;
  userId: number;
  balance: number;
  earned: number;
  withdrawn: number;
}

interface Withdrawal {
  id: number;
  userId: number;
  amount: number;
  status: string;
  createdAt: string;
  bankAccount?: string;
}

export default function TalentWalletPage() {
  const [user, setUser] = useState<{id: number; name: string} | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [bankAccount, setBankAccount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetch(`/api/wallet?userId=${u.id}`)
        .then((res) => res.json())
        .then(setWallet);
      fetch(`/api/withdrawals?userId=${u.id}`)
        .then((res) => res.json())
        .then(setWithdrawals)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    if (!amount || amount <= 0) {
      setMessage("يرجى إدخال مبلغ صحيح.");
      setSubmitting(false);
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      setMessage("لا يمكنك سحب مبلغ أكبر من رصيدك.");
      setSubmitting(false);
      return;
    }
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, amount, bankAccount }),
    });
    if (res.ok) {
      setMessage("تم إرسال طلب السحب بنجاح! سيتم مراجعته من الإدارة.");
      setAmount(0);
      setBankAccount("");
      // تحديث السحوبات
      fetch(`/api/withdrawals?userId=${user?.id}`)
        .then((res) => res.json())
        .then(setWithdrawals);
    } else {
      setMessage("حدث خطأ أثناء إرسال الطلب.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <div className="flex items-center gap-4 mb-8">
          <CreditCard size={40} className="text-orange-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">محفظتي</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin" /></div>
        ) : !wallet ? (
          <div className="text-center text-blue-200">لا يوجد بيانات محفظة.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-800/40 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-2xl font-bold text-orange-400 mb-2">{wallet.balance} ر.س</div>
                <div className="text-blue-100">الرصيد الحالي</div>
              </div>
              <div className="bg-indigo-800/40 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-2xl font-bold text-green-400 mb-2">{wallet.earned} ر.س</div>
                <div className="text-blue-100">إجمالي الأرباح</div>
              </div>
              <div className="bg-indigo-800/40 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-2xl font-bold text-red-400 mb-2">{wallet.withdrawn} ر.س</div>
                <div className="text-blue-100">إجمالي المسحوبات</div>
              </div>
            </div>
            <form onSubmit={handleWithdraw} className="bg-indigo-800/30 rounded-xl p-6 mb-8 border border-blue-400/30">
              <h3 className="text-xl font-bold mb-4 text-orange-300">طلب سحب جديد</h3>
              <div className="mb-4">
                <label className="block mb-2">المبلغ المطلوب</label>
                <input type="number" min="1" max={wallet.balance} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-blue-900/40 text-white border border-blue-400/20" required />
              </div>
              <div className="mb-4">
                <label className="block mb-2">بيانات الحساب البنكي (اختياري)</label>
                <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-blue-900/40 text-white border border-blue-400/20" placeholder="اسم البنك، رقم الحساب..." />
              </div>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-white disabled:opacity-60">{submitting ? "جاري الإرسال..." : "إرسال الطلب"}</button>
              {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
            </form>
            <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <h3 className="text-xl font-bold mb-4 text-orange-300">سجل السحوبات</h3>
              {withdrawals.length === 0 ? (
                <div className="text-blue-200 text-center">لا يوجد طلبات سحب بعد.</div>
              ) : (
                <table className="w-full text-center">
                  <thead>
                    <tr className="text-blue-200">
                      <th className="py-2">المبلغ</th>
                      <th>الحساب البنكي</th>
                      <th>الحالة</th>
                      <th>تاريخ الطلب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w, i) => (
                      <tr key={w.id} className={i%2===0?"bg-blue-900/30":"bg-blue-900/10"}>
                        <td className="py-2 font-bold text-orange-300">{w.amount} ر.س</td>
                        <td>{w.bankAccount || "-"}</td>
                        <td className={w.status==="approved"?"text-green-400":w.status==="rejected"?"text-red-400":"text-blue-200"}>{w.status==="approved"?"مقبول":w.status==="rejected"?"مرفوض":"بانتظار المراجعة"}</td>
                        <td>{w.createdAt?new Date(w.createdAt).toLocaleDateString("ar-EG"):"-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 