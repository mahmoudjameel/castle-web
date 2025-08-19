"use client";

import React from 'react';
import { Settings, UserCheck, FolderPlus, ImageIcon, Receipt, CreditCard, Mail, FileText, AlertTriangle } from 'lucide-react';

const links = [
  { title: 'إدارة الحسابات', desc: 'مراجعة وقبول حسابات المواهب والشركات', href: '/admin/accounts', color: 'from-orange-400 to-pink-500', icon: <UserCheck className="w-5 h-5" /> },
  { title: 'إدارة التصنيفات', desc: 'إضافة وتعديل التصنيفات', href: '/admin/categories', color: 'from-indigo-400 to-purple-500', icon: <FolderPlus className="w-5 h-5" /> },
  { title: 'إدارة البانر الرئيسي', desc: 'تعديل صور ونصوص البانر', href: '/admin/banners', color: 'from-teal-400 to-blue-500', icon: <ImageIcon className="w-5 h-5" /> },
  { title: 'إدارة الفواتير', desc: 'مراجعة الفواتير والمدفوعات', href: '/admin/invoices', color: 'from-purple-400 to-pink-500', icon: <Receipt className="w-5 h-5" /> },
  { title: 'طلبات السحب', desc: 'مراجعة طلبات السحب وتحويل الأرباح', href: '/admin/withdrawals', color: 'from-pink-400 to-red-500', icon: <CreditCard className="w-5 h-5" /> },
  { title: 'إدارة الطلبات', desc: 'عرض جميع الطلبات بين المستخدمين والمواهب', href: '/admin/orders', color: 'from-cyan-400 to-blue-500', icon: <FileText className="w-5 h-5" /> },
  { title: 'إدارة الشكاوى', desc: 'متابعة الشكاوى وحل النزاعات', href: '/admin/reports', color: 'from-green-400 to-blue-500', icon: <AlertTriangle className="w-5 h-5" /> },
  { title: 'التواصلات والاستفسارات', desc: 'عرض رسائل نموذج تواصل معنا', href: '/admin/contacts', color: 'from-teal-400 to-green-500', icon: <Mail className="w-5 h-5" /> },
];

export default function AdminServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl mb-4 transform rotate-12 shadow-lg">
              <Settings className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              الخدمات الإدارية
            </h1>
            <p className="text-blue-200/80 text-lg">وصول سريع لكل أدوات الإدارة</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((item, idx) => (
              <a key={idx} href={item.href} className="group bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{item.title}</h3>
                  <p className="text-blue-200/80">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

