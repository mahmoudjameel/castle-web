# دليل استكشاف أخطاء PWA - منصة طوق

## المشاكل المحتملة وحلولها

### 1. مشكلة: زر "تثبيت التطبيق" لا يظهر

**الأسباب المحتملة:**
- التطبيق مثبت بالفعل
- المتصفح لا يدعم PWA
- Service Worker لم يسجل بشكل صحيح

**الحلول:**
1. **تحقق من Console:**
   - افتح Developer Tools (F12)
   - انتقل إلى Console
   - ابحث عن رسائل "SW registered successfully" أو أخطاء

2. **تحقق من Service Worker:**
   - انتقل إلى Application > Service Workers
   - تأكد من أن `/sw.js` مسجل ويعمل

3. **تحقق من Manifest:**
   - انتقل إلى Application > Manifest
   - تأكد من أن `/manifest.json` محمل بشكل صحيح

### 2. مشكلة: التطبيق لا يثبت عند الضغط على الزر

**الأسباب المحتملة:**
- حدث `beforeinstallprompt` لم يحدث
- Service Worker غير مسجل
- مشكلة في Manifest

**الحلول:**
1. **إعادة تحميل الصفحة:**
   - أعد تحميل الصفحة بالكامل
   - انتظر حتى يسجل Service Worker

2. **تحقق من المتصفح:**
   - تأكد من استخدام Chrome/Edge على Android
   - تأكد من استخدام Safari على iOS

3. **مسح الكاش:**
   - امسح كاش المتصفح
   - امسح بيانات الموقع

### 3. مشكلة: التطبيق مثبت لكن لا يعمل كتطبيق منفصل

**الأسباب المحتملة:**
- Manifest غير صحيح
- Service Worker لا يعمل
- مشكلة في الأيقونات

**الحلول:**
1. **تحقق من Manifest:**
   ```json
   {
     "display": "standalone",
     "start_url": "/",
     "scope": "/"
   }
   ```

2. **تحقق من الأيقونات:**
   - تأكد من وجود `/logo.png`
   - تأكد من أحجام الأيقونات (192x192, 512x512)

3. **إعادة تسجيل Service Worker:**
   - امسح بيانات الموقع
   - أعد تحميل الصفحة

### 4. مشكلة: الإشعارات لا تعمل

**الأسباب المحتملة:**
- إذن الإشعارات مرفوض
- Service Worker لا يعمل
- مشكلة في VAPID keys

**الحلول:**
1. **تحقق من الأذونات:**
   - انتقل إلى Site Settings > Notifications
   - تأكد من أن الإشعارات مفعلة

2. **إعادة طلب الإذن:**
   - ارفض الإشعارات
   - أعد طلب الإذن

3. **تحقق من VAPID keys:**
   - تأكد من وجود `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - تأكد من وجود `VAPID_PRIVATE_KEY`

## خطوات التشخيص

### الخطوة 1: فحص Console
```javascript
// في Console، اكتب:
navigator.serviceWorker.getRegistrations().then(console.log)
```

### الخطوة 2: فحص Service Worker
```javascript
// في Console، اكتب:
navigator.serviceWorker.ready.then(console.log)
```

### الخطوة 3: فحص Manifest
```javascript
// في Console، اكتب:
navigator.getInstalledRelatedApps()
```

### الخطوة 4: فحص PWA
```javascript
// في Console، اكتب:
window.matchMedia('(display-mode: standalone)').matches
```

## متطلبات PWA

### المتصفحات المدعومة:
- **Android:** Chrome 67+, Edge 79+
- **iOS:** Safari 11.1+ (محدود)
- **Desktop:** Chrome 67+, Edge 79+

### المتطلبات التقنية:
- HTTPS مطلوب
- Manifest صحيح
- Service Worker مسجل
- أيقونات مناسبة

## إعدادات التطوير

### 1. تشغيل على HTTPS محلي:
```bash
# إنشاء شهادة SSL محلية
mkcert localhost 127.0.0.1 ::1

# تشغيل Next.js مع HTTPS
HTTPS=true SSL_CRT_FILE=localhost+2.pem SSL_KEY_FILE=localhost+2-key.pem npm run dev
```

### 2. اختبار PWA:
- استخدم Chrome DevTools > Application
- اختبر على جهاز موبايل حقيقي
- استخدم Lighthouse لفحص PWA

### 3. تحديث Service Worker:
```javascript
// في PWAManager.tsx
if (swRegistration && swRegistration.waiting) {
  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
}
```

## روابط مفيدة

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Debugging](https://web.dev/debug-service-workers/)

## دعم iOS

### ملاحظات مهمة:
- iOS لا يدعم `beforeinstallprompt`
- يجب إضافة التطبيق يدوياً من Safari
- استخدم `apple-touch-icon` في `<head>`

### إضافة دعم iOS:
```html
<!-- في layout.tsx -->
<link rel="apple-touch-icon" href="/logo.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="طوق" />
```
