"use client";
import React, { useEffect, useState } from "react";

export default function TalentServices() {
  const [services, setServices] = useState<{ name: string; price: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (!u.id) { setLoading(false); return; }
        fetch(`/api/accounts`)
          .then((res) => res.json())
          .then((users) => {
            const found = users.find((acc: Record<string, unknown>) => String(acc.id) === String(u.id));
            if (found && found.services) {
              setServices(JSON.parse(found.services));
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">الخدمات والأسعار</h2>
        {loading ? (
          <div className="text-blue-100 text-center">جاري التحميل...</div>
        ) : services.length === 0 ? (
          <div className="text-blue-200 text-center">لم تقم بإضافة أي خدمة بعد.</div>
        ) : (
          <div className="space-y-3">
            {services.map((srv, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-blue-900/40 rounded-lg px-3 py-2 border border-blue-400/20">
                <span className="flex-1 text-white">{srv.name}</span>
                <span className="text-orange-400 font-bold">{srv.price} ر.س</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 