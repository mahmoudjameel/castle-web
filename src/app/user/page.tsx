"use client";

import React, { useEffect, useState } from "react";
import { User, ClipboardList, Bell, LogOut, Home, Settings, Award, AlertCircle, MessageCircle, AlertTriangle } from "lucide-react";

const stats = [
  { 
    label: 'طلبات نشطة', 
    value: 5, 
    icon: <ClipboardList className="w-6 h-6 text-white" />,
    color: 'from-orange-400 to-pink-500'
  },
  { 
    label: 'إشعارات جديدة', 
    value: 3, 
    icon: <Bell className="w-6 h-6 text-white" />,
    color: 'from-blue-400 to-purple-500'
  },
  { 
    label: 'محادثات نشطة', 
    value: 2, 
    icon: <MessageCircle className="w-6 h-6 text-white" />,
    color: 'from-green-400 to-blue-500'
  },
  { 
    label: 'بلاغات مرسلة', 
    value: 2, 
    icon: <AlertTriangle className="w-6 h-6 text-white" />,
    color: 'from-red-400 to-orange-500'
  },
];

const userFeatures = [
  { 
    icon: <User className="w-8 h-8" />, 
    title: 'الملف الشخصي', 
    desc: 'تعديل بياناتك الشخصية وصورتك ورقم الهاتف والعنوان', 
    href: '/user/profile',
    color: 'from-orange-400 to-pink-500'
  },
  { 
    icon: <ClipboardList className="w-8 h-8" />, 
    title: 'طلباتي', 
    desc: 'استعرض جميع الطلبات التي قمت بها وحالتها', 
    href: '/user/orders',
    color: 'from-blue-400 to-purple-500'
  },
  { 
    icon: <Bell className="w-8 h-8" />, 
    title: 'الإشعارات', 
    desc: 'شاهد أحدث الإشعارات والتنبيهات الخاصة بك', 
    href: '/user/notifications',
    color: 'from-green-400 to-blue-500'
  },
  { 
    icon: <MessageCircle className="w-8 h-8" />, 
    title: 'المحادثات', 
    desc: 'تواصل مع المواهب مباشرة عبر المنصة', 
    href: '/user/chats',
    color: 'from-purple-400 to-pink-500'
  },
  { 
    icon: <AlertTriangle className="w-8 h-8" />, 
    title: 'بلاغاتي', 
    desc: 'عرض البلاغات التي أرسلتها وحالة معالجتها', 
    href: '/user/reports',
    color: 'from-red-400 to-orange-500'
  },
  { 
    icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>, 
    title: 'الفواتير', 
    desc: 'عرض وتحميل جميع فواتير عمليات الشراء الخاصة بك', 
    href: '/user/invoices',
    color: 'from-orange-400 to-red-500'
  },
];

export default function UserDashboardHome() {
  const [user, setUser] = useState<{name?: string, profileImageData?: string} | null>(null);
  
  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser({ name: u.name, profileImageData: u.profileImageData });
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">

      <div className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl mb-4 transform rotate-12 shadow-lg">
              <Settings className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              لوحة تحكم المستخدم
            </h1>
            <p className="text-blue-200/80 text-lg">إدارة طلباتك وحسابك من مكان واحد</p>
          </div>

          {/* قسم الترحيب والصورة الشخصية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.profileImageData ? (
                    <img
                      src={`data:image/png;base64,${user.profileImageData}`}
                      alt={user.name || 'صورة المستخدم'}
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
                    مرحباً {user?.name || 'مستخدم'}!
                  </h2>
                  <p className="text-blue-200/80">مرحبا بك في لوحة تحكم المستخدم</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl text-white font-semibold hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-xl text-white font-semibold hover:from-pink-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-5 text-center group hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-blue-200/80 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* الخدمات الرئيسية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              الخدمات الرئيسية
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFeatures.map((feature, i) => (
                <a
                  key={i}
                  href={feature.href}
                  className="group bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-300 hover:shadow-lg block relative overflow-hidden"
                >
                  {/* تأثير الخلفية المتحركة */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                  
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                      {feature.title}
                    </h4>
                    
                    <p className="text-blue-200/80 leading-relaxed">
                      {feature.desc}
                    </p>
                    
                    {/* سهم للإشارة للرابط */}
                    <div className="flex items-center mt-4 text-orange-400 group-hover:text-orange-300 transition-colors">
                      <span className="text-sm font-semibold">اذهب للصفحة</span>
                      <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* نصائح سريعة */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              نصائح مفيدة
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">💡</div>
                <h4 className="text-white font-semibold mb-2">أكمل ملفك الشخصي</h4>
                <p className="text-blue-200/80 text-sm">ملف شخصي مكتمل يساعد المواهب على فهم احتياجاتك بشكل أفضل</p>
              </div>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">📋</div>
                <h4 className="text-white font-semibold mb-2">تابع طلباتك</h4>
                <p className="text-blue-200/80 text-sm">راجع حالة طلباتك بانتظام للحصول على أفضل تجربة</p>
              </div>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">💬</div>
                <h4 className="text-white font-semibold mb-2">تواصل مباشرة</h4>
                <p className="text-blue-200/80 text-sm">استخدم المحادثات للتواصل مع المواهب وتوضيح متطلباتك</p>
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