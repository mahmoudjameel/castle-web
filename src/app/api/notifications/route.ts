import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
} 