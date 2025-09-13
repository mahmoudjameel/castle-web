# دليل تكامل الدفع مع Paymob

## نظرة عامة
تم تحديث نظام الدفع لدعم طريقتين رئيسيتين للدفع:
- **Apple Pay** - للدفع عبر أجهزة Apple
- **Visa Card** - للدفع بالبطاقات الائتمانية

## إعدادات Paymob

### Integration IDs المحدثة
```typescript
INTEGRATIONS: {
  CARD_PAYMENT: {
    ID: 14252, // MIGS-online website
    NAME: 'MIGS-online website',
    IFRAME_ID: '9589'
  },
  APPLE_PAY: {
    ID: 14250, // MIGS-online (APPLE PAY) website
    NAME: 'MIGS-online (APPLE PAY) website',
    IFRAME_ID: '14250'
  },
  APPLE_PAY_LINK: {
    ID: 14251, // MIGS-online (APPLE PAY) PL
    NAME: 'MIGS-online (APPLE PAY) PL',
    IFRAME_ID: '14251'
  }
}
```

## متغيرات البيئة المطلوبة

### في ملف `.env.local`:
```env
# Paymob API Keys
PAYMOB_API_KEY=your_api_key_here
PAYMOB_SECRET_KEY=your_secret_key_here
PAYMOB_PUBLIC_KEY=your_public_key_here

# Card Payment Integration
PAYMOB_CARD_PAYMENT_ID=14252
PAYMOB_CARD_PAYMENT_IFRAME_ID=9589

# Apple Pay Integration - Website
PAYMOB_APPLE_PAY_ID=14250
PAYMOB_APPLE_PAY_IFRAME_ID=14250

# Apple Pay Integration - Payment Link
PAYMOB_APPLE_PAY_LINK_ID=14251
PAYMOB_APPLE_PAY_LINK_IFRAME_ID=14251
```

## كيفية العمل

### 1. اختيار طريقة الدفع
المستخدم يختار طريقة الدفع من النافذة:
- **بطاقة Visa** 💳 - للدفع بالبطاقات الائتمانية
- **Apple Pay** 🍎 - للدفع عبر أجهزة Apple

### 2. معالجة الدفع
```typescript
// في handleConfirmAndPay
const res = await fetch('/api/paymob-init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: totalWithTax,
    user: { /* بيانات المستخدم */ },
    paymentMethod: selectedPaymentMethod, // 'VISA_CARD' أو 'APPLE_PAY'
    metadata: { /* بيانات إضافية */ }
  })
});
```

### 3. إنشاء رابط الدفع
النظام يختار Integration المناسب بناءً على طريقة الدفع:
- `VISA_CARD` → Integration ID: 14252
- `APPLE_PAY` → Integration ID: 14250

## الميزات

### ✅ دعم Apple Pay
- تكامل كامل مع Apple Pay
- دعم أجهزة iPhone و iPad
- تجربة دفع سلسة

### ✅ دعم Visa Card
- دعم جميع البطاقات الائتمانية
- حماية متقدمة للبيانات
- معالجة آمنة للمعاملات

### ✅ واجهة مستخدم محسنة
- اختيار بصري لطريقة الدفع
- تصميم متجاوب
- رسائل خطأ واضحة

## استكشاف الأخطاء

### خطأ في Integration ID
```
خطأ في إعدادات Integration
Integration ID غير صحيح أو غير متوافق مع الحساب
```
**الحل:** تحقق من صحة Integration IDs في Paymob Dashboard

### خطأ في API Key
```
خطأ في بيانات الاعتماد
API Key غير صحيح أو منتهي الصلاحية
```
**الحل:** تحقق من صحة API Key في متغيرات البيئة

### خطأ في الدفع
```
فشل في إنشاء مفتاح الدفع
```
**الحل:** تحقق من إعدادات Paymob واتصال الإنترنت

## الاختبار

### 1. اختبار Apple Pay
- استخدم جهاز Apple (iPhone/iPad)
- تأكد من تفعيل Apple Pay
- اختبر عملية الدفع الكاملة

### 2. اختبار Visa Card
- استخدم بطاقة ائتمانية صالحة
- تأكد من صحة بيانات البطاقة
- اختبر عملية الدفع الكاملة

## الدعم

للمساعدة في إعداد الدفع:
1. تحقق من إعدادات Paymob Dashboard
2. تأكد من صحة متغيرات البيئة
3. اختبر كل طريقة دفع على حدة
4. راجع سجلات الأخطاء في Console

---

**ملاحظة:** تأكد من تحديث جميع متغيرات البيئة قبل النشر على الإنتاج.
