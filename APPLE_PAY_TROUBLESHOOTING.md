# حل مشكلة Apple Pay مع Paymob

## المشكلة
```
خطأ في بوابة الدفع: خطأ في إعدادات Integration
Integration ID غير صحيح أو غير متوافق مع الحساب
Payment key request failed: {"message": "unrelated payment integration"}
```

## السبب
الـ Integration ID المستخدم لـ Apple Pay غير صحيح أو غير متوافق مع حسابك في Paymob.

## الحل المؤقت
تم إزالة Apple Pay مؤقتاً واستخدام بطاقات الائتمان فقط حتى يتم حل المشكلة.

## خطوات الحل النهائي

### 1. التحقق من Integration IDs في Paymob Dashboard

#### أ) تسجيل الدخول إلى Paymob Dashboard
1. اذهب إلى [Paymob Dashboard](https://dashboard.paymob.com)
2. سجل الدخول بحسابك

#### ب) العثور على Integration IDs الصحيحة
1. اذهب إلى **Developers** > **Payment Integrations**
2. ابحث عن التكاملات التالية:
   - `MIGS-online (APPLE PAY) website`
   - `MIGS-online (APPLE PAY) PL`
   - `MIGS-online website`
   - `MIGS-online Payment link`

3. انسخ الـ Integration ID لكل تكامل

#### ج) العثور على iFrame IDs
1. اذهب إلى **Developers** > **iFrames**
2. ابحث عن iFrames المرتبطة بالتكاملات أعلاه
3. انسخ الـ iFrame ID لكل تكامل

### 2. تحديث متغيرات البيئة

#### أ) في ملف `.env.local`:
```env
# API Keys
PAYMOB_API_KEY=your_api_key_here
PAYMOB_SECRET_KEY=your_secret_key_here
PAYMOB_PUBLIC_KEY=your_public_key_here

# Card Payment (يعمل حالياً)
PAYMOB_CARD_PAYMENT_ID=14252
PAYMOB_CARD_PAYMENT_IFRAME_ID=9589

# Apple Pay (يحتاج تحديث)
PAYMOB_APPLE_PAY_ID=14250  # استبدل بالـ ID الصحيح
PAYMOB_APPLE_PAY_IFRAME_ID=9083  # استبدل بالـ ID الصحيح

# Apple Pay Link (يحتاج تحديث)
PAYMOB_APPLE_PAY_LINK_ID=14251  # استبدل بالـ ID الصحيح
PAYMOB_APPLE_PAY_LINK_IFRAME_ID=9084  # استبدل بالـ ID الصحيح
```

### 3. إعادة تفعيل Apple Pay

#### أ) تحديث `src/paymob.config.ts`:
```typescript
INTEGRATIONS: {
  CARD_PAYMENT: {
    ID: parseInt(process.env.PAYMOB_CARD_PAYMENT_ID || '14252'),
    NAME: 'MIGS-online website',
    IFRAME_ID: process.env.PAYMOB_CARD_PAYMENT_IFRAME_ID || '9589'
  },
  APPLE_PAY: {
    ID: parseInt(process.env.PAYMOB_APPLE_PAY_ID || '14250'),
    NAME: 'MIGS-online (APPLE PAY) website',
    IFRAME_ID: process.env.PAYMOB_APPLE_PAY_IFRAME_ID || '9083'
  }
}
```

#### ب) تحديث منطق اختيار طريقة الدفع:
```typescript
let integrationConfig = PAYMOB_CONFIG.INTEGRATIONS.CARD_PAYMENT;
if (paymentMethod === 'APPLE_PAY') {
  integrationConfig = PAYMOB_CONFIG.INTEGRATIONS.APPLE_PAY;
}
```

### 4. اختبار الحل

#### أ) اختبار بطاقات الائتمان:
1. اختر "بطاقة ائتمانية"
2. جرب عملية دفع
3. تأكد من نجاح العملية

#### ب) اختبار Apple Pay:
1. اختر "Apple Pay"
2. جرب عملية دفع
3. تأكد من عدم ظهور خطأ Integration

### 5. استكشاف الأخطاء

#### إذا استمر خطأ Integration:
1. تحقق من صحة Integration IDs
2. تأكد من تفعيل Apple Pay في حسابك
3. تواصل مع دعم Paymob

#### إذا ظهر خطأ iFrame:
1. تحقق من صحة iFrame IDs
2. تأكد من ربط iFrame بـ Integration الصحيح

## ملاحظات مهمة

### ✅ ما يعمل حالياً:
- بطاقات الائتمان (Visa, Mastercard, Mada)
- جميع أنواع البطاقات المدعومة

### ⏳ قيد التطوير:
- Apple Pay (يحتاج Integration ID صحيح)
- طرق دفع إضافية

### 📞 الدعم:
إذا استمرت المشكلة، تواصل مع:
- دعم Paymob: support@paymob.com
- فريق التطوير الداخلي

---

**تذكير:** تأكد من تحديث جميع متغيرات البيئة قبل النشر على الإنتاج.
