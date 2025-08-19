"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Star, MapPin, Globe, Calendar, Clock, MessageCircle, Camera, Video, Award, Users, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Image from 'next/image';

export default function TalentPublicProfile() {
  const { id } = useParams();
  const [talent, setTalent] = useState<Record<string, any> | null>(null);
  const [portfolio, setPortfolio] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [reviewDates, setReviewDates] = useState<string[]>([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedServicesSummary, setSelectedServicesSummary] = useState<any[]>([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [orderDate, setOrderDate] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [modalVideo, setModalVideo] = useState<{ embedUrl?: string; dataSrc?: string; title?: string } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; title?: string } | null>(null);

  const clearPendingOrderData = () => {
    if (typeof window !== 'undefined') {
      const keys = [
        'pendingOrder_talentId',
        'pendingOrder_clientId', 
        'pendingOrder_date',
        'pendingOrder_message',
        'pendingOrder_services',
        'pendingOrder_address'
      ];
      keys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch {}
      });
    }
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
        setReviewDates(Array.isArray(data) ? data.map(r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : '') : []);
      });
  }, [id]);

  useEffect(() => {
    if (showPaymentModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showPaymentModal]);

  const handleServiceChange = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleOrderRequest = async () => {
    let total = 0;
    let servicesArr = [];
    try { servicesArr = JSON.parse(talent?.services || '[]'); } catch {}
    const selected = servicesArr.filter((srv: any) => selectedServices.includes(srv.name));
    total = selected.reduce((sum: number, srv: any) => sum + Number(srv.price || 0), 0);
    setSelectedServicesSummary(selected);
    setSelectedTotal(total);
    setShowOrderModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmAndPay = async () => {
    setShowConfirmModal(false);
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      if (!userStr) { setShowLoginMsg(true); return; }
      const user = JSON.parse(userStr);
      const selectedServices = selectedServicesSummary;
      const address = user.address || "";
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingOrder_talentId', talent?.id?.toString() || '');
        localStorage.setItem('pendingOrder_clientId', user.id?.toString() || '');
        localStorage.setItem('pendingOrder_date', orderDate || new Date().toISOString());
        localStorage.setItem('pendingOrder_message', orderMessage || 'طلب جديد');
        localStorage.setItem('pendingOrder_services', JSON.stringify(selectedServices));
        localStorage.setItem('pendingOrder_address', address);
      }
      
      const res = await fetch('/api/paymob-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalWithTax,
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
        clearPendingOrderData();
        
        if (data.error && data.details && data.details.includes('Too many attempts')) {
          setErrorMessage('تم حظر الاتصال مؤقتًا من Paymob. يرجى المحاولة بعد 30 دقيقة أو استخدام شبكة مختلفة.');
          setShowErrorModal(true);
          return;
        }
        setErrorMessage(`خطأ في بوابة الدفع: ${data.error || 'خطأ غير معروف'}\n\nالتفاصيل: ${data.details || 'لا توجد تفاصيل'}`);
        setShowErrorModal(true);
        return;
      }
      setIframeUrl(data.iframe);
      setShowPaymentModal(true);
    } catch (error) {
      clearPendingOrderData();
      console.error('Payment error:', error);
      setErrorMessage('خطأ في الاتصال مع بوابة الدفع. يرجى المحاولة مرة أخرى.');
      setShowErrorModal(true);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason || !reportDescription) {
      setShowValidationModal(true);
      return;
    }

    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      if (!userStr) { 
        setShowLoginMsg(true); 
        setShowReportModal(false);
        return; 
      }
      const user = JSON.parse(userStr);

      const reportData = {
        reporterId: user.id,
        reportedUserId: talent?.id,
        reason: reportReason,
        description: reportDescription,
        status: 'pending'
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        setShowReportModal(false);
        setShowSuccessModal(true);
        setReportReason('');
        setReportDescription('');
      } else {
        setErrorMessage('حدث خطأ في إرسال البلاغ. يرجى المحاولة مرة أخرى.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Report error:', error);
      setErrorMessage('حدث خطأ في إرسال البلاغ. يرجى المحاولة مرة أخرى.');
      setShowErrorModal(true);
    }
  };

  // مشتقات مُكثّفة الأداء: جدولة العمل، الخدمات، القيم المتاحة للحجز
  const workingScheduleMemo = useMemo(() => {
    try { return talent?.workingSchedule ? JSON.parse(talent.workingSchedule) : {}; } catch { return {}; }
  }, [talent?.workingSchedule]);

  const servicesList = useMemo(() => {
    try { return talent?.services ? JSON.parse(talent.services) : []; } catch { return []; }
  }, [talent?.services]);

  const availableSlots = useMemo(() => {
    const slots: { label: string; value: string }[] = [];
    const schedule = workingScheduleMemo || {};
    const daysAr: Record<string, string> = {
      sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
    };
    Object.keys(schedule).forEach((day) => {
      const d = schedule[day];
      if (d?.active) {
        if (d.allDay) {
          slots.push({ label: `${daysAr[day]} (متاح طوال اليوم)`, value: `${day}:00:00-23:59` });
        } else if (d.from && d.to) {
          slots.push({ label: `${daysAr[day]} (${d.from} - ${d.to})`, value: `${day}:${d.from}-${d.to}` });
        }
      }
    });
    return slots;
  }, [workingScheduleMemo]);

  // تحويل روابط YouTube/Vimeo إلى صيغة embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      const host = u.hostname.replace('www.', '');
      // YouTube
      if (host.includes('youtube.com')) {
        const videoId = u.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        // shorts
        if (u.pathname.startsWith('/shorts/')) {
          return `https://www.youtube.com/embed/${u.pathname.split('/shorts/')[1]}`;
        }
      }
      if (host === 'youtu.be') {
        const id = u.pathname.slice(1);
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      // Vimeo
      if (host.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean)[0];
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading || !talent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 rounded-2xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  let workingSchedule: Record<string, any> = workingScheduleMemo;
  const daysAr: Record<string, string> = {
    sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
  };

  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount).toFixed(1) : null;

  const servicesArr: any[] = selectedServices
    .map(name => (servicesList || []).find((srv:any) => srv.name === name))
    .filter(Boolean);
  const subtotal = servicesArr.reduce((sum, srv: any) => srv ? sum + Number(srv.price || 0) : sum, 0);
  const tax = Math.round(subtotal * 0.15);
  const totalWithTax = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">

      <div className="relative py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-6">
            <div className="text-center">
              {/* Profile Image */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-2xl ring-2 ring-orange-400/30 overflow-hidden bg-white/10">
                  {talent?.profileImageData ? (
                    <Image 
                      src={`data:image/png;base64,${talent.profileImageData}`} 
                      alt={talent.name as string} 
                      width={160} 
                      height={160} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400/20 to-pink-500/20 flex items-center justify-center text-white text-6xl">
                      👤
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Name & Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                {talent.name}
              </h1>
              <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-6">
                {talent.jobTitle}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="bg-white/15 rounded-2xl px-6 py-4 border border-white/25">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-yellow-300 fill-current" />
                    <span className="font-bold text-lg">{avgRating || '0.0'}</span>
                    <span className="text-blue-200 text-base">({reviewsCount} تقييم)</span>
                  </div>
                </div>
                <div className="bg-white/15 rounded-2xl px-6 py-4 border border-white/25">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-blue-300" />
                    <span className="font-bold text-lg">{portfolio.length}</span>
                    <span className="text-blue-200 text-base">عمل</span>
                  </div>
                </div>
              </div>

              {/* Location & Travel */}
              {(talent.workArea || talent.canTravelAbroad) && (
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {talent.workArea && (
                    <div className="bg-white/15 rounded-full px-4 py-2 border border-white/25">
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{talent.workArea}</span>
                      </div>
                    </div>
                  )}
                  {talent.canTravelAbroad && (
                    <div className="bg-green-500/25 rounded-full px-4 py-2 border border-green-300/40">
                      <div className="flex items-center gap-2 text-white">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">يمكنني السفر خارج المملكة</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal Traits Card moved to right column */}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => {
                    try {
                      const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
                      if (!userStr) {
                        setShowLoginMsg(true);
                        return;
                      }
                      setShowOrderModal(true);
                    } catch {
                      setShowLoginMsg(true);
                    }
                  }}
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  احجز الآن
                </button>
                <a
                  href={`/chat/${talent?.id}`}
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/25 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  محادثة
                </a>
                <button
                  onClick={() => {
                    try {
                      const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
                      if (!userStr) {
                        setShowLoginMsg(true);
                        return;
                      }
                      setShowReportModal(true);
                    } catch {
                      setShowLoginMsg(true);
                    }
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  بلاغ
                </button>
              </div>

              {showLoginMsg && (
                <div className="mt-6 bg-white/15 text-red-300 px-6 py-4 rounded-2xl border border-red-400/40 max-w-md mx-auto">
                  <p className="font-medium mb-2">يجب تسجيل الدخول أولاً للاستفادة من هذه الميزة</p>
                  <a href="/login" className="text-orange-400 hover:text-orange-300 font-bold underline">
                    سجّل الدخول الآن
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              {talent.bio && (
                <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    نبذة عني
                  </h2>
                  <p className="text-blue-200/80 leading-relaxed text-lg whitespace-pre-wrap break-words">
                    {talent.bio}
                  </p>
                </div>
              )}

              {/* Portfolio Section */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <span>معرض الأعمال</span>
                  <span className="bg-white/10 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {portfolio.length} عمل
                  </span>
                </h2>
                
                {portfolio.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-10 h-10 text-blue-300" />
                    </div>
                    <p className="text-blue-200/80 text-lg">لا يوجد أعمال بعد</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolio.map(item => (
                      <div key={item.id} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                        <div className="aspect-video bg-white/15">
                          {(item.mediaData && ((item.type === 'image') || (item as any).mediaType === 'image')) && (
                            <div className="group relative w-full h-full">
                            <Image 
                              src={`data:image/png;base64,${item.mediaData}`} 
                              alt={item.title || 'عمل'} 
                              width={400} 
                              height={225} 
                              className="w-full h-full object-cover"
                            />
                              <button
                                type="button"
                                aria-label="عرض الصورة"
                                onClick={() => {
                                  setModalImage({ src: `data:image/png;base64,${item.mediaData}`, title: item.title });
                                  setShowImageModal(true);
                                }}
                                className="absolute inset-0 cursor-zoom-in z-10"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="px-3 py-1 rounded-full bg-white/85 text-gray-900 text-sm font-semibold">عرض الصورة</div>
                              </div>
                            </div>
                          )}
                          {item.type === 'video' && item.mediaUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setModalVideo({ embedUrl: getEmbedUrl(item.mediaUrl as string), title: item.title });
                                setShowVideoModal(true);
                              }}
                              className="relative w-full h-full flex items-center justify-center group"
                            >
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                              <div className="w-16 h-16 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center z-10">
                                <span className="ml-1 border-l-8 border-y-8 border-y-transparent border-l-red-600"></span>
                              </div>
                            </button>
                          )}
                          {item.type === 'video' && item.mediaData && (
                            <button
                              type="button"
                              onClick={() => {
                                setModalVideo({ dataSrc: `data:video/mp4;base64,${item.mediaData}`, title: item.title });
                                setShowVideoModal(true);
                              }}
                              className="relative w-full h-full flex items-center justify-center group"
                            >
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                              <div className="w-16 h-16 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center z-10">
                                <span className="ml-1 border-l-8 border-y-8 border-y-transparent border-l-red-600"></span>
                        </div>
                            </button>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                            <div className="flex items-center gap-2">
                              {item.type === 'image' ? (
                                <Camera className="w-4 h-4 text-white/80" />
                              ) : (
                                <Video className="w-4 h-4 text-white/80" />
                              )}
                              <span className="text-white/80 text-sm capitalize">{item.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span>التقييمات</span>
                  <span className="bg-white/10 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {reviewsCount} تقييم
                  </span>
                </h2>

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-yellow-300" />
                    </div>
                    <p className="text-blue-200/80 text-lg">لا يوجد تقييمات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {rev.reviewerName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-bold text-white">{rev.reviewerName}</h4>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <Star 
                                    key={i} 
                                    size={16} 
                                    className={`${i <= rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-blue-200/60 text-sm">{reviewDates[idx]}</span>
                            </div>
                            <p className="text-blue-200/80 leading-relaxed break-words">{rev.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Personal Traits Card */}
              {(talent.eyeColor || talent.hairColor || talent.skinColor || talent.hairStyle || talent.language || talent.accent) && (
                <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 flex-wrap">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <span>السمات الشخصية</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {talent.eyeColor && (
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                        <span className="w-3 h-3 rounded-full bg-blue-300 inline-block"></span>
                        <span className="text-blue-200 font-semibold">لون العين:</span>
                        <span className="text-white">{talent.eyeColor}</span>
                      </div>
                    )}
                    {talent.hairColor && (
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                        <span className="w-3 h-3 rounded-full bg-red-300 inline-block"></span>
                        <span className="text-red-200 font-semibold">لون الشعر:</span>
                        <span className="text-white">{talent.hairColor}</span>
                      </div>
                    )}
                    {talent.skinColor && (
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                        <span className="w-3 h-3 rounded-full bg-orange-300 inline-block"></span>
                        <span className="text-orange-200 font-semibold">لون البشرة:</span>
                        <span className="text-white">{talent.skinColor}</span>
                      </div>
                    )}
                    {talent.hairStyle && (
                      <div className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                        <span className="w-3 h-3 rounded-full bg-pink-300 inline-block"></span>
                        <span className="text-pink-200 font-semibold">تسريحة الشعر:</span>
                        {(() => {
                          let list: string[] = [];
                          try {
                            if (Array.isArray(talent.hairStyle)) list = talent.hairStyle as string[];
                            else if (typeof talent.hairStyle === 'string') {
                              const s = talent.hairStyle.trim();
                              if (s.startsWith('[')) {
                                const a = JSON.parse(s);
                                if (Array.isArray(a)) list = a;
                              }
                              if (list.length === 0 && s) list = s.split(',').map(v => v.trim()).filter(Boolean);
                            }
                          } catch {}
                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {list.map((v, i) => (
                                <span key={i} className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">{v}</span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {talent.language && (
                      <div className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                        <span className="w-3 h-3 rounded-full bg-purple-300 inline-block"></span>
                        <span className="text-purple-200 font-semibold">اللغة:</span>
                        {(() => {
                          let list: string[] = [];
                          try {
                            if (Array.isArray(talent.language)) list = talent.language as string[];
                            else if (typeof talent.language === 'string') {
                              const s = talent.language.trim();
                              if (s.startsWith('[')) {
                                const a = JSON.parse(s);
                                if (Array.isArray(a)) list = a;
                              }
                              if (list.length === 0 && s) list = s.split(',').map(v => v.trim()).filter(Boolean);
                            }
                          } catch {}
                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {list.map((v, i) => (
                                <span key={i} className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">{v}</span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {talent.accent && (
                      <div className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                        <span className="w-3 h-3 rounded-full bg-cyan-300 inline-block"></span>
                        <span className="text-cyan-200 font-semibold">اللهجة:</span>
                        {(() => {
                          let list: string[] = [];
                          try {
                            if (Array.isArray(talent.accent)) list = talent.accent as string[];
                            else if (typeof talent.accent === 'string') {
                              const s = talent.accent.trim();
                              if (s.startsWith('[')) {
                                const a = JSON.parse(s);
                                if (Array.isArray(a)) list = a;
                              }
                              if (list.length === 0 && s) list = s.split(',').map(v => v.trim()).filter(Boolean);
                            }
                          } catch {}
                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {list.map((v, i) => (
                                <span key={i} className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">{v}</span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services & Pricing */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/20 lg:sticky lg:top-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span>الخدمات والأسعار</span>
                </h2>
                
                <div className="space-y-3">
                  {talent?.services && (() => {
                    let servicesArr = [];
                    try { servicesArr = JSON.parse(talent.services); } catch {}
                    if (!Array.isArray(servicesArr) || servicesArr.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-blue-300" />
                          </div>
                          <p className="text-blue-200/80">لا يوجد خدمات مضافة بعد</p>
                        </div>
                      );
                    }
                    return servicesArr.map((srv: any, idx: number) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-white">{srv.name}</h3>
                          <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                            {srv.price} ر.س
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <span>المواعيد المتاحة</span>
                </h2>
                
                <div className="space-y-3">
                  {Object.keys(daysAr).map(day => (
                    workingSchedule[day]?.active ? (
                      <div key={day} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-300" />
                            <span className="font-semibold text-white text-sm">{daysAr[day]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-200">
                            <Clock className="w-3 h-3" />
                            {workingSchedule[day]?.allDay ? (
                              <span className="font-medium text-xs">متاح طوال اليوم</span>
                            ) : (
                              <span className="font-medium text-xs">{workingSchedule[day].from} - {workingSchedule[day].to}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
                    </div>
                        </div>
        </div>
      </div>

      {/* Order Modal */}
      <Dialog open={showOrderModal} onClose={()=>setShowOrderModal(false)} PaperProps={{
        style: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          minWidth: 280,
          maxWidth: 380,
          margin: '16px'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700, 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          color: '#fff', 
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: { xs: '16px', sm: '24px' }
        }}>
          طلب خدمة من {talent?.name}
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: '16px', sm: '24px' } }}>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">اختر الخدمات المطلوبة:</h3>
            <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
              {talent?.services && (() => {
                let servicesArr = [];
                try { servicesArr = JSON.parse(talent.services); } catch {}
                if (!Array.isArray(servicesArr) || servicesArr.length === 0) {
                  return <div className="text-blue-200 text-center py-4 text-sm sm:text-base">لا يوجد خدمات متاحة حالياً.</div>;
                }
                return servicesArr.map((srv: any, idx: number) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-2 sm:p-3 border border-white/20">
                  <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedServices.includes(srv.name)} 
                          onChange={()=>handleServiceChange(srv.name)} 
                          sx={{
                            color: '#fff',
                            '&.Mui-checked': { color: '#fbbf24' },
                            padding: { xs: '4px', sm: '9px' }
                          }} 
                        />
                      }
                      label={
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
                          <span className="text-white font-medium text-sm sm:text-base">{srv.name}</span>
                          <span className="text-yellow-300 font-bold text-xs sm:text-sm">({srv.price} ر.س)</span>
                        </div>
                      }
                      sx={{ margin: 0, width: '100%' }}
                    />
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">اختر الموعد المتاح:</h3>
            <select 
              value={orderDate} 
              onChange={e=>setOrderDate(e.target.value)} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none text-sm sm:text-base"
            >
              <option value="" className="text-gray-800">اختر موعداً...</option>
                {availableSlots.map(slot => (
                <option key={slot.value} value={slot.value} className="text-gray-800">
                  {slot.label}
                </option>
                ))}
              </select>
          </div>

          <div className="mb-4 sm:mb-6">
              <TextField
                label="رسالتك (اختياري)"
                multiline
              minRows={3}
                fullWidth
                value={orderMessage}
                onChange={e => setOrderMessage(e.target.value)}
              InputProps={{
                style: { 
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: window.innerWidth < 640 ? '14px' : '16px'
                }
              }}
              InputLabelProps={{ 
                style: { 
                  color: '#fbbf24',
                  fontSize: window.innerWidth < 640 ? '14px' : '16px'
                } 
              }}
              sx={{
                '& .MuiOutlinedInput-root': { 
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: '#fbbf24' },
                  '&.Mui-focused fieldset': { borderColor: '#fbbf24' }
                }
              }}
            />
          </div>

          <div className="text-center">
                <a
                  href={`/chat/${talent?.id}`}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white font-bold hover:bg-white/30 transition-all duration-200 text-sm sm:text-base"
                  style={{textDecoration:'none'}}
                >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  محادثة صاحب الموهبة
                </a>
              </div>
            </DialogContent>
        <DialogActions sx={{justifyContent:'center', padding: { xs: '0 16px 16px', sm: '0 24px 24px' }}}>
          <Button 
            onClick={()=>setShowOrderModal(false)} 
            sx={{ 
              color: '#fff', 
              fontWeight: 700,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: { xs: '8px 16px', sm: '12px 24px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleOrderRequest} 
            disabled={selectedServices.length === 0 || !orderDate}
            sx={{ 
                              background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '12px',
                padding: { xs: '8px 16px', sm: '12px 24px' },
                fontSize: { xs: '14px', sm: '16px' },
                '&:hover': { 
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)'
                },
              '&:disabled': { 
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
                                  احجز الآن
              </Button>
            </DialogActions>
          </Dialog>

      {/* Payment Modal */}
          {showPaymentModal && iframeUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white relative">
                <button
                  onClick={() => {
                    clearPendingOrderData();
                    setShowPaymentModal(false);
                  }}
                className="absolute top-2 sm:top-4 left-2 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl transition-all"
              >
                ×
              </button>
              <div className="text-center">
                <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">إتمام عملية الدفع</h2>
                <p className="text-blue-100 text-sm sm:text-base">المبلغ الإجمالي: <span className="font-bold text-yellow-300">{totalWithTax} ر.س</span></p>
                </div>
                </div>
            <div className="p-3 sm:p-6">
                <iframe
                  src={iframeUrl}
                className="w-full h-[400px] sm:h-[500px] rounded-xl sm:rounded-2xl border-0"
                  allowFullScreen
                  onLoad={(e) => {
                  try {
                    const iframe = e.target as HTMLIFrameElement;
                      const iframeUrl = iframe.contentWindow?.location.href;
                                                    if (iframeUrl && (iframeUrl.includes('success=true') || iframeUrl.includes('approved'))) {
                                clearPendingOrderData();
                              } else if (iframeUrl && iframeUrl.includes('error')) {
                        clearPendingOrderData();
                        setShowPaymentModal(false);
                    }
                  } catch {}
                  }}
                />
            </div>
          </div>
                </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 sm:p-6 text-white relative">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-2 sm:top-4 left-2 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg transition-all"
              >
                ×
              </button>
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">تأكيد تفاصيل الطلب</h2>
                <p className="text-green-100 text-sm sm:text-base">مراجعة الخدمات والمبلغ</p>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 overflow-y-auto">
                {selectedServicesSummary.map((srv, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{srv.name}</span>
                    </div>
                    <span className="font-bold text-green-600 text-sm sm:text-base">{srv.price} ر.س</span>
                  </div>
                ))}
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mt-3 sm:mt-4">
                  <div className="flex justify-between items-center text-base sm:text-lg">
                    <span className="font-bold text-gray-800">المجموع قبل الضريبة:</span>
                    <span className="font-bold text-gray-800">{subtotal} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 mt-1">
                    <span>الضريبة (15%):</span>
                    <span>{tax} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-green-600 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                    <span>الإجمالي:</span>
                    <span>{totalWithTax} ر.س</span>
              </div>
                </div>
              </div>
              <button
                onClick={handleConfirmAndPay}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                  تأكيد والدفع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {/* Video Modal */}
      <Dialog open={showVideoModal} onClose={() => { setShowVideoModal(false); setModalVideo(null); }} PaperProps={{
        style: {
          borderRadius: 16,
          background: '#0b1220',
          color: '#fff',
          minWidth: 300,
          maxWidth: 900,
          width: '90vw'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          color: '#fff',
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {modalVideo?.title || 'فيديو'}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <div className="w-full">
            {modalVideo?.embedUrl && (
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={modalVideo.embedUrl}
                  title={modalVideo.title || 'فيديو'}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
            {modalVideo?.dataSrc && (
              <video controls className="w-full rounded-xl" src={modalVideo.dataSrc} />
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => { setShowVideoModal(false); setModalVideo(null); }} sx={{
            background: 'linear-gradient(45deg, #f59e0b, #d97706)',
            color: '#fff', fontWeight: 700, borderRadius: '12px', px: 3, py: 1,
            '&:hover': { background: 'linear-gradient(45deg, #d97706, #b45309)' }
          }}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      {/* End Video Modal */}
      {/* Image Modal */}
      <Dialog open={showImageModal} onClose={() => { setShowImageModal(false); setModalImage(null); }} PaperProps={{
        style: {
          borderRadius: 16,
          background: '#0b1220',
          color: '#fff',
          minWidth: 300,
          maxWidth: 1000,
          width: '95vw'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          color: '#fff',
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {modalImage?.title || 'صورة'}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          {modalImage?.src && (
            <img src={modalImage.src} alt={modalImage?.title || 'صورة'} className="w-full h-auto rounded-xl" />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => { setShowImageModal(false); setModalImage(null); }} sx={{
            background: 'linear-gradient(45deg, #f59e0b, #d97706)',
            color: '#fff', fontWeight: 700, borderRadius: '12px', px: 3, py: 1,
            '&:hover': { background: 'linear-gradient(45deg, #d97706, #b45309)' }
          }}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      {/* End Image Modal */}
      <Dialog open={showReportModal} onClose={()=>setShowReportModal(false)} PaperProps={{
        style: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: '#fff',
          minWidth: 280,
          maxWidth: 480,
          margin: '16px'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700, 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          color: '#fff', 
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: { xs: '16px', sm: '24px' }
        }}>
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-300" />
            <span>إبلاغ عن {talent?.name}</span>
          </div>
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: '16px', sm: '24px' } }}>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">سبب البلاغ:</h3>
            <select 
              value={reportReason} 
              onChange={e=>setReportReason(e.target.value)} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-red-400 focus:ring-2 focus:ring-red-400/50 outline-none text-sm sm:text-base"
            >
              <option value="" className="text-gray-800">اختر سبب البلاغ...</option>
              <option value="inappropriate_content" className="text-gray-800">محتوى غير لائق</option>
              <option value="fake_profile" className="text-gray-800">ملف شخصي مزيف</option>
              <option value="spam" className="text-gray-800">رسائل مزعجة</option>
              <option value="fraud" className="text-gray-800">احتيال أو غش</option>
              <option value="harassment" className="text-gray-800">تحرش أو إساءة</option>
              <option value="other" className="text-gray-800">سبب آخر</option>
            </select>
          </div>

          <div className="mb-4 sm:mb-6">
            <TextField
              label="تفاصيل البلاغ"
              multiline
              minRows={4}
              fullWidth
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              placeholder="يرجى وصف المشكلة بالتفصيل..."
              InputProps={{
                style: { 
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: window.innerWidth < 640 ? '14px' : '16px'
                }
              }}
              InputLabelProps={{ 
                style: { 
                  color: '#fbbf24',
                  fontSize: window.innerWidth < 640 ? '14px' : '16px'
                } 
              }}
              sx={{
                '& .MuiOutlinedInput-root': { 
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: '#fbbf24' },
                  '&.Mui-focused fieldset': { borderColor: '#fbbf24' }
                }
              }}
            />
          </div>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-100 text-sm">
                <p className="font-semibold mb-1">ملاحظة مهمة:</p>
                <p>سيتم مراجعة بلاغك من قبل فريق الإدارة. البلاغات الكاذبة قد تؤدي إلى تعليق حسابك.</p>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{justifyContent:'center', padding: { xs: '0 16px 16px', sm: '0 24px 24px' }}}>
          <Button 
            onClick={()=>setShowReportModal(false)} 
            sx={{ 
              color: '#fff', 
              fontWeight: 700,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: { xs: '8px 16px', sm: '12px 24px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleReportSubmit} 
            disabled={!reportReason || !reportDescription}
            sx={{ 
              background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '12px',
              padding: { xs: '8px 16px', sm: '12px 24px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { 
                background: 'linear-gradient(45deg, #b91c1c, #991b1b)'
              },
              '&:disabled': { 
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            إرسال البلاغ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onClose={()=>setShowSuccessModal(false)} PaperProps={{
        style: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          minWidth: 280,
          maxWidth: 480,
          margin: '16px'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700, 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          color: '#fff', 
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: { xs: '16px', sm: '24px' }
        }}>
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <span>تم إرسال البلاغ بنجاح</span>
          </div>
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: '16px', sm: '24px' } }}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                شكراً لك على إبلاغنا
              </h3>
              <p className="text-green-100 text-sm sm:text-base leading-relaxed">
                تم إرسال بلاغك بنجاح إلى فريق الإدارة. سنقوم بمراجعته في أقرب وقت ممكن واتخاذ الإجراءات اللازمة.
              </p>
            </div>

            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-green-100 text-sm">
                  <p className="font-semibold mb-1">ماذا يحدث بعد ذلك؟</p>
                  <ul className="space-y-1 text-xs">
                    <li>• سيتم مراجعة بلاغك من قبل فريق الإدارة</li>
                    <li>• قد نتصل بك للحصول على معلومات إضافية</li>
                    <li>• سيتم اتخاذ الإجراءات المناسبة في أقرب وقت</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{justifyContent:'center', padding: { xs: '0 16px 16px', sm: '0 24px 24px' }}}>
          <Button 
            onClick={()=>setShowSuccessModal(false)} 
            sx={{ 
              background: 'linear-gradient(45deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '12px',
              padding: { xs: '8px 16px', sm: '12px 24px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { 
                background: 'linear-gradient(45deg, #059669, #047857)'
              }
            }}
          >
            تم
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onClose={()=>setShowErrorModal(false)} PaperProps={{
        style: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          minWidth: 280,
          maxWidth: 480,
          margin: '16px'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700, 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          color: '#fff', 
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: { xs: '16px', sm: '24px' }
        }}>
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-300" />
            <span>حدث خطأ</span>
          </div>
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: '16px', sm: '24px' } }}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                عذراً، حدث خطأ
              </h3>
              <p className="text-red-100 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {errorMessage}
              </p>
            </div>

            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-red-100 text-sm">
                  <p className="font-semibold mb-1">اقتراحات لحل المشكلة:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• تحقق من اتصال الإنترنت</li>
                    <li>• أعد المحاولة بعد قليل</li>
                    <li>• تواصل مع الدعم الفني إذا استمرت المشكلة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{justifyContent:'center', padding: { xs: '0 16px 16px', sm: '0 24px 24px' }}}>
          <Button 
            onClick={()=>setShowErrorModal(false)} 
            sx={{ 
              background: 'linear-gradient(45deg, #ef4444, #dc2626)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '12px',
              padding: { xs: '8px 16px', sm: '12px 24px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { 
                background: 'linear-gradient(45deg, #dc2626, #b91c1c)'
              }
            }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validation Modal */}
      <Dialog open={showValidationModal} onClose={()=>setShowValidationModal(false)} PaperProps={{
        style: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          minWidth: 280,
          maxWidth: 480,
          margin: '16px'
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700, 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          color: '#fff', 
          textAlign: 'center',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: { xs: '16px', sm: '24px' }
        }}>
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-300" />
            <span>معلومات مطلوبة</span>
          </div>
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: '16px', sm: '24px' } }}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                يرجى ملء جميع الحقول
              </h3>
              <p className="text-yellow-100 text-sm sm:text-base leading-relaxed">
                يجب عليك اختيار سبب البلاغ وكتابة تفاصيل البلاغ قبل الإرسال.
              </p>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-yellow-100 text-sm">
                  <p className="font-semibold mb-1">الحقول المطلوبة:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• سبب البلاغ (اختيار من القائمة)</li>
                    <li>• تفاصيل البلاغ (وصف المشكلة)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{justifyContent:'center', padding: { xs: '0 16px 16px', sm: '0 24px 24px' }}}>
          <Button 
            onClick={()=>setShowValidationModal(false)} 
            sx={{ 
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '12px',
              padding: { xs: '8px 16px', sm: '12px 24px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { 
                background: 'linear-gradient(45deg, #d97706, #b45309)'
              }
            }}
          >
            فهمت
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 