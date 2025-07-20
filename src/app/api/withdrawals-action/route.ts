import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/withdrawals-action
export async function POST(req: Request) {
  try {
    const { id, userId, amount, action } = await req.json();
    if (!id || !userId || !amount || !action) {
      return NextResponse.json({ message: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }
    if (action === 'approve') {
      // تحديث حالة السحب
      await prisma.withdrawal.update({ where: { id }, data: { status: 'approved', processedAt: new Date() } });
      // تصفير الرصيد وزيادة إجمالي المسحوبات
      await prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      });
    } else if (action === 'reject') {
      await prisma.withdrawal.update({ where: { id }, data: { status: 'rejected', processedAt: new Date() } });
    }
    return NextResponse.json({ message: 'تم التحديث.' });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ أثناء تحديث الطلب.' }, { status: 500 });
  }
} 