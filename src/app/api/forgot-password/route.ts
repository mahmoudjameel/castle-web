import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: 'البريد الإلكتروني مطلوب.' }, { status: 400 });
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // نرسل نفس الرسالة حتى لو لم يكن البريد موجوداً لأمان إضافي
      return NextResponse.json({ 
        message: 'إذا كان هذا البريد الإلكتروني مسجل لدينا، سيتم إرسال رابط إعادة تعيين كلمة المرور.' 
      });
    }

    // إنشاء رمز عشوائي
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

    // حفظ الرمز في قاعدة البيانات
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // إنشاء رابط إعادة تعيين كلمة المرور
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    try {
      // إرسال البريد الإلكتروني
      await sendPasswordResetEmail({
        to: email,
        name: user.name,
        resetUrl
      });

      console.log('تم إرسال رابط إعادة تعيين كلمة المرور إلى:', email);
    } catch (emailError) {
      console.error('خطأ في إرسال البريد الإلكتروني:', emailError);
      
      // حذف الرمز إذا فشل إرسال البريد الإلكتروني
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return NextResponse.json({ 
        message: 'حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'إذا كان هذا البريد الإلكتروني مسجل لدينا، سيتم إرسال رابط إعادة تعيين كلمة المرور.' 
    });

  } catch (error) {
    console.error('خطأ في إرسال رابط إعادة تعيين كلمة المرور:', error);
    return NextResponse.json({ 
      message: 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور.' 
    }, { status: 500 });
  }
} 