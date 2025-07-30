'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Assignment, Person, Schedule } from '@mui/icons-material';
import Image from 'next/image';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationError, setNotificationError] = useState(false);

  useEffect(() => {
    // Get order details from URL params first, then localStorage as fallback
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const talentId = searchParams.get('talentId') || localStorage.getItem('pendingOrder_talentId');
    const clientId = searchParams.get('clientId') || localStorage.getItem('pendingOrder_clientId');
    const date = searchParams.get('date') || localStorage.getItem('pendingOrder_date');
    const message = searchParams.get('message') || localStorage.getItem('pendingOrder_message');
    const services = searchParams.get('services') || localStorage.getItem('pendingOrder_services');
    const address = searchParams.get('address') || localStorage.getItem('pendingOrder_address');

    console.log('Order details from URL:', { orderId, amount, talentId, clientId, date, message, services, address });
    console.log('Order details from localStorage:', {
      talentId: localStorage.getItem('pendingOrder_talentId'),
      clientId: localStorage.getItem('pendingOrder_clientId'),
      date: localStorage.getItem('pendingOrder_date'),
      message: localStorage.getItem('pendingOrder_message'),
      services: localStorage.getItem('pendingOrder_services'),
      address: localStorage.getItem('pendingOrder_address')
    });

    const confirmOrCreateOrder = async () => {
      setLoading(true);
      let found = false;
      
      // First try to find existing order by orderId
      if (orderId) {
        try {
          const orderRes = await fetch(`/api/orders?id=${orderId}`);
          if (orderRes.ok) {
            const order = await orderRes.json();
            setOrderDetails(order);
            found = true;
            console.log('Found existing order:', order);
          }
        } catch (error) {
          console.error('Error fetching existing order:', error);
        }
      }
      
      // If no existing order found, create new order with details from URL or localStorage
      if (!found && talentId && clientId && services) {
        try {
          const servicesData = typeof services === 'string' ? JSON.parse(services) : services;
          const createRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              talentId: Number(talentId),
              clientId: Number(clientId),
              services: servicesData,
              message: message || '',
              date: date || null,
              address: address || null
            })
          });
          
          if (createRes.ok) {
            const order = await createRes.json();
            setOrderDetails(order);
            console.log('Created new order:', order);
          } else {
            console.error('Failed to create order:', await createRes.text());
          }
        } catch (error) {
          console.error('Error creating order:', error);
        }
      }
      
      setOrderConfirmed(true);
      setLoading(false);
      
      // Clean up localStorage after order is confirmed/created
      const clearPendingOrderData = () => {
        localStorage.removeItem('pendingOrder_talentId');
        localStorage.removeItem('pendingOrder_clientId');
        localStorage.removeItem('pendingOrder_date');
        localStorage.removeItem('pendingOrder_message');
        localStorage.removeItem('pendingOrder_services');
        localStorage.removeItem('pendingOrder_address');
      };
      clearPendingOrderData();
      
      // إذا لم تكن هناك تفاصيل كافية لإنشاء الطلب، نظف localStorage أيضاً
      if (!talentId || !clientId || !services) {
        console.warn('Insufficient order details, cleaning localStorage');
        clearPendingOrderData();
      }
    };

    confirmOrCreateOrder();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, searchParams]);

  useEffect(() => {
    if (orderConfirmed && orderDetails && orderDetails.talentId) {
      // إنشاء الفاتورة مباشرة في بيئة التطوير فقط
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || process.env.NODE_ENV !== 'production')) {
        const createInvoice = async () => {
          try {
            const servicesArr = orderDetails.services ? JSON.parse(orderDetails.services) : [];
            const totalAmount = servicesArr.reduce((sum, s) => sum + Number(s.price || 0), 0);
            const res = await fetch('/api/invoices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                talentId: orderDetails.talentId,
                clientId: orderDetails.clientId,
                services: servicesArr,
                amount: totalAmount,
                orderId: orderDetails.id,
                message: orderDetails.message || ''
              })
            });
            if (res.ok) {
              console.log('تم إنشاء الفاتورة مباشرة من الواجهة (تجريبيًا)');
            } else {
              console.error('فشل في إنشاء الفاتورة:', await res.text());
            }
          } catch (err) {
            console.error('خطأ في إنشاء الفاتورة:', err);
          }
        };
        createInvoice();
      }
      const sendNotification = async () => {
        try {
          const totalAmount = orderDetails.services 
            ? JSON.parse(orderDetails.services).reduce((sum: number, s: any) => sum + Number(s.price || 0), 0)
            : 0;
          
          const notificationData = {
            userId: orderDetails.talentId,
            title: 'طلب جديد',
            message: `تم استلام طلب جديد من العميل بمبلغ ${totalAmount} ر.س`,
            type: 'new_order',
            orderId: orderDetails.id
          };
          
          const res = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData)
          });
          
          if (res.ok) {
            setNotificationSent(true);
            console.log('Notification sent successfully to talent');
          } else {
            setNotificationError(true);
            console.error('Failed to send notification:', await res.text());
          }
        } catch (error) {
          setNotificationError(true);
          console.error('Error sending notification:', error);
        }
      };
      
      sendNotification();
    }
  }, [orderConfirmed, orderDetails]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">تم الدفع بنجاح!</h1>
          <p className="text-gray-600 mb-4">شكراً لك على استخدام خدمة الدفع الإلكتروني</p>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-lg">Approved - تمت الموافقة على الدفع</div>
        </div>

        {loading ? (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-4">جاري تأكيد الطلب...</div>
        ) : orderDetails ? (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-4">تم تأكيد الطلب بنجاح - سيتم التواصل معك قريباً</div>
        ) : (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg mb-4">تم الدفع بنجاح - سيتم التواصل معك قريباً</div>
        )}

        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-indigo-800 mb-3">الخطوات التالية:</h3>
          <div className="space-y-2 text-sm text-indigo-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-indigo-700">
                {notificationSent ? 'تم إرسال إشعار لصاحب الموهبة' : notificationError ? 'فشل في إرسال الإشعار' : 'جاري إرسال إشعار لصاحب الموهبة'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Schedule className="text-indigo-500" />
              <span>سيتم التواصل معك خلال 24 ساعة</span>
            </div>
            <div className="flex items-center gap-2">
              <Person className="text-indigo-500" />
              <span>يمكنك متابعة طلبك من لوحة التحكم</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-gray-500 mb-4">سيتم توجيهك للشاشة الرئيسية خلال</p>
          <div className="text-3xl font-bold text-blue-600 mb-4">{countdown}</div>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">العودة للشاشة الرئيسية الآن</button>
        </div>

        <div className="mt-6 text-xs text-gray-400">© Payment is powered by Paymob</div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 