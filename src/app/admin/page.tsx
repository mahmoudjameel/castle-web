'use client';

import React, { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Receipt, BarChart2, FolderPlus, UserCheck, ImageIcon, CreditCard, Home, LogOut, Settings, Award, AlertCircle, Mail, MessageCircle, User, Clock } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { 
    label: 'حسابات بانتظار الموافقة', 
    value: 0, 
    icon: <UserCheck className="w-6 h-6 text-white" />,
    color: 'from-orange-400 to-pink-500',
    key: 'pendingAccounts'
  },
  { 
    label: 'عروض نشطة', 
    value: 0, 
    icon: <FileText className="w-6 h-6 text-white" />,
    color: 'from-blue-400 to-purple-500',
    key: 'activeOffers'
  },
  { 
    label: 'شكاوى جديدة', 
    value: 0, 
    icon: <AlertTriangle className="w-6 h-6 text-white" />,
    color: 'from-green-400 to-blue-500',
    key: 'newReports'
  },
  { 
    label: 'فواتير قيد المراجعة', 
    value: 0, 
    icon: <Receipt className="w-6 h-6 text-white" />,
    color: 'from-purple-400 to-pink-500',
    key: 'pendingInvoices'
  },
];

const adminSections = [
  {
    icon: <Settings className="w-8 h-8" />,
    title: 'الخدمات الإدارية',
    desc: 'وصول سريع لكل أدوات وإعدادات الإدارة',
    link: '/admin/services',
    color: 'from-orange-400 to-pink-500'
  },
  { 
    icon: <UserCheck className="w-8 h-8" />, 
    title: 'إدارة المستخدمين والمواهب', 
    desc: 'عرض وإدارة جميع المستخدمين مع معلومات صاحب الحاسب', 
    link: '/admin/users',
    color: 'from-orange-400 to-pink-500'
  },
  { 
    icon: <FileText className="w-8 h-8" />, 
    title: 'متابعة العروض', 
    desc: 'إشراف كامل على عروض الكاستينج والمشاريع', 
    link: null,
    color: 'from-blue-400 to-purple-500'
  },
  { 
    icon: <AlertTriangle className="w-8 h-8" />, 
    title: 'إدارة الشكاوى', 
    desc: 'متابعة الشكاوى وحل النزاعات بين الأطراف', 
    link: '/admin/reports',
    color: 'from-green-400 to-blue-500'
  },
  { 
    icon: <Receipt className="w-8 h-8" />, 
    title: 'إدارة الفواتير', 
    desc: 'مراجعة الفواتير والمدفوعات والعمولات', 
    link: '/admin/invoices',
    color: 'from-purple-400 to-pink-500'
  },
  { 
    icon: <BarChart2 className="w-8 h-8" />, 
    title: 'تقارير النظام', 
    desc: 'عرض تقارير الأداء والإحصائيات بشكل دوري', 
    link: '/admin/reports',
    color: 'from-orange-400 to-red-500'
  },
  { 
    icon: <FolderPlus className="w-8 h-8" />, 
    title: 'إدارة التصنيفات', 
    desc: 'إضافة وتعديل التصنيفات', 
    link: '/admin/categories',
    color: 'from-indigo-400 to-purple-500'
  },
  { 
    icon: <ImageIcon className="w-8 h-8" />, 
    title: 'إدارة البانر الرئيسي', 
    desc: 'تعديل صور ونصوص البانر في الصفحة الرئيسية', 
    link: '/admin/banners',
    color: 'from-teal-400 to-blue-500'
  },
  { 
    icon: <Mail className="w-8 h-8" />, 
    title: 'التواصلات والاستفسارات', 
    desc: 'عرض رسائل نموذج تواصل معنا والرد عليها', 
    link: '/admin/contacts',
    color: 'from-teal-400 to-green-500'
  },
  { 
    icon: <MessageCircle className="w-8 h-8" />, 
    title: 'إدارة المحادثات', 
    desc: 'مراقبة المحادثات بين المستخدمين وأصحاب المواهب', 
    link: '/admin/conversations',
    color: 'from-indigo-400 to-purple-500'
  },
  { 
    icon: <CreditCard className="w-8 h-8" />, 
    title: 'طلبات السحب', 
    desc: 'مراجعة طلبات السحب وتحويل الأرباح للمواهب', 
    link: '/admin/withdrawals',
    color: 'from-pink-400 to-red-500'
  },
  { 
    icon: <Receipt className="w-8 h-8" />, 
    title: 'إدارة الطلبات', 
    desc: 'عرض جميع الطلبات بين المستخدمين وأصحاب المواهب', 
    link: '/admin/orders',
    color: 'from-cyan-400 to-blue-500'
  },
];

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<{name?: string, profileImageData?: string} | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>({});
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    // جلب بيانات المدير من localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setAdmin({ name: u.name, profileImageData: u.profileImageData });
      }
    } catch {}
    
    // جلب المحادثات والإحصائيات
    fetchConversations();
    fetchStats();
  }, []);
  
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/admin/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return 'منذ يوم';
    return date.toLocaleDateString('ar-EG');
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
              لوحة تحكم الإدارة
            </h1>
            <p className="text-blue-200/80 text-lg">إدارة النظام والمستخدمين من مكان واحد</p>
          </div>

          {/* قسم الترحيب والصورة الشخصية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {admin?.profileImageData ? (
                    <img
                      src={`data:image/png;base64,${admin.profileImageData}`}
                      alt={admin.name || 'صورة المدير'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-orange-400/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center text-4xl border-2 border-blue-400/50">
                      <Settings className="w-12 h-12 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    مرحباً {admin?.name || 'مدير'}!
                  </h2>
                  <p className="text-blue-200/80">مرحبا بك في لوحة تحكم الإدارة</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl text-white font-semibold hover:from-blue-500 hover:to-purple-600 transition-all duration-150 shadow-lg"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-xl text-white font-semibold hover:from-pink-500 hover:to-red-600 transition-all duration-150 shadow-lg"
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
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-5 text-center group hover:bg-white/10 transition-all duration-150 shadow-lg">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-150`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-150">
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
                  <div className="text-2xl font-bold text-white mb-1">{statsData.totalUsers || 0}</div>
                  <div className="text-blue-200/80 text-sm">إجمالي المستخدمين</div>
                </div>
                
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.totalTalents || 0}</div>
                  <div className="text-blue-200/80 text-sm">المواهب المعتمدة</div>
                </div>
                
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.totalOrders || 0}</div>
                  <div className="text-blue-200/80 text-sm">إجمالي الطلبات</div>
                </div>
                
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{statsData.completedOrders || 0}</div>
                  <div className="text-blue-200/80 text-sm">الطلبات المكتملة</div>
                </div>
              </div>
            </div>
          )}

          {/* قسم المحادثات */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              المحادثات من المستخدمين
            </h3>
            
            <div className="space-y-4">
              {conversationsLoading ? (
                <div className="text-center text-blue-200 py-8">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  جاري تحميل المحادثات...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-blue-200 py-8">
                  لا توجد محادثات حالياً
                </div>
              ) : (
                conversations.slice(0, 4).map((conversation) => (
                  <div key={conversation.conversationId} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{conversation.user.name}</h4>
                          <p className="text-blue-200/80 text-sm">مستخدم عادي</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-200/80 text-sm mb-1">آخر رسالة</div>
                        <div className="text-white text-sm max-w-xs truncate">
                          {conversation.lastMessage}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-blue-200/80 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(conversation.lastMessageDate)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/admin/conversations" className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-150 text-sm font-medium">
                          عرض المحادثة
                        </Link>
                        <Link href="/admin/conversations" className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-150 text-sm font-medium">
                          الرد
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* زر عرض جميع المحادثات */}
              <div className="text-center pt-4">
                <Link href="/admin/conversations" className="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl hover:from-blue-500 hover:to-purple-600 transition-all duration-150 font-medium shadow-lg inline-block">
                  عرض جميع المحادثات
                </Link>
              </div>
            </div>
          </div>

          {/* الخدمات الإدارية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              الخدمات الإدارية
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section, i) => (
                section.link ? (
                  <a
                    key={i}
                    href={section.link}
                    className="group bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-150 block relative overflow-hidden"
                  >
                    {/* تأثير الخلفية المتحركة */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-150 rounded-xl`}></div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-150 shadow-lg`}>
                        <div className="text-white">
                          {section.icon}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-150">
                        {section.title}
                      </h4>
                      
                      <p className="text-blue-200/80 leading-relaxed">
                        {section.desc}
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
                    className="group bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-150 relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-150 rounded-xl`}></div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-150 shadow-lg`}>
                        <div className="text-white">
                          {section.icon}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-150">
                        {section.title}
                      </h4>
                      
                      <p className="text-blue-200/80 leading-relaxed">
                        {section.desc}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* نصائح إدارية */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              نصائح إدارية
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">⚡</div>
                <h4 className="text-white font-semibold mb-2">تابع الحسابات الجديدة</h4>
                <p className="text-blue-200/80 text-sm">راجع الحسابات الجديدة بانتظام لضمان جودة المنصة</p>
              </div>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">📊</div>
                <h4 className="text-white font-semibold mb-2">راقب الإحصائيات</h4>
                <p className="text-blue-200/80 text-sm">تابع إحصائيات المنصة لاتخاذ قرارات مدروسة</p>
              </div>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-orange-400 mb-2">🔧</div>
                <h4 className="text-white font-semibold mb-2">حل الشكاوى سريعاً</h4>
                <p className="text-blue-200/80 text-sm">الاستجابة السريعة للشكاوى تحافظ على رضا المستخدمين</p>
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