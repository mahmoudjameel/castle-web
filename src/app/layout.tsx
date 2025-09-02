'use client';

import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import ThemeRegistry from '@/components/ThemeRegistry';

import Head from 'next/head';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // تحديد اللغة من localStorage أو الافتراضية
  const lang = typeof window !== 'undefined' ? localStorage.getItem('lang') || 'ar' : 'ar';
  // تحميل الرسائل حسب اللغة
  let messages = {};
  try {
    messages = require(`../messages/${lang}.json`);
  } catch {
    messages = require('../messages/ar.json');
  }
  // تغيير اتجاه الصفحة حسب اللغة
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <meta name="description" content="منصة رقمية متكاملة للكاستينج وإدارة المواهب" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/Logo.jpg" />
        
        {/* منع Cache */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* حذف الكوكيز تلقائياً */}
        <script src="/clear-cookies.js"></script>
      </head>
      <body>
        <ThemeRegistry>
          <NextIntlClientProvider messages={messages} locale={lang} timeZone="Asia/Riyadh">
            {children}
          </NextIntlClientProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
