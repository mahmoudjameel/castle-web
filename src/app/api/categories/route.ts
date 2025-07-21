import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    // أرجع imageData كـ base64 string إذا موجودة
    const categoriesWithBase64 = categories.map(cat => ({
      ...cat,
      imageData: cat.imageData ? Buffer.from(cat.imageData).toString('base64') : undefined,
    }));
    return NextResponse.json(categoriesWithBase64);
  } catch {
    return NextResponse.json({ message: 'خطأ في جلب التصنيفات.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, name, imageUrl, imageData } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ message: 'الاسم وID مطلوبان.' }, { status: 400 });
    }
    let imageDataBuffer: Buffer | undefined = undefined;
    if (imageData) {
      imageDataBuffer = Buffer.from(imageData, 'base64');
    }
    const category = await prisma.category.create({ data: { id, name, imageUrl, imageData: imageDataBuffer } });
    return NextResponse.json({ ...category, imageData: imageData ? imageData : undefined }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في إضافة التصنيف.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: 'id مطلوب.' }, { status: 400 });
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: 'تم الحذف.' });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في الحذف.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, name, imageUrl } = await req.json();
    if (!id) return NextResponse.json({ message: 'id مطلوب.' }, { status: 400 });
    const updated = await prisma.category.update({
      where: { id },
      data: { name, imageUrl },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في التعديل.' }, { status: 500 });
  }
} 