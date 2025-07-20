"use client";
import React, { useEffect, useState, useRef } from "react";
import { Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';

interface Banner {
  id?: number;
  title: string;
  subtitle: string;
  imageUrl?: string;
  imageData?: string;
  ctaText?: string;
  order: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<Banner>({ title: "", subtitle: "", order: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hero-banners");
      if (!res.ok) {
        setBanners([]);
        setLoading(false);
        return;
      }
      const text = await res.text();
      if (!text) {
        setBanners([]);
        setLoading(false);
        return;
      }
      const data = JSON.parse(text);
      setBanners(data);
    } catch (err) {
      setBanners([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string)?.split(",")[1];
        setForm(f => ({ ...f, imageData: base64, imageUrl: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...form, id: editingId } : form;
    await fetch("/api/hero-banners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm({ title: "", subtitle: "", order: 0 });
    setEditingId(null);
    setSuccessMsg(editingId ? "تم تحديث السلايد بنجاح" : "تمت إضافة السلايد بنجاح");
    fetchBanners();
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleEdit = (banner: Banner) => {
    setForm({ ...banner });
    setEditingId(banner.id!);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السلايد؟")) return;
    setLoading(true);
    await fetch("/api/hero-banners", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSuccessMsg("تم حذف السلايد بنجاح");
    fetchBanners();
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">إدارة صور ونصوص البانر الرئيسي</h1>
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 bg-green-700/80 text-white px-4 py-3 rounded-lg shadow border border-green-400/30 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span>{successMsg}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-blue-900/30 p-6 rounded-xl mb-8 shadow border border-blue-400/10">
          <div>
            <label className="block mb-1 text-blue-100 font-bold">العنوان الرئيسي</label>
            <input name="title" value={form.title} onChange={handleInput} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-orange-300 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" required />
          </div>
          <div>
            <label className="block mb-1 text-blue-100 font-bold">الوصف</label>
            <textarea name="subtitle" value={form.subtitle} onChange={handleInput} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200 min-h-[80px]" required />
          </div>
          <div>
            <label className="block mb-1 text-blue-100 font-bold">نص الزر (CTA)</label>
            <input name="ctaText" value={form.ctaText || ""} onChange={handleInput} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" />
          </div>
          <div>
            <label className="block mb-1 text-blue-100 font-bold">ترتيب العرض</label>
            <input name="order" type="number" value={form.order} onChange={handleInput} className="w-32 px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" />
          </div>
          <div>
            <label className="block mb-1 text-blue-100 font-bold">رابط الصورة (Image URL)</label>
            <input name="imageUrl" value={form.imageUrl || ""} onChange={handleInput} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="https://example.com/banner.jpg" />
          </div>
          <div>
            <label className="block mb-1 text-blue-100 font-bold">الصورة</label>
            <div className="mt-2 flex gap-4 items-center">
              {form.imageUrl && <img src={form.imageUrl} alt="صورة البانر" className="w-40 h-24 object-cover rounded-xl border-2 border-orange-400 shadow" />}
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
              <CheckCircle className="w-5 h-5" />
              {editingId ? "تحديث السلايد" : "إضافة سلايد"}
            </button>
            {editingId && <button type="button" onClick={()=>{setForm({ title: "", subtitle: "", order: 0 }); setEditingId(null);}} className="px-6 py-3 bg-gray-300 text-blue-900 rounded-lg font-bold hover:bg-gray-400 transition-all flex items-center gap-2"><XCircle className="w-5 h-5" />إلغاء</button>}
          </div>
        </form>
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">كل السلايدات</h2>
        <div className="overflow-x-auto rounded-xl shadow border border-blue-400/10">
          <table className="min-w-full bg-indigo-900/30 text-white rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-blue-900/40 text-orange-300">
                <th className="p-3">#</th>
                <th className="p-3">العنوان</th>
                <th className="p-3">الوصف</th>
                <th className="p-3">الصورة</th>
                <th className="p-3">الزر</th>
                <th className="p-3">ترتيب</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-blue-200">لا توجد أي سلايدات بعد.</td>
                </tr>
              )}
              {banners.map((b, i) => (
                <tr key={b.id} className={`border-b border-blue-400/10 hover:bg-blue-900/20 transition-all ${editingId === b.id ? 'bg-blue-950/60' : ''}` }>
                  <td className="p-3 font-bold text-blue-200">{i+1}</td>
                  <td className="p-3 font-bold text-orange-200">{b.title}</td>
                  <td className="p-3 text-blue-100">{b.subtitle}</td>
                  <td className="p-3">{b.imageUrl && <img src={b.imageUrl} alt="صورة" className="w-24 h-16 object-cover rounded-xl border-2 border-orange-400 shadow" />}</td>
                  <td className="p-3 text-pink-200 font-bold">{b.ctaText}</td>
                  <td className="p-3 text-blue-200">{b.order}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={()=>handleEdit(b)} className="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-1"><Edit2 className="w-4 h-4" />تعديل</button>
                    <button onClick={()=>handleDelete(b.id!)} className="px-3 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-bold transition-all flex items-center gap-1"><Trash2 className="w-4 h-4" />حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 