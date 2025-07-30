import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // ابحث عن الإعداد في قاعدة البيانات
  const setting = await prisma.settings.findUnique({ where: { key: 'commissionRate' } });
  const rate = setting ? Number(setting.value) : 10;
  return NextResponse.json({ rate });
}

export async function POST(req: NextRequest) {
  try {
    const { rate } = await req.json();
    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return NextResponse.json({ error: 'Invalid rate' }, { status: 400 });
    }
    // حدّث أو أنشئ الإعداد في قاعدة البيانات
    await prisma.settings.upsert({
      where: { key: 'commissionRate' },
      update: { value: String(rate) },
      create: { key: 'commissionRate', value: String(rate) },
    });
    return NextResponse.json({ success: true, rate });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
} 