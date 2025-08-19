import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ message: 'الاسم والبريد والرسالة مطلوبة.' }, { status: 400 });
    }
    const created = await prisma.contactMessage.create({ data: { name, email, message } });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في إرسال الرسالة.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في جلب الرسائل.' }, { status: 500 });
  }
}

