import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createOrderFromPayment(data: any) {
  try {
    console.log('=== [PAYMOB CALLBACK] Creating order from payment data ===');
    console.log('Raw data:', JSON.stringify(data, null, 2));
    
    // Check for client, talent, and service data in metadata
    const metadata = data.metadata || {};
    console.log('Extracted metadata:', JSON.stringify(metadata, null, 2));
    const talentId = metadata.talentId ? Number(metadata.talentId) : null;
    const clientId = metadata.clientId ? Number(metadata.clientId) : null;
    const services = metadata.services ? JSON.parse(metadata.services) : null;
    const message = metadata.message || '';
    const date = metadata.date || null;
    const address = metadata.address || null;

    console.log('Parsed metadata:', { talentId, clientId, services, message, date, address });

    if (!talentId || !clientId || !services) {
      console.warn('Missing metadata for order creation:', metadata);
      return null;
    }

    // Check if order already exists for the same client, talent, services, and date
    const existing = await prisma.talentOrder.findFirst({
      where: {
        talentId,
        clientId,
        services: JSON.stringify(services),
        date,
      }
    });
    if (existing) {
      console.log('Order already exists, skipping creation. Order:', existing);
      return existing;
    }

    const newOrder = await prisma.talentOrder.create({
      data: {
        talentId,
        clientId,
        services: JSON.stringify(services),
        message,
        date,
        address,
      }
    });
    console.log('Order created successfully from payment callback:', newOrder);

    // إنشاء سجل العملية المالية (Transaction)
    try {
      const totalAmount = services.reduce((sum: number, service: any) => sum + Number(service.price || 0), 0);
      const tx = await prisma.transaction.create({
        data: {
          type: 'earning',
          amount: totalAmount,
          description: `دفع طلب رقم ${newOrder.id}`,
          status: 'paid',
          senderId: clientId,
          receiverId: talentId,
          orderId: newOrder.id,
        }
      });
      console.log('Transaction created for order:', tx);
    } catch (txError) {
      console.error('Error creating transaction for order:', txError);
    }

    // Send notification to talent
    try {
      const totalAmount = services.reduce((sum: number, service: any) => sum + Number(service.price || 0), 0);
      const notificationData = {
        userId: talentId,
        title: 'طلب جديد',
        message: `تم استلام طلب جديد من العميل بمبلغ ${totalAmount} ر.س`,
        type: 'new_order',
        orderId: newOrder.id
      };
      
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
      console.log('Notification sent to talent successfully');
    } catch (notificationError) {
      console.error('Error sending notification to talent:', notificationError);
    }

    return newOrder;
  } catch (e) {
    console.error('Error creating order from payment:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Paymob callback POST received:', data);

    // Check if payment was successful
    const isSuccess = data.success === true || 
                     data.success === 'true' || 
                     data.txn_response_code === 'APPROVED' ||
                     data['data.message'] === 'Approved' ||
                     data.obj?.success === true;

    if (isSuccess) {
      // Create order in database
      const order = await createOrderFromPayment(data);
      
      // Return success response to Paymob with order details
      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully',
        order: order ? {
          orderId: order.id,
          amount: data.amount_cents ? Number(data.amount_cents) / 100 : 0,
          talentId: order.talentId,
          clientId: order.clientId,
          date: order.date,
          message: order.message
        } : null
      });
    } else {
      // Payment failed
      console.log('Payment failed:', data);
      return NextResponse.json({ 
        success: false, 
        message: 'Payment failed' 
      });
    }

  } catch (error) {
    console.error('Paymob callback POST error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing callback' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const data = Object.fromEntries(searchParams.entries());
    
    console.log('Paymob callback GET received:', data);

    // Check if payment was successful
    const isSuccess = data.success === 'true' || 
                     data.txn_response_code === 'APPROVED' ||
                     data['data.message'] === 'Approved';

    if (isSuccess) {
      // Create order in database
      const order = await createOrderFromPayment(data);
      
      if (order) {
        // Redirect to order success page with order details
        const orderDetails = {
          orderId: order.id.toString(),
          amount: (data.amount_cents ? Number(data.amount_cents) / 100 : 0).toString(),
          talentId: order.talentId.toString(),
          clientId: order.clientId.toString(),
          date: order.date || '',
          message: order.message || ''
        };
        const params = new URLSearchParams(orderDetails);
        return NextResponse.redirect(new URL(`/order-success?${params.toString()}`, req.url));
      } else {
        // Redirect to payment success page without order details
        return NextResponse.redirect(new URL('/payment-success', req.url));
      }
    } else {
      // Redirect to failure page
      const errorMessage = data.error || data['data.message'] || 'حدث خطأ أثناء عملية الدفع';
      return NextResponse.redirect(new URL(`/payment-failed?error=${encodeURIComponent(errorMessage)}`, req.url));
    }

  } catch (error) {
    console.error('Paymob callback GET error:', error);
    return NextResponse.redirect(new URL('/payment-failed?error=خطأ في معالجة استجابة الدفع', req.url));
  }
} 