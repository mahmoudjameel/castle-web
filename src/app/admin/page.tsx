'use client';

import React, { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Receipt, BarChart2, FolderPlus, UserCheck, Image as ImageIcon, CreditCard } from 'lucide-react';
import Link from 'next/link';

const adminSections = [
  { icon: <UserCheck size={32} />, title: 'إدارة الحسابات', desc: 'مراجعة وقبول حسابات المواهب والشركات.', link: '/admin/accounts' },
  { icon: <FileText size={32} />, title: 'متابعة العروض', desc: 'إشراف كامل على عروض الكاستينج والمشاريع.' },
  { icon: <AlertTriangle size={32} />, title: 'إدارة الشكاوى', desc: 'متابعة الشكاوى وحل النزاعات بين الأطراف.' },
  { icon: <Receipt size={32} />, title: 'إدارة الفواتير', desc: 'مراجعة الفواتير والمدفوعات والعمولات.', link: '/admin/invoices' },
  { icon: <BarChart2 size={32} />, title: 'تقارير النظام', desc: 'عرض تقارير الأداء والإحصائيات بشكل دوري.', link: '/admin/reports' },
  { icon: <FolderPlus size={32} />, title: 'إدارة التصنيفات', desc: 'إضافة وتعديل التصنيفات.', link: '/admin/categories' },
  // كارد البانر الجديد
  { icon: <ImageIcon size={32} />, title: 'إدارة البانر الرئيسي', desc: 'تعديل صور ونصوص البانر في الصفحة الرئيسية.', link: '/admin/banners' },
  { icon: <CreditCard size={32} />, title: 'طلبات السحب', desc: 'مراجعة طلبات السحب وتحويل الأرباح للمواهب.', link: '/admin/withdrawals' },
  // كارد الطلبات الجديد
  { icon: <Receipt size={32} />, title: 'إدارة الطلبات', desc: 'عرض جميع الطلبات بين المستخدمين وأصحاب المواهب.', link: '/admin/orders' },
];

const stats = [
  { label: 'حسابات بانتظار الموافقة', value: 12 },
  { label: 'عروض نشطة', value: 34 },
  { label: 'شكاوى جديدة', value: 2 },
  { label: 'فواتير قيد المراجعة', value: 5 },
];

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<{name?: string, profileImageData?: string} | null>(null);
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setAdmin({ name: u.name, profileImageData: u.profileImageData });
      }
    } catch {}
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with image, name, and buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {admin?.profileImageData ? (
              <img
                src={`data:image/png;base64,${admin.profileImageData}`}
                alt={admin.name || 'صورة المدير'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow">
                {admin?.name ? admin.name[0] : 'م'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-lg">{admin?.name || 'مدير'}</span>
              <span className="text-blue-200 text-sm">مرحبا بك في لوحة تحكم الإدارة</span>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 mt-4 sm:mt-0">
            <button
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg font-bold shadow hover:from-orange-400 hover:to-pink-500 transition-all text-sm md:text-base"
            >
              <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' viewBox='0 0 24 24'><path fill='currentColor' d='M15.75 3.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0V5.56l-7.22 7.22a.75.75 0 1 1-1.06-1.06l7.22-7.22H9.75a.75.75 0 0 1 0-1.5h6ZM20.25 12a.75.75 0 0 1-.75.75H4.81l2.72 2.72a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 1 1 1.06 1.06L4.81 11.25h14.69a.75.75 0 0 1 .75.75Z'/></svg>
              تسجيل خروج
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-bold shadow hover:from-indigo-500 hover:to-blue-500 transition-all text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.25a.75.75 0 0 1 .53.22l8.25 8.25a.75.75 0 1 1-1.06 1.06l-.72-.72V20a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.25h-2.5V20a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 4 20v-7.94l-.72.72a.75.75 0 1 1-1.06-1.06l8.25-8.25A.75.75 0 0 1 12 3.25Zm-7.25 8.81V20h4.5v-4.25a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75V20h4.5v-7.94l-6-6-6 6Z"/></svg>
              الصفحة الرئيسية
            </button>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center">لوحة تحكم الإدارة</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-indigo-800/30 rounded-xl p-6 text-center border border-blue-400/30">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {adminSections.map((sec, i) => (
            sec.link ? (
              <Link key={i} href={sec.link} className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30 hover:bg-indigo-800/50 transition-all cursor-pointer">
                <div className="text-orange-400">{sec.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{sec.title}</h3>
                  <p className="text-blue-100">{sec.desc}</p>
                </div>
              </Link>
            ) : (
              <div key={i} className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30 hover:bg-indigo-800/50 transition-all">
                <div className="text-orange-400">{sec.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{sec.title}</h3>
                  <p className="text-blue-100">{sec.desc}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
} 