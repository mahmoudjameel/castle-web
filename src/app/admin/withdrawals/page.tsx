"use client";
import React, { useEffect, useState } from "react";
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number|null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/withdrawals")
      .then(res => res.json())
      .then(async data => {
        setWithdrawals(data);
        // جلب بيانات المستخدمين المرتبطين
        const userIds = Array.from(new Set(data.map((w:any)=>w.userId)));
        if (userIds.length > 0) {
          const res = await fetch("/api/accounts");
          const allUsers = await res.json();
          const usersMap:any = {};
          allUsers.forEach((u:any) => { if (userIds.includes(u.id)) usersMap[u.id] = u; });
          setUsers(usersMap);
        }
      })
      .finally(()=>setLoading(false));
  }, []);

  const handleAction = async (id:number, userId:number, amount:number, action:'approve'|'reject') => {
    setUpdatingId(id);
    setMessage("");
    // تحديث حالة السحب
    const res = await fetch("/api/withdrawals-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId, amount, action }),
    });
    if (res.ok) {
      setMessage("تم تحديث حالة الطلب بنجاح.");
      // تحديث السحوبات
      fetch("/api/withdrawals")
        .then(res => res.json())
        .then(setWithdrawals);
    } else {
      setMessage("حدث خطأ أثناء تحديث الطلب.");
    }
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <div className="flex items-center gap-4 mb-8">
          <CreditCard size={40} className="text-orange-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">طلبات السحب</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin" /></div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center text-blue-200">لا يوجد طلبات سحب بعد.</div>
        ) : (
          <table className="w-full text-center">
            <thead>
              <tr className="text-blue-200">
                <th className="py-2">المستخدم</th>
                <th>المبلغ</th>
                <th>الحساب البنكي</th>
                <th>الحالة</th>
                <th>تاريخ الطلب</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w, i) => (
                <tr key={w.id} className={i%2===0?"bg-blue-900/30":"bg-blue-900/10"}>
                  <td className="py-2 font-bold text-orange-300">{users[w.userId]?.name || w.userId}</td>
                  <td>{w.amount} ر.س</td>
                  <td>{w.bankAccount || "-"}</td>
                  <td className={w.status==="approved"?"text-green-400":w.status==="rejected"?"text-red-400":"text-blue-200"}>{w.status==="approved"?"مقبول":w.status==="rejected"?"مرفوض":"بانتظار المراجعة"}</td>
                  <td>{w.createdAt?new Date(w.createdAt).toLocaleDateString("ar-EG"):"-"}</td>
                  <td>
                    {w.status==="pending" && (
                      <div className="flex gap-2 justify-center">
                        <button disabled={updatingId===w.id} onClick={()=>handleAction(w.id, w.userId, w.amount, 'approve')} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-1 disabled:opacity-60"><CheckCircle size={18}/> موافقة</button>
                        <button disabled={updatingId===w.id} onClick={()=>handleAction(w.id, w.userId, w.amount, 'reject')} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-1 disabled:opacity-60"><XCircle size={18}/> رفض</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
      </div>
    </div>
  );
} 