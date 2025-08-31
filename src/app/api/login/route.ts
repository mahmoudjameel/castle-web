import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, phone, password, loginMethod } = await req.json();
    
    if (!password) {
      return NextResponse.json({ message: 'كلمة المرور مطلوبة.' }, { status: 400 });
    }

    // التحقق من وجود إما البريد الإلكتروني أو رقم الهاتف
    if (loginMethod === 'email' && !email) {
      return NextResponse.json({ message: 'البريد الإلكتروني مطلوب.' }, { status: 400 });
    }
    if (loginMethod === 'phone' && !phone) {
      return NextResponse.json({ message: 'رقم الهاتف مطلوب.' }, { status: 400 });
    }

    let user;
    
    // البحث عن المستخدم حسب طريقة الدخول
    if (loginMethod === 'email') {
      user = await prisma.user.findFirst({ where: { email } });
    } else {
      user = await prisma.user.findFirst({ where: { phone } });
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ message: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }

    if (!user.approved && user.role !== 'user' && user.role !== 'admin') {
      return NextResponse.json({ message: 'حسابك بانتظار موافقة الإدارة.' }, { status: 403 });
    }
    
    // إنشاء response مع cookies
    const response = NextResponse.json({ 
      message: 'تم تسجيل الدخول بنجاح.', 
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
    });

    // حفظ معلومات المستخدم في cookies
    response.cookies.set('user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // أسبوع واحد
    });

    response.cookies.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // أسبوع واحد
    });

    response.cookies.set('user_name', user.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // أسبوع واحد
    });

    return response;
  } catch (err) {
    console.error('Login API error:', err);
    return NextResponse.json({ message: 'حدث خطأ أثناء تسجيل الدخول.' }, { status: 500 });
  }
} 