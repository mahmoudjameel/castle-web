# إعداد Apple Pay السريع

## ✅ Integration IDs الصحيحة (تم التحقق)
```
14250 - MIGS-online (APPLE PAY) website ✅ Live
14251 - MIGS-online (APPLE PAY) PL ✅ Live  
14252 - MIGS-online website ✅ Live
14253 - MIGS-online Payment link ✅ Live
```

## 🔧 خطوات التطبيق

### 1. تأكد من ملف `.env.local`
```env
# Paymob API Keys
PAYMOB_API_KEY=your_api_key_here
PAYMOB_SECRET_KEY=your_secret_key_here
PAYMOB_PUBLIC_KEY=your_public_key_here

# Integration IDs (صحيحة ومتحققة)
PAYMOB_APPLE_PAY_ID=14250
PAYMOB_APPLE_PAY_IFRAME_ID=14250
PAYMOB_CARD_PAYMENT_ID=14252
PAYMOB_CARD_PAYMENT_IFRAME_ID=9589
```

### 2. أعد تشغيل الخادم
```bash
npm run dev
```

### 3. اختبر الدفع
- **بطاقة ائتمانية**: يستخدم Integration ID `14252`
- **Apple Pay**: يستخدم Integration ID `14250`

## 🎯 النتيجة المتوقعة

### عند اختيار بطاقة ائتمانية:
- يفتح iframe Paymob العادي
- يدعم Visa, Mastercard, Mada
- يعمل على جميع الأجهزة

### عند اختيار Apple Pay:
- يفتح iframe Paymob مع دعم Apple Pay
- يعمل فقط على أجهزة Apple (iPhone, iPad, Mac)
- يتطلب Apple Wallet مسجل

## 🔍 استكشاف الأخطاء

### إذا ظهر خطأ "unrelated payment integration":
1. تأكد من أن Integration ID `14250` صحيح في `.env.local`
2. تأكد من أن API Key صحيح
3. أعد تشغيل الخادم

### إذا لم يظهر خيار Apple Pay:
1. تأكد من أنك تستخدم جهاز Apple
2. تأكد من أن Apple Pay مفعل في الجهاز
3. تأكد من أن لديك بطاقة في Apple Wallet

## 📱 متطلبات Apple Pay

### للمستخدم:
- جهاز Apple (iPhone, iPad, Mac)
- Apple Pay مفعل
- بطاقة مسجلة في Apple Wallet

### للموقع:
- HTTPS في الإنتاج (ليس مطلوب في localhost)
- Integration ID صحيح
- API Key صحيح

## ✅ تم الإعداد بنجاح!

Apple Pay جاهز للاستخدام مع Integration ID: `14250`
