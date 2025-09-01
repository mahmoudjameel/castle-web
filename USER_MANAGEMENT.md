# إدارة المستخدمين - User Management

## 📋 نظرة عامة
هذا الدليل يوضح كيفية إضافة مستخدمين جدد إلى قاعدة البيانات باستخدام Terminal.

## 🛠️ الـ Scripts المتاحة

### 1. إضافة مستخدم Admin
**الملف:** `add-admin.js`

#### الاستخدام:
```bash
# استخدام البيانات الافتراضية
node add-admin.js

# استخدام بيانات مخصصة
node add-admin.js "اسم المستخدم" "admin@admin.com" "رقم الهاتف" "كلمة المرور"
```

#### مثال:
```bash
node add-admin.js "مدير النظام" "admin4@admin.com" "1111111111" "123456"
```

### 2. إضافة مستخدم عادي أو موهبة
**الملف:** `add-user.js`

#### الاستخدام:
```bash
node add-user.js "اسم المستخدم" "admin@admin.com" "رقم الهاتف" "كلمة المرور" "نوع الحساب"
```

#### أنواع الحسابات المتاحة:
- `admin`: مدير النظام
- `user`: مستخدم عادي
- `talent`: موهبة

#### أمثلة:
```bash
# إضافة مستخدم عادي
node add-user.js "أحمد محمد" "ahmed@email.com" "1234567890" "123456" "user"

# إضافة موهبة
node add-user.js "سارة أحمد" "sara@email.com" "9876543210" "123456" "talent"

# إضافة مدير
node add-user.js "مدير جديد" "admin5@admin.com" "5555555555" "123456" "admin"
```

## 🔐 قواعد الحسابات

### المستخدمين العاديين (user):
- ✅ مفعلين تلقائياً
- ✅ يمكنهم تسجيل الدخول فوراً
- ✅ لديهم صلاحيات محدودة

### المواهب (talent):
- ❌ غير مفعلين تلقائياً
- ⏳ يحتاجون موافقة الإدارة
- ✅ لديهم صلاحيات خاصة بالمواهب

### المديرين (admin):
- ✅ مفعلين تلقائياً
- ✅ لديهم جميع الصلاحيات
- ✅ يمكنهم الوصول للوحة الإدارة

## 📊 المستخدمين الموجودين حالياً

### المديرين:
- `admin@admin` - Admin (ID: 1) | 🔑 123456 | 👑 admin
- `a@a.com` - Admin User (ID: 11) | 🔑 123456 | 👑 admin
- `admin4@admin.com` - مدير النظام (ID: 13) | 🔑 123456 | 👑 admin
- `admin5@admin.com` - مدير جديد (ID: 15) | 🔑 123456 | 👑 admin

### المستخدمين العاديين:
- `test@example.com` - Test User (ID: 3) | 🔑 123456
- `hhhhh@hh.com` - hhhhh@hh.com (ID: 4) | 🔑 hhhhh@hh.com
- `u@u.com` - u@u.com (ID: 8) | 🔑 u@u.com
- `yyyyyy@yyy.com` - محمود جميل (ID: 10) | 🔑 05922332323
- `dsdsd@hhh.com` - يسييسي (ID: 12) | 🔑 dsdsd@hhh.com

### المواهب:
- `t@t.com` - dsdsdsdsddssdsd (ID: 2) | 🔑 t@t.com
- `uu@uu.com` - abedeslallam (ID: 5) | 🔑 uu@uu.com
- `ddd@dddd` - ddd (ID: 6) | 🔑 ddd@dddd
- `tt@tttd` - يييي (ID: 7) | 🔑 tt@tttd | ❌ غير مفعل
- `hhh@hhh.com` - http://localhost:3000/admin (ID: 9) | 🔑 hhh@hhh.com | ❌ غير مفعل
- `sara@email.com` - سارة أحمد (ID: 14) | 🔑 123456 | ❌ غير مفعل

## 🔍 التحقق من المستخدمين

### عرض جميع المستخدمين:
```bash
psql postgres://toqtalent:g3XiLkVylv6ATaG@localhost:5432/toqtalent -c "SELECT id, name, email, phone, role, approved FROM \"User\";"
```

### البحث عن مستخدم محدد:
```bash
psql postgres://toqtalent:g3XiLkVylv6ATaG@localhost:5432/toqtalent -c "SELECT id, name, email, phone, role, approved FROM \"User\" WHERE email = 'admin@admin.com';"
```

## 🚀 تسجيل الدخول

### للمديرين:
```
http://localhost:3001/admin/login
```

### للمستخدمين العاديين والمواهب:
```
http://localhost:3001/login
```

## 💡 بيانات تسجيل الدخول للتجربة

### المديرين:
- **admin@admin** | **123456**
- **a@a.com** | **123456**
- **admin4@admin.com** | **123456**
- **admin5@admin.com** | **123456**

### المستخدمين العاديين:
- **test@example.com** | **123456**
- **u@u.com** | **u@u.com**
- **yyyyyy@yyy.com** | **05922332323**

### المواهب (المفعلة):
- **t@t.com** | **t@t.com**
- **uu@uu.com** | **uu@uu.com**
- **ddd@dddd** | **ddd@dddd**

## ⚠️ ملاحظات مهمة

1. **كلمات المرور:** لا يتم تشفيرها حالياً في النظام
2. **رقم الهاتف:** مطلوب وفريد لكل مستخدم
3. **البريد الإلكتروني:** فريد لكل مستخدم
4. **الموافقة:** المواهب تحتاج موافقة الإدارة للدخول
5. **Cookies:** النظام يستخدم localStorage للمصادقة
6. **الأدوار:** جميع المديرين لديهم دور 'admin' (أحرف صغيرة)

## 🔧 إصلاحات حديثة

### مشكلة الـ Placeholder:
- ✅ إزالة الـ placeholder المزدوج
- ✅ تحسين تنسيق النص
- ✅ إصلاح مشاكل Chrome/Safari

## 🛡️ الأمان

- تأكد من استخدام كلمات مرور قوية
- لا تشارك بيانات تسجيل الدخول
- احذف الـ scripts بعد الاستخدام في البيئة الإنتاجية

## 📞 الدعم

إذا واجهت أي مشاكل، تأكد من:
1. تشغيل قاعدة البيانات PostgreSQL
2. وجود اتصال صحيح بقاعدة البيانات
3. صحة البيانات المدخلة
4. تشغيل التطبيق على المنفذ الصحيح (3001)
5. استخدام رابط تسجيل الدخول الصحيح (admin/login للمديرين)
