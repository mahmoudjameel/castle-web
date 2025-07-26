'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Error } from '@mui/icons-material';

export default function PaymentFailed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const errorMessage = searchParams.get('error') || 'حدث خطأ أثناء عملية الدفع';

  useEffect(() => {
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
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Error className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            فشلت عملية الدفع
          </h1>
          <p className="text-gray-600 mb-4">
            {errorMessage}
          </p>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
            Failed
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <p className="text-gray-500">
            سيتم توجيهك للشاشة الرئيسية خلال
          </p>
          <div className="text-3xl font-bold text-red-600 mb-4">
            {countdown}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex-1"
            >
              المحاولة مرة أخرى
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex-1"
            >
              العودة للشاشة الرئيسية
            </button>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          © Payment is powered by Paymob
        </div>
      </div>
    </div>
  );
} 