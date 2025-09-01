const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// الحصول على البيانات من command line arguments
const args = process.argv.slice(2);

async function addUser() {
  try {
    // التحقق من وجود البيانات المطلوبة
    if (args.length < 4) {
      console.log('📋 كيفية الاستخدام:');
      console.log('node add-user.js "اسم المستخدم" "admin@admin.com" "رقم الهاتف" "كلمة المرور" "نوع الحساب"');
      console.log('\n📝 أنواع الحسابات المتاحة:');
      console.log('- admin: مدير النظام');
      console.log('- user: مستخدم عادي');
      console.log('- talent: موهبة');
      console.log('\n📝 مثال:');
      console.log('node add-user.js "أحمد محمد" "ahmed@email.com" "1234567890" "123456" "user"');
      console.log('node add-user.js "سارة أحمد" "sara@email.com" "9876543210" "123456" "talent"');
      return;
    }

    // بيانات المستخدم الجديد
    const newUser = {
      name: args[0],
      email: args[1],
      phone: args[2],
      password: args[3],
      role: args[4] || 'user',
      approved: args[4] === 'user' || args[4] === 'admin' ? true : false // المستخدمين العاديين والمديرين مفعلين تلقائياً
    };

    // التحقق من صحة نوع الحساب
    const validRoles = ['admin', 'user', 'talent'];
    if (!validRoles.includes(newUser.role)) {
      console.log('❌ نوع الحساب غير صحيح!');
      console.log('الأنواع المتاحة:', validRoles.join(', '));
      return;
    }

    console.log('🔍 جاري التحقق من البيانات...');
    console.log('📝 الاسم:', newUser.name);
    console.log('📧 البريد الإلكتروني:', newUser.email);
    console.log('📱 رقم الهاتف:', newUser.phone);
    console.log('🔑 كلمة المرور:', newUser.password);
    console.log('👤 نوع الحساب:', newUser.role);
    console.log('✅ الحساب مفعل:', newUser.approved);

    // التحقق من عدم وجود المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: newUser.email },
          { phone: newUser.phone }
        ]
      }
    });

    if (existingUser) {
      console.log('\n❌ المستخدم موجود بالفعل!');
      console.log('البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل');
      return;
    }

    // إنشاء المستخدم الجديد
    const user = await prisma.user.create({
      data: newUser
    });

    console.log('\n✅ تم إنشاء المستخدم بنجاح!');
    console.log('📧 البريد الإلكتروني:', user.email);
    console.log('🔑 كلمة المرور:', newUser.password);
    console.log('👤 نوع الحساب:', user.role);
    console.log('🆔 معرف المستخدم:', user.id);
    console.log('📱 رقم الهاتف:', user.phone);
    console.log('✅ الحساب مفعل:', user.approved);
    
    // تحديد صفحة تسجيل الدخول حسب نوع الحساب
    let loginUrl = '';
    if (user.role === 'admin') {
      loginUrl = 'http://localhost:3001/admin/login';
    } else if (user.role === 'talent') {
      loginUrl = 'http://localhost:3001/login';
    } else {
      loginUrl = 'http://localhost:3001/login';
    }
    
    console.log('\n🔗 يمكنك تسجيل الدخول الآن من:');
    console.log(loginUrl);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الـ function
addUser();
