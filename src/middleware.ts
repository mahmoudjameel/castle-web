import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // التحقق من معاملات الدفع في URL
  const success = searchParams.get('success');
  const txn_response_code = searchParams.get('txn_response_code');
  const data_message = searchParams.get('data.message');
  const error = searchParams.get('error');
  
  // إذا كانت هناك معاملات دفع، توجيه للصفحات المناسبة
  if (success === 'true' || txn_response_code === 'APPROVED' || data_message === 'Approved') {
    console.log('Payment success detected in middleware, redirecting to success page');
    return NextResponse.redirect(new URL('/payment-success', request.url));
  } else if (success === 'false' || error) {
    console.log('Payment failure detected in middleware, redirecting to failed page');
    return NextResponse.redirect(new URL(`/payment-failed?error=${encodeURIComponent(error || 'فشلت عملية الدفع')}`, request.url));
  }
  
  // التحقق من cookies الدفع
  const paymentStatus = request.cookies.get('payment_status')?.value;
  const paymentResult = request.cookies.get('payment_result')?.value;
  
  if (paymentStatus === 'completed') {
    if (paymentResult === 'success') {
      console.log('Payment success detected in cookies, redirecting to success page');
      const response = NextResponse.redirect(new URL('/payment-success', request.url));
      // حذف cookies بعد التوجيه
      response.cookies.delete('payment_status');
      response.cookies.delete('payment_result');
      response.cookies.delete('payment_data');
      return response;
    } else if (paymentResult === 'failed') {
      console.log('Payment failure detected in cookies, redirecting to failed page');
      const response = NextResponse.redirect(new URL('/payment-failed?error=فشلت عملية الدفع', request.url));
      // حذف cookies بعد التوجيه
      response.cookies.delete('payment_status');
      response.cookies.delete('payment_result');
      response.cookies.delete('payment_data');
      return response;
    }
  }

  // حماية الصفحات حسب دور المستخدم
  const userRole = request.cookies.get('user_role')?.value;
  const isLoggedIn = request.cookies.get('user_id')?.value;

  // الصفحات المحمية للمدير فقط
  const adminProtectedPaths = [
    '/admin',
    '/admin/accounts',
    '/admin/categories',
    '/admin/orders',
    '/admin/invoices',
    '/admin/withdrawals',
    '/admin/reports',
    '/admin/banners'
  ];

  // الصفحات المحمية لصاحب الموهبة فقط
  const talentProtectedPaths = [
    '/talent',
    '/talent/profile',
    '/talent/portfolio',
    '/talent/services',
    '/talent/schedule',
    '/talent/bookings',
    '/talent/chats',
    '/talent/notifications',
    '/talent/wallet'
  ];

  // الصفحات المحمية للمستخدم العادي فقط
  const userProtectedPaths = [
    '/user',
    '/user/profile',
    '/user/orders',
    '/user/invoices',
    '/user/chats',
    '/user/notifications',
    '/user/reports'
  ];

  // التحقق من الصفحات المحمية للمدير
  if (adminProtectedPaths.some(path => pathname.startsWith(path))) {
    if (!isLoggedIn || userRole !== 'admin') {
      console.log('Unauthorized access to admin page, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // التحقق من الصفحات المحمية لصاحب الموهبة
  if (talentProtectedPaths.some(path => pathname.startsWith(path))) {
    if (!isLoggedIn || userRole !== 'talent') {
      console.log('Unauthorized access to talent page, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // التحقق من الصفحات المحمية للمستخدم العادي
  if (userProtectedPaths.some(path => pathname.startsWith(path))) {
    if (!isLoggedIn || userRole !== 'user') {
      console.log('Unauthorized access to user page, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 