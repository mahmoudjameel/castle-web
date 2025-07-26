"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter } from "react-icons/fa";
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function TalentPublicProfile() {
  const { id } = useParams();
  const [talent, setTalent] = useState<Record<string, any> | null>(null);
  const [portfolio, setPortfolio] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  // إضافة state جديد لتواريخ التقييمات كنصوص
  const [reviewDates, setReviewDates] = useState<string[]>([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedServicesSummary, setSelectedServicesSummary] = useState<any[]>([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [orderDate, setOrderDate] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  // دالة مساعدة لتنظيف localStorage
  const clearPendingOrderData = () => {
    localStorage.removeItem('pendingOrder_talentId');
    localStorage.removeItem('pendingOrder_clientId');
    localStorage.removeItem('pendingOrder_date');
    localStorage.removeItem('pendingOrder_message');
    localStorage.removeItem('pendingOrder_services');
    localStorage.removeItem('pendingOrder_address');
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/accounts?id=${id}`)
      .then(res => res.json())
      .then(data => setTalent(Array.isArray(data) ? data[0] : data))
      .finally(() => setLoading(false));
    fetch(`/api/portfolio?userId=${id}`)
      .then(res => res.json())
      .then(data => setPortfolio(data));
    fetch(`/api/reviews?userId=${id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        // معالجة التواريخ
        setReviewDates(Array.isArray(data) ? data.map(r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : '') : []);
      });
  }, [id]);



  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.reviewerName || !reviewForm.rating || !reviewForm.comment) return;
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, ...reviewForm }),
    });
    if (res.ok) {
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setReviewForm({ reviewerName: '', rating: 0, comment: '' });
    }
    setSubmitting(false);
  };

  const handleServiceChange = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleOrderRequest = async () => {
    // حساب إجمالي السعر للخدمات المختارة
    let total = 0;
    let servicesArr = [];
    try { servicesArr = JSON.parse(talent?.services || '[]'); } catch {}
    const selected = servicesArr.filter((srv: any) => selectedServices.includes(srv.name));
    total = selected.reduce((sum: number, srv: any) => sum + Number(srv.price || 0), 0);
    setSelectedServicesSummary(selected);
    setSelectedTotal(total);
    setShowOrderModal(false); // أغلق مودال اختيار الخدمات مباشرة
    setShowConfirmModal(true); // افتح مودال ملخص الدفع
  };

  const handleConfirmAndPay = async () => {
    setShowConfirmModal(false);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { setShowLoginMsg(true); return; }
      const user = JSON.parse(userStr);
      let servicesArr = [];
      try { servicesArr = JSON.parse(talent?.services || '[]'); } catch {}
      const selectedServices = selectedServicesSummary;
      const address = user.address || "";
      
      // حفظ تفاصيل الطلب في localStorage كنسخة احتياطية
      localStorage.setItem('pendingOrder_talentId', talent?.id?.toString() || '');
      localStorage.setItem('pendingOrder_clientId', user.id?.toString() || '');
      localStorage.setItem('pendingOrder_date', orderDate || new Date().toISOString());
      localStorage.setItem('pendingOrder_message', orderMessage || 'طلب جديد');
      localStorage.setItem('pendingOrder_services', JSON.stringify(selectedServices));
      localStorage.setItem('pendingOrder_address', address);
      
      const res = await fetch('/api/paymob-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTotal,
          user: {
            email: talent?.email,
            firstName: talent?.name?.split(' ')[0] || '',
            lastName: talent?.name?.split(' ')[1] || '',
            phone: talent?.phone || ''
          },
          metadata: {
            talentId: talent?.id,
            clientId: user.id,
            services: JSON.stringify(selectedServices),
            message: orderMessage || 'طلب جديد',
            date: orderDate || new Date().toISOString(),
            address: user.address || ''
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        // تنظيف localStorage في حالة فشل عملية الدفع
        clearPendingOrderData();
        
        if (data.error && data.details && data.details.includes('Too many attempts')) {
          alert('تم حظر الاتصال مؤقتًا من Paymob. يرجى المحاولة بعد 30 دقيقة أو استخدام شبكة مختلفة.');
          return;
        }
        if (data.error && data.details && data.details.includes('incorrect credentials')) {
          alert('خطأ في بيانات الاعتماد. يرجى التحقق من إعدادات Paymob.');
          return;
        }
        if (data.error && data.details && data.details.includes('استجابة غير صحيحة')) {
          alert('خطأ في استجابة Paymob. يرجى التحقق من الحساب أو المحاولة لاحقاً.');
          return;
        }
        alert(`خطأ في بوابة الدفع: ${data.error || 'خطأ غير معروف'}\n\nالتفاصيل: ${data.details || 'لا توجد تفاصيل'}`);
        return;
      }
      setIframeUrl(data.iframe);
      setShowPaymentModal(true);
    } catch (error) {
      // تنظيف localStorage في حالة حدوث خطأ
      clearPendingOrderData();
      
      console.error('Payment error:', error);
      alert('خطأ في الاتصال مع بوابة الدفع. يرجى المحاولة مرة أخرى.\n\nالتفاصيل: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    }
  };

  const getAvailableSlots = () => {
    let slots: { label: string, value: string }[] = [];
    try {
      if (!talent?.workingSchedule) return slots;
      const schedule = JSON.parse(talent.workingSchedule);
      const daysAr: Record<string, string> = {
        sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
      };
      Object.keys(schedule).forEach(day => {
        if (schedule[day]?.active && schedule[day].from && schedule[day].to) {
          slots.push({
            label: `${daysAr[day]} (${schedule[day].from} - ${schedule[day].to})`,
            value: `${day}:${schedule[day].from}-${schedule[day].to}`
          });
        }
      });
    } catch {}
    return slots;
  };

  if (loading || !talent) {
    return <div className="flex items-center justify-center min-h-[60vh] text-blue-200">جاري تحميل البيانات...</div>;
  }

  let workingSchedule: Record<string, any> = {};
  try { if (talent.workingSchedule) workingSchedule = JSON.parse(talent.workingSchedule); } catch {}
  const daysAr: Record<string, string> = {
    sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
  };
  let socialLinks: Record<string, string> = {};
  try { if (talent.socialLinks) socialLinks = JSON.parse(talent.socialLinks); } catch {}

  // حساب متوسط التقييم وعدد التقييمات
  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount).toFixed(1) : null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-10 px-2 flex justify-center">
        <div className="w-full max-w-4xl bg-indigo-950/80 rounded-2xl shadow-lg p-8 border border-blue-400/20">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-2">
              {talent?.profileImageData ? (
                <Image src={`data:image/png;base64,${talent.profileImageData}`} alt={talent.name as string} width={128} height={128} className="w-32 h-32 object-cover rounded-full border-4 border-orange-400 shadow-lg bg-indigo-900" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-200 text-5xl border-4 border-blue-400/30">👤</div>
              )}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-center text-blue-100 mb-1">{talent.name}</div>
            <div className="text-orange-300 font-bold text-center mb-1">{talent.jobTitle}</div>
            {/* منطقة العمل وإمكانية السفر */}
            {(talent.workArea || talent.canTravelAbroad) && (
              <div className="flex flex-col md:flex-row gap-2 items-center justify-center mb-2">
                {talent.workArea && (
                  <span className="bg-blue-900/40 text-blue-200 px-3 py-1 rounded-lg border border-blue-400/20 font-bold">منطقة العمل: {talent.workArea}</span>
                )}
                {talent.canTravelAbroad && (
                  <span className="bg-green-900/40 text-green-200 px-3 py-1 rounded-lg border border-green-400/20 font-bold flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    بإمكاني السفر خارج المملكة
                  </span>
                )}
              </div>
            )}
            {/* bio بتصميم مرتب */}
            {talent.bio && (
              <div className="text-blue-200 text-center mb-4 max-w-xl mx-auto bg-blue-900/30 rounded-lg px-4 py-3 shadow border border-blue-400/10 whitespace-pre-line break-words" style={{fontSize:'1.1rem', lineHeight:'1.8'}}>
                {talent.bio}
              </div>
            )}
          </div>
          <div className="text-lg text-center text-blue-100 mb-6">{talent.intro || ""}</div>
          {/* معرض الأعمال */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4 text-orange-300 text-center">معرض الأعمال</h3>
            {portfolio.length === 0 ? (
              <div className="text-blue-200 text-center">لا يوجد أعمال بعد.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {portfolio.map(item => (
                  <div key={item.id} className="overflow-hidden rounded-2xl shadow-lg border-2 border-pink-400/30 bg-gradient-to-tr from-indigo-900/60 to-purple-900/60">
                    {item.type === 'image' && item.mediaData && (
                      <Image src={`data:image/png;base64,${item.mediaData}`} alt={item.title || 'عمل'} width={320} height={192} className="w-full h-48 object-cover" />
                    )}
                    {item.type === 'video' && item.mediaUrl && (
                      <iframe src={item.mediaUrl.replace('watch?v=', 'embed/')} title={item.title || 'فيديو'} className="w-full h-48" allowFullScreen />
                    )}
                    <div className="font-bold text-center text-blue-100 mb-2 text-base p-2 truncate w-full bg-blue-900/30">{item.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* جدول المواعيد */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-orange-300 text-center">جدول المواعيد المتاحة</h3>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              {Object.keys(daysAr).map(day => (
                workingSchedule[day]?.active ? (
                  <div key={day} className="bg-blue-900/40 rounded-lg px-4 py-2 flex items-center gap-2 border border-blue-400/20 text-blue-100 font-bold">
                    <span>{daysAr[day]}:</span>
                    <span>{workingSchedule[day].from} - {workingSchedule[day].to}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
          {/* الخدمات والأسعار */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-orange-300 text-center">الخدمات والأسعار</h3>
            <div className="flex flex-col gap-2 items-center">
              {talent?.services && (() => {
                let servicesArr = [];
                try { servicesArr = JSON.parse(talent.services); } catch {}
                if (!Array.isArray(servicesArr) || servicesArr.length === 0) {
                  return <div className="text-blue-200 text-center">لا يوجد خدمات مضافة بعد.</div>;
                }
                return servicesArr.map((srv: any, idx: number) => (
                  <div key={idx} className="w-full md:w-1/2 bg-blue-900/40 rounded-lg px-4 py-2 flex justify-between items-center border border-blue-400/20 mb-2">
                    <span>{srv.name}</span>
                    <span className="text-orange-400 font-bold">{srv.price} ر.س</span>
                  </div>
                ));
              })()}
            </div>
            {/* زر تواصل أو احجز الآن */}
            <div className="flex flex-col items-center mt-6">
                <button onClick={() => {
                  try {
                    const userStr = localStorage.getItem("user");
                    if (!userStr) {
                      setShowLoginMsg(true);
                      return;
                    }
                    setShowOrderModal(true);
                  } catch {
                    setShowLoginMsg(true);
                  }
                }} className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition-all">تواصل أو احجز الآن</button>
              {showLoginMsg && (
                <div className="mt-4 bg-blue-900/60 text-orange-300 px-4 py-2 rounded-lg border border-orange-400/30 text-center max-w-xs">
                  يجب تسجيل الدخول أولاً للاستفادة من هذه الميزة.<br/> <a href="/login" className="underline text-orange-400 hover:text-pink-400">سجّل الدخول الآن</a>
                </div>
              )}
            </div>
            {/* أيقونات السوشيال ميديا بشكل مميز */}
            <div className="flex gap-4 justify-center mt-6">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-br from-pink-500 to-orange-400 shadow-lg w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform">
                  <FaInstagram size={28} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-br from-black to-gray-700 shadow-lg w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform">
                  <FaTiktok size={28} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-br from-red-600 to-pink-500 shadow-lg w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform">
                  <FaYoutube size={28} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform">
                  <FaTwitter size={28} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </a>
              )}
            </div>
          </div>
          {/* Modal الطلب */}
          <Dialog open={showOrderModal} onClose={()=>setShowOrderModal(false)} PaperProps={{style:{borderRadius:20,background:'#1e1b4b',color:'#fff',minWidth:340}}}>
            <DialogTitle sx={{fontWeight:700, fontSize:'1.3rem', color:'#FFA726', textAlign:'center'}}>طلب خدمة من {talent?.name}</DialogTitle>
            <DialogContent>
              <div className="mb-4 text-blue-200 font-bold">اختر الخدمات المطلوبة:</div>
              {talent?.services && (() => {
                let servicesArr = [];
                try { servicesArr = JSON.parse(talent.services); } catch {}
                if (!Array.isArray(servicesArr) || servicesArr.length === 0) {
                  return <div className="text-blue-400 mb-2">لا يوجد خدمات متاحة حالياً.</div>;
                }
                return servicesArr.map((srv: any, idx: number) => (
                  <FormControlLabel
                    key={idx}
                    control={<Checkbox checked={selectedServices.includes(srv.name)} onChange={()=>handleServiceChange(srv.name)} sx={{color:'#FFA726','&.Mui-checked':{color:'#FFA726'}}} />}
                    label={<span className="text-white">{srv.name} <span className="text-orange-400 font-bold">({srv.price} ر.س)</span></span>}
                  />
                ));
              })()}
              <div className="mt-4 mb-2 text-blue-200 font-bold">اختر الموعد المتاح:</div>
              
              <select value={orderDate} onChange={e=>setOrderDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white mb-4">
                <option value="">اختر موعداً...</option>
                {getAvailableSlots().map(slot => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>

              <TextField
                label="رسالتك (اختياري)"
                multiline
                minRows={2}
                fullWidth
                value={orderMessage}
                onChange={e => setOrderMessage(e.target.value)}
                className="mt-2"
                InputProps={{style:{color:'#fff'}}}
                InputLabelProps={{style:{color:'#FFA726'}}}
                sx={{'& .MuiOutlinedInput-root':{ '& fieldset':{borderColor:'#FFA726'},'&:hover fieldset':{borderColor:'#FFA726'},'&.Mui-focused fieldset':{borderColor:'#FFA726'}}}}
              />
              {/* زر محادثة صاحب الموهبة */}
              <div className="flex justify-center mt-6">
                <a
                  href={`/chat/${talent?.id}`}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all text-lg"
                  style={{textDecoration:'none'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M2 21l1.65-4.95A8.001 8.001 0 1 1 10 18h-.13L2 21zm8-7a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/></svg>
                  محادثة صاحب الموهبة
                </a>
              </div>
            </DialogContent>
            <DialogActions sx={{justifyContent:'center',pb:2}}>
              <Button onClick={()=>setShowOrderModal(false)} color="secondary" sx={{fontWeight:700}}>إلغاء</Button>
                              <Button onClick={handleOrderRequest} color="warning" variant="contained" sx={{fontWeight:700}} disabled={selectedServices.length === 0 || !orderDate}>
                                  احجز الآن
              </Button>
            </DialogActions>
          </Dialog>
          {/* حسّن تصميم نافذة الدفع: */}
          {showPaymentModal && iframeUrl && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-6 relative w-[95vw] max-w-lg flex flex-col items-center">
                {/* زر إغلاق */}
                <button
                  onClick={() => {
                    // تنظيف localStorage عند إغلاق مودال الدفع
                    clearPendingOrderData();
                    setShowPaymentModal(false);
                  }}
                  className="absolute top-3 left-3 text-red-500 font-bold text-xl"
                  aria-label="إغلاق"
                >×</button>
                {/* شعار الموقع */}
                <Image src="/logo.png" alt="شعار الموقع" width={60} height={60} className="mb-2" />
                {/* عنوان الدفع */}
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  إتمام عملية الدفع
                </h2>
                {/* معلومات Paymob للديباغ */}
                <div className="text-xs text-blue-400 mb-2">
                  Integration ID: {process.env.NEXT_PUBLIC_PAYMOB_INTEGRATION_ID || '13184'} | Iframe ID: {process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID || '9083'}
                  <br/>
                  <span className="text-[10px] text-blue-300">(هذه المعلومات تظهر فقط للديباغ ويمكن إزالتها لاحقاً)</span>
                </div>
                {/* مجموع المبلغ */}
                <div className="text-lg font-bold text-orange-500 mb-4">
                  المبلغ الإجمالي: <span>{selectedTotal} ر.س</span>
                </div>
                {/* تعليمات */}
                <div className="text-blue-700 mb-4 text-center">
                  يرجى إتمام عملية الدفع عبر بوابة Paymob الآمنة أدناه.
                </div>
                {/* iframe الدفع */}
                <iframe
                  src={iframeUrl}
                  className="w-full h-[400px]"
                  style={{ border: 0, borderRadius: 16, boxShadow: '0 2px 16px #0002' }}
                  allowFullScreen
                  onLoad={(e) => {
                    console.log('Payment iframe loaded');
                    // محاولة اكتشاف نجاح الدفع من URL
                    const iframe = e.target as HTMLIFrameElement;
                    try {
                      const iframeUrl = iframe.contentWindow?.location.href;
                                                    if (iframeUrl && (iframeUrl.includes('success=true') || iframeUrl.includes('approved'))) {
                                console.log('Payment success detected from iframe URL');
                                // تنظيف localStorage عند نجاح الدفع
                                clearPendingOrderData();
                              } else if (iframeUrl && iframeUrl.includes('error')) {
                        console.log('Payment error detected from iframe URL');
                        // تنظيف localStorage عند فشل الدفع
                        clearPendingOrderData();
                        setShowPaymentModal(false);
                        window.location.href = '/payment-failed?error=فشلت عملية الدفع';
                      }
                    } catch (error) {
                      // تجاهل أخطاء CORS
                      console.log('Cannot access iframe URL due to CORS');
                    }
                  }}
                />
                {/* ملاحظة: سيتم التوجيه التلقائي بعد الدفع */}
                <div className="text-xs text-gray-500 mt-2 text-center">
                  بعد إتمام الدفع، سيتم توجيهك تلقائياً لصفحة النجاح
                </div>
              </div>
            </div>
          )}
          {/* قسم التقييمات */}
          <div className="mb-10 mt-10">
            <h3 className="text-2xl font-bold mb-4 text-orange-300 text-center">التقييمات</h3>
            {reviews.length === 0 ? (
              <div className="text-blue-200 text-center mb-4">لا يوجد تقييمات بعد.</div>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="bg-blue-900/40 rounded-xl border border-blue-400/20 shadow-md p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={18} className={i <= rev.rating ? 'text-orange-400 fill-current' : 'text-blue-400'} />
                      ))}
                      <span className="font-bold text-orange-300 ml-2">{rev.reviewerName}</span>
                      <span className="text-xs text-blue-200 ml-2">{reviewDates[idx]}</span>
                    </div>
                    <div className="text-blue-100 text-sm mt-1 whitespace-pre-line">{rev.comment}</div>
                  </div>
                ))}
              </div>
            )}
            {/* نموذج إضافة تقييم جديد */}
            <form onSubmit={handleReviewSubmit} className="bg-blue-900/30 rounded-xl p-6 border border-blue-400/10 max-w-xl mx-auto flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input type="text" placeholder="اسمك" className="flex-1 px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" value={reviewForm.reviewerName} onChange={e=>setReviewForm({...reviewForm, reviewerName: e.target.value})} required />
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <button type="button" key={i} onClick={()=>setReviewForm({...reviewForm, rating: i})} className={reviewForm.rating >= i ? 'text-orange-400' : 'text-blue-400'}>
                      <Star size={22} className={reviewForm.rating >= i ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea placeholder="تعليقك..." className="px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white min-h-[60px]" value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm, comment: e.target.value})} required />
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'جاري الإرسال...' : 'إضافة تقييم'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative w-[95vw] max-w-md rounded-3xl shadow-2xl border-2 border-blue-400/30 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-0 overflow-hidden">
            {/* رأس المودال */}
            <div className="flex flex-col items-center py-6 px-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-t-3xl shadow">
              <Image src="/logo.png" alt="شعار الموقع" width={48} height={48} className="mb-2" />
              <h2 className="text-2xl font-bold text-white mb-1 drop-shadow">تأكيد تفاصيل الدفع</h2>
              <div className="text-blue-50 text-center mb-2 text-base">يرجى مراجعة تفاصيل الخدمات والمبلغ قبل إتمام الطلب</div>
            </div>
            {/* جدول الخدمات */}
            <div className="w-full bg-white/90 rounded-b-3xl px-6 py-6">
              <table className="w-full text-right mb-4">
                <thead>
                  <tr className="text-orange-400 text-lg">
                    <th className="py-2 font-bold">الخدمة</th>
                    <th className="py-2 font-bold">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedServicesSummary.map((srv, idx) => (
                    <tr key={idx} className="text-blue-900">
                      <td className="py-1 font-semibold flex items-center gap-2">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#FFA726"/>
                          <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {srv.name}
                      </td>
                      <td className="py-1 font-bold text-orange-500">{srv.price} ر.س</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold text-lg border-t border-blue-200">
                    <td className="py-2">الإجمالي</td>
                    <td className="py-2 text-orange-600">{selectedTotal} ر.س</td>
                  </tr>
                </tfoot>
              </table>
              {/* زر التأكيد */}
              <button
                onClick={handleConfirmAndPay}
                className="w-full mt-2 px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <rect width="24" height="24" rx="12" fill="#1A9F29"/>
                    <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  تأكيد والدفع
                </span>
              </button>
              {/* زر إغلاق دائري أعلى اليسار */}
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-3 left-3 bg-white/80 hover:bg-red-100 text-red-500 font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow"
                aria-label="إغلاق"
              >×</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 