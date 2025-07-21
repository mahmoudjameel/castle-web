"use client";

import React, { useEffect, useState, useRef } from "react";
import { Star, User, Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  imageData?: string;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

export default function TalentProfile() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false); // جديد
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    bio: "",
    categoryId: "",
    socialLinks: { instagram: "", tiktok: "", youtube: "", twitter: "" },
    profileImage: undefined as File | undefined,
    profileImageData: undefined as string | undefined,
    jobTitle: "",
    services: [] as { name: string; price: string }[],
    workArea: "",
    canTravelAbroad: false,
  });
  const [newService, setNewService] = useState({ name: "", price: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryError, setCategoryError] = useState(""); // جديد: حالة لرسالة الخطأ
  // تعريف جدول أيام الأسبوع الافتراضي
  const defaultSchedule = {
    sunday:    { from: '', to: '', active: false },
    monday:    { from: '', to: '', active: false },
    tuesday:   { from: '', to: '', active: false },
    wednesday: { from: '', to: '', active: false },
    thursday:  { from: '', to: '', active: false },
    friday:    { from: '', to: '', active: false },
    saturday:  { from: '', to: '', active: false },
  };
  const daysAr: Record<string, string> = {
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
  };
  const [workingSchedule, setWorkingSchedule] = useState<any>(defaultSchedule);

  useEffect(() => {
    setMounted(true); // عند تحميل الصفحة على المتصفح فقط
  }, []);

  // جلب التصنيفات
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // جلب بيانات المستخدم من localStorage فقط بعد التأكد من mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (!u.id) { setUser(null); setLoading(false); return; }
        setUser(u);
        fetch(`/api/accounts`)
          .then((res) => res.json())
          .then((users) => {
            const found = users.find((acc: any) => String(acc.id) === String(u.id));
            if (found) {
              let socialLinks = { instagram: "", tiktok: "", youtube: "", twitter: "" };
              try {
                if (found.socialLinks) socialLinks = JSON.parse(found.socialLinks);
              } catch {}
              let profileImageData: string | undefined = undefined;
              try {
                if (found.profileImageData) {
                  profileImageData = typeof found.profileImageData === "string"
                    ? found.profileImageData
                    : Buffer.from(found.profileImageData).toString("base64");
                }
              } catch {}
              setForm((f) => ({
                ...f,
                name: found.name || "",
                age: found.age ? String(found.age) : "",
                bio: found.bio || "",
                categoryId: found.categoryId || "",
                socialLinks,
                profileImageData,
                jobTitle: found.jobTitle || "",
                services: found.services ? JSON.parse(found.services) : [],
                workArea: found.workArea || "",
                canTravelAbroad: found.canTravelAbroad || false,
              }));
              let schedule = defaultSchedule;
              try {
                if (found.workingSchedule) schedule = JSON.parse(found.workingSchedule);
              } catch {}
              setWorkingSchedule(schedule);
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  }, [mounted]);

  // معالجة رفع صورة الملف الشخصي
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((f) => ({ ...f, profileImage: file }));
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string)?.split(",")[1];
        setForm((f) => ({ ...f, profileImageData: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMessage("يجب تسجيل الدخول أولاً.");
    // تحقق من اختيار التصنيف
    if (!form.categoryId) {
      setCategoryError("يجب اختيار التصنيف!");
      setMessage("");
      return;
    } else {
      setCategoryError("");
    }
    setSubmitting(true);
    setMessage("");
    const payload: any = {
      id: user.id,
      name: form.name,
      age: form.age ? Number(form.age) : undefined,
      bio: form.bio,
      categoryId: form.categoryId,
      socialLinks: JSON.stringify(form.socialLinks),
      profileImageData: form.profileImageData,
      workingSchedule: JSON.stringify(workingSchedule),
      jobTitle: form.jobTitle,
      services: JSON.stringify(form.services),
      workArea: form.workArea,
      canTravelAbroad: form.canTravelAbroad,
    };
    const res = await fetch("/api/accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMessage("تم تحديث الملف الشخصي بنجاح!");
      // جلب بيانات المستخدم الجديدة وتحديث localStorage
      const updatedRes = await fetch(`/api/accounts?id=${user.id}`);
      if (updatedRes.ok) {
        const updatedUser = await updatedRes.json();
        const userObj = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;
        localStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);
      }
    } else {
      const err = await res.json();
      setMessage(err.message || "حدث خطأ أثناء التحديث.");
      alert(err.message || "حدث خطأ أثناء التحديث.");
    }
    setSubmitting(false);
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <div className="flex flex-col items-center -mt-20 mb-6">
          <div className="relative w-32 h-32">
            {form.profileImageData ? (
              <Image
                src={`data:image/png;base64,${form.profileImageData}`}
                alt="الصورة الشخصية"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full border-4 border-orange-400 shadow-lg bg-indigo-900"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
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
          <div className="text-blue-200 text-sm mt-2">يمكنك تغيير الصورة الشخصية</div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Star className="text-orange-400" /> الملف الشخصي للموهبة
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-blue-100">الاسم</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-orange-300 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="اسمك الكامل" />
          </div>
          {user?.email && (
            <div className="mb-4">
              <label className="block mb-2 text-blue-100">البريد الإلكتروني</label>
              <input type="email" value={user.email} disabled className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-blue-200 font-bold cursor-not-allowed" />
            </div>
          )}
          <div>
            <label className="block mb-2 text-blue-100">العمر</label>
            <input type="number" min="10" max="100" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="مثال: 22" />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">نبذة عنك</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200 min-h-[80px]" placeholder="اكتب نبذة مختصرة عن خبراتك ومواهبك..." />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">التصنيف <span className="text-red-400">*</span></label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={`w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 ${categoryError ? 'border-red-400' : ''}`}>
              <option value="">اختر تصنيفك...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categoryError && <div className="text-red-400 mt-1 text-sm font-bold">{categoryError}</div>}
          </div>
          <div>
            <label className="block mb-2 text-blue-100">روابط السوشيال ميديا</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="url" value={form.socialLinks.instagram} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: e.target.value } }))} className="px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="رابط Instagram" />
              <input type="url" value={form.socialLinks.tiktok} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, tiktok: e.target.value } }))} className="px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="رابط TikTok" />
              <input type="url" value={form.socialLinks.youtube} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, youtube: e.target.value } }))} className="px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="رابط YouTube" />
              <input type="url" value={form.socialLinks.twitter} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, twitter: e.target.value } }))} className="px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="رابط Twitter" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-blue-100">المسمى المهني</label>
            <input type="text" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="مثال: مصمم جرافيك، مصور فوتوغرافي..." />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">منطقة العمل</label>
            <input type="text" value={form.workArea} onChange={e => setForm(f => ({ ...f, workArea: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="مثال: الرياض، جدة..." />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="canTravelAbroad" checked={form.canTravelAbroad} onChange={e => setForm(f => ({ ...f, canTravelAbroad: e.target.checked }))} />
            <label htmlFor="canTravelAbroad" className="text-blue-100">بإمكاني السفر خارج المملكة</label>
          </div>
          <div>
            <label className="block mb-2 text-blue-100">جدول ساعات وأيام العمل</label>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="text-blue-200 font-bold">اليوم</th>
                    <th className="text-blue-200 font-bold">نشط؟</th>
                    <th className="text-blue-200 font-bold">من</th>
                    <th className="text-blue-200 font-bold">إلى</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(daysAr).map(day => (
                    <tr key={day}>
                      <td className="text-blue-100 font-bold">{daysAr[day]}</td>
                      <td>
                        <input type="checkbox" checked={workingSchedule[day].active} onChange={e => setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], active: e.target.checked } }))} />
                      </td>
                      <td>
                        <input type="time" value={workingSchedule[day].from} disabled={!workingSchedule[day].active} onChange={e => setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], from: e.target.value } }))} className="px-2 py-1 rounded bg-blue-900/40 border border-blue-400/20 text-white" />
                      </td>
                      <td>
                        <input type="time" value={workingSchedule[day].to} disabled={!workingSchedule[day].active} onChange={e => setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], to: e.target.value } }))} className="px-2 py-1 rounded bg-blue-900/40 border border-blue-400/20 text-white" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* قسم الخدمات والأسعار */}
          <div>
            <label className="block mb-2 text-blue-100">الخدمات والأسعار</label>
            {form.services.length === 0 && <div className="text-blue-200 mb-2">لم تقم بإضافة أي خدمة بعد.</div>}
            <div className="space-y-2 mb-4">
              {form.services.map((srv, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-blue-900/40 rounded-lg px-3 py-2 border border-blue-400/20">
                  <span className="flex-1 text-white">{srv.name}</span>
                  <span className="text-orange-400 font-bold">{srv.price} ر.س</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, services: f.services.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} placeholder="اسم الخدمة" className="flex-1 px-3 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" />
              <input type="number" min="0" value={newService.price} onChange={e => setNewService(s => ({ ...s, price: e.target.value }))} placeholder="السعر" className="w-24 px-3 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" />
              <button type="button" onClick={() => {
                if (!newService.name || !newService.price) return;
                setForm(f => ({ ...f, services: [...f.services, { ...newService }] }));
                setNewService({ name: "", price: "" });
              }} className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white font-bold hover:from-orange-500 hover:to-pink-600 transition-all">إضافة</button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting && <Loader2 className="animate-spin" size={20} />} حفظ التعديلات
          </button>
          {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
        </form>
      </div>
    </div>
  );
} 