import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url!);
    const clientId = url.searchParams.get('clientId');

    const where: any = {
      type: { in: ['earning', 'payment'] },
      orderId: { not: null }
    };
    if (clientId) {
      where.senderId = Number(clientId);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, phone: true } },
        receiver: { select: { id: true, name: true, email: true, phone: true } },
        order: true
      }
    });

    // تحويل البيانات إلى شكل الفاتورة
    const invoices = transactions.map(tx => ({
      id: tx.id,
      client: tx.sender ? { id: tx.sender.id, name: tx.sender.name, email: tx.sender.email, phone: tx.sender.phone } : null,
      talent: tx.receiver ? { id: tx.receiver.id, name: tx.receiver.name, email: tx.receiver.email, phone: tx.receiver.phone } : null,
      amount: tx.amount,
      commission: tx.order ? (JSON.parse(tx.order.services).reduce((sum, s) => sum + Number(s.price || 0), 0) * 0.1) : 0,
      status: tx.status,
      date: tx.createdAt,
      createdAt: tx.createdAt,
      orderId: tx.orderId,
      orderMessage: tx.order?.message || '',
      orderServices: tx.order?.services || '',
    }));

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'فشل في جلب الفواتير', details: typeof error === 'object' && error && 'message' in error ? (error as any).message : '' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // للسماح فقط في بيئة التطوير
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'غير مسموح في بيئة الإنتاج' }, { status: 403 });
  }
  try {
    const { talentId, clientId, services, amount, orderId, message } = await req.json();
    if (!talentId || !clientId || !services || !amount) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }
    // إذا لم يوجد orderId، أنشئ طلب جديد
    let order;
    if (!orderId) {
      order = await prisma.talentOrder.create({
        data: {
          talentId: Number(talentId),
          clientId: Number(clientId),
          services: JSON.stringify(services),
          message: message || '',
          date: new Date().toISOString(),
        }
      });
    } else {
      order = await prisma.talentOrder.findUnique({ where: { id: Number(orderId) } });
    }
    if (!order) {
      return NextResponse.json({ error: 'تعذر إنشاء أو جلب الطلب' }, { status: 500 });
    }
    // إنشاء الفاتورة (Transaction)
    const tx = await prisma.transaction.create({
      data: {
        type: 'earning',
        amount: Number(amount),
        description: `دفع طلب رقم ${order.id}`,
        status: 'paid',
        senderId: Number(clientId),
        receiverId: Number(talentId),
        orderId: order.id,
      }
    });
    return NextResponse.json({ success: true, transaction: tx });
  } catch (error) {
    return NextResponse.json({ error: 'فشل في إنشاء الفاتورة', details: typeof error === 'object' && error && 'message' in error ? (error as any).message : '' }, { status: 500 });
  }
} 