# 📧 دليل إعداد إرسال البريد الإلكتروني

## 🚀 إعداد Gmail (الأسهل)

### 1. تفعيل المصادقة الثنائية
1. اذهب إلى [Google Account](https://myaccount.google.com/)
2. انتقل إلى "Security"
3. فعّل "2-Step Verification"

### 2. إنشاء كلمة مرور للتطبيق
1. اذهب إلى "Security"
2. ابحث عن "App passwords"
3. انقر على "App passwords"
4. اختر "Mail" و "Other (Custom name)"
5. اكتب اسم مثل "Talent Platform"
6. انسخ كلمة المرور المولدة

### 3. إضافة متغيرات البيئة
أضف التالي إلى ملف `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔧 إعدادات أخرى

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## 🧪 اختبار النظام

1. أضف متغيرات البيئة
2. أعد تشغيل التطبيق: `npm run dev`
3. اذهب إلى: http://localhost:3001/forgot-password
4. أدخل بريد إلكتروني حقيقي
5. تحقق من صندوق البريد

## 📋 ملاحظات مهمة

- تأكد من أن البريد الإلكتروني صحيح
- تحقق من مجلد Spam إذا لم تجد البريد
- في الإنتاج، استخدم `NEXT_PUBLIC_APP_URL` صحيح
- تأكد من أن كلمة مرور التطبيق صحيحة

## 🆘 حل المشاكل

### خطأ "Authentication failed"
- تأكد من تفعيل المصادقة الثنائية
- تأكد من كلمة مرور التطبيق

### خطأ "Connection timeout"
- تحقق من إعدادات Firewall
- تأكد من صحة SMTP_HOST و SMTP_PORT

### البريد لا يصل
- تحقق من مجلد Spam
- تأكد من صحة عنوان البريد الإلكتروني 