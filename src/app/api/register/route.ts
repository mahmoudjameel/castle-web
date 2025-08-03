import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }
    // تحقق من عدم تكرار البريد
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل.' }, { status: 409 });
    }
    // حفظ المستخدم في القاعدة
    await prisma.user.create({
      data: {
        name,
        email,
        password, // يفضل تشفير كلمة المرور في الإنتاج
        role,
        approved: role === 'user' ? true : false,
      },
    });
    return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح! بانتظار موافقة الإدارة.' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'حدث خطأ أثناء معالجة الطلب.' }, { status: 500 });
  }
} 