"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, ClipboardList, Bell, LogOut } from "lucide-react";

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
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-8 px-2 flex flex-col items-center">
      <div className="w-full max-w-2xl relative mb-8">
        <button onClick={handleLogout} className="absolute left-0 top-0 md:left-auto md:right-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg font-bold shadow hover:from-orange-400 hover:to-pink-500 transition-all z-10">
          <LogOut size={18} /> تسجيل خروج
        </button>
        <h1 className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg mb-2">لوحة التحكم الخاصة بالمستخدم</h1>
        {userName && <div className="text-center text-lg md:text-xl font-bold text-blue-100 mb-2">{userName}</div>}
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
        {cards.map(card => (
          <button
            key={card.href}
            onClick={() => router.push(card.href)}
            className="bg-indigo-950/80 rounded-2xl shadow-xl border border-blue-400/30 p-8 flex flex-col items-center text-center hover:scale-105 hover:border-orange-400 transition-all group focus:outline-none"
          >
            {card.icon}
            <div className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">{card.title}</div>
            <div className="text-blue-200 text-sm mb-2">{card.desc}</div>
            <span className="mt-2 text-orange-400 font-bold text-sm group-hover:underline">الدخول &rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
} 