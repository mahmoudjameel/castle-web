'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Star, Users, Calendar, Shield, Play, ChevronRight, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';

const CastingPlatform = () => {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<{id:string,name:string,imageUrl?:string,imageData?:string}[]>([]);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState('ar');
  const [showLangModal, setShowLangModal] = useState(false);

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
  // الحالة الجديدة
  const [heroSlides, setHeroSlides] = useState<any[]>(defaultHeroSlides);

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
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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
      if (userStr) setUser(JSON.parse(userStr));
      else setUser(null);
    } catch { setUser(null); }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
    setLang(typeof window !== 'undefined' ? localStorage.getItem('lang') || 'ar' : 'ar');
    } catch { setLang('ar'); }
  }, [isMounted]);

  useEffect(() => {
    // جلب بيانات البانر الرئيسي
    fetch('/api/hero-banners')
      .then(res => res.json())
      .then(data => {
        setHeroSlides(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching hero banners:', error);
        setHeroSlides([]);
      });
  }, []);

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
  let dashboardLink = '/';
  if (user?.role === 'admin') dashboardLink = '/admin';
  else if (user?.role === 'talent') dashboardLink = '/talent';
  else if (user?.role === 'company') dashboardLink = '/company';
  else if (user?.role === 'user') dashboardLink = '/user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50" style={{ background: '#0D0552CC', borderBottom: '1px solid #3B3B98' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 relative">
                <Image src="/logo.png" alt="شعار طوق" fill className="object-contain" />
              </div>
              <div className="hidden sm:block text-sm text-blue-200">
                {t('platform.tagline')}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="hover:text-orange-400 transition-colors">{t('navigation.home')}</a>
              <a href="#categories" className="hover:text-orange-400 transition-colors">{t('navigation.categories')}</a>
              <a href="#services" className="hover:text-orange-400 transition-colors">{t('navigation.services')}</a>
              <a href="#about" className="hover:text-orange-400 transition-colors">{t('navigation.about')}</a>
              <a href="#contact" className="hover:text-orange-400 transition-colors">{t('navigation.contact')}</a>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {/* أزرار اللغة والحساب كما كانت */}
              {!isMounted ? null : !user ? (
                <>
                  <a href="/login" className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg transition-colors border border-blue-400/30">{t('navigation.login')}</a>
                  <a href="/register" className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all">{t('navigation.joinNow')}</a>
                  <button onClick={toggleLang} className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-900/40 border border-blue-400/20 hover:bg-orange-400/80 transition-all text-white text-lg font-bold">
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
                  <button onClick={toggleLang} className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-900/40 border border-blue-400/20 hover:bg-orange-400/80 transition-all text-white text-lg font-bold">
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
                  <button onClick={handleAvatarClick} className="ml-2 focus:outline-none">
                    {user.profileImageData ? (
                      <Image
                        src={`data:image/png;base64,${typeof user.profileImageData === 'string' ? user.profileImageData : ''}`}
                        alt={typeof user.name === 'string' ? user.name : 'user'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow"
                      />
                    ) : (
                  <Avatar
                        sx={{ width: 40, height: 40, bgcolor: '#FFD600', color: '#222' }}
                  >
                    {user && typeof user.name === 'string' ? user.name[0] : 'م'}
                  </Avatar>
                    )}
                  </button>
                  <MuiMenu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} anchorOrigin={{vertical:'bottom',horizontal:'right'}} transformOrigin={{vertical:'top',horizontal:'right'}}>
                    <div className="flex flex-col items-center px-4 pt-4 pb-2">
                      <Avatar
                        src={user && typeof user.profileImageData === 'string' ? `data:image/png;base64,${user.profileImageData}` : undefined}
                        alt={user && typeof user.name === 'string' ? user.name : 'user'}
                        sx={{ width: 56, height: 56, bgcolor: '#FFD600', color: '#222', mb: 1 }}
                      >
                        {user && typeof user.name === 'string' ? user.name[0] : 'م'}
                      </Avatar>
                      <div className="font-bold text-blue-900 mb-2" style={{fontSize:'1.1rem'}}>{user && typeof user.name === 'string' ? user.name : ''}</div>
                    </div>
                    <MuiMenuItem component={Link} href={dashboardLink} onClick={handleMenuClose}>لوحة التحكم</MuiMenuItem>
                    <MuiMenuItem onClick={handleLogout}>تسجيل خروج</MuiMenuItem>
                  </MuiMenu>
                </>
              )}
            </div>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
        {/* Mobile Menu */}
        {isMenuOpen && (
        <div className="md:hidden fixed top-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-sm bg-indigo-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-400/20 z-50 animate-fadeIn">
          <div className="flex flex-col items-center px-6 py-8 gap-4">
            <Link href="/#home" className="w-full text-center py-3 rounded-xl font-bold text-lg hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all">{t('navigation.home')}</Link>
            <Link href="/#categories" className="w-full text-center py-3 rounded-xl font-bold text-lg hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all">{t('navigation.categories')}</Link>
            <Link href="/#services" className="w-full text-center py-3 rounded-xl font-bold text-lg hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all">{t('navigation.services')}</Link>
            <Link href="/#about" className="w-full text-center py-3 rounded-xl font-bold text-lg hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all">{t('navigation.about')}</Link>
            <Link href="/#contact" className="w-full text-center py-3 rounded-xl font-bold text-lg hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all">{t('navigation.contact')}</Link>
            <div className="flex flex-col w-full gap-2 pt-4">
              <Link href="/login" className="w-full py-3 bg-blue-600/30 rounded-xl border border-blue-400/30 text-center font-bold text-white">{t('navigation.login')}</Link>
              <Link href="/register" className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl text-center font-bold">{t('navigation.joinNow')}</Link>
              </div>
            </div>
          </div>
        )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-indigo-950/95 backdrop-blur-md rounded-2xl p-6 border border-blue-400/20 shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{t('language.select')}</h3>
              <p className="text-blue-200 text-sm">{t('language.selectPrompt')}</p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => selectLanguage('ar')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  lang === 'ar' 
                    ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-pink-500 text-white' 
                    : 'border-blue-400/30 bg-blue-900/40 text-blue-100 hover:border-orange-400'
                }`}
              >
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="16" rx="2" fill="#1A9F29"/>
                  <path d="M17.5 7.5c0-.276-.224-.5-.5-.5h-7a.5.5 0 0 0 0 1h7c.276 0 .5-.224.5-.5Zm-2.5 2.5c0-.276-.224-.5-.5-.5h-2a.5.5 0 0 0 0 1h2c.276 0 .5-.224.5-.5Z" fill="#fff"/>
                  <circle cx="6" cy="8" r="1.2" fill="#fff"/>
                </svg>
                <span className="font-bold">{t('language.arabic')}</span>
                {lang === 'ar' && <span className="ml-auto text-sm">✓</span>}
              </button>
              <button 
                onClick={() => selectLanguage('en')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  lang === 'en' 
                    ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-pink-500 text-white' 
                    : 'border-blue-400/30 bg-blue-900/40 text-blue-100 hover:border-orange-400'
                }`}
              >
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="16" rx="2" fill="#00247D"/>
                  <rect y="5.33" width="24" height="1.33" fill="#fff"/>
                  <rect y="9.33" width="24" height="1.33" fill="#fff"/>
                  <rect x="8" width="1.33" height="16" fill="#fff"/>
                  <rect x="14.67" width="1.33" height="16" fill="#fff"/>
                </svg>
                <span className="font-bold">{t('language.english')}</span>
                {lang === 'en' && <span className="ml-auto text-sm">✓</span>}
              </button>
            </div>
            <button 
              onClick={() => setShowLangModal(false)}
              className="w-full mt-6 py-3 bg-blue-900/40 border border-blue-400/20 text-blue-200 rounded-lg hover:bg-blue-800/60 transition-all"
            >
              {t('language.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
        {/* Background Image Slider */}
        <div className="absolute inset-0 overflow-hidden">
          {heroSlides.map((slide, index) => (
            (slide && slide.title && slide.image) ? (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                  priority={index === currentSlide}
              />
            </div>
            ) : null
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col md:flex-row items-center justify-between min-h-[70vh]">
          {/* النصوص والأزرار */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-right space-y-6 md:space-y-8 py-12 md:py-0">
            <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 md:mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {heroSlides[currentSlide]?.title || 'عنوان السلايدر'}
              </h1>
            <p className="text-lg xs:text-xl md:text-2xl text-blue-100 leading-relaxed mb-2 md:mb-4 max-w-xl">
              {heroSlides[currentSlide]?.subtitle || 'وصف السلايدر'}
              </p>
            <div className="flex flex-col sm:flex-row items-center w-full gap-4 md:gap-6 mb-2 md:mb-6">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all transform hover:scale-105 text-lg md:text-xl shadow-lg">
                {heroSlides[currentSlide]?.cta || 'ابدأ الآن'}
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600/30 backdrop-blur-sm border border-blue-400/30 rounded-lg hover:bg-blue-600/50 transition-all flex items-center justify-center gap-2 text-lg md:text-xl shadow-lg">
                <Play className="w-5 h-5" />
                <span>{t('hero.video')}</span>
              </button>
            </div>
            {/* User Type Selection */}
              </div>
          {/* صورة البانر على الديسكتوب فقط */}
          <div className="hidden md:block w-1/2 h-[400px] lg:h-[500px] relative">
            <div className="absolute inset-0 rounded-3xl shadow-2xl border-4 border-blue-400/20 overflow-hidden">
              {heroSlides[currentSlide]?.image ? (
                <Image
                  src={heroSlides[currentSlide].image}
                  alt={heroSlides[currentSlide]?.title || 'سلايدر'}
                  fill
                  className="object-cover"
                  priority
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>
        </div>
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-orange-400' : 'bg-blue-300/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section id="categories" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('categories.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {categories.map(cat => (
                <Link key={cat.id} href={`/categories/${cat.id}?name=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center bg-indigo-800/30 rounded-xl p-4 border border-blue-400/30 shadow-md hover:bg-orange-400/10 transition-all cursor-pointer">
                  {cat.imageData ? (
                    <Image src={`data:image/png;base64,${cat.imageData}`} alt={cat.name} width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-blue-400/30 mb-2" />
                  ) : cat.imageUrl ? (
                    <Image src={cat.imageUrl} alt={cat.name} width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-blue-400/30 mb-2" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-200 mb-2">{t('categories.noImage')}</div>
                  )}
                  <div className="font-bold text-lg text-center mt-2">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('features.whyChoose.title')} <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">طوق</span>?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('features.whyChoose.description')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-indigo-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30 hover:bg-indigo-800/50 transition-all transform hover:scale-105">
                <div className="text-orange-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-indigo-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('howItWorks.title')}</h2>
            <p className="text-xl text-blue-100">{t('howItWorks.description')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('howItWorks.step1.title')}</h3>
              <p className="text-blue-100">{t('howItWorks.step1.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('howItWorks.step2.title')}</h3>
              <p className="text-blue-100">{t('howItWorks.step2.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('howItWorks.step3.title')}</h3>
              <p className="text-blue-100">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('testimonials.title')}</h2>
            <p className="text-xl text-blue-100">{t('testimonials.description')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-indigo-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30 hover:bg-indigo-800/50 transition-all transform hover:scale-105">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />
                  ))}
                </div>
                <p className="mb-6 text-blue-100 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-blue-200">{testimonial.role} - {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-400 to-pink-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.ready.title')}</h2>
          <p className="text-xl mb-8 opacity-90">{t('cta.ready.description')}</p>
          <div className="flex justify-center">
            <button className="px-8 py-4 bg-white text-orange-500 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105">
              {t('cta.startAsTalent')}
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('services.title')}</h2>
            <p className="text-lg text-blue-100">{t('services.description')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <Search size={36} className="text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('services.smartSearch.title')}</h3>
                <p className="text-blue-100">{t('services.smartSearch.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <Users size={36} className="text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('services.manageTalents.title')}</h3>
                <p className="text-blue-100">{t('services.manageTalents.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <Calendar size={36} className="text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('services.scheduleInterviews.title')}</h3>
                <p className="text-blue-100">{t('services.scheduleInterviews.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <Shield size={36} className="text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('services.electronicPayment.title')}</h3>
                <p className="text-blue-100">{t('services.electronicPayment.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <Play size={36} className="text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('services.reportingTracking.title')}</h3>
                <p className="text-blue-100">{t('services.reportingTracking.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <ChevronRight size={36} className="text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('services.invitationsCommunication.title')}</h3>
                <p className="text-blue-100">{t('services.invitationsCommunication.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-indigo-950/60 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('about.title')}</h2>
            <p className="text-lg text-blue-100 mb-8">{t('about.description')}</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <h3 className="text-xl font-bold mb-2 text-orange-400">{t('about.vision.title')}</h3>
              <p className="text-blue-100">{t('about.vision.description')}</p>
            </div>
            <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <h3 className="text-xl font-bold mb-2 text-orange-400">{t('about.mission.title')}</h3>
              <p className="text-blue-100">{t('about.mission.description')}</p>
            </div>
            <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
              <h3 className="text-xl font-bold mb-2 text-orange-400">{t('about.values.title')}</h3>
              <p className="text-blue-100">{t('about.values.description')}</p>
            </div>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-pink-400">{t('about.team.title')}</h2>
            <p className="text-blue-100">{t('about.team.description')}</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{t('contact.title')}</h2>
            <p className="text-lg text-blue-100 mb-8">{t('contact.description')}</p>
          </div>
          <div className="max-w-2xl mx-auto bg-indigo-800/30 rounded-xl p-8 border border-blue-400/30 mb-8">
            <form className="space-y-6">
              <div>
                <label className="block mb-2 text-blue-100">{t('contact.form.name')}</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('contact.form.namePlaceholder')} required />
              </div>
              <div>
                <label className="block mb-2 text-blue-100">{t('contact.form.email')}</label>
                <input type="email" className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" placeholder={t('contact.form.emailPlaceholder')} required />
              </div>
              <div>
                <label className="block mb-2 text-blue-100">{t('contact.form.message')}</label>
                <textarea className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" rows={4} placeholder={t('contact.form.messagePlaceholder')} required />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg font-bold text-lg text-white hover:from-orange-500 hover:to-pink-600 transition-all">{t('contact.form.submit')}</button>
            </form>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2 justify-center">
                <Mail className="text-orange-400" />
                {t('contact.email')}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Phone className="text-orange-400" />
                {t('contact.phone')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-950/90 backdrop-blur-sm py-12">
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
                  <span className="text-blue-100">{t('contact.phone')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <span className="text-blue-100">{t('contact.email')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span className="text-blue-100">{t('footer.address')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CastingPlatform;
