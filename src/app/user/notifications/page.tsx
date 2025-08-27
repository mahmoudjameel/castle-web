"use client";

import React, { useEffect, useState } from "react";
import { Bell, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// تعريف الأنواع
interface Notification {
  id: number;
  title: string;
  body: string;
  date: string;
}

export default function UserNotificationsPage() {
  const [user, setUser] = useState<{id: number; name: string} | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetch(`/api/notifications?userId=${u.id}`)
        .then((res) => res.json())
        .then((data) => setNotifications(data || []));
    }
  }, []);
  const router = useRouter();
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <div className="bg-indigo-950/80 p-8 rounded-2xl shadow-lg border border-blue-400/20">
          <div className="text-2xl font-bold mb-4">يرجى تسجيل الدخول أولاً</div>
          <a href="/login" className="text-orange-400 hover:underline font-bold">تسجيل دخول</a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4 flex flex-col items-center">
      <button onClick={() => router.push('/user')} className="self-start mb-6 flex items-center gap-2 text-orange-400 hover:underline font-bold"><ArrowRight size={20}/> رجوع</button>
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-900/80 to-indigo-950/90 rounded-2xl shadow-xl border border-blue-400/30 p-8">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={28} className="text-orange-400" />
          <span className="text-2xl font-bold text-orange-400">الإشعارات</span>
        </div>
        {notifications.length === 0 ? (
          <div className="text-blue-200">لا توجد إشعارات جديدة.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li key={notif.id} className="p-4 rounded-xl bg-blue-900/40 border border-blue-400/20 shadow-md">
                <div className="font-bold text-orange-300 mb-1">{notif.title || "إشعار جديد"}</div>
                <div className="text-blue-100 text-sm">{notif.body}</div>
                <div className="text-xs text-blue-300 mt-2">
                  {(() => {
                    try {
                      if (!notif.date) {
                        return 'تاريخ غير محدد';
                      }
                      const date = new Date(notif.date);
                      if (isNaN(date.getTime())) {
                        return 'تاريخ غير محدد';
                      }
                      return date.toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch {
                      return 'تاريخ غير محدد';
                    }
                  })()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 