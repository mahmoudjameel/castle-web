"use client";

import React, { useEffect, useState, useRef } from "react";
import { Star, User, Camera, Loader2, UserCircle, Save, Clock, MapPin, Globe, Briefcase, Plus, X, Check } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    bio: "",
    categories: [] as string[],
    profileImage: undefined as File | undefined,
    profileImageData: undefined as string | undefined,
    jobTitle: "",
    services: [] as { name: string; price: string; hidePrice?: boolean }[],
    workArea: "",
    canTravelAbroad: false,
    eyeColor: "",
    hairStyle: [] as string[],
    height: "",
    weight: "",
    skinColor: "",
    language: [] as string[],
    accent: [] as string[],
    features: "",
    hairColor: "",
  });
  const [newService, setNewService] = useState({ name: "", price: "", hidePrice: false });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryError, setCategoryError] = useState("");

  // تعريف جدول أيام الأسبوع الافتراضي
  const defaultSchedule = {
    sunday:    { from: '', to: '', active: false, allDay: false },
    monday:    { from: '', to: '', active: false, allDay: false },
    tuesday:   { from: '', to: '', active: false, allDay: false },
    wednesday: { from: '', to: '', active: false, allDay: false },
    thursday:  { from: '', to: '', active: false, allDay: false },
    friday:    { from: '', to: '', active: false, allDay: false },
    saturday:  { from: '', to: '', active: false, allDay: false },
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

  // دوال مساعدة للتحويل بين 24 ساعة و12 ساعة
  const convert24To12 = (time24: string) => {
    if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) return { hour: '12', minute: '00', period: 'AM' };
    const [hStr, m] = time24.split(':');
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hour = h.toString().padStart(2, '0');
    return { hour, minute: m, period };
  };

  const convert12To24 = (hour12: string, minute: string, period: 'AM'|'PM') => {
    let h = parseInt(hour12 || '12', 10);
    if (period === 'AM') {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h = h + 12;
    }
    return `${h.toString().padStart(2, '0')}:${(minute || '00').padStart(2, '0')}`;
  };

  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = ['00', '15', '30', '45'];
  const periods: Array<'AM'|'PM'> = ['AM', 'PM'];

  // قوائم الخيارات المتاحة
  const hairStyleOptions = [
    'قصير', 'طويل', 'مموج', 'أملس', 'مجعد'
  ];
  const languageOptions = [
    'العربية', 'الإنجليزية', 'الفرنسية', 'الإسبانية'
  ];
  const accentOptions = [
    'نجدية','حجازية','جنوبية','شرقاوية','شمالية','تهامية','حائلية','جازانية','عسيرية',
    'قطرية','إماراتية','كويتية','بحرينية','عمانية','شامية','مصرية','مغربية','ليبية',
    'تونسية','جزائرية','سودانية','يمنية','موريتانية','فلسطينية','لبنانية','عراقية','سورية','أردنية','أخرى'
  ];

  // دالة لتطبيع الجدول وضمان وجود allDay لكل يوم
  const normalizeSchedule = (schedule: any) => {
    const result: any = {};
    Object.keys(defaultSchedule).forEach((dayKey) => {
      const day = schedule?.[dayKey] || {};
      result[dayKey] = {
        from: typeof day.from === 'string' ? day.from : '',
        to: typeof day.to === 'string' ? day.to : '',
        active: typeof day.active === 'boolean' ? day.active : false,
        allDay: typeof day.allDay === 'boolean' ? day.allDay : false,
      };
    });
    return result;
  };

  useEffect(() => {
    setMounted(true);
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
                categories: found.categories ? found.categories.map((c: any) => c.id || c.category?.id) : [],
                profileImageData,
                jobTitle: found.jobTitle || "",
                services: found.services ? JSON.parse(found.services) : [],
                workArea: found.workArea || "",
                canTravelAbroad: found.canTravelAbroad || false,
                eyeColor: found.eyeColor || "",
                hairStyle: (() => {
                  try {
                    if (Array.isArray(found.hairStyle)) return found.hairStyle;
                    if (typeof found.hairStyle === 'string') {
                      const s = found.hairStyle.trim();
                      if (s.startsWith('[')) {
                        const arr = JSON.parse(s);
                        if (Array.isArray(arr)) return arr;
                      }
                      if (s !== '') return s.split(',').map((v: string) => v.trim()).filter(Boolean);
                    }
                  } catch {}
                  return [] as string[];
                })(),
                height: found.height ? String(found.height) : "",
                weight: found.weight ? String(found.weight) : "",
                skinColor: found.skinColor || "",
                language: (() => {
                  try {
                    if (Array.isArray(found.language)) return found.language;
                    if (typeof found.language === 'string') {
                      const s = found.language.trim();
                      if (s.startsWith('[')) {
                        const arr = JSON.parse(s);
                        if (Array.isArray(arr)) return arr;
                      }
                      if (s !== '') return s.split(',').map((v: string) => v.trim()).filter(Boolean);
                    }
                  } catch {}
                  return [] as string[];
                })(),
                accent: (() => {
                  try {
                    if (Array.isArray(found.accent)) return found.accent;
                    if (typeof found.accent === 'string') {
                      const s = found.accent.trim();
                      if (s.startsWith('[')) {
                        const arr = JSON.parse(s);
                        if (Array.isArray(arr)) return arr;
                      }
                      if (s !== '') return s.split(',').map((v: string) => v.trim()).filter(Boolean);
                    }
                  } catch {}
                  return [] as string[];
                })(),
                features: found.features || "",
                hairColor: found.hairColor || "",
              }));
              let schedule = defaultSchedule;
              try {
                if (found.workingSchedule) schedule = normalizeSchedule(JSON.parse(found.workingSchedule));
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
    
    if (!form.categories || form.categories.length === 0) {
      setCategoryError("يجب اختيار تصنيف واحد على الأقل!");
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
      categories: form.categories,
      profileImageData: form.profileImageData,
      workingSchedule: JSON.stringify(workingSchedule),
      jobTitle: form.jobTitle,
      services: JSON.stringify(form.services),
      workArea: form.workArea,
      canTravelAbroad: form.canTravelAbroad,
      eyeColor: form.eyeColor,
      hairStyle: form.hairStyle,
      height: form.height ? Number(form.height) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      skinColor: form.skinColor,
      language: form.language,
      accent: form.accent,
      features: form.features,
      hairColor: form.hairColor,
    };

    const res = await fetch("/api/accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMessage("تم تحديث الملف الشخصي بنجاح!");
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
    }
    setSubmitting(false);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
          <p className="text-blue-200/80">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* خلفية مؤثرات بصرية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-4 transform rotate-12 shadow-lg">
              <UserCircle className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              الملف الشخصي للموهبة
            </h1>
            <p className="text-blue-200/80 text-lg">قم بتحديث معلوماتك وخدماتك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* قسم الصورة الشخصية والمعلومات الأساسية */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-32 h-32 mb-4">
                  {form.profileImageData ? (
                    <img
                      src={`data:image/png;base64,${form.profileImageData}`}
                      alt="الصورة الشخصية"
                      className="w-32 h-32 object-cover rounded-2xl border-4 border-orange-400/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center text-6xl border-4 border-blue-400/50">
                      <User className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:from-orange-500 hover:to-pink-600 transition-all transform hover:scale-110"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-blue-200/80 text-sm">انقر على الكاميرا لتغيير الصورة</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-blue-100 font-semibold">الاسم الكامل</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 placeholder:text-blue-200/60"
                    placeholder="اسمك الكامل"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-blue-100 font-semibold">العمر</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 placeholder:text-blue-200/60"
                    placeholder="مثال: 25"
                  />
                </div>

                {user?.email && (
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-blue-100 font-semibold">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-blue-200 cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block mb-2 text-blue-100 font-semibold">نبذة عنك</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 placeholder:text-blue-200/60 resize-none"
                    placeholder="اكتب نبذة مختصرة عن خبراتك ومواهبك..."
                  />
                </div>
              </div>
            </div>

            {/* قسم المعلومات المهنية */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                المعلومات المهنية
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-blue-100 font-semibold">
                    التصنيفات <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const checked = form.categories.includes(cat.id);
                      return (
                        <label key={cat.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border transition-all duration-150 ${checked ? 'bg-orange-400/20 border-orange-400 text-orange-300 font-bold' : 'bg-white/5 border-white/10 text-white'}`}> 
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              if (e.target.checked) {
                                setForm(f => ({ ...f, categories: [...f.categories, cat.id] }));
                              } else {
                                setForm(f => ({ ...f, categories: f.categories.filter(id => id !== cat.id) }));
                              }
                            }}
                            className="accent-orange-400 w-5 h-5 rounded"
                          />
                        {cat.name}
                        </label>
                      );
                    })}
                  </div>
                  {categoryError && (
                    <div className="text-red-400 mt-2 text-sm font-semibold flex items-center gap-1">
                      <X className="w-4 h-4" />
                      {categoryError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-blue-100 font-semibold">المسمى المهني</label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 placeholder:text-blue-200/60"
                    placeholder="مثال: مصمم جرافيك، مصور فوتوغرافي..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-blue-100 font-semibold">منطقة العمل</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      value={form.workArea}
                      onChange={e => setForm(f => ({ ...f, workArea: e.target.value }))}
                      className="w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 placeholder:text-blue-200/60"
                      placeholder="مثال: الرياض، جدة..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="canTravelAbroad"
                      checked={form.canTravelAbroad}
                      onChange={e => setForm(f => ({ ...f, canTravelAbroad: e.target.checked }))}
                      className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 text-orange-400 focus:ring-orange-400/50"
                    />
                    <label htmlFor="canTravelAbroad" className="text-blue-100 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      بإمكاني السفر خارج المملكة
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* قسم الخدمات والأسعار */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                الخدمات والأسعار
              </h3>

              {form.services.length === 0 && (
                <div className="text-center py-8 text-blue-200/80">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-blue-400/50" />
                  <p>لم تقم بإضافة أي خدمة بعد</p>
                </div>
              )}

              <div className="grid gap-4 mb-6">
                {form.services.map((srv, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center justify-between group hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-semibold">{srv.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold text-lg">{srv.hidePrice ? '—' : `${srv.price} ر.س`}</span>
                      <label className="flex items-center gap-1 text-xs text-white">
                        <input
                          type="checkbox"
                          checked={!!srv.hidePrice}
                          onChange={e => setForm(f => ({
                            ...f,
                            services: f.services.map((s, i) => i === idx ? { ...s, hidePrice: e.target.checked } : s)
                          }))}
                        />
                        إخفاء السعر
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, services: f.services.filter((_, i) => i !== idx) }))}
                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500 rounded-lg flex items-center justify-center text-red-400 hover:text-white transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newService.name}
                    onChange={e => setNewService(s => ({ ...s, name: e.target.value }))}
                    placeholder="اسم الخدمة"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 placeholder:text-blue-200/60"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newService.price}
                    onChange={e => setNewService(s => ({ ...s, price: e.target.value }))}
                    placeholder="السعر"
                    className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 placeholder:text-blue-200/60"
                  />
                  <label className="flex items-center gap-1 text-xs text-white">
                    <input
                      type="checkbox"
                      checked={!!newService.hidePrice}
                      onChange={e => setNewService(s => ({ ...s, hidePrice: e.target.checked }))}
                    />
                    إخفاء السعر
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newService.name || !newService.price) return;
                      setForm(f => ({ ...f, services: [...f.services, { ...newService }] }));
                      setNewService({ name: "", price: "", hidePrice: false });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl text-white font-semibold hover:from-orange-500 hover:to-pink-600 transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* قسم جدول العمل */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                جدول ساعات العمل
              </h3>

              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-7 gap-4 mb-4 text-center font-semibold text-blue-200">
                    <div>اليوم</div>
                    <div>نشط؟</div>
                    <div>من (ساعة)</div>
                    <div>من (دقيقة)</div>
                    <div>من (AM/PM)</div>
                    <div>إلى</div>
                    <div>طوال اليوم</div>
                  </div>
                  {Object.keys(daysAr).map(day => {
                    const from12 = convert24To12(workingSchedule[day].from);
                    const to12 = convert24To12(workingSchedule[day].to);
                    return (
                    <div key={day} className="grid grid-cols-7 gap-4 mb-3 items-center">
                      <div className="text-blue-100 font-semibold">{daysAr[day]}</div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={workingSchedule[day].active}
                          onChange={e => setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], active: e.target.checked } }))}
                          className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 text-orange-400 focus:ring-orange-400/50"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {/* من: ساعة */}
                        <select
                          value={from12.hour}
                          disabled={!workingSchedule[day].active || workingSchedule[day].allDay}
                          onChange={e => {
                            const newFrom = convert12To24(e.target.value, from12.minute, from12.period);
                            setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], from: newFrom } }));
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {hours12.map(h => <option key={h} value={h} className="text-black">{h}</option>)}
                        </select>
                        {/* من: دقيقة */}
                        <select
                          value={from12.minute}
                          disabled={!workingSchedule[day].active || workingSchedule[day].allDay}
                          onChange={e => {
                            const newFrom = convert12To24(from12.hour, e.target.value, from12.period);
                            setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], from: newFrom } }));
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {minutesList.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                        </select>
                        {/* من: AM/PM */}
                        <select
                          value={from12.period}
                          disabled={!workingSchedule[day].active || workingSchedule[day].allDay}
                          onChange={e => {
                            const newFrom = convert12To24(from12.hour, from12.minute, e.target.value as 'AM'|'PM');
                            setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], from: newFrom } }));
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {periods.map(p => <option key={p} value={p} className="text-black">{p}</option>)}
                        </select>
                      </div>
                      {/* إلى: وقت كامل بمدخل time للحفاظ على البساطة، لكن بحساب 12/24 عند التغيير */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* إلى: ساعة */}
                        <select
                          value={to12.hour}
                          disabled={!workingSchedule[day].active || workingSchedule[day].allDay}
                          onChange={e => {
                            const newTo = convert12To24(e.target.value, to12.minute, to12.period);
                            setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], to: newTo } }));
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {hours12.map(h => <option key={h} value={h} className="text-black">{h}</option>)}
                        </select>
                        {/* إلى: دقيقة */}
                        <select
                          value={to12.minute}
                          disabled={!workingSchedule[day].active || workingSchedule[day].allDay}
                          onChange={e => {
                            const newTo = convert12To24(to12.hour, e.target.value, to12.period);
                            setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], to: newTo } }));
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {minutesList.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                        </select>
                        {/* إلى: AM/PM */}
                        <select
                          value={to12.period}
                          disabled={!workingSchedule[day].active || workingSchedule[day].allDay}
                          onChange={e => {
                            const newTo = convert12To24(to12.hour, to12.minute, e.target.value as 'AM'|'PM');
                            setWorkingSchedule((ws: any) => ({ ...ws, [day]: { ...ws[day], to: newTo } }));
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {periods.map(p => <option key={p} value={p} className="text-black">{p}</option>)}
                        </select>
                      </div>
                      <label className="flex items-center justify-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(workingSchedule[day].allDay)}
                          onChange={e => setWorkingSchedule((ws: any) => ({
                            ...ws,
                            [day]: {
                              ...ws[day],
                              allDay: e.target.checked,
                              // عند اختيار طوال اليوم، فعّل اليوم واضبط الوقت إلى كامل اليوم
                              active: e.target.checked ? true : ws[day].active,
                              from: e.target.checked ? '00:00' : ws[day].from,
                              to: e.target.checked ? '23:59' : ws[day].to,
                            }
                          }))}
                          className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 text-orange-400 focus:ring-orange-400/50"
                        />
                        <span className="text-blue-100 text-sm">متاح طوال اليوم</span>
                      </label>
                    </div>
                  );})}
                </div>
              </div>
            </div>

            {/* لون العين */}
            <div>
              <label className="block mb-2 font-semibold text-blue-300">لون العين</label>
              <select
                value={form.eyeColor}
                onChange={e => setForm(f => ({ ...f, eyeColor: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-300/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-300/40"
              >
                <option value="">اختر...</option>
                <option>بني</option>
                <option>أزرق</option>
                <option>أخضر</option>
                <option>عسلي</option>
                <option>رمادي</option>
                <option>أسود</option>
              </select>
            </div>
            {/* تسريحة الشعر (select متعدد) */}
            <div>
              <label className="block mb-2 font-semibold text-pink-300">تسريحة الشعر</label>
              <select
                multiple
                value={form.hairStyle}
                onChange={e => {
                  const opts = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
                  setForm(f => ({ ...f, hairStyle: opts }));
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-pink-300/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-300/40"
              >
                {hairStyleOptions.map(opt => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
            </div>
            {/* لون الشعر */}
            <div>
              <label className="block mb-2 font-semibold text-red-300">لون الشعر</label>
              <select
                value={form.hairColor}
                onChange={e => setForm(f => ({ ...f, hairColor: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-red-300/30 text-white focus:outline-none focus:ring-2 focus:ring-red-300/40"
              >
                <option value="">اختر...</option>
                <option>أسود</option>
                <option>بني</option>
                <option>أشقر</option>
                <option>أحمر</option>
                <option>رمادي</option>
                <option>أبيض</option>
              </select>
            </div>
            {/* لون البشرة */}
            <div>
              <label className="block mb-2 font-semibold text-orange-300">لون البشرة</label>
              <select
                value={form.skinColor}
                onChange={e => setForm(f => ({ ...f, skinColor: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-orange-300/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-300/40"
              >
                <option value="">اختر...</option>
                <option>فاتح</option>
                <option>قمحي</option>
                <option>أسمر</option>
                <option>داكن</option>
              </select>
                </div>
            {/* اللغة (select متعدد) */}
            <div>
              <label className="block mb-2 font-semibold text-purple-300">اللغة</label>
              <select
                multiple
                value={form.language}
                onChange={e => {
                  const opts = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
                  setForm(f => ({ ...f, language: opts }));
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-300/40"
              >
                {languageOptions.map(opt => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
            </div>
            {/* اللهجة (select متعدد) */}
            <div>
              <label className="block mb-2 font-semibold text-cyan-300">اللهجة</label>
              <select
                multiple
                value={form.accent}
                onChange={e => {
                  const opts = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
                  setForm(f => ({ ...f, accent: opts }));
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-300/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
              >
                {accentOptions.map(opt => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
            </div>

            {/* زر الحفظ */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="px-12 py-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl text-white font-bold text-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>

            {/* رسالة النجاح/الخطأ */}
            {message && (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold ${
                  message.includes('نجاح') 
                    ? 'bg-green-500/20 text-green-400 border border-green-400/20' 
                    : 'bg-red-500/20 text-red-400 border border-red-400/20'
                }`}>
                  {message.includes('نجاح') ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                  {message}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* تحسين الاستجابة للهواتف */
        @media (max-width: 640px) {
          .grid.grid-cols-4 {
            grid-template-columns: 1fr 80px 1fr 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}