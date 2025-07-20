import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/wallet?userId=xx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ message: 'userId مطلوب.' }, { status: 400 });
  let wallet = await prisma.wallet.findUnique({ where: { userId: Number(userId) } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: Number(userId) } });
  }
  return NextResponse.json(wallet);
} 