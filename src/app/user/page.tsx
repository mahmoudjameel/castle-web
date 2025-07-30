"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, ClipboardList, Bell, LogOut } from "lucide-react";
import Link from 'next/link';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function UserDashboardHome() {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  // جلب اسم المستخدم من localStorage
  let userName = "";
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        userName = JSON.parse(userStr).name || "";
      } catch {}
    }
  }
  const cards = [
    {
      title: "الملف الشخصي",
      icon: <User size={40} className="text-orange-400 mb-2" />,
      desc: "تعديل بياناتك الشخصية وصورتك ورقم الهاتف والعنوان.",
      href: "/user/profile",
    },
    {
      title: "طلباتي",
      icon: <ClipboardList size={40} className="text-orange-400 mb-2" />,
      desc: "استعرض جميع الطلبات التي قمت بها وحالتها.",
      href: "/user/orders",
    },
    {
      title: "الإشعارات",
      icon: <Bell size={40} className="text-orange-400 mb-2" />,
      desc: "شاهد أحدث الإشعارات والتنبيهات الخاصة بك.",
      href: "/user/notifications",
    },
    {
      icon: <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#FFA726" d="M2 21l1.65-4.95A8.001 8.001 0 1 1 10 18h-.13L2 21zm8-7a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/></svg>,
      title: 'المحادثات',
      desc: 'تواصل مع المواهب مباشرة عبر المنصة.',
      href: '/user/chats',
      badge: false
    },
    {
      icon: <ReceiptLongIcon style={{ fontSize: 48, color: '#1e40af' }} className="mb-2" />,
      title: 'الفواتير',
      desc: 'عرض وتحميل جميع فواتير عمليات الشراء الخاصة بك',
      href: '/user/invoices',
      badge: false
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-8 px-2 flex flex-col items-center">
      <div className="w-full max-w-3xl relative mb-10 flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg mb-2 mt-8 md:mt-0">
          لوحة التحكم الخاصة بالمستخدم
        </h1>
        {userName && (
          <div className="text-center text-lg md:text-xl font-bold text-blue-100 mb-2">
            {userName}
          </div>
        )}
      </div>
      <div
        className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-1 sm:px-2 md:px-0"
      >
        {cards.map(card => (
          <Link key={card.href} href={card.href} className="focus:outline-none">
            <button
              className="w-full h-full bg-indigo-950/80 rounded-2xl shadow-xl border border-blue-400/30 p-6 sm:p-7 md:p-8 flex flex-col items-center text-center hover:scale-[1.04] hover:border-orange-400 transition-all group focus:outline-none min-h-[220px] md:min-h-[240px]"
            >
              <span className="mb-2 flex items-center justify-center">{card.icon}</span>
              <div className="text-lg md:text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                {card.title}
              </div>
              <div className="text-blue-200 text-xs md:text-sm mb-2 min-h-[40px] flex items-center justify-center">
                {card.desc}
              </div>
              <span className="mt-auto text-orange-400 font-bold text-xs md:text-sm group-hover:underline">الدخول &rarr;</span>
            </button>
          </Link>
        ))}
      </div>
      {/* أزرار التحكم السفلية */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mt-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg font-bold shadow hover:from-orange-400 hover:to-pink-500 transition-all text-sm md:text-base"
        >
          <LogOut size={18} /> تسجيل خروج
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-bold shadow hover:from-indigo-500 hover:to-blue-500 transition-all text-sm md:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.25a.75.75 0 0 1 .53.22l8.25 8.25a.75.75 0 1 1-1.06 1.06l-.72-.72V20a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.25h-2.5V20a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 4 20v-7.94l-.72.72a.75.75 0 1 1-1.06-1.06l8.25-8.25A.75.75 0 0 1 12 3.25Zm-7.25 8.81V20h4.5v-4.25a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75V20h4.5v-7.94l-6-6-6 6Z"/></svg>
          الصفحة الرئيسية
        </button>
      </div>
    </div>
  );
} 