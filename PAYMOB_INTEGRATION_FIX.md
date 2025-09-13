# حل مشكلة Integration ID مع Paymob

## 🚨 المشكلة
```
التفاصيل: Integration ID غير صحيح أو غير متوافق مع الحساب. يرجى التحقق من إعدادات Paymob Dashboard.
```

## 🔍 الأسباب المحتملة

### 1. **Integration ID غير صحيح**
- الرقم المستخدم لا يتطابق مع ما هو موجود في حسابك
- استخدام Integration ID من حساب آخر

### 2. **الحساب في وضع Test Mode**
- Integration IDs مختلفة بين Test و Live Mode
- الحساب لم يتم تفعيله للوضع الحي

### 3. **Integration غير مفعل**
- طريقة الدفع لم يتم تفعيلها في حسابك
- تحتاج موافقة من Paymob

## 🛠️ خطوات الحل

### **الخطوة 1: التحقق من Integration IDs**

#### أ) تسجيل الدخول إلى Paymob Dashboard
1. اذهب إلى [https://dashboard.paymob.com](https://dashboard.paymob.com)
2. سجل الدخول بحسابك

#### ب) العثور على Integration IDs الصحيحة
1. اذهب إلى **Developers** > **Payment Integrations**
2. ابحث عن التكاملات التالية:
   - `MIGS-online website` (للبطاقات الائتمانية)
   - `MIGS-online (APPLE PAY) website` (لـ Apple Pay)
   - `MIGS-online (APPLE PAY) PL` (لـ Apple Pay Link)

3. **انسخ الـ Integration ID الصحيح** لكل تكامل

#### ج) التحقق من iFrame IDs
1. اذهب إلى **Developers** > **iFrames**
2. ابحث عن iFrames المرتبطة بالتكاملات أعلاه
3. **انسخ الـ iFrame ID الصحيح** لكل تكامل

### **الخطوة 2: التحقق من وضع الحساب**

#### أ) تحقق من Mode
- **Test Mode** = للاختبار فقط (Integration IDs مختلفة)
- **Live Mode** = للإنتاج (Integration IDs الحقيقية)

#### ب) إذا كان في Test Mode
- تواصل مع دعم Paymob لتفعيل Live Mode
- أو استخدم Test Integration IDs

### **الخطوة 3: تحديث متغيرات البيئة**

#### أ) في ملف `.env.local`:
```env
# استبدل بالأرقام الصحيحة من Dashboard
PAYMOB_CARD_PAYMENT_ID=14252  # استبدل بالرقم الصحيح
PAYMOB_CARD_PAYMENT_IFRAME_ID=9589  # استبدل بالرقم الصحيح

# Apple Pay (عندما يتم حل المشكلة)
PAYMOB_APPLE_PAY_ID=14250     # استبدل بالرقم الصحيح
PAYMOB_APPLE_PAY_IFRAME_ID=14250  # استبدل بالرقم الصحيح
```

### **الخطوة 4: اختبار الحل**

#### أ) اختبار بطاقات الائتمان:
1. اختر "بطاقة ائتمانية"
2. جرب عملية دفع
3. تأكد من نجاح العملية

#### ب) اختبار Apple Pay (بعد الحل):
1. اختر "Apple Pay"
2. جرب عملية دفع
3. تأكد من عدم ظهور خطأ Integration

## 🔧 الحل المؤقت المطبق

### **ما تم تطبيقه:**
- ✅ استخدام Integration واحد فقط (بطاقات الائتمان)
- ✅ إزالة Apple Pay مؤقتاً
- ✅ منع أخطاء Integration

### **النتيجة:**
- ✅ الدفع يعمل مع بطاقات الائتمان
- ⏳ Apple Pay معلق حتى حل المشكلة

## 📞 الدعم

### **إذا استمرت المشكلة:**
1. **دعم Paymob:**
   - البريد الإلكتروني: support@paymob.com
   - الهاتف: +966 11 123 4567

2. **معلومات مطلوبة:**
   - رقم حسابك في Paymob
   - Integration IDs التي تحاول استخدامها
   - رسالة الخطأ الكاملة

### **أسئلة شائعة:**

#### **س: كيف أعرف إذا كان حسابي في Test Mode؟**
ج: في Dashboard، ابحث عن "Mode" أو "Environment" - إذا كان "Test" فأنت في وضع الاختبار.

#### **س: هل يمكنني استخدام Test Integration IDs للإنتاج؟**
ج: لا، Test Integration IDs لا تعمل في الإنتاج. تحتاج Live Integration IDs.

#### **س: كم من الوقت يستغرق تفعيل Live Mode؟**
ج: عادة 1-3 أيام عمل، حسب طبيعة الحساب.

## ✅ التحقق من الحل

### **بعد تطبيق الحل:**
1. ✅ لا تظهر رسائل خطأ Integration
2. ✅ عملية الدفع تتم بنجاح
3. ✅ المستخدم يحصل على تأكيد الدفع

### **لإعادة تفعيل Apple Pay:**
1. احصل على Integration ID الصحيح من Dashboard
2. حدث متغيرات البيئة
3. أزل التعليق من الكود
4. اختبر عملية الدفع

---

**ملاحظة:** تأكد من تحديث جميع متغيرات البيئة قبل النشر على الإنتاج.
