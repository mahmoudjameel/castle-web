# دليل إعداد Apple Pay في Paymob

## المشكلة الحالية
```
خطأ في بوابة الدفع: خطأ في إعدادات Integration
Integration ID غير صحيح أو غير متوافق مع الحساب
```

## السبب
Integration IDs التالية غير مرتبطة بحسابك في Paymob:
- `14250` - MIGS-online (APPLE PAY) website
- `14251` - MIGS-online (APPLE PAY) PL

## الحل المؤقت (مطبق حالياً)
تم تعديل الكود ليستخدم نفس Integration ID للبطاقات والـ Apple Pay:
- **جميع طرق الدفع تستخدم**: `14252` (MIGS-online website)

## الحل النهائي: إعداد Apple Pay في Paymob

### الخطوة 1: تسجيل الدخول إلى Paymob Dashboard
1. اذهب إلى [Paymob Dashboard](https://dashboard.paymob.com)
2. سجل الدخول بحسابك

### الخطوة 2: إنشاء Apple Pay Integration
1. اذهب إلى **Developers** > **Payment Integrations**
2. اضغط على **+ New Integration**
3. اختر **Apple Pay**
4. املأ البيانات المطلوبة:
   - **Integration Name**: `Apple Pay Website`
   - **Website URL**: `http://localhost:3000` (أو رابط موقعك)
   - **Callback URL**: `http://localhost:3000/api/paymob-callback`
   - **Success URL**: `http://localhost:3000/payment-success`
   - **Failure URL**: `http://localhost:3000/payment-failed`

### الخطوة 3: الحصول على Integration ID
1. بعد إنشاء Integration، انسخ الـ **Integration ID**
2. انسخ الـ **iFrame ID** (إذا كان متوفراً)

### الخطوة 4: تحديث متغيرات البيئة
```env
# في ملف .env.local
PAYMOB_APPLE_PAY_ID=YOUR_NEW_APPLE_PAY_ID
PAYMOB_APPLE_PAY_IFRAME_ID=YOUR_NEW_IFRAME_ID
```

### الخطوة 5: إعادة تفعيل Apple Pay في الكود
عدّل ملف `src/app/api/paymob-init/route.ts`:

```typescript
// بدلاً من الحل المؤقت
if (paymentMethod === 'APPLE_PAY') {
  integrationConfig = PAYMOB_CONFIG.INTEGRATIONS.APPLE_PAY;
  console.log('Using Apple Pay integration:', integrationConfig);
} else {
  integrationConfig = PAYMOB_CONFIG.INTEGRATIONS.CARD_PAYMENT;
  console.log('Using Card Payment integration:', integrationConfig);
}
```

## ملاحظات مهمة

### 1. متطلبات Apple Pay
- يجب أن يكون الموقع على HTTPS في الإنتاج
- يجب أن يكون لديك شهادة SSL صالحة
- يجب أن يكون الموقع مسجلاً في Apple Developer Console

### 2. اختبار Apple Pay
- Apple Pay يعمل فقط على أجهزة Apple (iPhone, iPad, Mac)
- يجب أن يكون الجهاز يدعم Apple Pay
- يجب أن يكون المستخدم لديه بطاقة مسجلة في Apple Wallet

### 3. أمان الدفع
- Apple Pay يستخدم نفس مستوى الأمان للبطاقات الائتمانية
- البيانات محمية بتشفير Apple
- لا يتم تخزين بيانات البطاقة في خوادمك

## استكشاف الأخطاء

### خطأ "unrelated payment integration"
- تأكد من أن Integration ID صحيح
- تأكد من أن Integration مرتبط بحسابك
- تأكد من أن Integration نشط

### خطأ "Apple Pay not available"
- تأكد من أن الجهاز يدعم Apple Pay
- تأكد من أن المستخدم لديه بطاقة في Apple Wallet
- تأكد من أن الموقع على HTTPS

### خطأ "Invalid domain"
- تأكد من أن domain مسجل في Apple Developer Console
- تأكد من أن domain مطابق تماماً للـ URL المسجل

## الدعم الفني
إذا استمرت المشاكل:
1. تواصل مع دعم Paymob
2. تأكد من إعدادات Apple Developer Console
3. راجع logs في Paymob Dashboard
