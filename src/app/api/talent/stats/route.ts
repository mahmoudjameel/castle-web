import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // الحصول على معرف الموهبة من query parameters
    const { searchParams } = new URL(request.url);
    const talentId = searchParams.get('talentId');

    if (!talentId) {
      return NextResponse.json(
        { error: 'Talent ID is required' },
        { status: 400 }
      );
    }

    const talentIdInt = parseInt(talentId);

    // 1. طلبات نشطة (الطلبات الجديدة أو قيد التنفيذ)
    const activeOrders = await prisma.talentOrder.count({
      where: {
        talentId: talentIdInt,
        status: {
          in: ['new', 'in_progress']
        }
      }
    });

    // 2. عروض متاحة (الطلبات الجديدة)
    const availableOffers = await prisma.talentOrder.count({
      where: {
        talentId: talentIdInt,
        status: 'new'
      }
    });

    // 3. إشعارات جديدة (غير مقروءة)
    const newNotifications = await prisma.notification.count({
      where: {
        userId: talentIdInt,
        read: false
      }
    });

    // 4. مدفوعات قيد التحويل (طلبات السحب المعلقة)
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: {
        userId: talentIdInt,
        status: 'pending'
      }
    });

    // 5. إحصائيات إضافية
    const totalOrders = await prisma.talentOrder.count({
      where: {
        talentId: talentIdInt
      }
    });

    const completedOrders = await prisma.talentOrder.count({
      where: {
        talentId: talentIdInt,
        status: 'completed'
      }
    });

    const totalEarnings = await prisma.transaction.aggregate({
      where: {
        receiverId: talentIdInt,
        type: 'earning',
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    });

    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          { senderId: talentIdInt },
          { receiverId: talentIdInt }
        ]
      }
    });

    // 6. معلومات المحفظة
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: talentIdInt
      }
    });

    const stats = {
      activeOrders,
      availableOffers,
      newNotifications,
      pendingWithdrawals,
      totalOrders,
      completedOrders,
      totalEarnings: totalEarnings._sum.amount || 0,
      totalMessages,
      walletBalance: wallet?.balance || 0,
      totalEarned: wallet?.totalEarned || 0
    };

    console.log(`Talent stats fetched for talent ${talentId}:`, stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching talent stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talent statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



