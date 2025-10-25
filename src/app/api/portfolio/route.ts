import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ملاحظة: في Next.js 15 App Router، يتم التحكم في حجم الـ body من next.config.ts
// تم تعيين bodySizeLimit: '50mb' في experimental.serverActions

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
    
    // قراءة البيانات مع معالجة الأخطاء
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ خطأ في قراءة البيانات:', parseError);
      return NextResponse.json({ 
        message: 'خطأ في قراءة البيانات. الملف قد يكون كبيراً جداً.' 
      }, { status: 413 });
    }
    
    const { userId, type, title, mediaData, mediaUrl } = body;
    
    // التحقق من البيانات المطلوبة
    if (!userId || !type || (!mediaData && !mediaUrl)) {
      console.error('❌ بيانات ناقصة:', { userId: !!userId, type, hasMediaData: !!mediaData, hasMediaUrl: !!mediaUrl });
      return NextResponse.json({ 
        message: 'userId, type, mediaData أو mediaUrl مطلوبة.' 
      }, { status: 400 });
    }
    
    console.log(`📊 نوع العمل: ${type}, حجم البيانات: ${mediaData ? (mediaData.length / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
    
    let mediaDataBuffer: Buffer | undefined = undefined;
    if (mediaData) {
      try {
        // التحقق من حجم البيانات قبل التحويل
        const estimatedSizeMB = (mediaData.length * 0.75) / (1024 * 1024); // base64 حجم تقريبي
        console.log(`📦 حجم البيانات المقدر: ${estimatedSizeMB.toFixed(2)} MB`);
        
        if (estimatedSizeMB > 45) {
          console.error('❌ الملف كبير جداً:', estimatedSizeMB.toFixed(2), 'MB');
          return NextResponse.json({ 
            message: `حجم الملف كبير جداً (${estimatedSizeMB.toFixed(2)} MB). الحد الأقصى المسموح هو 45MB.` 
          }, { status: 413 });
        }
        
        mediaDataBuffer = Buffer.from(mediaData, 'base64');
        console.log('✅ تم تحويل البيانات إلى Buffer بنجاح');
      } catch (bufferError) {
        console.error('❌ خطأ في تحويل base64 إلى Buffer:', bufferError);
        return NextResponse.json({ 
          message: 'خطأ في معالجة بيانات الملف.' 
        }, { status: 500 });
      }
    }
    
    // حفظ في قاعدة البيانات
    try {
      const item = await prisma.portfolioItem.create({
        data: { 
          userId: Number(userId), 
          type, 
          title: title || null, 
          mediaData: mediaDataBuffer, 
          mediaUrl: mediaUrl || null 
        },
      });
      console.log('✅ تم حفظ العمل بنجاح:', item.id);
      return NextResponse.json({ ...item, mediaData }, { status: 201 });
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