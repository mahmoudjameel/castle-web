'use client';

import React from 'react';
import { Users, FileText, AlertTriangle, Receipt, BarChart2, FolderPlus, UserCheck, Image as ImageIcon, CreditCard } from 'lucide-react';
import Link from 'next/link';

const adminSections = [
  { icon: <UserCheck size={32} />, title: 'إدارة الحسابات', desc: 'مراجعة وقبول حسابات المواهب والشركات.', link: '/admin/accounts' },
  { icon: <FileText size={32} />, title: 'متابعة العروض', desc: 'إشراف كامل على عروض الكاستينج والمشاريع.' },
  { icon: <AlertTriangle size={32} />, title: 'إدارة الشكاوى', desc: 'متابعة الشكاوى وحل النزاعات بين الأطراف.' },
  { icon: <Receipt size={32} />, title: 'إدارة الفواتير', desc: 'مراجعة الفواتير والمدفوعات والعمولات.' },
  { icon: <BarChart2 size={32} />, title: 'تقارير النظام', desc: 'عرض تقارير الأداء والإحصائيات بشكل دوري.' },
  { icon: <FolderPlus size={32} />, title: 'إدارة التصنيفات', desc: 'إضافة وتعديل التصنيفات.', link: '/admin/categories' },
  // كارد البانر الجديد
  { icon: <ImageIcon size={32} />, title: 'إدارة البانر الرئيسي', desc: 'تعديل صور ونصوص البانر في الصفحة الرئيسية.', link: '/admin/banners' },
  { icon: <CreditCard size={32} />, title: 'طلبات السحب', desc: 'مراجعة طلبات السحب وتحويل الأرباح للمواهب.', link: '/admin/withdrawals' },
];

const stats = [
  { label: 'حسابات بانتظار الموافقة', value: 12 },
  { label: 'عروض نشطة', value: 34 },
  { label: 'شكاوى جديدة', value: 2 },
  { label: 'فواتير قيد المراجعة', value: 5 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
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