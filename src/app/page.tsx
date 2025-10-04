'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Star, Users, Calendar, Shield, Play, ChevronRight, Menu, X, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';

const CastingPlatform = () => {
  const t = useTranslations();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{id:string,name:string,imageUrl?:string,imageData?:string}[]>([]);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState('ar');
  const [showLangModal, setShowLangModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [contactStatus, setContactStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [notificationsCount, setNotificationsCount] = useState(0);

  // heroSlides الافتراضية للاحتياط
  const defaultHeroSlides = [
    {
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      image: "/hero/Sliders-01.jpg",
      cta: t('hero.slide1.cta')
    },
    {
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      image: "/hero/Sliders-02.jpg",
      cta: t('hero.slide2.cta')
    },
    {
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      image: "/hero/Sliders-03.jpg",
      cta: t('hero.slide3.cta')
    }
  ];

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: t('features.search.title'),
      description: t('features.search.description')
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t('features.database.title'),
      description: t('features.database.description')
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: t('features.scheduling.title'),
      description: t('features.scheduling.description')
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('features.security.title'),
      description: t('features.security.description')
    }
  ];

  const stats = [
    { number: "5000+", label: t('stats.talents') },
    { number: "200+", label: t('stats.companies') },
    { number: "1000+", label: t('stats.projects') },
    { number: "98%", label: t('stats.satisfaction') }
  ];

  const testimonials = [
    {
      name: "أحمد محمد",
      role: "مخرج",
      company: "شركة الرؤية للإنتاج",
      text: "منصة طوق غيرت طريقة عملنا في اختيار المواهب. أصبح لدينا وصول لقاعدة بيانات ضخمة من المواهب المتميزة.",
      rating: 5
    },
    {
      name: "فاطمة العلي",
      role: "منتجة",
      company: "وكالة الإبداع",
      text: "النظام سهل الاستخدام ومنظم بشكل رائع. وفر علينا الكثير من الوقت والجهد في عملية الكاستينج.",
      rating: 5
    },
    {
      name: "خالد السعدي",
      role: "مدير تسويق",
      company: "برند لاب",
      text: "الدفع الآمن والتوقيع الإلكتروني جعل العملية كلها سلسة ومريحة للطرفين.",
      rating: 5
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        // جلب عدد الإشعارات إذا كان المستخدم مسجل
        if (userData?.id) {
          fetchNotificationsCount(userData.id);
        }
      } else {
        setUser(null);
      }
    } catch { setUser(null); }
  }, [isMounted]);
  
  // وظيفة لجلب عدد الإشعارات
  const fetchNotificationsCount = async (userId: number) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const notifications = await response.json();
      const unreadCount = notifications.filter((n: any) => !n.read).length;
      setNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications count:', error);
    }
  };

  useEffect(() => {
    if (!isMounted) return;
    try {
    setLang(typeof window !== 'undefined' ? localStorage.getItem('lang') || 'ar' : 'ar');
    } catch { setLang('ar'); }
  }, [isMounted]);
  
  // تحديث مستمر للإشعارات كل دقيقة
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      fetchNotificationsCount(Number(user.id));
    }, 60000); // تحديث كل دقيقة
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const toggleLang = () => {
    setShowLangModal(!showLangModal);
  };
  
  const selectLanguage = (selectedLang: string) => {
    localStorage.setItem('lang', selectedLang);
    setLang(selectedLang);
    setShowLangModal(false);
    window.location.reload();
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAnchorEl(null);
    window.location.reload();
  };
  
  let dashboardLink = '/user';
  if (user?.role === 'admin') dashboardLink = '/admin';
  else if (user?.role === 'talent') dashboardLink = '/talent';
  else if (user?.role === 'company') dashboardLink = '/company';
  else if (user?.role === 'user') dashboardLink = '/user';

  const heroSlide = defaultHeroSlides[0];

  return (
    <div className="min-h-screen gradient-optimized text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
        scrolled 
          ? 'bg-indigo-950/95 border-b border-blue-400/20 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4 group">
              <div className="w-16 h-16 relative">
                <Image src="/logo.png" alt="شعار طوق" fill className="object-contain" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  طوق
                </div>
                <div className="text-xs text-blue-300/80">
                  {t('platform.tagline')}
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#home" className="relative py-2 px-1 group">
                <span className="relative z-10 transition-colors group-hover:text-orange-400">
                  {t('navigation.home')}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></div>
              </a>
              <a href="#categories" className="relative py-2 px-1 group">
                <span className="relative z-10 transition-colors group-hover:text-orange-400">
                  {t('navigation.categories')}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></div>
              </a>
              <a href="/talents" className="relative py-2 px-1 group">
                <span className="relative z-10 transition-colors group-hover:text-orange-400">
                  {t('navigation.talents')}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></div>
              </a>
              <a href="#services" className="relative py-2 px-1 group">
                <span className="relative z-10 transition-colors group-hover:text-orange-400">
                  {t('navigation.services')}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></div>
              </a>
              <a href="#about" className="relative py-2 px-1 group">
                <span className="relative z-10 transition-colors group-hover:text-orange-400">
                  {t('navigation.about')}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></div>
              </a>
              <a href="#contact" className="relative py-2 px-1 group">
                <span className="relative z-10 transition-colors group-hover:text-orange-400">
                  {t('navigation.contact')}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></div>
              </a>
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {!isMounted ? null : !user ? (
                <>
                  <a href="/login" className="px-6 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 rounded-full transition-colors border border-blue-400/30 hover:border-blue-400/60">
                    {t('navigation.login')}
                  </a>
                  <a href="/register" className="px-6 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg">
                    {t('navigation.joinNow')}
                  </a>
                  <button 
                    onClick={toggleLang} 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-900/30 border border-blue-400/20 hover:bg-orange-400/20 hover:border-orange-400/40 transition-colors backdrop-light"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    {lang === 'ar' ? (
                      <span className="flex items-center gap-1">
                        <svg width="16" height="12" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="16" rx="2" fill="#1A9F29"/>
                          <path d="M17.5 7.5c0-.276-.224-.5-.5-.5h-7a.5.5 0 0 0 0 1h7c.276 0 .5-.224.5-.5Zm-2.5 2.5c0-.276-.224-.5-.5-.5h-2a.5.5 0 0 0 0 1h2c.276 0 .5-.224.5-.5Z" fill="#fff"/>
                          <circle cx="6" cy="8" r="1.2" fill="#fff"/>
                        </svg>
                        <span className="hidden sm:inline">AR</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg width="16" height="12" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="16" rx="2" fill="#00247D"/>
                          <rect y="5.33" width="24" height="1.33" fill="#fff"/>
                          <rect y="9.33" width="24" height="1.33" fill="#fff"/>
                          <rect x="8" width="1.33" height="16" fill="#fff"/>
                          <rect x="14.67" width="1.33" height="16" fill="#fff"/>
                        </svg>
                        <span className="hidden sm:inline">EN</span>
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* أيقونة الإشعارات المحسنة */}
                  <button 
                    onClick={() => {
                      if (user?.role === 'admin') router.push('/admin');
                      else if (user?.role === 'talent') router.push('/talent/notifications');
                      else if (user?.role === 'user') router.push('/user/notifications');
                      else router.push('/user/notifications');
                    }}
                    className="relative p-3.5 rounded-xl bg-blue-900/40 border border-blue-400/30 hover:bg-orange-500/30 hover:border-orange-400/50 transition-colors backdrop-light group shadow-lg"
                    title="الإشعارات"
                  >
                    {/* أيقونة الإشعارات الجديدة */}
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white group-hover:text-orange-300 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    
                    {/* عداد الإشعارات المحسن */}
                    {notificationsCount > 0 && (
                      <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white/20">
                        {notificationsCount > 99 ? '99+' : notificationsCount}
                      </div>
                    )}
                    
                    {/* تأثير التوهج */}
                    <div className="absolute inset-0 rounded-xl bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  
                  {/* أيقونة تغيير اللغة المحسنة */}
                  <button 
                    onClick={toggleLang} 
                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-900/40 border border-blue-400/30 hover:bg-orange-500/30 hover:border-orange-400/50 transition-colors backdrop-light group shadow-lg"
                  >
                    {/* أيقونة الكرة الأرضية الجديدة */}
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white group-hover:text-orange-300 transition-colors">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path d="M2 12h20" strokeWidth="2"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
                      <path d="M12 2v20" strokeWidth="2"/>
                    </svg>
                    
                    {/* العلم واللغة */}
                    {lang === 'ar' ? (
                      <span className="flex items-center gap-2">
                        <div className="relative">
                          <svg width="20" height="14" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded shadow-md">
                            <rect width="24" height="16" rx="2" fill="#1A9F29"/>
                            <path d="M17.5 7.5c0-.276-.224-.5-.5-.5h-7a.5.5 0 0 0 0 1h7c.276 0 .5-.224.5-.5Zm-2.5 2.5c0-.276-.224-.5-.5-.5h-2a.5.5 0 0 0 0 1h2c.276 0 .5-.224.5-.5Z" fill="#fff"/>
                            <circle cx="6" cy="8" r="1.2" fill="#fff"/>
                          </svg>
                          <div className="absolute inset-0 rounded bg-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="hidden sm:inline font-semibold text-white group-hover:text-orange-300 transition-colors">العربية</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <div className="relative">
                          <svg width="20" height="14" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded shadow-md">
                            <rect width="24" height="16" rx="2" fill="#00247D"/>
                            <rect y="5.33" width="24" height="1.33" fill="#fff"/>
                            <rect y="9.33" width="24" height="1.33" fill="#fff"/>
                            <rect x="8" width="1.33" height="16" fill="#fff"/>
                            <rect x="14.67" width="1.33" height="16" fill="#fff"/>
                          </svg>
                          <div className="absolute inset-0 rounded bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="hidden sm:inline font-semibold text-white group-hover:text-orange-300 transition-colors">English</span>
                      </span>
                    )}
                    
                    {/* تأثير التوهج */}
                    <div className="absolute inset-0 rounded-xl bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  <button onClick={handleAvatarClick} className="ml-2 focus:outline-none group">
                    {user.profileImageData ? (
                      <Image
                        src={`data:image/png;base64,${typeof user.profileImageData === 'string' ? user.profileImageData : ''}`}
                        alt={typeof user.name === 'string' ? user.name : 'user'}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/50 shadow-lg group-hover:border-orange-400/70 transition-all duration-150"
                      />
                    ) : (
                      <Avatar
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: '#FFD600', 
                          color: '#222',
                          border: '2px solid rgba(59, 130, 246, 0.5)',
                          '&:hover': {
                            border: '2px solid rgba(251, 146, 60, 0.7)'
                          }
                        }}
                      >
                        {user && typeof user.name === 'string' ? user.name[0] : 'م'}
                      </Avatar>
                    )}
                  </button>
                  <MuiMenu 
                    anchorEl={anchorEl} 
                    open={menuOpen} 
                    onClose={handleMenuClose} 
                    anchorOrigin={{vertical:'bottom',horizontal:'right'}} 
                    transformOrigin={{vertical:'top',horizontal:'right'}}
                    PaperProps={{
                      sx: {
                        bgcolor: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        mt: 1
                      }
                    }}
                  >
                    <div className="flex flex-col items-center px-6 pt-6 pb-4">
                      <Avatar
                        src={user && typeof user.profileImageData === 'string' ? `data:image/png;base64,${user.profileImageData}` : undefined}
                        alt={user && typeof user.name === 'string' ? user.name : 'user'}
                        sx={{ width: 64, height: 64, bgcolor: '#FFD600', color: '#222', mb: 2 }}
                      >
                        {user && typeof user.name === 'string' ? user.name[0] : 'م'}
                      </Avatar>
                      <div className="font-bold text-white text-lg mb-2">{user && typeof user.name === 'string' ? user.name : ''}</div>
                    </div>
                    <MuiMenuItem 
                      onClick={() => { handleMenuClose(); router.push(dashboardLink); }}
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(251, 146, 60, 0.1)' } }}
                    >
                      لوحة التحكم
                    </MuiMenuItem>
                    <MuiMenuItem 
                      onClick={handleLogout}
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                    >
                      تسجيل خروج
                    </MuiMenuItem>
                  </MuiMenu>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg bg-blue-900/30 border border-blue-400/20 transition-colors hover:bg-blue-800/40"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay خلفية داكنة تغطي الشاشة */}
          <div className="fixed inset-0 z-30 bg-[#0f172a]/90 md:hidden" onClick={() => setIsMenuOpen(false)} />
          {/* القائمة نفسها */}
          <div className="md:hidden fixed top-20 left-0 right-0 z-40 bg-indigo-950/98 border-b border-blue-400/20 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                <Link href="/#home" className="py-3 px-4 rounded-xl hover:bg-orange-400/20 transition-colors text-center font-medium">
                  {t('navigation.home')}
                </Link>
                <Link href="/#categories" className="py-3 px-4 rounded-xl hover:bg-orange-400/20 transition-colors text-center font-medium">
                  {t('navigation.categories')}
                </Link>
                <Link href="/talents" className="py-3 px-4 rounded-xl hover:bg-orange-400/20 transition-colors text-center font-medium">
                  {t('navigation.talents')}
                </Link>
                <Link href="/#services" className="py-3 px-4 rounded-xl hover:bg-orange-400/20 transition-colors text-center font-medium">
                  {t('navigation.services')}
                </Link>
                <Link href="/#about" className="py-3 px-4 rounded-xl hover:bg-orange-400/20 transition-colors text-center font-medium">
                  {t('navigation.about')}
                </Link>
                <Link href="/#contact" className="py-3 px-4 rounded-xl hover:bg-orange-400/20 transition-colors text-center font-medium">
                  {t('navigation.contact')}
                </Link>
                {/* عناصر خاصة بالمستخدم المسجل فقط */}
                {user ? (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-blue-400/20">
                    {/* أيقونة الإشعارات للموبايل المحسنة */}
                    <button
                      className="relative py-4 bg-green-600/40 rounded-2xl border border-green-400/40 text-center font-medium hover:bg-green-500/60 hover:border-green-300/60 transition-colors text-white shadow-lg group"
                      onClick={() => { 
                        setIsMenuOpen(false); 
                        if (user?.role === 'admin') router.push('/admin');
                        else if (user?.role === 'talent') router.push('/talent/notifications');
                        else if (user?.role === 'user') router.push('/user/notifications');
                        else router.push('/user/notifications');
                      }}
                    >
                      <span className="flex items-center justify-center gap-3">
                        {/* أيقونة الإشعارات الجديدة */}
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white group-hover:text-green-200 transition-colors">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="font-semibold">الإشعارات</span>
                        
                        {/* عداد الإشعارات المحسن */}
                        {notificationsCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-3 py-1.5 shadow-lg border-2 border-white/20">
                            {notificationsCount > 99 ? '99+' : notificationsCount}
                          </span>
                        )}
                      </span>
                      
                      {/* تأثير التوهج */}
                      <div className="absolute inset-0 rounded-2xl bg-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button
                      className="py-3 bg-blue-600/30 rounded-xl border border-blue-400/30 text-center font-medium hover:bg-blue-600/50 transition-colors text-white"
                      onClick={() => { setIsMenuOpen(false); router.push(dashboardLink); }}
                    >
                      لوحة التحكم
                    </button>
                    <button
                      className="py-3 bg-red-500 text-white rounded-xl text-center font-medium hover:bg-red-600 transition-colors"
                      onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    >
                      تسجيل خروج
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-blue-400/20">
                    <Link href="/login" className="py-3 bg-blue-600/30 rounded-xl border border-blue-400/30 text-center font-medium hover:bg-blue-600/50 transition-colors">
                      {t('navigation.login')}
                    </Link>
                    <Link href="/register" className="py-3 bg-orange-500 text-white rounded-xl text-center font-medium hover:bg-orange-600 transition-colors">
                      {t('navigation.joinNow')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-indigo-950/95 rounded-2xl p-8 border border-blue-400/20 shadow-lg max-w-md w-full mx-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('language.select')}
              </h3>
              <p className="text-blue-200">{t('language.selectPrompt')}</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => selectLanguage('ar')}
              className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-colors ${
                lang === 'ar' 
                  ? 'border-orange-400 bg-orange-400/20 text-white shadow-lg' 
                  : 'border-blue-400/30 bg-blue-900/30 text-blue-100 hover:border-orange-400/50 hover:bg-blue-800/40'
              }`}
              >
                <svg width="32" height="22" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="16" rx="3" fill="#1A9F29"/>
                  <path d="M17.5 7.5c0-.276-.224-.5-.5-.5h-7a.5.5 0 0 0 0 1h7c.276 0 .5-.224.5-.5Zm-2.5 2.5c0-.276-.224-.5-.5-.5h-2a.5.5 0 0 0 0 1h2c.276 0 .5-.224.5-.5Z" fill="#fff"/>
                  <circle cx="6" cy="8" r="1.2" fill="#fff"/>
                </svg>
                <span className="font-bold text-lg">{t('language.arabic')}</span>
                {lang === 'ar' && <span className="ml-auto text-xl">✓</span>}
              </button>
              <button 
                onClick={() => selectLanguage('en')}
              className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-colors ${
                lang === 'en' 
                  ? 'border-orange-400 bg-orange-400/20 text-white shadow-lg' 
                  : 'border-blue-400/30 bg-blue-900/30 text-blue-100 hover:border-orange-400/50 hover:bg-blue-800/40'
              }`}
              >
                <svg width="32" height="22" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="16" rx="3" fill="#00247D"/>
                  <rect y="5.33" width="24" height="1.33" fill="#fff"/>
                  <rect y="9.33" width="24" height="1.33" fill="#fff"/>
                  <rect x="8" width="1.33" height="16" fill="#fff"/>
                  <rect x="14.67" width="1.33" height="16" fill="#fff"/>
                </svg>
                <span className="font-bold text-lg">{t('language.english')}</span>
                {lang === 'en' && <span className="ml-auto text-xl">✓</span>}
              </button>
            </div>
            <button 
              onClick={() => setShowLangModal(false)}
              className="w-full mt-8 py-4 bg-blue-900/40 border border-blue-400/20 text-blue-200 rounded-xl hover:bg-blue-800/60 transition-colors font-medium"
            >
              {t('language.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20">
        {/* Background with Parallax Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>
          <Image
            src={heroSlide.image}
            alt={heroSlide.title}
            fill
            className="object-cover transform scale-105"
            priority
          />
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-transparent to-purple-900/60 z-5"></div>
        </div>

        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Content */}
            <div className="text-center lg:text-right">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                  <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    {heroSlide.title}
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100/90 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                  {heroSlide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-8">
                  <button 
                    onClick={() => router.push('/register')}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-150 hover:shadow-lg"
                  >
                    <span className="relative z-10">{heroSlide.cta}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  </button>
                  <button 
                    onClick={() => setShowVideoModal(true)}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-150 overflow-hidden hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-150 shadow-lg">
                        <Play className="w-5 h-5 ml-1 text-white group-hover:translate-x-0.5 transition-transform duration-150" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                    </div>
                    <span className="font-medium text-white group-hover:text-orange-300 transition-colors duration-150">{t('hero.video')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg border border-white/10">
                  <Image
                    src={heroSlide.image}
                    alt={heroSlide.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl rotate-12 opacity-80"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl -rotate-12 opacity-60"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-indigo-950/80 backdrop-light">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    {stat.number}
                  </div>
                  <div className="text-blue-200 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section id="categories" className="py-24">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('categories.title')}
              </h2>
              <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
                اكتشف مجموعة واسعة من فئات المواهب المتاحة على منصتنا
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((cat, index) => (
                <Link 
                  key={cat.id} 
                  href={`/categories/${cat.id}?name=${encodeURIComponent(cat.name)}`} 
                  className="group"
                >
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col items-center text-center">
                                              <div className="w-20 h-20 mb-4 rounded-xl overflow-hidden border border-white/20 group-hover:border-orange-400/50 transition-colors">
                          {cat.imageData ? (
                            <Image 
                              src={`data:image/png;base64,${cat.imageData}`} 
                              alt={cat.name} 
                              width={80} 
                              height={80} 
                              className="w-full h-full object-cover" 
                            />
                          ) : cat.imageUrl ? (
                            <Image 
                              src={cat.imageUrl} 
                              alt={cat.name} 
                              width={80} 
                              height={80} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                          <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-200">
                            <span className="text-xs">{t('categories.noImage')}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-indigo-950/60">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('features.whyChoose.title')} <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">طوق</span>؟
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
              {t('features.whyChoose.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors h-full">
                  <div className="text-orange-400 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
              {t('howItWorks.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-6 group-hover:text-orange-400 transition-colors">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="text-blue-100/80 text-lg leading-relaxed">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-6 group-hover:text-pink-400 transition-colors">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="text-blue-100/80 text-lg leading-relaxed">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-6 group-hover:text-blue-400 transition-colors">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="text-blue-100/80 text-lg leading-relaxed">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-indigo-950/60">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
              {t('testimonials.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors h-full">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-blue-100/80 text-lg leading-relaxed mb-8 italic">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl ml-4 shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-lg group-hover:text-orange-400 transition-colors">
                        {testimonial.name}
                      </div>
                      <div className="text-blue-200/80">
                        {testimonial.role} - {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              {t('cta.ready.title')}
            </h2>
            <p className="text-xl lg:text-2xl mb-12 opacity-90 leading-relaxed">
              {t('cta.ready.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register" className="group px-10 py-5 bg-white text-orange-500 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg inline-block">
                <span className="flex items-center gap-2">
                  {t('cta.startAsTalent')}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              <button className="px-10 py-5 bg-white/10 border-2 border-white/30 rounded-xl hover:bg-white/20 transition-colors font-bold text-lg">
                تعرف على المزيد
              </button>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t('services.title')}
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
              {t('services.description')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="flex items-start gap-6 bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-orange-400">
                  <Search size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
                    {t('services.smartSearch.title')}
                  </h3>
                  <p className="text-blue-100/80 text-lg leading-relaxed">
                    {t('services.smartSearch.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-pink-400">
                  <Users size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-pink-400 transition-colors">
                    {t('services.manageTalents.title')}
                  </h3>
                  <p className="text-blue-100/80 text-lg leading-relaxed">
                    {t('services.manageTalents.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-blue-400">
                  <Calendar size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                    {t('services.scheduleInterviews.title')}
                  </h3>
                  <p className="text-blue-100/80 text-lg leading-relaxed">
                    {t('services.scheduleInterviews.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-green-400">
                  <Shield size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-green-400 transition-colors">
                    {t('services.electronicPayment.title')}
                  </h3>
                  <p className="text-blue-100/80 text-lg leading-relaxed">
                    {t('services.electronicPayment.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-purple-400">
                  <Play size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                    {t('services.reportingTracking.title')}
                  </h3>
                  <p className="text-blue-100/80 text-lg leading-relaxed">
                    {t('services.reportingTracking.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-indigo-400">
                  <ChevronRight size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">
                    {t('services.invitationsCommunication.title')}
                  </h3>
                  <p className="text-blue-100/80 text-lg leading-relaxed">
                    {t('services.invitationsCommunication.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-indigo-950/60">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t('about.title')}
            </h2>
            <p className="text-xl text-blue-100/80 leading-relaxed">
              {t('about.description')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="group">
                              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors h-full text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-orange-400">
                    {t('about.vision.title')}
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed">
                    {t('about.vision.description')}
                  </p>
                </div>
            </div>

            <div className="group">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors h-full text-center">
                <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-pink-400">
                  {t('about.mission.title')}
                </h3>
                <p className="text-blue-100/80 leading-relaxed">
                  {t('about.mission.description')}
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors h-full text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-blue-400">
                  {t('about.values.title')}
                </h3>
                <p className="text-blue-100/80 leading-relaxed">
                  {t('about.values.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-3xl font-bold mb-6 text-pink-400">
                {t('about.team.title')}
              </h3>
              <p className="text-blue-100/80 text-lg leading-relaxed">
                {t('about.team.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 gradient-optimized text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('contact.title')}</h2>
            <p className="text-lg text-blue-100 mb-8">{t('contact.description')}</p>
          </div>
          <div className="max-w-2xl mx-auto bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30 mb-8">
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const name = String(formData.get('name') || '');
              const email = String(formData.get('email') || '');
              const message = String(formData.get('message') || '');
              if (!name || !email || !message) return;
              try {
                setContactStatus('loading');
                const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, message }) });
                if (!res.ok) throw new Error('failed');
                form.reset();
                setContactStatus('success');
              } catch {
                setContactStatus('error');
              }
            }}>
              <div>
                <label className="block mb-2 text-blue-100">{t('contact.form.name')}</label>
                <input name="name" type="text" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('contact.form.namePlaceholder')} required />
              </div>
              <div>
                <label className="block mb-2 text-blue-100">{t('contact.form.email')}</label>
                <input name="email" type="email" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('contact.form.emailPlaceholder')} required />
              </div>
              <div>
                <label className="block mb-2 text-blue-100">{t('contact.form.message')}</label>
                <textarea name="message" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" rows={4} placeholder={t('contact.form.messagePlaceholder')} required />
              </div>
              <button type="submit" disabled={contactStatus==='loading'} className="w-full py-3 bg-orange-500 rounded-lg font-bold text-lg text-white hover:bg-orange-600 transition-colors disabled:opacity-60">{contactStatus==='loading' ? 'جارٍ الإرسال...' : t('contact.form.submit')}</button>
              {contactStatus==='success' && (
                <div className="mt-3 p-3 rounded-lg bg-green-500/15 border border-green-400/30 text-green-200">
                  تم إرسال استفسارك بنجاح، سنعود إليك قريباً. شكراً لتواصلك معنا.
                </div>
              )}
              {contactStatus==='error' && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200">
                  حدث خطأ أثناء الإرسال. الرجاء المحاولة مرة أخرى.
                </div>
              )}
            </form>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2 justify-center">
                <Mail className="text-orange-400" />
                Toq@toq-group.com
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Phone className="text-orange-400" />
                +966 55 144 8433
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-950/90 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                طوق
              </div>
              <p className="text-blue-100 mb-4">{t('footer.about.description')}</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600/50 transition-colors">
                  <span className="text-sm">ت</span>
                </div>
                <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600/50 transition-colors">
                  <span className="text-sm">ف</span>
                </div>
                <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600/50 transition-colors">
                  <span className="text-sm">ي</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks.title')}</h3>
              <div className="space-y-2">
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('navigation.home')}</a>
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('navigation.services')}</a>
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('navigation.about')}</a>
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('footer.help')}</a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.forTalents.title')}</h3>
              <div className="space-y-2">
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('footer.createProfile')}</a>
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('footer.findWork')}</a>
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('footer.successTips')}</a>
                <a href="#" className="block text-blue-100 hover:text-white transition-colors">{t('footer.faq')}</a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contactUs.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-400" />
                  <span className="text-blue-100">+966 55 144 8433</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <span className="text-blue-100">Toq@toq-group.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span className="text-blue-100">الرياض حي الملك سلمان مبنى الواحة سكوير الدور الاول مكتب 109</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowVideoModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl mx-auto modal-fade-in">
            <div className="relative bg-gradient-to-br from-indigo-900/95 to-purple-900/95 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  تعرف على منصة طوق
                </h3>
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group"
                >
                  <X className="w-5 h-5 text-white group-hover:text-orange-400 transition-colors" />
                </button>
              </div>
              
              {/* Video Container */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
                  title="منصة طوق - تعرف على المنصة"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              {/* Footer */}
              <div className="p-6 bg-gradient-to-r from-orange-400/10 to-pink-500/10">
                <p className="text-blue-200 text-center text-lg">
                  اكتشف كيف يمكن لمنصة طوق أن تساعدك في تطوير موهبتك أو العثور على المواهب المناسبة
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/966551448433"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 text-3xl transition-all"
        title="تواصل عبر واتساب"
        style={{ boxShadow: '0 4px 24px 0 rgba(37, 211, 102, 0.3)' }}
      >
        <FaWhatsapp />
      </a>
    </div>
  );
};

export default CastingPlatform;
