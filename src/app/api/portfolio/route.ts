import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ملاحظة: export config لا يعمل في App Router
// استخدم next.config.ts للإعدادات العامة و vercel.json لإعدادات Vercel

// جلب كل الأعمال لمستخدم معين
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ message: 'userId مطلوب.' }, { status: 400 });
  try {
    const items = await prisma.portfolioItem.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
    // أرجع mediaData كـ base64
    const itemsWithBase64 = items.map(item => ({
      ...item,
      mediaData: item.mediaData ? Buffer.from(item.mediaData).toString('base64') : undefined,
    }));
    return NextResponse.json(itemsWithBase64);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في جلب الأعمال.' }, { status: 500 });
  }
}

// إضافة عمل جديد (صورة أو فيديو)
export async function POST(req: Request) {
  try {
    console.log('📥 استلام طلب رفع عمل جديد');
    
    const contentType = req.headers.get('content-type') || '';
    
    // معالجة FormData (للفيديوهات والصور المرفوعة كملفات)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const userId = formData.get('userId') as string;
      const type = formData.get('type') as string;
      const title = formData.get('title') as string;

      if (!userId || !type || !file) {
        return NextResponse.json({ 
          message: 'المعلومات المطلوبة ناقصة' 
        }, { status: 400 });
      }

      // قراءة الملف مباشرة بدون قيود حجم
      const buffer = await file.arrayBuffer();
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`📊 حجم الملف: ${fileSizeMB.toFixed(2)} MB`);

      try {
        const item = await prisma.portfolioItem.create({
          data: { 
            userId: Number(userId), 
            type,
            title: title || null,
            mediaData: Buffer.from(buffer),
            mediaUrl: null
          },
        });
        console.log('✅ تم حفظ العمل بنجاح:', item.id);
        return NextResponse.json(item, { status: 201 });
      } catch (dbError) {
        console.error('❌ خطأ في حفظ البيانات:', dbError);
        return NextResponse.json({ 
          message: 'خطأ في حفظ العمل في قاعدة البيانات.' 
        }, { status: 500 });
      }
    }
    
    // معالجة JSON (للروابط أو base64 القديمة)
    const body = await req.json();
    const { userId, type, title, mediaData, mediaUrl } = body;

    if (!userId || !type) {
      return NextResponse.json({ 
        message: 'المعلومات المطلوبة ناقصة' 
      }, { status: 400 });
    }

    try {
      const item = await prisma.portfolioItem.create({
        data: { 
          userId: Number(userId), 
          type,
          title: title || null,
          mediaData: mediaData ? Buffer.from(mediaData, 'base64') : null,
          mediaUrl: mediaUrl || null
        },
      });
      console.log('✅ تم حفظ العمل بنجاح:', item.id);
      return NextResponse.json(item, { status: 201 });
    } catch (dbError) {
      console.error('❌ خطأ في حفظ البيانات:', dbError);
      return NextResponse.json({ 
        message: 'خطأ في حفظ العمل في قاعدة البيانات.' 
      }, { status: 500 });
    }
  } catch (err) {
    console.error('❌ خطأ عام في رفع العمل:', err);
    return NextResponse.json({ 
      message: 'حدث خطأ غير متوقع أثناء رفع العمل.' 
    }, { status: 500 });
  }
}

// حذف عمل
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: 'id مطلوب.' }, { status: 400 });
    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ message: 'تم الحذف.' });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في الحذف.' }, { status: 500 });
  }
}