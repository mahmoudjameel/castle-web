import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // إزالة التحقق من حجم الطلب - لا توجد قيود
  if (request.nextUrl.pathname.startsWith('/api/portfolio')) {
    // زيادة timeout للطلبات الكبيرة فقط (إذا لزم الأمر)
    if (request.method === 'POST') {
      const response = NextResponse.next();
      // إضافة headers لزيادة timeout
      response.headers.set('X-Timeout', '600000'); // 10 minutes للفيديوهات الكبيرة جداً
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/portfolio/:path*',
  ],
};
