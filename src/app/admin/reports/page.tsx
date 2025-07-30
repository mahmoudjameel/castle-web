"use client";

import { useEffect, useState } from 'react';

const statCards = [
  { key: 'totalOrders', label: 'إجمالي الطلبات', color: 'from-blue-400 to-blue-600', icon: '📦' },
  { key: 'newOrders', label: 'طلبات جديدة اليوم', color: 'from-orange-400 to-pink-500', icon: '🆕' },
  { key: 'completedOrders', label: 'طلبات مكتملة', color: 'from-green-400 to-green-600', icon: '✅' },
  { key: 'rejectedOrders', label: 'طلبات مرفوضة', color: 'from-red-400 to-red-600', icon: '❌' },
  { key: 'talents', label: 'عدد المواهب', color: 'from-purple-400 to-blue-400', icon: '🎭' },
  { key: 'clients', label: 'عدد العملاء', color: 'from-pink-400 to-orange-400', icon: '👤' },
  { key: 'totalAmount', label: 'إجمالي المبالغ المدفوعة', color: 'from-yellow-400 to-orange-500', icon: '💰' },
];

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error('فشل في جلب التقارير');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-10 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center">تقارير النظام</h1>
        {loading && <div className="text-center text-blue-200">جاري التحميل...</div>}
        {error && <div className="text-center text-red-400 font-bold">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {statCards.map(card => (
              <div key={card.key} className={`rounded-xl p-6 flex flex-col items-center shadow-lg border border-blue-400/20 bg-white/90 backdrop-blur-md bg-gradient-to-br ${card.color}`}>
                <div className="text-4xl mb-2">{card.icon}</div>
                <div className="text-2xl font-bold text-blue-900 mb-1">{stats[card.key] ?? '—'}</div>
                <div className="text-blue-700 font-semibold text-lg">{card.label}</div>
              </div>
            ))}
          </div>
        )}
        {/* يمكنك إضافة رسوم بيانية وجداول هنا لاحقاً */}
      </div>
    </div>
  );
} 