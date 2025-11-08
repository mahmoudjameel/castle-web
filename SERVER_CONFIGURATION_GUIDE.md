# 🔧 دليل إعداد السيرفر لرفع الفيديوهات الكبيرة

## ⚠️ المشكلة الحالية

الخطأ:
```
POST https://toqtalent.com/api/portfolio 413 (Request Entity Too Large)
SyntaxError: Unexpected token '<', "<html>..." is not valid JSON
```

**السبب**: السيرفر (Nginx أو Apache) يرفض الطلب قبل أن يصل إلى Next.js

---

## 🎯 الحل حسب نوع السيرفر

### أولاً: اكتشف نوع السيرفر

```bash
# طريقة 1: فحص العمليات
ps aux | grep nginx
ps aux | grep apache

# طريقة 2: فحص المنفذ 80
sudo netstat -tlnp | grep :80

# طريقة 3: curl headers
curl -I https://toqtalent.com
```

---

## 🟢 إذا كان السيرفر: Nginx

### الخطوة 1: تحديد ملف الإعدادات

```bash
# ابحث عن ملف nginx.conf
sudo nginx -t

# عادةً يكون في:
# /etc/nginx/nginx.conf
# /etc/nginx/sites-available/toqtalent.com
# /etc/nginx/conf.d/toqtalent.com.conf
```

### الخطوة 2: تعديل الإعدادات

افتح ملف الإعدادات:
```bash
sudo nano /etc/nginx/sites-available/toqtalent.com
# أو
sudo nano /etc/nginx/nginx.conf
```

أضف هذه الإعدادات:

#### داخل `http { }`
```nginx
http {
    # السماح برفع ملفات حتى 500MB
    client_max_body_size 500M;
    client_body_timeout 600s;
    client_header_timeout 600s;
    
    # ... باقي الإعدادات
}
```

#### داخل `server { }` الخاص بموقعك
```nginx
server {
    server_name toqtalent.com www.toqtalent.com;
    
    # السماح برفع ملفات كبيرة
    client_max_body_size 500M;
    client_body_timeout 600s;
    
    # Proxy لـ Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # زيادة timeout
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
    
    # إعدادات خاصة لـ API
    location /api/portfolio {
        client_max_body_size 1000M;  # 1GB للفيديوهات
        client_body_timeout 900s;     # 15 دقيقة
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        proxy_connect_timeout 900s;
        proxy_send_timeout 900s;
        proxy_read_timeout 900s;
    }
}
```

### الخطوة 3: اختبار وإعادة تحميل

```bash
# اختبر صحة الإعدادات
sudo nginx -t

# إذا كان كل شيء OK، أعد تحميل Nginx
sudo systemctl reload nginx

# أو
sudo service nginx reload
```

---

## 🔵 إذا كان السيرفر: Apache

### الخطوة 1: تحديد ملف الإعدادات

```bash
# ابحث عن ملف httpd.conf أو apache2.conf
apache2 -V | grep SERVER_CONFIG_FILE

# عادةً يكون في:
# /etc/apache2/apache2.conf
# /etc/httpd/conf/httpd.conf
# /etc/apache2/sites-available/toqtalent.com.conf
```

### الخطوة 2: تعديل الإعدادات الرئيسية

افتح ملف الإعدادات:
```bash
sudo nano /etc/apache2/apache2.conf
# أو
sudo nano /etc/apache2/sites-available/toqtalent.com.conf
```

أضف:
```apache
<VirtualHost *:80>
    ServerName toqtalent.com
    DocumentRoot /path/to/your/app
    
    # السماح برفع ملفات كبيرة
    LimitRequestBody 524288000  # 500MB بالبايت
    
    # زيادة timeout
    Timeout 600
    
    # إعدادات ProxyPass لـ Next.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    ProxyTimeout 600
</VirtualHost>
```

### الخطوة 3: تعديل إعدادات PHP (إذا كانت موجودة)

افتح php.ini:
```bash
# ابحث عن الملف
php --ini

# عادةً في:
sudo nano /etc/php/8.1/apache2/php.ini
# أو
sudo nano /etc/php.ini
```

عدّل هذه القيم:
```ini
upload_max_filesize = 500M
post_max_size = 500M
memory_limit = 512M
max_execution_time = 600
max_input_time = 600
```

### الخطوة 4: التأكد من .htaccess

الملف `.htaccess` موجود بالفعل في المشروع، لكن تأكد من:

1. أن `AllowOverride` مفعل في Apache:
```apache
<Directory /path/to/your/app>
    AllowOverride All
</Directory>
```

2. أن الملف `.htaccess` في المجلد الصحيح

### الخطوة 5: إعادة تشغيل Apache

```bash
# اختبر الإعدادات
sudo apachectl configtest

# إذا كان OK، أعد تشغيل Apache
sudo systemctl restart apache2

# أو
sudo service apache2 restart
```

---

## 🟡 إذا كان لديك Panel (cPanel, Plesk, etc.)

### cPanel:
1. اذهب إلى **MultiPHP INI Editor**
2. اختر الدومين
3. عدّل:
   - `upload_max_filesize = 500M`
   - `post_max_size = 500M`
   - `max_execution_time = 600`
4. احفظ

### Plesk:
1. اذهب إلى **PHP Settings**
2. عدّل نفس القيم أعلاه
3. احفظ

### DirectAdmin:
1. اذهب إلى **Custom HTTPD Configuration**
2. أضف إعدادات Apache
3. احفظ وأعد البناء

---

## 🟣 إذا كنت على Vercel/Netlify

### Vercel:
المشكلة: Vercel لديها حدود صارمة:
- **Hobby**: 4.5MB maximum
- **Pro**: ~100MB مع FormData (الكود الجديد يدعم هذا)
- **Enterprise**: حدود أعلى

**الحل**:
1. ترقية إلى Pro أو Enterprise
2. أو استخدام خدمة تخزين خارجية (S3, Cloudinary)

```bash
# تأكد من أن vercel.json محدث (تم تحديثه بالفعل)
cat vercel.json
```

### Netlify:
نفس المشكلة، الحد الأقصى ~10MB

**الحل**: استخدام Netlify Functions + S3

---

## 🧪 اختبار الإعدادات

### اختبار 1: curl
```bash
# اختبر حد الرفع
curl -X POST \
  -F "file=@large_video.mp4" \
  -F "userId=1" \
  -F "type=video" \
  https://toqtalent.com/api/portfolio
```

### اختبار 2: من المتصفح
1. افتح https://toqtalent.com
2. سجل دخول كموهبة
3. اذهب إلى Portfolio
4. ارفع فيديو كبير (30-50MB)
5. راقب Console (F12)

**يجب أن ترى**:
```
📤 بدء رفع الفيديو إلى الخادم باستخدام FormData...
✅ تم رفع الفيديو بنجاح
```

**بدلاً من**:
```
❌ 413 Request Entity Too Large
```

---

## 📊 جدول استكشاف الأخطاء

| الخطأ | السبب | الحل |
|------|-------|------|
| 413 + `<html>` | السيرفر يرفض قبل Next.js | عدّل `client_max_body_size` (Nginx) أو `LimitRequestBody` (Apache) |
| 504 Timeout | الرفع يأخذ وقت طويل | زيادة `timeout` في إعدادات السيرفر |
| 500 Server Error | خطأ في Next.js | تحقق من logs: `pm2 logs` أو `journalctl -u your-app` |
| لا يوجد استجابة | السيرفر متوقف | `sudo systemctl status nginx` أو `apache2` |

---

## 🔍 فحص Logs

### Nginx:
```bash
# Error log
sudo tail -f /var/log/nginx/error.log

# Access log
sudo tail -f /var/log/nginx/access.log
```

### Apache:
```bash
# Error log
sudo tail -f /var/log/apache2/error.log

# Access log
sudo tail -f /var/log/apache2/access.log
```

### Next.js (PM2):
```bash
pm2 logs
```

---

## ✅ Checklist

- [ ] تحديد نوع السيرفر (Nginx/Apache/Vercel)
- [ ] تعديل إعدادات السيرفر
- [ ] إعادة تحميل/تشغيل السيرفر
- [ ] اختبار رفع فيديو صغير (10MB)
- [ ] اختبار رفع فيديو متوسط (30MB)
- [ ] اختبار رفع فيديو كبير (50MB+)
- [ ] التحقق من Logs
- [ ] توثيق الإعدادات

---

## 💡 نصائح إضافية

### 1. استخدم CDN/S3 للملفات الكبيرة جداً
```bash
npm install @aws-sdk/client-s3
# أو
npm install cloudinary
```

### 2. راقب استهلاك الموارد
```bash
# CPU & Memory
htop

# Disk space
df -h

# Network
iftop
```

### 3. Backup قبل التعديل
```bash
# Nginx
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Apache
sudo cp /etc/apache2/apache2.conf /etc/apache2/apache2.conf.backup
```

---

## 📞 إذا استمرت المشكلة

1. **أرسل معلومات السيرفر**:
```bash
# نوع السيرفر
nginx -v
# أو
apache2 -v

# نظام التشغيل
uname -a
cat /etc/os-release
```

2. **أرسل Error Logs**:
```bash
sudo tail -100 /var/log/nginx/error.log
# أو
sudo tail -100 /var/log/apache2/error.log
```

3. **تواصل مع مزود الاستضافة** إذا كان لديك قيود على التعديل

---

**آخر تحديث**: نوفمبر 2024
**الحالة**: جاهز للتطبيق
