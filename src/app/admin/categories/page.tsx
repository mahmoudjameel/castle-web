'use client';

import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt?: string;
  imageData?: string; // Added for base64 data
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // منطق التعديل والحذف
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  async function uploadImage(file: File): Promise<string | undefined> {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { Authorization: 'Client-ID 2b7e1e7e0b6b1b1' },
      body: form,
    });
    const data = await res.json();
    return data.success ? data.data.link : undefined;
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!imageFile && !imageUrl)) {
      setMessage("الاسم والصورة مطلوبة.");
      return;
    }
    setUploading(true);
    let imageDataBase64: string | undefined = undefined;
    let finalImageUrl: string | undefined = imageUrl || undefined;
    if (imageFile) {
      // اقرأ الصورة كـ base64
      imageDataBase64 = await new Promise<string | undefined>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string)?.split(',')[1]);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(imageFile);
      });
      if (!imageDataBase64) {
        setMessage('فشل قراءة الصورة. جرب صورة أخرى.');
        setUploading(false);
        return;
      }
      finalImageUrl = undefined; // لا ترسل imageUrl إذا أرسلت imageData
    }
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: name.toLowerCase().replace(/\s+/g, '-'), name, imageUrl: finalImageUrl, imageData: imageDataBase64 }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories([newCat, ...categories]);
      setMessage('تمت إضافة التصنيف بنجاح!');
      setName(""); setImageFile(undefined); setImageUrl(""); setPreview(undefined);
    } else {
      const err = await res.json();
      setMessage(err.message || 'حدث خطأ أثناء الإضافة.');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف التصنيف؟')) return;
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setCategories(categories.filter(cat => cat.id !== id));
    } else {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditImageUrl(cat.imageUrl || "");
    setPreview(cat.imageUrl);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUploading(true);
    let finalImageUrl = editImageUrl;
    if (imageFile) {
      finalImageUrl = await uploadImage(imageFile) || '';
    }
    const res = await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, name: editName, imageUrl: finalImageUrl }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(categories.map(cat => cat.id === editId ? updated : cat));
      setEditId(null); setEditName(""); setEditImageUrl(""); setImageFile(undefined); setPreview(undefined);
    } else {
      alert('حدث خطأ أثناء التعديل');
    }
    setEditUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-lg mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">إضافة تصنيف جديد</h2>
        <form className="space-y-6" onSubmit={handleAddCategory}>
          <div>
            <label className="block mb-2 text-blue-100">اسم التصنيف <span className="text-orange-400">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder="مثال: تمثيل، غناء..." required />
          </div>
          <div>
            <label className="block mb-2 text-blue-100">صورة التصنيف <span className="text-orange-400">*</span></label>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              setImageFile(file);
              if (file) {
                setPreview(URL.createObjectURL(file));
                setImageUrl("");
              } else {
                setPreview(undefined);
              }
            }} className="w-full text-blue-100" />
            <div className="text-center text-blue-200 my-2">أو</div>
            <input type="url" value={imageUrl} onChange={e => {
              setImageUrl(e.target.value);
              setImageFile(undefined);
              setPreview(e.target.value || undefined);
            }} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="https://example.com/image.png" />
            {preview && (
              <div className="mt-4 text-center">
                <img src={preview} alt="معاينة الصورة" className="mx-auto rounded-lg max-h-32 border border-blue-400/30" />
              </div>
            )}
          </div>
          <button type="submit" disabled={uploading} className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">{uploading ? 'جاري رفع الصورة...' : 'إضافة التصنيف'}</button>
          {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
        </form>
      </div>
      {/* قائمة التصنيفات */}
      <div className="max-w-4xl mx-auto mt-10 bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">قائمة التصنيفات</h3>
        {categories.length === 0 ? (
          <div className="text-blue-200 text-center">لا يوجد تصنيفات بعد.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center bg-indigo-800/30 rounded-xl p-4 border border-blue-400/30 shadow-md">
                {cat.imageData ? (
                  <img src={`data:image/png;base64,${cat.imageData}`} alt={cat.name} className="w-24 h-24 object-cover rounded-lg border border-blue-400/30 mb-3" />
                ) : cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-24 h-24 object-cover rounded-lg border border-blue-400/30 mb-3" />
                ) : null}
                {editId === cat.id ? (
                  <form onSubmit={handleEdit} className="flex flex-col items-center gap-2 w-full">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="px-2 py-1 rounded bg-blue-900/40 border border-blue-400/20 text-white w-full" />
                    <input type="url" value={editImageUrl} onChange={e => { setEditImageUrl(e.target.value); setPreview(e.target.value); }} className="px-2 py-1 rounded bg-blue-900/40 border border-blue-400/20 text-white w-full" placeholder="رابط صورة جديد (اختياري)" />
                    <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; setImageFile(file); if (file) { setPreview(URL.createObjectURL(file)); } else { setPreview(undefined); } }} className="w-full" />
                    {preview && <img src={preview} alt="معاينة" className="w-16 h-16 rounded" />}
                    <div className="flex gap-2">
                      <button type="submit" disabled={editUploading} className="px-3 py-1 bg-blue-500 text-white rounded">حفظ</button>
                      <button type="button" onClick={() => { setEditId(null); setEditName(""); setEditImageUrl(""); setImageFile(undefined); setPreview(undefined); }} className="px-3 py-1 bg-gray-400 text-white rounded">إلغاء</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="font-bold text-lg mb-2 text-center">{cat.name}</div>
                    <div className="flex gap-2 justify-center mt-2">
                      <button className="text-blue-400 hover:underline" onClick={() => startEdit(cat)}>تعديل</button>
                      <button className="text-red-400 hover:underline" onClick={() => handleDelete(cat.id)}>حذف</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 