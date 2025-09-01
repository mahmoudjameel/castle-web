const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// الحصول على البيانات من command line arguments
const args = process.argv.slice(2);

async function addAdminUser() {
  try {
    // بيانات المستخدم الجديد - يمكن تغييرها حسب الحاجة
    const newAdmin = {
      name: args[0] || 'Admin User',
      email: args[1] || 'admin3@admin.com',
      phone: args[2] || '9876543210',
      password: args[3] || '123456',
      role: 'ADMIN',
      approved: true
    };

    console.log('🔍 جاري التحقق من البيانات...');
    console.log('📝 الاسم:', newAdmin.name);
    console.log('📧 البريد الإلكتروني:', newAdmin.email);
    console.log('📱 رقم الهاتف:', newAdmin.phone);
    console.log('🔑 كلمة المرور:', newAdmin.password);

    // التحقق من عدم وجود المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: newAdmin.email },
          { phone: newAdmin.phone }
        ]
      }
    });

    if (existingUser) {
      console.log('\n❌ المستخدم موجود بالفعل!');
      console.log('البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل');
      console.log('\n💡 يمكنك استخدام بيانات مختلفة:');
      console.log('node add-admin.js "اسم المستخدم" "admin4@admin.com" "1111111111" "كلمة المرور"');
      return;
    }

    // إنشاء المستخدم الجديد
    const user = await prisma.user.create({
      data: newAdmin
    });

    console.log('\n✅ تم إنشاء المستخدم Admin بنجاح!');
    console.log('📧 البريد الإلكتروني:', user.email);
    console.log('🔑 كلمة المرور:', newAdmin.password);
    console.log('👤 الدور: ADMIN');
    console.log('🆔 معرف المستخدم:', user.id);
    console.log('📱 رقم الهاتف:', user.phone);
    console.log('✅ الحساب مفعل:', user.approved);
    
    console.log('\n🔗 يمكنك تسجيل الدخول الآن من:');
    console.log('http://localhost:3001/admin/login');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// عرض التعليمات إذا لم يتم تمرير arguments
if (args.length === 0) {
  console.log('📋 كيفية الاستخدام:');
  console.log('node add-admin.js "اسم المستخدم" "admin@admin.com" "رقم الهاتف" "كلمة المرور"');
  console.log('\n📝 مثال:');
  console.log('node add-admin.js "مدير النظام" "admin@admin.com" "1234567890" "123456"');
  console.log('\n🚀 أو استخدم البيانات الافتراضية:');
  console.log('node add-admin.js');
  console.log('');
}

// تشغيل الـ function
addAdminUser();
