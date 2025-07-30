import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // إجمالي الطلبات
    const totalOrders = await prisma.talentOrder.count();
    // الطلبات الجديدة اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newOrders = await prisma.talentOrder.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });
    // الطلبات المكتملة
    const completedOrders = await prisma.talentOrder.count({ where: { status: 'completed' } });
    // الطلبات المرفوضة
    const rejectedOrders = await prisma.talentOrder.count({ where: { status: 'rejected' } });
    // عدد المواهب
    const talents = await prisma.user.count({ where: { role: 'USER', approved: true } });
    // عدد العملاء (كل المستخدمين غير المواهب)
    const clients = await prisma.user.count({ where: { role: 'USER', approved: true } });
    // إجمالي المبالغ المدفوعة (نجمع أسعار الخدمات في الطلبات المكتملة)
    const completed = await prisma.talentOrder.findMany({ where: { status: 'completed' }, select: { services: true } });
    let totalAmount = 0;
    for (const order of completed) {
      try {
        const services = JSON.parse(order.services);
        totalAmount += services.reduce((sum: number, s: any) => sum + Number(s.price || 0), 0);
      } catch {}
    }
    return NextResponse.json({
      totalOrders,
      newOrders,
      completedOrders,
      rejectedOrders,
      talents,
      clients,
      totalAmount
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل في جلب التقارير', details: typeof error === 'object' && error && 'message' in error ? (error as any).message : '' }, { status: 500 });
  }
} 