import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'البريد وكلمة المرور مطلوبة.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return NextResponse.json({ message: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }
    if (!user.approved && user.role !== 'user') {
      return NextResponse.json({ message: 'حسابك بانتظار موافقة الإدارة.' }, { status: 403 });
    }
    // تسجيل دخول ناجح (يمكنك هنا إنشاء session أو JWT)
    return NextResponse.json({ message: 'تم تسجيل الدخول بنجاح.', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return NextResponse.json({ message: 'حدث خطأ أثناء تسجيل الدخول.' }, { status: 500 });
  }
} 