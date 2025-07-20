import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب التقييمات لموهبة معينة
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ message: 'userId مطلوب.' }, { status: 400 });
    const reviews = await prisma.talentReview.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في جلب التقييمات.' }, { status: 500 });
  }
}

// إضافة تقييم جديد
export async function POST(req: Request) {
  try {
    const { userId, reviewerName, rating, comment } = await req.json();
    if (!userId || !reviewerName || !rating || !comment) {
      return NextResponse.json({ message: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }
    const review = await prisma.talentReview.create({
      data: {
        userId: Number(userId),
        reviewerName,
        rating: Number(rating),
        comment,
      },
    });
    return NextResponse.json(review);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في إضافة التقييم.' }, { status: 500 });
  }
} 