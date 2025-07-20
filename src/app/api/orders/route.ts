import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب الطلبات لموهبة أو عميل
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const talentId = searchParams.get('talentId');
    const clientId = searchParams.get('clientId');
    const where: any = {};
    if (talentId) where.talentId = Number(talentId);
    if (clientId) where.clientId = Number(clientId);
    const orders = await prisma.talentOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في جلب الطلبات.' }, { status: 500 });
  }
}

// إضافة طلب جديد
export async function POST(req: Request) {
  try {
    const { talentId, clientId, services, message, date, phone, address } = await req.json();
    if (!talentId || !clientId || !services) {
      return NextResponse.json({ message: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }
    const order = await prisma.talentOrder.create({
      data: {
        talentId: Number(talentId),
        clientId: Number(clientId),
        services: JSON.stringify(services),
        message: message || '',
        date: date || null,
        phone: phone || null,
        address: address || null,
      },
    });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في إضافة الطلب.' }, { status: 500 });
  }
}

// تحديث حالة الطلب
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ message: 'id و status مطلوبان.' }, { status: 400 });
    }
    const order = await prisma.talentOrder.update({
      where: { id: Number(id) },
      data: { status },
    });
    // إضافة إشعار للمستخدم عند تغيير الحالة
    let statusAr = '';
    let notifMsg = '';
    if (status === 'new') {
      statusAr = 'جديد';
      notifMsg = 'تم إعادة تعيين حالة طلبك إلى جديد. سيتم التواصل معك قريبًا.';
    } else if (status === 'in_progress') {
      statusAr = 'قيد التنفيذ';
      notifMsg = 'تم قبول طلبك وهو الآن قيد التنفيذ من قبل الموهبة.';
    } else if (status === 'completed') {
      statusAr = 'مكتمل';
      notifMsg = 'تهانينا! تم اكتمال تنفيذ طلبك بنجاح.';
      // إضافة منطق المحفظة عند الاكتمال
      let total = 0;
      try {
        const servicesArr = JSON.parse(order.services);
        total = servicesArr.reduce((sum:any, srv:any) => sum + (parseFloat(srv.price)||0), 0);
        console.log('servicesArr:', servicesArr, 'total:', total);
      } catch (e) { console.log('services parse error', e); }
      // زيادة رصيد المحفظة للموهبة
      if (total > 0) {
        await prisma.wallet.upsert({
          where: { userId: order.talentId },
          update: {
            balance: { increment: total },
            totalEarned: { increment: total },
          },
          create: {
            userId: order.talentId,
            balance: total,
            totalEarned: total,
            totalWithdrawn: 0,
          },
        });
      }
    } else if (status === 'rejected') {
      statusAr = 'مرفوض';
      notifMsg = 'نأسف، تم رفض طلبك من قبل الموهبة. يمكنك التواصل لمزيد من التفاصيل.';
    } else {
      notifMsg = `تم تحديث حالة طلبك إلى: ${statusAr}`;
    }
    await prisma.notification.create({
      data: {
        userId: order.clientId,
        title: 'تحديث حالة الطلب',
        body: notifMsg,
      }
    });
    return NextResponse.json(order);
  } catch (err) {
    console.error('PATCH /api/orders error:', err);
    return NextResponse.json({ message: 'خطأ في تحديث الطلب.' }, { status: 500 });
  }
}

// حذف طلب
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: 'معرّف الطلب مطلوب.' }, { status: 400 });
    }
    await prisma.talentOrder.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'تم حذف الطلب بنجاح.' });
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في حذف الطلب.' }, { status: 500 });
  }
} 