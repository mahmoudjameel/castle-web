# نظام الـ Logging المتكامل

## 🎯 الميزات

### 1. **أنواع الـ Logs**:
- **ERROR**: الأخطاء والاستثناءات
- **WARN**: التحذيرات
- **INFO**: المعلومات العامة
- **DEBUG**: معلومات التطوير

### 2. **خيارات التخزين**:
- **Console**: طباعة في terminal
- **File**: حفظ في ملفات مع تدوير تلقائي
- **كليهما معاً**

### 3. **إدارة الملفات**:
- **تدوير تلقائي**: عند تجاوز 5MB
- **عدد محدود**: 10 ملفات كحد أقصى
- **تسمية ذكية**: حسب التاريخ

## 📁 الملفات

### 1. **`src/lib/logger.ts`**:
- النظام الأساسي للـ logging
- إدارة الإعدادات والملفات
- دوال مساعدة للاستخدام السريع

### 2. **`src/middleware/logger.ts`**:
- Middleware لتسجيل الطلبات
- قياس وقت الاستجابة
- تسجيل معلومات المستخدم

### 3. **`src/app/api/logs/route.ts`**:
- API لإدارة الـ logs
- تغيير الإعدادات
- عرض الإحصائيات

### 4. **`src/app/admin/logs/page.tsx`**:
- واجهة إدارة الـ logs
- عرض الإحصائيات
- تغيير الإعدادات

## 🚀 كيفية الاستخدام

### 1. **الاستخدام الأساسي**:
```typescript
import { logger, logError, logInfo, logWarn, logDebug } from '@/lib/logger';

// تسجيل معلومات
await logger.info('تم تسجيل الدخول بنجاح', { userId: 123, ip: '192.168.1.1' });

// تسجيل خطأ
await logger.error('فشل في الاتصال بقاعدة البيانات', { error: error.message });

// تسجيل تحذير
await logger.warn('المستخدم يحاول الوصول لصفحة محمية');

// تسجيل debug
await logger.debug('قيمة المتغير', { variable: value });
```

### 2. **الاستخدام السريع**:
```typescript
import { logError, logInfo } from '@/lib/logger';

logError('رسالة خطأ');
logInfo('رسالة معلومات');
```

### 3. **في API Routes**:
```typescript
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    await logger.info('API call started', { endpoint: '/api/users', method: 'POST' });
    
    // ... منطق API
    
    await logger.info('API call completed', { status: 200, responseTime: '150ms' });
    return NextResponse.json({ success: true });
  } catch (error) {
    await logger.error('API call failed', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## ⚙️ الإعدادات

### 1. **تكوين الـ Logger**:
```typescript
import { Logger } from '@/lib/logger';

const customLogger = new Logger({
  level: LogLevel.DEBUG,
  enableConsole: true,
  enableFile: true,
  logDir: 'custom-logs',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 20
});
```

### 2. **تغيير الإعدادات**:
```typescript
// تغيير مستوى الـ log
logger.setLevel(LogLevel.DEBUG);

// تفعيل/إلغاء console
logger.setConsoleEnabled(false);

// تفعيل/إلغاء file
logger.setFileEnabled(false);
```

## 📊 API Endpoints

### 1. **GET `/api/logs`**:
- عرض إحصائيات الـ logs
- آخر 100 سطر من آخر ملف
- معلومات النظام

### 2. **POST `/api/logs`**:
```json
{
  "action": "setLevel",
  "level": "DEBUG"
}
```

**الأفعال المتاحة**:
- `setLevel`: تغيير مستوى الـ log
- `setConsole`: تفعيل/إلغاء console
- `setFile`: تفعيل/إلغاء file
- `clear`: مسح جميع الـ logs

### 3. **DELETE `/api/logs`**:
- مسح جميع ملفات الـ logs

## 🎨 واجهة الإدارة

### 1. **الوصول**: `/admin/logs`
### 2. **الميزات**:
- عرض إحصائيات الـ logs
- تغيير مستوى الـ logging
- تفعيل/إلغاء console/file
- عرض آخر الـ logs
- مسح جميع الـ logs

## 📈 الإحصائيات

### 1. **عدد الملفات**: إجمالي ملفات الـ logs
### 2. **الحجم الإجمالي**: حجم جميع ملفات الـ logs
### 3. **آخر تحديث**: وقت آخر تحديث للبيانات

## 🔧 التخصيص

### 1. **تغيير مجلد الـ logs**:
```typescript
const logger = new Logger({
  logDir: 'my-logs'
});
```

### 2. **تغيير حجم الملف**:
```typescript
const logger = new Logger({
  maxFileSize: 20 * 1024 * 1024 // 20MB
});
```

### 3. **تغيير عدد الملفات**:
```typescript
const logger = new Logger({
  maxFiles: 50
});
```

## 🚨 أفضل الممارسات

### 1. **استخدام مستويات مناسبة**:
- `ERROR`: للأخطاء فقط
- `WARN`: للتحذيرات المهمة
- `INFO`: للمعلومات العامة
- `DEBUG`: للتطوير فقط

### 2. **إضافة context مفيد**:
```typescript
await logger.error('فشل في تسجيل الدخول', {
  userId: user.id,
  email: user.email,
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

### 3. **عدم تسجيل معلومات حساسة**:
- كلمات المرور
- بيانات شخصية
- مفاتيح API

## 📝 أمثلة عملية

### 1. **تسجيل تسجيل الدخول**:
```typescript
await logger.info('User login attempt', {
  email: email,
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

### 2. **تسجيل الأخطاء**:
```typescript
await logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

### 3. **تسجيل الأداء**:
```typescript
const startTime = Date.now();
// ... عملية
const duration = Date.now() - startTime;
await logger.info('Operation completed', { duration: `${duration}ms` });
```

## 🔍 استكشاف الأخطاء

### 1. **مشكلة في الكتابة**:
- تأكد من صلاحيات المجلد
- تحقق من مساحة القرص
- راجع إعدادات النظام

### 2. **مشكلة في الأداء**:
- قلل مستوى الـ logging
- ألغِ file logging مؤقتاً
- استخدم async/await

### 3. **مشكلة في التنسيق**:
- تحقق من صحة JSON
- تأكد من عدم وجود حروف خاصة
- راجع تنسيق التاريخ

## 📚 المراجع

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Node.js File System](https://nodejs.org/api/fs.html)
- [TypeScript](https://www.typescriptlang.org/docs/)

