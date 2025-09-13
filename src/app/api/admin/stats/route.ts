import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. حسابات بانتظار الموافقة
    const pendingAccounts = await prisma.user.count({
      where: {
        approved: false
      }
    });

    // 2. عروض نشطة (طلبات جديدة)
    const activeOffers = await prisma.talentOrder.count({
      where: {
        status: 'new'
      }
    });

    // 3. شكاوى جديدة
    const newReports = await prisma.report.count({
      where: {
        status: 'pending'
      }
    });

    // 4. فواتير قيد المراجعة (طلبات سحب معلقة)
    const pendingInvoices = await prisma.withdrawal.count({
      where: {
        status: 'pending'
      }
    });

    // 5. إحصائيات إضافية
    const totalUsers = await prisma.user.count();
    
    const totalTalents = await prisma.user.count({
      where: {
        role: 'TALENT',
        approved: true
      }
    });

    const totalOrders = await prisma.talentOrder.count();
    
    const completedOrders = await prisma.talentOrder.count({
      where: {
        status: 'completed'
      }
    });

    // 6. إحصائيات المحادثات
    const totalMessages = await prisma.message.count();
    
    const totalConversations = await prisma.message.groupBy({
      by: ['senderId', 'receiverId'],
      _count: {
        id: true
      }
    });

    // 7. إحصائيات المعاملات
    const totalTransactions = await prisma.transaction.count();
    
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'earning',
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    });

    // 8. إحصائيات المحافظ
    const totalWallets = await prisma.wallet.count();
    
    const totalBalance = await prisma.wallet.aggregate({
      _sum: {
        balance: true
      }
    });

    const stats = {
      // الإحصائيات الأساسية
      pendingAccounts,
      activeOffers,
      newReports,
      pendingInvoices,
      
      // الإحصائيات الإضافية
      totalUsers,
      totalTalents,
      totalOrders,
      completedOrders,
      totalMessages,
      totalConversations: totalConversations.length,
      totalTransactions,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalWallets,
      totalBalance: totalBalance._sum.balance || 0,
      
      // معدلات التحويل
      conversionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(2) : 0,
      talentApprovalRate: totalUsers > 0 ? (totalTalents / totalUsers * 100).toFixed(2) : 0
    };

    console.log('Admin stats fetched:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
