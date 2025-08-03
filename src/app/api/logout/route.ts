import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // إنشاء response مع حذف cookies
    const response = NextResponse.json({ 
      message: 'تم تسجيل الخروج بنجاح.' 
    });

    // حذف cookies المستخدم
    response.cookies.delete('user_id');
    response.cookies.delete('user_role');
    response.cookies.delete('user_name');

    return response;
  } catch {
    return NextResponse.json({ message: 'حدث خطأ أثناء تسجيل الخروج.' }, { status: 500 });
  }
} 