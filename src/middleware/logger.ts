import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function loggerMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  const startTime = Date.now();
  const { method, url, headers } = request;
  const userAgent = headers.get('user-agent') || 'Unknown';
  const ip = headers.get('x-forwarded-for') || 
             headers.get('x-real-ip') || 
             'Unknown';

  // تسجيل بداية الطلب
  await logger.info('Request started', {
    method,
    url,
    userAgent,
    ip,
    timestamp: new Date().toISOString()
  });

  // تسجيل الاستجابة
  const responseTime = Date.now() - startTime;
  const status = response.status;
  
  await logger.info('Request completed', {
    method,
    url,
    status,
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString()
  });

  // تسجيل الأخطاء
  if (status >= 400) {
    await logger.error('Request failed', {
      method,
      url,
      status,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }

  return response;
}

// Middleware للـ API routes
export function apiLoggerMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  const { method, url } = request;
  const startTime = Date.now();

  // تسجيل بداية طلب API
  logger.info(`API ${method} ${url} started`);

  // تسجيل انتهاء طلب API
  response.headers.set('x-response-time', `${Date.now() - startTime}ms`);
  
  logger.info(`API ${method} ${url} completed in ${Date.now() - startTime}ms`);

  return response;
}

