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
    
    // معالجة آمنة للتواريخ
    const processedNotifications = notifications.map(notification => ({
      ...notification,
      date: notification.date ? notification.date.toISOString() : new Date().toISOString()
    }));
    
    return NextResponse.json(processedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title, message, type, orderId } = await req.json();
    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'بيانات الإشعار غير مكتملة' }, { status: 400 });
    }
    // تحقق من وجود المستخدم
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }
    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        body: message,
        date: new Date(),
        read: false
      }
    });
    
    // إرجاع الإشعار مع تاريخ معالج بشكل صحيح
    const processedNotification = {
      ...notification,
      date: notification.date.toISOString()
    };
    
    return NextResponse.json(processedNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الإشعار', details: typeof error === 'object' && error && 'message' in error ? (error as any).message : '' }, { status: 500 });
  }
} 