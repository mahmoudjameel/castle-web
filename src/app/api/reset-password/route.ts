import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json({ message: 'الرمز وكلمة المرور الجديدة مطلوبة.' }, { status: 400 });
    }

    // البحث عن المستخدم بالرمز
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'الرمز غير صحيح أو منتهي الصلاحية.' }, { status: 400 });
    }

    // تحديث كلمة المرور وحذف الرمز
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ 
      message: 'تم إعادة تعيين كلمة المرور بنجاح.' 
    });

  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return NextResponse.json({ 
      message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور.' 
    }, { status: 500 });
  }
} 