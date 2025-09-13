import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// إعدادات bodyParser لزيادة حجم الملفات المسموح
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // زيادة الحد الأقصى لحجم الملفات إلى 50MB
    },
  },
};

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
    const { userId, type, title, mediaData, mediaUrl } = await req.json();
    if (!userId || !type || (!mediaData && !mediaUrl)) {
      return NextResponse.json({ message: 'userId, type, mediaData أو mediaUrl مطلوبة.' }, { status: 400 });
    }
    let mediaDataBuffer: Buffer | undefined = undefined;
    if (mediaData) {
      mediaDataBuffer = Buffer.from(mediaData, 'base64');
    }
    const item = await prisma.portfolioItem.create({
      data: { userId: Number(userId), type, title, mediaData: mediaDataBuffer, mediaUrl },
    });
    return NextResponse.json({ ...item, mediaData }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في إضافة العمل.' }, { status: 500 });
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