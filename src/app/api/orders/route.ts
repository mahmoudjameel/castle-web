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
        status: 'pending'
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
    const { id, status, userConfirmed } = await req.json();
    if (!id || (!status && typeof userConfirmed === 'undefined')) {
      return NextResponse.json({ message: 'id و status أو userConfirmed مطلوبان.' }, { status: 400 });
    }
    // إذا كان الطلب هو تأكيد المستخدم
    if (typeof userConfirmed === 'boolean') {
      // اجلب الطلب الحالي
      const order = await prisma.talentOrder.findUnique({ where: { id: Number(id) } });
      if (!order) return NextResponse.json({ message: 'الطلب غير موجود.' }, { status: 404 });
      // إذا وافق المستخدم على الاكتمال
      if (userConfirmed) {
        // حدث الطلب: userConfirmed=true, status='completed'
        const updatedOrder = await prisma.talentOrder.update({
          where: { id: Number(id) },
          data: { userConfirmed: true, status: 'completed' },
        });
        // منطق المحفظة والإشعار كما في السابق
        let notifMsg = 'تهانينا! تم اكتمال تنفيذ طلبك بنجاح.';
        let total = 0;
        try {
          const servicesArr = JSON.parse(order.services);
          total = servicesArr.reduce((sum:any, srv:any) => sum + (parseFloat(srv.price)||0), 0);
        } catch {}
        if (total > 0) {
          let commissionRate = 10;
          try {
            const setting = await prisma.settings.findUnique({ where: { key: 'commissionRate' } });
            commissionRate = setting ? Number(setting.value) : 10;
          } catch {}
          const commission = Math.round((total * commissionRate) / 100);
          const net = total - commission;
          await prisma.wallet.upsert({
            where: { userId: order.talentId },
            update: {
              balance: { increment: net },
              totalEarned: { increment: net },
            },
            create: {
              userId: order.talentId,
              balance: net,
              totalEarned: net,
              totalWithdrawn: 0,
            },
          });
        }
        await prisma.notification.create({
          data: {
            userId: order.clientId,
            title: 'تحديث حالة الطلب',
            body: notifMsg,
            date: new Date(),
          }
        });
        return NextResponse.json(updatedOrder);
      } else {
        // فقط حدث userConfirmed=false
        const updatedOrder = await prisma.talentOrder.update({
          where: { id: Number(id) },
          data: { userConfirmed: false },
        });
        return NextResponse.json(updatedOrder);
      }
    }
    // منطق تغيير الحالة
    if (status === 'completed') {
      // اجلب الطلب الحالي
      const order = await prisma.talentOrder.findUnique({ where: { id: Number(id) } });
      if (!order) return NextResponse.json({ message: 'الطلب غير موجود.' }, { status: 404 });
      // إذا لم يؤكد المستخدم بعد، لا تكمل الطلب
      if (!order.userConfirmed) {
        // حدث الحالة إلى 'awaiting_user_confirmation'
        const updatedOrder = await prisma.talentOrder.update({
          where: { id: Number(id) },
          data: { status: 'awaiting_user_confirmation' },
        });
        // إشعار للمستخدم
        await prisma.notification.create({
          data: {
            userId: order.clientId,
            title: 'تأكيد اكتمال الطلب',
            body: 'يرجى تأكيد اكتمال الطلب حتى يتم إنهاؤه بشكل رسمي.',
            date: new Date(),
          }
        });
        return NextResponse.json(updatedOrder);
      }
      // إذا كان userConfirmed=true، أكمل الطلب (منطق المحفظة ... الخ كما في السابق)
      // (لن يصل غالباً لهذا الفرع إلا في حالة خاصة)
    }
    // باقي الحالات كما هي
    const order = await prisma.talentOrder.update({
      where: { id: Number(id) },
      data: { status },
    });
    // إشعار الحالة
    let statusAr = '';
    let notifMsg = '';
    if (status === 'new') {
      statusAr = 'جديد';
      notifMsg = 'تم إعادة تعيين حالة طلبك إلى جديد. سيتم التواصل معك قريبًا.';
    } else if (status === 'in_progress') {
      statusAr = 'قيد التنفيذ';
      notifMsg = 'تم قبول طلبك وهو الآن قيد التنفيذ من قبل الموهبة.';
    } else if (status === 'awaiting_user_confirmation') {
      statusAr = 'بانتظار موافقة المستخدم';
      notifMsg = 'يرجى تأكيد اكتمال الطلب حتى يتم إنهاؤه بشكل رسمي.';
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
        date: new Date(),
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