import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/withdrawals?userId=xx (للموهبة) أو بدون userId (للأدمن)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const userId = searchParams.get('userId');
  let where: any = {};
  if (userId) where.userId = Number(userId);
  const withdrawals = await prisma.withdrawal.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(withdrawals);
}

// POST /api/withdrawals (إرسال طلب سحب)
export async function POST(req: Request) {
  try {
    const { userId, amount, bankAccount } = await req.json();
    if (!userId || !amount) {
      return NextResponse.json({ message: 'userId و amount مطلوبة.' }, { status: 400 });
    }
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: Number(userId),
        amount: Number(amount),
        bankAccount: bankAccount || null,
        status: 'pending',
      },
    });
    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ أثناء إرسال طلب السحب.' }, { status: 500 });
  }
} 