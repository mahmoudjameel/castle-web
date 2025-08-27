# دليل إعداد PWA (Progressive Web App) لمنصة طوق

## ما هو PWA؟
PWA هو تطبيق ويب يمكن تثبيته على الأجهزة المحمولة ويعمل مثل التطبيق الأصلي مع إشعارات push فورية.

## الميزات المضافة:
✅ **تثبيت التطبيق**: يمكن للمستخدمين تثبيت التطبيق على الشاشة الرئيسية
✅ **إشعارات Push**: إشعارات فورية حتى عندما يكون التطبيق مغلقاً
✅ **عمل بدون إنترنت**: تخزين مؤقت للملفات الأساسية
✅ **تجربة تطبيق**: واجهة تشبه التطبيق الأصلي

## خطوات الإعداد:

### 1. إعداد VAPID Keys:
```bash
# توليد VAPID keys
node scripts/generate-vapid-keys.js

# إضافة المفاتيح إلى .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 2. تحديث قاعدة البيانات:
```bash
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

### 3. تشغيل التطبيق:
```bash
npm run dev
```

## كيفية الاستخدام:

### للمستخدمين:
1. **تثبيت التطبيق**: ستظهر رسالة "تثبيت التطبيق" في المتصفح
2. **تفعيل الإشعارات**: السماح بالإشعارات عند الطلب
3. **استقبال الإشعارات**: إشعارات فورية للطلبات الجديدة والتحديثات

### للمطورين:
1. **إرسال إشعار**: استخدم API `/api/send-push-notification`
2. **إدارة Subscriptions**: API `/api/push-subscription`
3. **تخصيص الإشعارات**: إضافة actions وأيقونات مخصصة

## مثال على إرسال إشعار:
```javascript
const response = await fetch('/api/send-push-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'طلب جديد',
    body: 'تم استلام طلب جديد من العميل',
    userId: 123, // إرسال لمستخدم محدد
    icon: '/logo.png',
    data: { orderId: 456 }
  })
});
```

## الملفات المضافة:
- `public/manifest.json` - إعدادات PWA
- `public/sw.js` - Service Worker
- `src/components/PWAManager.tsx` - إدارة PWA
- `src/app/api/push-subscription/route.ts` - إدارة subscriptions
- `src/app/api/send-push-notification/route.ts` - إرسال الإشعارات

## ملاحظات مهمة:
- تأكد من أن الموقع يعمل على HTTPS (مطلوب للإشعارات)
- احتفظ بـ VAPID private key آمناً
- اختبر الإشعارات على أجهزة حقيقية
- راقب أداء Service Worker

## دعم المتصفحات:
- ✅ Chrome (Android/Desktop)
- ✅ Firefox (Android/Desktop)
- ✅ Safari (iOS 16.4+)
- ✅ Edge (Windows/Desktop)

## استكشاف الأخطاء:
- إذا لم تظهر رسالة التثبيت، تأكد من تلبية شروط PWA
- إذا لم تعمل الإشعارات، تحقق من VAPID keys
- إذا لم يتم تسجيل Service Worker، تحقق من console errors
