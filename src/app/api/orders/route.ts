import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const talentId = searchParams.get('talentId');
    const clientId = searchParams.get('clientId');

    if (id) {
      // Get specific order by ID
      const order = await prisma.talentOrder.findUnique({
        where: { id: Number(id) },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              jobTitle: true
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
      }

      return NextResponse.json(order);
    }

    // Build where clause based on parameters
    const where: any = {};
    if (talentId) where.talentId = Number(talentId);
    if (clientId) where.clientId = Number(clientId);

    // Get orders with filters
    const orders = await prisma.talentOrder.findMany({
      where,
      include: {
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'خطأ في جلب الطلبات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { talentId, clientId, services, message, date, address } = body;

    if (!talentId || !clientId || !services) {
      return NextResponse.json({ error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    const order = await prisma.talentOrder.create({
      data: {
        talentId: Number(talentId),
        clientId: Number(clientId),
        services: JSON.stringify(services),
        message: message || '',
        date: date || null,
        address: address || null,
      },
      include: {
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء الطلب' }, { status: 500 });
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
  } catch  {
    return NextResponse.json({ message: 'خطأ في حذف الطلب.' }, { status: 500 });
  }
} 