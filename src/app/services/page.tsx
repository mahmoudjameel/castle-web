'use client';

import { Search, Users, Calendar, Shield, FileText, Send } from 'lucide-react';

const services = [
  { icon: <Search size={36} />, title: 'بحث ذكي عن المواهب', desc: 'فلترة متقدمة للعثور على المواهب المناسبة لأي مشروع.' },
  { icon: <Users size={36} />, title: 'إدارة ملفات المواهب', desc: 'رفع صور وفيديوهات، تحديث الملف الشخصي، تتبع الطلبات.' },
  { icon: <Calendar size={36} />, title: 'جدولة المقابلات', desc: 'نظام متطور لحجز وتنظيم مواعيد الكاستينج والمقابلات.' },
  { icon: <Shield size={36} />, title: 'دفع وتوقيع إلكتروني', desc: 'عمليات دفع آمنة وتوقيع عقود إلكترونية مع الجهات.' },
  { icon: <FileText size={36} />, title: 'نظام تقارير ومتابعة', desc: 'تقارير دورية، متابعة الأداء، إدارة الشكاوى والفواتير.' },
  { icon: <Send size={36} />, title: 'دعوات وتواصل مباشر', desc: 'إرسال دعوات للمواهب، رسائل داخلية، إشعارات فورية.' },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">خدمات المنصة</h1>
        <p className="text-lg text-blue-100">كل ما تحتاجه لإدارة الكاستينج والموهبة في مكان واحد، باحترافية وأمان.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {services.map((srv, i) => (
          <div key={i} className="flex items-start gap-4 bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30 hover:bg-indigo-800/50 transition-all">
            <div className="text-orange-400">{srv.icon}</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{srv.title}</h3>
              <p className="text-blue-100">{srv.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 