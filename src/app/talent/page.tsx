'use client';

import React, { useEffect, useState } from 'react';
import { User, Upload, ListChecks, Bell, CreditCard, Home, LogOut, MessageCircle, Settings, TrendingUp, Award, Clock, AlertCircle, BarChart2 } from 'lucide-react';

const stats = [
  { 
    label: 'طلبات نشطة', 
    value: 0, 
    icon: <ListChecks className="w-6 h-6 text-white" />,
    color: 'from-orange-400 to-pink-500',
    key: 'activeOrders'
  },
  { 
    label: 'عروض متاحة', 
    value: 0, 
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    color: 'from-blue-400 to-purple-500',
    key: 'availableOffers'
  },
  { 
    label: 'إشعارات جديدة', 
    value: 0, 
    icon: <Bell className="w-6 h-6 text-white" />,
    color: 'from-green-400 to-blue-500',
    key: 'newNotifications'
  },
  { 
    label: 'مدفوعات قيد التحويل', 
    value: 0, 
    icon: <CreditCard className="w-6 h-6 text-white" />,
    color: 'from-purple-400 to-pink-500',
    key: 'pendingWithdrawals'
  },
];

const features = [
  { 
    icon: <User className="w-8 h-8" />, 
    title: 'إدارة الملف الشخصي', 
    desc: 'تحديث بياناتك، إضافة خبراتك، وتخصيص ملفك', 
    link: '/talent/profile',
    color: 'from-orange-400 to-pink-500'
  },
  { 
    icon: <Upload className="w-8 h-8" />, 
    title: 'رفع الصور والفيديو', 
    desc: 'أضف صورك وفيديوهاتك لعرض مواهبك', 
    link: '/talent/portfolio',
    color: 'from-blue-400 to-purple-500'
  },
  { 
    icon: <ListChecks className="w-8 h-8" />, 
    title: 'تتبع الطلبات', 
    desc: 'تابع حالة طلباتك وتقديماتك للعروض', 
    link: '/talent/bookings',
    color: 'from-green-400 to-blue-500'
  },
  { 
    icon: <Bell className="w-8 h-8" />, 
    title: 'الإشعارات', 
    desc: 'استقبل إشعارات فورية حول العروض والطلبات', 
    link: '/talent/notifications', 
    badge: true,
    color: 'from-purple-400 to-pink-500'
  },
  { 
    icon: <CreditCard className="w-8 h-8" />, 
    title: 'المحفظة', 
    desc: 'اعرض رصيدك واطلب سحب أرباحك من هنا', 
    link: '/talent/wallet',
    color: 'from-orange-400 to-red-500'
  },
  { 
    icon: <MessageCircle className="w-8 h-8" />, 
    title: 'المحادثات', 
    desc: 'تواصل مع العملاء مباشرة عبر المنصة', 
    link: '/talent/chats', 
    badge: false,
    color: 'from-indigo-400 to-purple-500'
  },
];

export default function TalentDashboard() {
  const [notifCount, setNotifCount] = useState(0);
  const [talent, setTalent] = useState<{name?: string, profileImageData?: string, id?: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>({});
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setTalent({ name: u.name, profileImageData: u.profileImageData });
        
        // جلب الإحصائيات إذا كان لدينا معرف الموهبة
        if (u.id) {
          fetchStats(u.id);
        }
        
        // تحسين جلب البيانات - استخدام setTimeout لتأخير الطلب
        setTimeout(() => {
          fetch(`/api/orders?talentId=${u.id}`)
            .then(res => res.json())
            .then(data => {
              const newCount = (Array.isArray(data) ? data : []).filter((o: Record<string, unknown>)=>o.status==='new').length;
              setNotifCount(newCount);
            })
            .catch(() => setNotifCount(0))
            .finally(() => setIsLoading(false));
        }, 100);
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = async (talentId: number) => {
    try {
      const response = await fetch(`/api/talent/stats?talentId=${talentId}`);
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching talent stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-optimized">

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 backdrop-light">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      <div className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-xl mb-4 shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              لوحة تحكم المواهب
            </h1>
            <p className="text-blue-200/80 text-lg">إدارة ملفك الشخصي وطلباتك من مكان واحد</p>
          </div>

          {/* قسم الترحيب والصورة الشخصية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {talent?.profileImageData ? (
                    <img
                      src={`data:image/png;base64,${talent.profileImageData}`}
                      alt={talent.name || 'صورة الموهبة'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-orange-400/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center text-4xl border-2 border-blue-400/50">
                      <User className="w-12 h-12 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    مرحباً {talent?.name || 'موهبة'}!
                  </h2>
                  <p className="text-blue-200/80">مرحبا بك في لوحة تحكم المواهب</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 rounded-xl text-white font-semibold hover:bg-red-600 transition-colors shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              // حالة التحميل
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-5 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <div className="w-16 h-4 bg-gray-600 rounded animate-pulse mx-auto"></div>
                  </div>
                  <div className="text-blue-200/80 text-sm font-medium">
                    <div className="w-24 h-3 bg-gray-600 rounded animate-pulse mx-auto"></div>
                  </div>
                </div>
              ))
            ) : (
              // عرض الإحصائيات الحقيقية
              stats.map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-5 text-center group hover:bg-white/10 transition-colors shadow-lg">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {statsData[stat.key] || 0}
                  </div>
                  <div className="text-blue-200/80 text-sm font-medium">{stat.label}</div>
                </div>
              ))
            )}
          </div>

          {/* إحصائيات إضافية */}
          {!statsLoading && (
            <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                إحصائيات إضافية
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.totalOrders || 0}</div>
                  <div className="text-blue-200/80 text-sm">إجمالي الطلبات</div>
                </div>
                
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.completedOrders || 0}</div>
                  <div className="text-blue-200/80 text-sm">الطلبات المكتملة</div>
                </div>
                
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.totalEarnings || 0}</div>
                  <div className="text-blue-200/80 text-sm">إجمالي الأرباح</div>
                </div>
                
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.walletBalance || 0}</div>
                  <div className="text-blue-200/80 text-sm">رصيد المحفظة</div>
                </div>
              </div>
            </div>
          )}

          {/* الخدمات الرئيسية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              الخدمات الرئيسية
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, i) => (
                feat.link ? (
                  <a
                    key={i}
                    href={feat.link}
                    className="group bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-150 block relative overflow-hidden"
                  >
                    {/* تأثير الخلفية المتحركة */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-150 rounded-xl`}></div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-r ${feat.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-150 shadow-lg`}>
                        <div className="text-white">
                          {feat.icon}
                        </div>
                        {feat.badge && notifCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                            {notifCount}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-150">
                        {feat.title}
                      </h4>
                      
                      <p className="text-blue-200/80 leading-relaxed">
                        {feat.desc}
                      </p>
                      
                      {/* سهم للإشارة للرابط */}
                      <div className="flex items-center mt-4 text-orange-400 group-hover:text-orange-300 transition-colors duration-150">
                        <span className="text-sm font-semibold">اذهب للصفحة</span>
                        <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div
                    key={i}
                    className="group bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${feat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-r ${feat.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <div className="text-white">
                          {feat.icon}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                        {feat.title}
                      </h4>
                      
                      <p className="text-blue-200/80 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* نصائح سريعة */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              نصائح سريعة
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">💡</div>
                <h4 className="text-white font-semibold mb-2">اكمل ملفك الشخصي</h4>
                <p className="text-blue-200/80 text-sm">ملف شخصي مكتمل يزيد من فرص حصولك على طلبات</p>
              </div>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">📸</div>
                <h4 className="text-white font-semibold mb-2">أضف أعمالك</h4>
                <p className="text-blue-200/80 text-sm">عرض أعمالك السابقة يجذب المزيد من العملاء</p>
              </div>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">⚡</div>
                <h4 className="text-white font-semibold mb-2">استجب بسرعة</h4>
                <p className="text-blue-200/80 text-sm">الرد السريع على الطلبات يحسن تقييمك</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}