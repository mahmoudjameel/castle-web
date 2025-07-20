import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// جلب الرسائل بين مستخدمين
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get('user1');
  const user2 = searchParams.get('user2');
  const talentId = searchParams.get('talentId');
  const userId = searchParams.get('userId'); // إضافة userId

  if (user1 && user2) {
    // جلب الرسائل بين مستخدمين
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: Number(user1), receiverId: Number(user2) },
          { senderId: Number(user2), receiverId: Number(user1) },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } else if (talentId) {
    // جلب قائمة المحادثات لصاحب الموهبة
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: Number(talentId) },
          { receiverId: Number(talentId) }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    // استخرج المستخدمين الآخرين (clients)
    const userMap = new Map();
    for (const msg of messages) {
      const otherId = msg.senderId == Number(talentId) ? msg.receiverId : msg.senderId;
      if (!userMap.has(otherId)) {
        userMap.set(otherId, msg);
      }
    }
    const clientIds = Array.from(userMap.keys());
    if (clientIds.length === 0) return NextResponse.json([]);
    const users = await prisma.user.findMany({
      where: { id: { in: clientIds } }
    });
    // حساب عدد الرسائل غير المقروءة لكل محادثة
    const unreadCounts = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: Number(talentId),
        isRead: false
      },
      _count: { _all: true }
    });
    // دمج بيانات المستخدم مع آخر رسالة وعدد الرسائل غير المقروءة
    const conversations = users.map((u: any) => {
      const msg = userMap.get(u.id);
      const unread = unreadCounts.find((c: any) => c.senderId === u.id)?._count._all || 0;
      return {
        userId: u.id,
        name: u.name,
        profileImageData: u.profileImageData ? Buffer.from(u.profileImageData).toString('base64') : undefined,
        lastMessage: msg.content,
        lastDate: msg.createdAt,
        unreadCount: unread
      };
    });
    return NextResponse.json(conversations);
  } else if (userId) {
    // جلب قائمة المحادثات للمستخدم العادي
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: Number(userId) },
          { receiverId: Number(userId) }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    // استخرج الطرف الآخر (الموهبة)
    const talentMap = new Map();
    for (const msg of messages) {
      const otherId = msg.senderId == Number(userId) ? msg.receiverId : msg.senderId;
      if (!talentMap.has(otherId)) {
        talentMap.set(otherId, msg);
      }
    }
    const talentIds = Array.from(talentMap.keys());
    if (talentIds.length === 0) return NextResponse.json([]);
    const users = await prisma.user.findMany({
      where: { id: { in: talentIds } }
    });
    // حساب عدد الرسائل غير المقروءة لكل محادثة
    const unreadCounts = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: Number(userId),
        isRead: false
      },
      _count: { _all: true }
    });
    // دمج بيانات الموهبة مع آخر رسالة وعدد الرسائل غير المقروءة
    const conversations = users.map((u: any) => {
      const msg = talentMap.get(u.id);
      const unread = unreadCounts.find((c: any) => c.senderId === u.id)?._count._all || 0;
      return {
        userId: u.id,
        name: u.name,
        profileImageData: u.profileImageData ? Buffer.from(u.profileImageData).toString('base64') : undefined,
        lastMessage: msg.content,
        lastDate: msg.createdAt,
        unreadCount: unread
      };
    });
    return NextResponse.json(conversations);
  } else {
    return NextResponse.json([], { status: 200 });
  }
}

// إرسال رسالة جديدة
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { senderId, receiverId, content } = body;
  if (!senderId || !receiverId || !content) {
    return NextResponse.json({ error: 'senderId, receiverId, and content are required' }, { status: 400 });
  }
  const message = await prisma.message.create({
    data: {
      senderId: Number(senderId),
      receiverId: Number(receiverId),
      content,
    },
  });
  // إضافة إشعار لصاحب الموهبة إذا كان المستقبل موهبة
  const receiver = await prisma.user.findUnique({ where: { id: Number(receiverId) } });
  if (receiver && receiver.role === 'talent') {
    await prisma.notification.create({
      data: {
        userId: receiver.id,
        title: 'محادثة جديدة',
        body: 'لديك محادثة جديدة من أحد العملاء. قم بالدخول إلى صفحة المحادثات لقراءتها.',
      }
    });
  }
  return NextResponse.json(message);
}

// تحديث حالة القراءة
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { messageId, isRead } = body;
  if (!messageId || typeof isRead !== 'boolean') {
    return NextResponse.json({ error: 'messageId and isRead are required' }, { status: 400 });
  }
  const message = await prisma.message.update({
    where: { id: Number(messageId) },
    data: { isRead },
  });
  return NextResponse.json(message);
} 