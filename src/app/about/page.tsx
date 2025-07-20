'use client';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">من نحن</h1>
        <p className="text-lg text-blue-100 mb-8">منصة طوق هي منصة سعودية متخصصة في ربط المواهب التمثيلية مع شركات الإنتاج والإعلانات بطريقة احترافية وآمنة. رؤيتنا أن نكون الخيار الأول في السعودية والخليج لإدارة الكاستينج وتطوير المواهب.</p>
      </div>
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-bold mb-2 text-orange-400">رؤيتنا</h3>
          <p className="text-blue-100">تسهيل الوصول للمواهب وتطوير صناعة الترفيه والإنتاج في المنطقة.</p>
        </div>
        <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-bold mb-2 text-orange-400">رسالتنا</h3>
          <p className="text-blue-100">تقديم منصة موحدة وآمنة تربط المواهب بالجهات الإنتاجية وتدعم نموهم المهني.</p>
        </div>
        <div className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-bold mb-2 text-orange-400">قيمنا</h3>
          <p className="text-blue-100">الاحترافية، الأمان، الشفافية، دعم المواهب المحلية، الابتكار.</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-pink-400">فريق العمل</h2>
        <p className="text-blue-100">يضم فريق طوق خبراء في الإنتاج، التقنية، التسويق، وخدمة العملاء، يعملون معاً لتحقيق تجربة استثنائية لكل مستخدم.</p>
      </div>
    </div>
  );
} 