import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// تكوين VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BJe8pDWPvkxBf1wqoGj-5QxE5dVNVpXTuYTvybug5GSUdFMyd3WBj08UbJAqtGNuj40fL3eLOHeaz_Ve0Xrp-R0',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'dfZ4jZ2MLZe4dYKqtUAe0nWiCGu76kBhstoT42fmoWM'
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:info@toq-group.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, userId, icon, badge, data, actions } = await req.json();
    
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    let subscriptions;
    
    if (userId) {
      // إرسال إشعار لمستخدم محدد
      subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: Number(userId) }
      });
    } else {
      // إرسال إشعار لجميع المستخدمين
      subscriptions = await prisma.pushSubscription.findMany();
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo.png',
      badge: badge || '/logo.png',
      data: data || {},
      actions: actions || [
        {
          action: 'explore',
          title: 'عرض',
          icon: '/logo.png'
        },
        {
          action: 'close',
          title: 'إغلاق',
          icon: '/logo.png'
        }
      ]
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            payload
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error('Error sending notification:', error);
          
          // إذا كان subscription غير صالح، احذفه
          if (error.statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { endpoint: subscription.endpoint }
            });
          }
          
          return { success: false, endpoint: subscription.endpoint, error: error.message };
        }
      })
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results: results.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: 'Promise rejected' }
      )
    });

  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
