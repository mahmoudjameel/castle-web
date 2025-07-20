export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب كل السلايدات
export async function GET() {
  const banners = await prisma.heroBanner.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(banners);
}

// POST: إضافة سلايد جديد
export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.order !== undefined) data.order = Number(data.order);
  const banner = await prisma.heroBanner.create({ data });
  return NextResponse.json(banner);
}

// PUT: تعديل سلايد
export async function PUT(req: NextRequest) {
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
  if (data.order !== undefined) data.order = Number(data.order);
  const banner = await prisma.heroBanner.update({ where: { id: data.id }, data });
  return NextResponse.json(banner);
}

// DELETE: حذف سلايد
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
  await prisma.heroBanner.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
 