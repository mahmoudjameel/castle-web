import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // الحصول على معرف المستخدم من query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);

    // 1. طلبات نشطة (الطلبات الجديدة أو قيد التنفيذ)
    const activeOrders = await prisma.talentOrder.count({
      where: {
        clientId: userIdInt,
        status: {
          in: ['new', 'in_progress']
        }
      }
    });

    // 2. إشعارات جديدة (غير مقروءة)
    const newNotifications = await prisma.notification.count({
      where: {
        userId: userIdInt,
        read: false
      }
    });

    // 3. محادثات نشطة (عدد المحادثات الفريدة مع المواهب)
    const activeConversations = await prisma.message.groupBy({
      by: ['receiverId'],
      where: {
        senderId: userIdInt,
        receiver: {
          role: 'talent'
        }
      },
      _count: {
        receiverId: true
      }
    });

    // 4. بلاغات مرسلة
    const sentReports = await prisma.report.count({
      where: {
        reporterId: userIdInt
      }
    });

    // 5. إحصائيات إضافية
    const totalOrders = await prisma.talentOrder.count({
      where: {
        clientId: userIdInt
      }
    });

    const completedOrders = await prisma.talentOrder.count({
      where: {
        clientId: userIdInt,
        status: 'completed'
      }
    });

    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          { senderId: userIdInt },
          { receiverId: userIdInt }
        ]
      }
    });

    const stats = {
      activeOrders,
      newNotifications,
      activeConversations: activeConversations.length,
      sentReports,
      totalOrders,
      completedOrders,
      totalMessages
    };

    console.log(`User stats fetched for user ${userId}:`, stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}




