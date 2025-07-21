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
  const [orderServices, setOrderServices] = useState<string[]>([]);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [showOrderSuccessMsg, setShowOrderSuccessMsg] = useState(false);
  // إضافة state جديد لتواريخ التقييمات كنصوص
  const [reviewDates, setReviewDates] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ name: '', card: '', exp: '', cvv: '' });
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  // دالة التحقق عند الضغط على الزر
  const handleContactOrBook = () => {
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
  };

  const handleOrderServiceChange = (serviceName: string) => {
    setOrderServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
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

  const handleOrderSubmit = async () => {
    setOrderSubmitting(true);
    setOrderSuccess(false);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { setShowLoginMsg(true); setOrderSubmitting(false); return; }
      const user = JSON.parse(userStr);
      let servicesArr = [];
      try { servicesArr = JSON.parse(talent?.services || '[]'); } catch {}
      const selectedServices = servicesArr.filter((srv: any) => orderServices.includes(srv.name));
      // إضافة phone و address
      const phone = user.phone || "";
      const address = user.address || "";
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          talentId: talent?.id,
          clientId: user.id,
          services: selectedServices,
          message: orderMessage,
          date: orderDate,
          phone,
          address,
        }),
      });
      if (res.ok) {
        setOrderSuccess(true);
        setOrderServices([]);
        setOrderMessage('');
        setOrderDate('');
        setShowOrderModal(false);
        setShowOrderSuccessMsg(true);
        setTimeout(()=>setShowOrderSuccessMsg(false), 7000);
      }
    } catch {}
    setOrderSubmitting(false);
  };

  const handleOrderRequest = () => {
    // قبل تنفيذ الطلب، تحقق من الدفع
    if (!paymentDone) {
      setShowPaymentModal(true);
      return;
    }
    handleOrderSubmit();
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
      {/* رسالة نجاح إرسال الطلب */}
      {showOrderSuccessMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-600/95 text-white px-6 py-4 rounded-xl shadow-lg border-2 border-green-300 text-lg font-bold flex flex-col items-center animate-fade-in">
          <span>✅ تم إرسال الطلب بنجاح!</span>
          <span className="text-sm mt-1">يمكنك متابعة حالة الطلب من <a href="/user/orders" className="underline text-orange-200 hover:text-orange-400">لوحة التحكم &rarr; طلباتي</a></span>
        </div>
      )}
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
              <button onClick={handleContactOrBook} className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition-all">تواصل أو احجز الآن</button>
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
                    control={<Checkbox checked={orderServices.includes(srv.name)} onChange={()=>handleOrderServiceChange(srv.name)} sx={{color:'#FFA726','&.Mui-checked':{color:'#FFA726'}}} />}
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
              <Button onClick={handleOrderRequest} color="warning" variant="contained" sx={{fontWeight:700}} disabled={orderSubmitting || orderServices.length === 0 || !orderDate}>
                {orderSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            </DialogActions>
          </Dialog>
          {/* مودال الدفع الوهمي */}
          <Dialog open={showPaymentModal} onClose={()=>setShowPaymentModal(false)} PaperProps={{style:{borderRadius:20,background:'#1e1b4b',color:'#fff',minWidth:340}}}>
            <DialogTitle sx={{fontWeight:700, fontSize:'1.3rem', color:'#FFA726', textAlign:'center'}}>بوابة الدفع</DialogTitle>
            <DialogContent>
              <div className="mb-4 text-blue-200 font-bold text-center">يرجى إدخال بيانات البطاقة لإتمام الدفع</div>
              <form onSubmit={e=>{e.preventDefault(); setPaymentError('');
                if (!paymentForm.name || !paymentForm.card || !paymentForm.exp || !paymentForm.cvv) {
                  setPaymentError('يرجى تعبئة جميع الحقول'); return;
                }
                setPaymentSuccess(true);
                setTimeout(()=>{
                  setPaymentDone(true); setShowPaymentModal(false); setPaymentSuccess(false); setPaymentForm({ name: '', card: '', exp: '', cvv: '' }); handleOrderSubmit();
                }, 1200);
              }} className="flex flex-col gap-3 items-center">
                <input type="text" placeholder="اسم حامل البطاقة" className="w-full max-w-xs px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" value={paymentForm.name} onChange={e=>setPaymentForm(f=>({...f, name: e.target.value}))} />
                <input type="text" placeholder="رقم البطاقة (16 رقم)" maxLength={16} className="w-full max-w-xs px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" value={paymentForm.card} onChange={e=>setPaymentForm(f=>({...f, card: e.target.value.replace(/[^0-9]/g,'')}))} />
                <div className="flex gap-2 w-full max-w-xs">
                  <input type="text" placeholder="MM/YY" maxLength={5} className="flex-1 px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" value={paymentForm.exp} onChange={e=>setPaymentForm(f=>({...f, exp: e.target.value}))} />
                  <input type="text" placeholder="CVV" maxLength={4} className="w-20 px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white" value={paymentForm.cvv} onChange={e=>setPaymentForm(f=>({...f, cvv: e.target.value.replace(/[^0-9]/g,'')}))} />
                </div>
                {paymentError && <div className="text-red-400 text-sm mt-1">{paymentError}</div>}
                <div className="flex flex-col gap-2 items-center mb-2 mt-2">
                  {talent?.services && (() => {
                    let servicesArr = [];
                    try { servicesArr = JSON.parse(talent.services); } catch {}
                    const selected = servicesArr.filter((srv: any) => orderServices.includes(srv.name));
                    if (!selected.length) return <div className="text-blue-400">لم يتم اختيار خدمات.</div>;
                    const total = selected.reduce((sum: number, srv: any) => sum + Number(srv.price || 0), 0);
                    return <>
                      {selected.map((srv: any, idx: number) => (
                        <div key={idx} className="flex justify-between w-full max-w-xs">
                          <span>{srv.name}</span>
                          <span className="text-orange-400 font-bold">{srv.price} ر.س</span>
                        </div>
                      ))}
                      <div className="flex justify-between w-full max-w-xs mt-2 border-t border-orange-400 pt-2">
                        <span className="font-bold">الإجمالي</span>
                        <span className="text-orange-400 font-bold">{total} ر.س</span>
                      </div>
                    </>;
                  })()}
                </div>
                <div className="text-center text-blue-300 text-sm mb-2">هذه بوابة دفع وهمية للتجربة فقط</div>
                <button type="submit" className="w-full max-w-xs py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg font-bold text-lg text-white hover:from-green-500 hover:to-blue-600 transition-all mt-2">ادفع الآن</button>
                {paymentSuccess && <div className="text-green-400 text-center mt-2">تم الدفع بنجاح!</div>}
              </form>
            </DialogContent>
            <DialogActions sx={{justifyContent:'center',pb:2}}>
              <Button onClick={()=>setShowPaymentModal(false)} color="secondary" sx={{fontWeight:700}}>إلغاء</Button>
            </DialogActions>
          </Dialog>
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
    </>
  );
} 