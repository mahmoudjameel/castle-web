"use client";
import React, { useEffect, useRef, useState } from "react";
import { Trash2, Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import Image from "next/image";
import { compressFiles, getFileSizeMB, isFileSizeAcceptable } from "@/lib/fileCompression";
import { logBrowserInfo } from "@/lib/safariSupport";

interface PortfolioItem {
  id: number;
  mediaType?: string; // توافق قديم
  type?: string;      // الحقل الفعلي من الـ API
  title?: string;
  mediaData?: string;
  mediaUrl?: string;
  createdAt: string;
  // workLink?: string; // محذوف من الواجهة
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
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  // اختيار طريقة إدخال الفيديو: رابط أو ملف
  const [videoInputType, setVideoInputType] = useState<'url'|'file'>('url');
  // مؤشر تقدم الضغط (للصور فقط)
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // جلب userId من localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserId(u.id);
      }
    } catch {}
    
    // فحص دعم Safari وطباعة معلومات المتصفح
    logBrowserInfo();
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
    if (type === 'video' && videoInputType === 'url' && !mediaUrl) return setMessage('يرجى إدخال رابط الفيديو');
    if (type === 'video' && videoInputType === 'file' && !file) return setMessage('يرجى اختيار ملف فيديو');
    setUploading(true);
    setMessage('');
    
    if (type === 'image') {
        try {
          // ضغط الصور قبل الرفع
          setMessage('جاري ضغط الصور...');
          setCompressionProgress(0);
          
          const compressedFiles = await compressFiles(files);
          setCompressionProgress(100);
          
          // التحقق من نجاح الضغط
          if (compressedFiles.length === 0) {
            setMessage('فشل في ضغط الصور، يرجى المحاولة مرة أخرى');
            setUploading(false);
            return;
          }
        
        const uploadedItems: PortfolioItem[] = [];
        for (const file of compressedFiles) {
          // التحقق من حجم الملف بعد الضغط
          const fileSizeMB = getFileSizeMB(file);
          console.log(`حجم الملف بعد الضغط: ${fileSizeMB.toFixed(2)} MB`);
          
          // التحقق من أن الملف صالح
          if (file.size === 0) {
            setMessage('فشل في ضغط أحد الملفات، يرجى المحاولة مرة أخرى');
            setUploading(false);
            return;
          }
          
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
        setTitle(''); setFiles([]); setFile(null); setMediaUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage('تم رفع جميع الأعمال بنجاح!');
        setUploading(false);
        return;
        } catch (error) {
          console.error('خطأ في ضغط الصور:', error);
          setMessage('حدث خطأ في ضغط الصور. يرجى المحاولة مرة أخرى أو رفع الملفات الأصلي');
          setUploading(false);
          return;
        }
    }
    // Handle video upload
    if (type === 'video') {
      // إذا كان الفيديو كملف مرفوع
      if (videoInputType === 'file' && file) {
        try {
          // رفع الفيديو الأصلي بدون ضغط
          setMessage('جاري تجهيز الفيديو... قد يستغرق بعض الوقت على الأجهزة المحمولة');
          setUploadProgress(10);
          
          // التحقق من حجم الملف
          const fileSizeMB = getFileSizeMB(file);
          console.log(`🎥 حجم الفيديو: ${fileSizeMB.toFixed(2)} MB`);
          console.log(`📱 نوع الجهاز: ${navigator.userAgent}`);
          
          // التحقق من أن الملف صالح
          if (file.size === 0) {
            setMessage('الملف فارغ، يرجى اختيار ملف صالح');
            setUploading(false);
            setUploadProgress(0);
            return;
          }
          
          // التحقق من حجم الملف (حد أقصى 50MB لجميع الأجهزة)
          const maxSize = 50;
          if (fileSizeMB > maxSize) {
            setMessage(`حجم الفيديو كبير جداً. الحد الأقصى المسموح هو ${maxSize}MB`);
            setUploading(false);
            setUploadProgress(0);
            return;
          }
          
          // إضافة تحقق من متصفح Safari
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (isSafari) {
            console.log('ℹ️ تم الكشف عن متصفح Safari - تطبيق معالجة خاصة');
          }
          
          setMessage('جاري قراءة الفيديو...');
          setUploadProgress(30);
          
          // قراءة الملف مع دعم محسن للموبايل
          const mediaDataBase64 = await new Promise<string | undefined>((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
              try {
                const result = reader.result;
                let base64;
                
                if (typeof result === 'string') {
                  // معالجة DataURL
                  base64 = result.split(',')[1];
                } else if (result instanceof ArrayBuffer) {
                  // معالجة ArrayBuffer للملفات الكبيرة
                  const bytes = new Uint8Array(result);
                  let binary = '';
                  bytes.forEach(b => binary += String.fromCharCode(b));
                  base64 = btoa(binary);
                }
                
                if (!base64) {
                  reject(new Error('فشل في تحويل الملف'));
                  return;
                }
                
                resolve(base64);
              } catch (error) {
                reject(error);
              }
            };
            
            reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
            
            // استخدام ArrayBuffer للملفات الكبيرة أو متصفح Safari
            if (file.size > 10 * 1024 * 1024 || isSafari) {
              reader.readAsArrayBuffer(file);
            } else {
              reader.readAsDataURL(file);
            }
          });
          
          if (!mediaDataBase64) {
            setMessage('فشل قراءة ملف الفيديو. حاول تقليل حجم الفيديو.');
            setUploading(false);
            setUploadProgress(0);
            return;
          }
          
          setMessage('جاري رفع الفيديو...');
          setUploadProgress(70);
          console.log('📤 بدء رفع الفيديو إلى الخادم...');
          
          const res = await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              type,
              title,
              mediaData: mediaDataBase64,
            }),
          });
          
          setUploadProgress(90);
          
          if (res.ok) {
            const newItem = await res.json();
            setItems([newItem, ...items]);
            setTitle(''); setMediaUrl(''); setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setUploadProgress(100);
            setMessage('تم رفع العمل بنجاح! ✅');
            console.log('✅ تم رفع الفيديو بنجاح');
            
            // مسح الرسالة بعد 3 ثوانٍ
            setTimeout(() => {
              setMessage('');
              setUploadProgress(0);
            }, 3000);
          } else {
            const err = await res.json();
            console.error('❌ خطأ من الخادم:', err);
            setMessage(err.message || 'حدث خطأ أثناء الرفع.');
            setUploadProgress(0);
          }
          setUploading(false);
          return;
        } catch (error) {
          console.error('❌ خطأ في رفع الفيديو:', error);
          setMessage(`حدث خطأ في رفع الفيديو: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
          setUploading(false);
          setUploadProgress(0);
          return;
        }
      }
      // إذا كان الفيديو كرابط
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          title,
          mediaUrl: mediaUrl,
        }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems([newItem, ...items]);
        setTitle(''); setMediaUrl(''); setFile(null);
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
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={()=>setVideoInputType('url')} className={`px-3 py-2 rounded-lg text-sm border ${videoInputType==='url' ? 'border-orange-400 bg-orange-500/20 text-orange-200' : 'border-blue-400/30 text-blue-100'}`}>رابط فيديو</button>
                <button type="button" onClick={()=>setVideoInputType('file')} className={`px-3 py-2 rounded-lg text-sm border ${videoInputType==='file' ? 'border-orange-400 bg-orange-500/20 text-orange-200' : 'border-blue-400/30 text-blue-100'}`}>ملف فيديو</button>
              </div>
              {videoInputType === 'url' ? (
                <>
                  <label className="block mb-2 text-blue-100">رابط الفيديو (YouTube, Vimeo...)</label>
                  <input type="url" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" placeholder="https://youtube.com/..." />
                </>
              ) : (
                <>
                  <label className="block mb-2 text-blue-100">اختر ملف فيديو (جميع الصيغ مدعومة - حتى 50MB)</label>
                  <input
                    type="file"
                    accept="video/*,.mov,.avi,.mkv,.webm,.3gp,.m4v"
                    ref={fileInputRef}
                    onChange={e => setFile((e.target.files && e.target.files[0]) || null)}
                    className="w-full text-blue-100"
                  />
                  {file && (
                    <div className="mt-2 text-sm text-blue-200">
                      الملف المختار: {file.name} ({getFileSizeMB(file).toFixed(2)} MB)
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* تم حذف رابط العمل (اختياري) */}
          <button type="submit" disabled={uploading} className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {uploading && <Loader2 className="animate-spin" size={20} />} رفع العمل
          </button>
          
          {/* شريط تقدم الضغط (للصور فقط) */}
          {uploading && type === 'image' && compressionProgress > 0 && compressionProgress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-200 mb-2">
                <span>جاري ضغط الصور...</span>
                <span>{compressionProgress}%</span>
              </div>
              <div className="w-full bg-blue-900/40 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* شريط تقدم رفع الفيديو */}
          {uploading && type === 'video' && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-200 mb-2">
                <span>{message}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-900/40 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
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
                {(item.type === 'image' && item.mediaData) && (
                  <Image
                    src={`data:image/png;base64,${item.mediaData}`}
                    alt={item.title || 'عمل'}
                    width={200}
                    height={100}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                {/* لا تعرض أي صورة إذا لم يوجد mediaData */}
                {(item.mediaType === 'video' || item.type === 'video') && item.mediaUrl && (
                  <iframe
                    src={item.mediaUrl.replace('watch?v=', 'embed/')}
                    title={item.title || 'فيديو'}
                    className="w-full h-40 rounded-lg mb-2"
                    allowFullScreen
                  />
                )}
                {(item.mediaType === 'video' || item.type === 'video') && item.mediaData && (
                  <video
                    controls
                    className="w-full h-40 rounded-lg mb-2"
                    src={`data:video/mp4;base64,${item.mediaData}`}
                  />
                )}
                <div className="font-bold text-center text-blue-100 mb-1 text-sm truncate w-full">{item.title}</div>
                {/* تم حذف عرض رابط العمل */}
                <button className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all" onClick={() => handleDelete(item.id)} title="حذف العمل"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 