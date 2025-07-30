"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, MapPin, Globe, Calendar, Clock, MessageCircle, Camera, Video, Award, Users } from "lucide-react";
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
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [reviewDates, setReviewDates] = useState<string[]>([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedServicesSummary, setSelectedServicesSummary] = useState<any[]>([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [orderDate, setOrderDate] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [lang, setLang] = useState('ar');

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
        setReviewDates(Array.isArray(data) ? data.map(r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : '') : []);
      });
  }, [id]);

  useEffect(() => {
    if (showPaymentModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showPaymentModal]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLang(localStorage.getItem('lang') || document.documentElement.lang || 'ar');
    }
  }, []);

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
      const userStr = localStorage.getItem("user");
      if (!userStr) { setShowLoginMsg(true); return; }
      const user = JSON.parse(userStr);
      const selectedServices = selectedServicesSummary;
      const address = user.address || "";
      
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
          alert('تم حظر الاتصال مؤقتًا من Paymob. يرجى المحاولة بعد 30 دقيقة أو استخدام شبكة مختلفة.');
          return;
        }
        alert(`خطأ في بوابة الدفع: ${data.error || 'خطأ غير معروف'}\n\nالتفاصيل: ${data.details || 'لا توجد تفاصيل'}`);
        return;
      }
      setIframeUrl(data.iframe);
      setShowPaymentModal(true);
    } catch (error) {
      clearPendingOrderData();
      console.error('Payment error:', error);
      alert('خطأ في الاتصال مع بوابة الدفع. يرجى المحاولة مرة أخرى.');
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-blue-100">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  let workingSchedule: Record<string, any> = {};
  try { if (talent.workingSchedule) workingSchedule = JSON.parse(talent.workingSchedule); } catch {}
  const daysAr: Record<string, string> = {
    sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
  };
  let socialLinks: Record<string, string> = {};
  try { if (talent.socialLinks) socialLinks = JSON.parse(talent.socialLinks); } catch {}

  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount).toFixed(1) : null;

  // Ensure servicesArr is typed as any[] to avoid TS 'never' error
  const servicesArr: any[] = selectedServices.map(name => {
    if (!talent?.services) return null;
    let arr = [];
    try { arr = JSON.parse(talent.services); } catch {}
    return arr.find((srv:any) => srv.name === name);
  }).filter(Boolean);
  const subtotal = servicesArr.reduce((sum, srv: any) => srv ? sum + Number(srv.price || 0) : sum, 0);
  const tax = Math.round(subtotal * 0.15);
  const totalWithTax = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 pb-16 sm:pb-20 md:pb-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Profile Image */}
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto rounded-full ring-4 sm:ring-8 ring-white/30 shadow-2xl overflow-hidden bg-white">
              {talent?.profileImageData ? (
                  <Image 
                    src={`data:image/png;base64,${talent.profileImageData}`} 
                    alt={talent.name as string} 
                    width={160} 
                    height={160} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl sm:text-4xl md:text-6xl">
                    👤
                  </div>
                )}
              </div>
              {/* Online Status */}
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 sm:border-4 border-white shadow-lg"></div>
            </div>

            {/* Name & Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg px-4">
              {talent.name}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 font-medium mb-4 sm:mb-6 px-4">
              {talent.jobTitle}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border border-white/30">
                <div className="flex items-center gap-1 sm:gap-2 text-white">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-current" />
                  <span className="font-bold text-sm sm:text-base md:text-lg">{avgRating || '0.0'}</span>
                  <span className="text-blue-100 text-xs sm:text-sm md:text-base">({reviewsCount} تقييم)</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border border-white/30">
                <div className="flex items-center gap-1 sm:gap-2 text-white">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                  <span className="font-bold text-sm sm:text-base md:text-lg">{portfolio.length}</span>
                  <span className="text-blue-100 text-xs sm:text-sm md:text-base">عمل</span>
                </div>
              </div>
            </div>

            {/* Location & Travel */}
            {(talent.workArea || talent.canTravelAbroad) && (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 px-4">
                {talent.workArea && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 border border-white/30">
                    <div className="flex items-center gap-1 sm:gap-2 text-white">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium text-xs sm:text-sm md:text-base">{talent.workArea}</span>
                    </div>
                  </div>
                )}
                {talent.canTravelAbroad && (
                  <div className="bg-green-500/30 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 border border-green-300/50">
                    <div className="flex items-center gap-1 sm:gap-2 text-white">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium text-xs sm:text-sm md:text-base">يمكنني السفر خارج المملكة</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <button 
                onClick={() => {
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
                }}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                احجز الآن
              </button>
              <a
                href={`/chat/${talent?.id}`}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                محادثة
              </a>
            </div>

              {showLoginMsg && (
              <div className="mt-4 sm:mt-6 bg-white/90 backdrop-blur-sm text-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-red-200 max-w-sm sm:max-w-md mx-auto">
                <p className="font-medium mb-2 text-sm sm:text-base">يجب تسجيل الدخول أولاً للاستفادة من هذه الميزة</p>
                <a href="/login" className="text-blue-600 hover:text-blue-800 font-bold underline text-sm sm:text-base">
                  سجّل الدخول الآن
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 sm:-mt-12 md:-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* About Section */}
              {talent.bio && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md sm:rounded-lg"></div>
                    نبذة عني
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-wrap break-words overflow-hidden">
                      {talent.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Portfolio Section */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-md sm:rounded-lg"></div>
                  <span>معرض الأعمال</span>
                  <span className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {portfolio.length} عمل
                  </span>
                </h2>
                
                {portfolio.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg">لا يوجد أعمال بعد</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {portfolio.map(item => (
                      <div key={item.id} className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                          {item.type === 'image' && item.mediaData && (
                            <Image 
                              src={`data:image/png;base64,${item.mediaData}`} 
                              alt={item.title || 'عمل'} 
                              width={400} 
                              height={225} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          {item.type === 'video' && item.mediaUrl && (
                            <iframe 
                              src={item.mediaUrl.replace('watch?v=', 'embed/')} 
                              title={item.title || 'فيديو'} 
                              className="w-full h-full" 
                              allowFullScreen 
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                            <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1">{item.title}</h3>
                            <div className="flex items-center gap-2">
                              {item.type === 'image' ? (
                                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                              ) : (
                                <Video className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                              )}
                              <span className="text-white/80 text-xs sm:text-sm capitalize">{item.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md sm:rounded-lg"></div>
                  <span>التقييمات</span>
                  <span className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {reviewsCount} تقييم
                  </span>
                </h2>

                {reviews.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg">لا يوجد تقييمات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                            {rev.reviewerName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="font-bold text-gray-800 text-sm sm:text-base">{rev.reviewerName}</h4>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={`sm:w-4 sm:h-4 ${i <= rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-gray-500 text-xs sm:text-sm">{reviewDates[idx]}</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base break-words">{rev.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* تم حذف فورم إضافة التقييم */}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Services & Pricing */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 lg:sticky lg:top-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md sm:rounded-lg"></div>
                  <span>الخدمات والأسعار</span>
                </h2>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {talent?.services && (() => {
                    let servicesArr = [];
                    try { servicesArr = JSON.parse(talent.services); } catch {}
                    if (!Array.isArray(servicesArr) || servicesArr.length === 0) {
                      return (
                        <div className="text-center py-6 sm:py-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm sm:text-base">لا يوجد خدمات مضافة بعد</p>
                        </div>
                      );
                    }
                    return servicesArr.map((srv: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{srv.name}</h3>
                          <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm self-start sm:self-auto">
                            {srv.price} ر.س
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-md sm:rounded-lg"></div>
                  <span>المواعيد المتاحة</span>
                </h2>
                
                <div className="space-y-2 sm:space-y-3">
                  {Object.keys(daysAr).map(day => (
                    workingSchedule[day]?.active ? (
                      <div key={day} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{daysAr[day]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mr-6 sm:mr-0">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-xs sm:text-sm">
                              {workingSchedule[day].from} - {workingSchedule[day].to}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              {/* Social Media */}
              {(socialLinks.instagram || socialLinks.tiktok || socialLinks.youtube || socialLinks.twitter) && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-md sm:rounded-lg"></div>
                    <span>تابعني على</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {socialLinks.instagram && (
                      <a 
                        href={socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FaInstagram size={20} className="sm:w-6 sm:h-6" />
                          <span className="font-semibold text-sm sm:text-base">Instagram</span>
                        </div>
                </a>
              )}
              {socialLinks.tiktok && (
                      <a 
                        href={socialLinks.tiktok} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group bg-gradient-to-br from-black to-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FaTiktok size={20} className="sm:w-6 sm:h-6" />
                          <span className="font-semibold text-sm sm:text-base">TikTok</span>
                        </div>
                </a>
              )}
              {socialLinks.youtube && (
                      <a 
                        href={socialLinks.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group bg-gradient-to-br from-red-600 to-pink-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FaYoutube size={20} className="sm:w-6 sm:h-6" />
                          <span className="font-semibold text-sm sm:text-base">YouTube</span>
                        </div>
                </a>
              )}
              {socialLinks.twitter && (
                      <a 
                        href={socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FaTwitter size={20} className="sm:w-6 sm:h-6" />
                          <span className="font-semibold text-sm sm:text-base">Twitter</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Dialog open={showOrderModal} onClose={()=>setShowOrderModal(false)} PaperProps={{
        style: {
          borderRadius: 24,
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
          backdropFilter: 'blur(10px)',
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
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none text-sm sm:text-base"
            >
              <option value="" className="text-gray-800">اختر موعداً...</option>
                {getAvailableSlots().map(slot => (
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
                  backdropFilter: 'blur(10px)',
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
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl text-white font-bold hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base"
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
              backdropFilter: 'blur(10px)',
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
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                transform: 'translateY(-2px)'
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
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
    </div>
  );
} 