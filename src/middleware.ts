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