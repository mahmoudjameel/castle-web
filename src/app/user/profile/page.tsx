"use client";

import React, { useEffect, useState, useRef } from "react";
import { User, Camera, Save, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    profileImageData: undefined as string | undefined,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      setProfile({
        name: u.name || "",
        phone: u.phone || "",
        address: u.address || "",
        profileImageData: u.profileImageData,
      });
    }
  }, []);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string)?.split(",")[1];
        setProfile((p) => ({ ...p, profileImageData: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    const payload = {
      id: user.id,
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      profileImageData: profile.profileImageData,
    };
    const res = await fetch("/api/accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMessage("تم حفظ التعديلات بنجاح!");
      const updated = { ...user, ...payload };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    } else {
      setMessage("حدث خطأ أثناء الحفظ.");
    }
    setSaving(false);
  };
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
      <form onSubmit={handleSave} className="w-full max-w-xl bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20 flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          {profile.profileImageData ? (
            <img src={`data:image/png;base64,${profile.profileImageData}`} alt="الصورة الشخصية" className="w-32 h-32 object-cover rounded-full border-4 border-orange-400 shadow-lg bg-indigo-900" onError={e => (e.currentTarget.style.display = 'none')} />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-200 text-5xl border-4 border-blue-400/30">
              <User size={64} />
            </div>
          )}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 left-2 bg-orange-400 text-white rounded-full p-2 shadow-lg hover:bg-orange-500 transition-all">
            <Camera size={20} />
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
        </div>
        <div className="w-full space-y-4">
          <div>
            <label className="block mb-1 text-blue-100">الاسم</label>
            <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-orange-300 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="اسمك الكامل" required />
          </div>
          <div>
            <label className="block mb-1 text-blue-100">رقم الهاتف</label>
            <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="05xxxxxxxx" required />
          </div>
          <div>
            <label className="block mb-1 text-blue-100">العنوان</label>
            <input type="text" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="المدينة / الحي / الشارع" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white flex items-center gap-2 hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          <Save size={20} /> {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
        {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
      </form>
    </div>
  );
} 