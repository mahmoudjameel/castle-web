import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json();
    
    if (!name || !phone || !password || !role) {
      return NextResponse.json({ message: 'الاسم ورقم الجوال وكلمة المرور ونوع الحساب مطلوبة.' }, { status: 400 });
    }

    // التحقق من وجود رقم الجوال (مطلوب)
    if (!phone) {
      return NextResponse.json({ message: 'رقم الجوال مطلوب.' }, { status: 400 });
    }

    // التحقق من عدم تكرار رقم الهاتف
    const existingPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ message: 'رقم الهاتف مستخدم بالفعل.' }, { status: 409 });
    }

    // التحقق من عدم تكرار البريد الإلكتروني إذا تم إدخاله
    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل.' }, { status: 409 });
      }
    }

    // حفظ المستخدم في القاعدة
    await prisma.user.create({
      data: {
        name,
        email: email || null, // يمكن أن يكون null إذا لم يتم إدخاله
        phone, // مطلوب
        password, // يفضل تشفير كلمة المرور في الإنتاج
        role,
        approved: role === 'user' ? true : false,
      },
    });

    return NextResponse.json({ 
      message: 'تم إنشاء الحساب بنجاح! بانتظار موافقة الإدارة.' 
    }, { status: 201 });
  } catch (err) {
    console.error('Register API error:', err);
    return NextResponse.json({ message: 'حدث خطأ أثناء معالجة الطلب.' }, { status: 500 });
  }
} 