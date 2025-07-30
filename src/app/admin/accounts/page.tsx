'use client';
import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all'|'talent'|'user'|'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/accounts?role=USER,talent')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, []);

  const handleApprove = async (id: number) => {
    const res = await fetch('/api/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true }),
    });
    if (res.ok) {
      setUsers(users.map(u => u.id === id ? { ...u, approved: true } : u));
      setMessage('تمت الموافقة على الحساب.');
    }
  };
  const handleReject = async (id: number) => {
    const res = await fetch('/api/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: false }),
    });
    if (res.ok) {
      setUsers(users.map(u => u.id === id ? { ...u, approved: false } : u));
      setMessage('تم رفض الحساب.');
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف الحساب؟')) return;
    const res = await fetch('/api/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
      setMessage('تم حذف الحساب.');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الحسابات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    const res = await fetch('/api/accounts?all=true', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setUsers([]);
      setMessage('تم حذف جميع الحسابات بنجاح.');
    } else {
      setMessage('حدث خطأ أثناء حذف جميع الحسابات.');
    }
  };

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'pending') return !u.approved;
    if (filter === 'talent') return u.role === 'talent' || u.role === 'TALENT';
    if (filter === 'user') return u.role === 'USER' || u.role === 'user';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">إدارة المستخدمين والمواهب</h2>
        <div className="flex gap-4 justify-center mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم أو بريد..." className="px-4 py-2 rounded-lg bg-blue-900/40 text-blue-100 border border-blue-400/20" />
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter==='all'?'bg-orange-400 text-white':'bg-blue-900/40 text-blue-100'}`}>الكل</button>
          <button onClick={() => setFilter('user')} className={`px-4 py-2 rounded-lg ${filter==='user'?'bg-orange-400 text-white':'bg-blue-900/40 text-blue-100'}`}>المستخدمين</button>
          <button onClick={() => setFilter('talent')} className={`px-4 py-2 rounded-lg ${filter==='talent'?'bg-orange-400 text-white':'bg-blue-900/40 text-blue-100'}`}>المواهب</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg ${filter==='pending'?'bg-orange-400 text-white':'bg-blue-900/40 text-blue-100'}`}>بانتظار الموافقة</button>
        </div>
        <div className="flex justify-end mb-4">
          <button onClick={handleDeleteAll} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg">حذف جميع الحسابات</button>
        </div>
        {loading ? <div className="text-center text-blue-200">جاري التحميل...</div> : (
          <div className="space-y-4">
            {filtered.length === 0 ? <div className="text-center text-blue-200">لا يوجد حسابات.</div> : filtered.map(u => (
              <div key={u.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-indigo-800/30 rounded-xl p-4 border border-blue-400/30">
                <div className="flex-1">
                  <div className="font-bold text-lg">{u.name}</div>
                  <div className="text-blue-200 text-sm">{u.email}</div>
                  <div className="text-blue-200 text-sm">الدور: {u.role === 'talent' ? 'موهبة' : u.role === 'company' ? 'شركة' : u.role}</div>
                  <div className="text-blue-200 text-sm">الحالة: {u.approved ? 'مفعل' : 'بانتظار الموافقة'}</div>
                  <div className="text-blue-200 text-xs">تاريخ الإنشاء: {new Date(u.createdAt).toLocaleString('ar-EG')}</div>
                </div>
                <div className="flex gap-2">
                  {!u.approved && <button onClick={() => handleApprove(u.id)} className="px-3 py-1 bg-green-500 text-white rounded">موافقة</button>}
                  {u.approved && <button onClick={() => handleReject(u.id)} className="px-3 py-1 bg-red-500 text-white rounded">رفض</button>}
                  <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-gray-700 text-white rounded">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
      </div>
    </div>
  );
} 