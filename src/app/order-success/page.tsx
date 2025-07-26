"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Assignment, Person, Schedule, CalendarToday, LocationOn } from '@mui/icons-material';
import Image from 'next/image';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(15);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [talentDetails, setTalentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationError, setNotificationError] = useState(false);

  const resendNotification = async () => {
    if (!orderDetails?.talentId || !orderDetails?.amount) return;
    
    try {
      setNotificationError(false);
      const notificationData = {
        userId: orderDetails.talentId,
        title: 'طلب جديد',
        message: `تم استلام طلب جديد من العميل بمبلغ ${orderDetails.amount} ر.س`,
        type: 'new_order',
        orderId: orderDetails.orderId
      };
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
      
      if (response.ok) {
        setNotificationSent(true);
        setNotificationError(false);
      } else {
        setNotificationError(true);
      }
    } catch (error) {
      console.error('Error resending notification:', error);
      setNotificationError(true);
    }
  };

  useEffect(() => {
    // Get order details from URL parameters
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const talentId = searchParams.get('talentId');
    const clientId = searchParams.get('clientId');
    const date = searchParams.get('date');
    const message = searchParams.get('message');
    const services = searchParams.get('services');
    const address = searchParams.get('address');

    if (orderId && amount) {
      setOrderDetails({
        orderId,
        amount: parseFloat(amount),
        talentId,
        clientId,
        date,
        message,
        services,
        address
      });

      // Confirm order creation and send notification to talent
      const confirmOrCreateOrder = async () => {
        try {
          // First, confirm the order exists in database
          const orderResponse = await fetch(`/api/orders?id=${orderId}`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            // Send notification to talent
            if (talentId) {
              const notificationData = {
                userId: talentId,
                title: 'طلب جديد',
                message: `تم استلام طلب جديد من العميل بمبلغ ${amount} ر.س`,
                type: 'new_order',
                orderId: orderId
              };
              const notificationResponse = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData)
              });
              if (notificationResponse.ok) {
                setNotificationSent(true);
                setNotificationError(false);
              } else {
                setNotificationError(true);
              }
            }
            // Fetch talent details
            if (talentId) {
              const talentResponse = await fetch(`/api/accounts?id=${talentId}`);
              if (talentResponse.ok) {
                const talentData = await talentResponse.json();
                const talent = Array.isArray(talentData) ? talentData[0] : talentData;
                setTalentDetails(talent);
              }
            }
          } else {
            // Order does not exist, create it now
            if (talentId && clientId && services) {
              const createRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  talentId,
                  clientId,
                  services: JSON.parse(services),
                  message,
                  date,
                  address
                })
              });
              if (createRes.ok) {
                setOrderDetails(await createRes.json());
                // Send notification after creation
                const notificationData = {
                  userId: talentId,
                  title: 'طلب جديد',
                  message: `تم استلام طلب جديد من العميل بمبلغ ${amount} ر.س`,
                  type: 'new_order',
                  orderId: orderId
                };
                const notificationResponse = await fetch('/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(notificationData)
                });
                if (notificationResponse.ok) {
                  setNotificationSent(true);
                  setNotificationError(false);
                } else {
                  setNotificationError(true);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error confirming or creating order:', error);
        } finally {
          setLoading(false);
        }
      };

      confirmOrCreateOrder();
    } else {
      setLoading(false);
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Assignment className="text-yellow-500 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">تم الدفع بنجاح</h1>
          <p className="text-gray-600 mb-4">لكن لم يتم العثور على تفاصيل الطلب</p>
          <p className="text-sm text-gray-500 mb-6">لا تقلق، سيتم التواصل معك قريباً لتأكيد الطلب</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">العودة للشاشة الرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            تم تأكيد الطلب بنجاح!
          </h1>
          <p className="text-gray-600">
            شكراً لك على استخدام منصة طوق للكاستينج
          </p>
        </div>

        {/* Payment Status */}
        <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl font-semibold text-lg mb-6 text-center">
          ✅ تم الدفع والتأكيد بنجاح
        </div>

        {/* Notification Status */}
        {notificationSent && (
          <div className="bg-blue-100 text-blue-800 px-6 py-4 rounded-xl mb-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              تم إرسال إشعار لصاحب الموهبة
            </div>
          </div>
        )}

        {notificationError && (
          <div className="bg-red-100 text-red-800 px-6 py-4 rounded-xl mb-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                فشل في إرسال الإشعار لصاحب الموهبة
              </div>
              <button
                onClick={resendNotification}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                إعادة إرسال الإشعار
              </button>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 text-center">تفاصيل الطلب</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-semibold text-blue-600">#{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المبلغ:</span>
                <span className="font-semibold text-green-600">{orderDetails.amount} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">التاريخ:</span>
                <span className="font-semibold">{orderDetails.date || new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            <div className="space-y-3">
              {talentDetails && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">صاحب الموهبة:</span>
                  <span className="font-semibold">{talentDetails.name}</span>
                </div>
              )}
              {orderDetails.message && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الرسالة:</span>
                  <span className="font-semibold">{orderDetails.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-indigo-50 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-indigo-800 mb-4 text-center">الخطوات التالية</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-indigo-700">
                {notificationSent ? 'تم إرسال إشعار لصاحب الموهبة' : 'جاري إرسال إشعار لصاحب الموهبة'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Schedule className="text-indigo-500" />
              <span className="text-indigo-700">سيتم التواصل معك خلال 24 ساعة</span>
            </div>
            <div className="flex items-center gap-3">
              <Person className="text-indigo-500" />
              <span className="text-indigo-700">يمكنك متابعة طلبك من لوحة التحكم</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarToday className="text-indigo-500" />
              <span className="text-indigo-700">سيتم تأكيد الموعد مع صاحب الموهبة</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {talentDetails && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-800 mb-4 text-center">معلومات التواصل</h3>
            <div className="space-y-3">
              {talentDetails.email && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-blue-700">{talentDetails.email}</span>
                </div>
              )}
              {talentDetails.workArea && (
                <div className="flex items-center gap-3">
                  <LocationOn className="text-blue-500" />
                  <span className="text-blue-700">منطقة العمل: {talentDetails.workArea}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Countdown */}
        <div className="border-t pt-6 text-center">
          <p className="text-gray-500 mb-4">
            سيتم توجيهك للشاشة الرئيسية خلال
          </p>
          <div className="text-4xl font-bold text-blue-600 mb-4">
            {countdown}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/user/orders')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              عرض طلباتي
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              العودة للشاشة الرئيسية
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/logo.png" alt="شعار طوق" width={24} height={24} />
            <span className="text-sm text-gray-500">منصة طوق للكاستينج</span>
          </div>
          <div className="text-xs text-gray-400">
            © Payment is powered by Paymob
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الصفحة...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
} 