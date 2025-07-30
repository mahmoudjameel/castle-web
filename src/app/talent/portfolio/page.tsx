"use client";
import React, { useEffect, useRef, useState } from "react";
import { Trash2, Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import Image from "next/image";

interface PortfolioItem {
  id: number;
  mediaType: string;
  title?: string;
  mediaData?: string;
  mediaUrl?: string;
  createdAt: string;
  workLink?: string;
}

export default function TalentPortfolio() {
  const [userId, setUserId] = useState<number | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [workLink, setWorkLink] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // جلب userId من localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserId(u.id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/portfolio?userId=${userId}`)
      .then(res => res.json())
      .then(data => setItems(data))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUpload = async (e: React.FormEvent) => {
    // type is always 'image' | 'video' due to useState typing
    e.preventDefault();
    if (!userId) return setMessage('يجب تسجيل الدخول');
    if (type === 'image' && files.length === 0) return setMessage('يرجى اختيار صورة واحدة على الأقل');
    if (type === 'video' && !mediaUrl) return setMessage('يرجى إدخال رابط الفيديو');
    setUploading(true);
    setMessage('');
    if (type === 'image') {
      const uploadedItems: PortfolioItem[] = [];
      for (const file of files) {
        const mediaDataBase64 = await new Promise<string | undefined>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string)?.split(',')[1]);
          reader.onerror = () => resolve(undefined);
          reader.readAsDataURL(file);
        });
        if (!mediaDataBase64) {
          setMessage('فشل قراءة أحد الملفات.');
          setUploading(false);
          return;
        }
        const res = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type,
            title,
            mediaData: mediaDataBase64,
            workLink: workLink || undefined,
          }),
        });
        if (res.ok) {
          const newItem = await res.json();
          uploadedItems.push(newItem);
        } else {
          const err = await res.json();
          setMessage(err.message || 'حدث خطأ أثناء رفع أحد الأعمال.');
          setUploading(false);
          return;
        }
      }
      setItems([...uploadedItems, ...items]);
      setTitle(''); setFiles([]); setFile(null); setMediaUrl(''); setWorkLink('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage('تم رفع جميع الأعمال بنجاح!');
      setUploading(false);
      return;
    }
    // Handle video upload
    if (type === 'video') {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          title,
          mediaUrl: mediaUrl,
          workLink: workLink || undefined,
        }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems([newItem, ...items]);
        setTitle(''); setMediaUrl(''); setWorkLink('');
        setMessage('تم رفع العمل بنجاح!');
      } else {
        const err = await res.json();
        setMessage(err.message || 'حدث خطأ أثناء الرفع.');
      }
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;
    const res = await fetch('/api/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20 mb-10">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">إضافة عمل جديد</h2>
        <form className="space-y-6" onSubmit={handleUpload}>
          <div className="flex gap-4 justify-center mb-2">
            <button type="button" onClick={() => { setType('image'); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${type === 'image' ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 'border-blue-400/30 bg-blue-900/40 text-blue-100 hover:border-orange-400'}`}>
              <ImageIcon /> صورة
            </button>
            <button type="button" onClick={() => { setType('video'); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${type === 'video' ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 'border-blue-400/30 bg-blue-900/40 text-blue-100 hover:border-orange-400'}`}>
              <VideoIcon /> فيديو
            </button>
          </div>
          <div>
            <label className="block mb-2 text-blue-100">عنوان العمل (اختياري)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="مثال: جلسة تصوير، إعلان..." />
          </div>
          {type === 'image' && (
            <div>
              <label className="block mb-2 text-blue-100">اختر صور</label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={e => setFiles(Array.from(e.target.files || []))}
                className="w-full text-blue-100"
              />
            </div>
          )}
          {type === 'video' && (
            <div>
              <label className="block mb-2 text-blue-100">رابط الفيديو (YouTube, Vimeo...)</label>
              <input type="url" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="https://youtube.com/..." />
            </div>
          )}
          <div>
            <label className="block mb-2 text-blue-100">رابط العمل (اختياري)</label>
            <input
              type="url"
              value={workLink}
              onChange={e => setWorkLink(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white"
              placeholder="https://mysite.com/project..."
            />
          </div>
          <button type="submit" disabled={uploading} className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {uploading && <Loader2 className="animate-spin" size={20} />} رفع العمل
          </button>
          {message && <div className="mt-4 text-center text-orange-300 font-bold">{message}</div>}
        </form>
      </div>
      <div className="max-w-4xl mx-auto bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
        <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">معرض الأعمال</h3>
        {loading ? (
          <div className="flex justify-center items-center min-h-[120px]"><Loader2 className="animate-spin text-blue-400" size={32} /></div>
        ) : items.length === 0 ? (
          <div className="text-blue-200 text-center">لا يوجد أعمال بعد.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="relative bg-indigo-800/30 rounded-xl p-3 border border-blue-400/30 shadow-md flex flex-col items-center">
                {item.mediaType === 'image' && item.mediaData && (
                  <Image
                    src={`data:image/png;base64,${item.mediaData}`}
                    alt={item.title || 'عمل'}
                    width={200}
                    height={100}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                {/* لا تعرض أي صورة إذا لم يوجد mediaData */}
                {item.mediaType === 'video' && item.mediaUrl && (
                  <iframe
                    src={item.mediaUrl.replace('watch?v=', 'embed/')}
                    title={item.title || 'فيديو'}
                    className="w-full h-40 rounded-lg mb-2"
                    allowFullScreen
                  />
                )}
                <div className="font-bold text-center text-blue-100 mb-1 text-sm truncate w-full">{item.title}</div>
                {item.workLink && (
                  <a
                    href={item.workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline text-xs mb-1 break-all"
                    title="رابط العمل"
                  >
                    {item.workLink}
                  </a>
                )}
                <button className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all" onClick={() => handleDelete(item.id)} title="حذف العمل"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 