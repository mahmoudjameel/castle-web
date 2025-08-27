'use client';

import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import ThemeRegistry from '@/components/ThemeRegistry';
import PWAManager from '@/components/PWAManager';
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
        {/* PWA Meta Tags */}
        <meta name="application-name" content="طوق منصة الكاستينج" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="طوق منصة الكاستينج" />
        <meta name="description" content="منصة رقمية متكاملة للكاستينج وإدارة المواهب" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#f59e0b" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/Logo.jpg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/Logo.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Logo.jpg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/Logo.jpg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/Logo.jpg" />
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/Logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/Logo.jpg" color="#f59e0b" />
        <link rel="shortcut icon" href="/Logo.jpg" />

        {/* iOS Specific */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* iOS Splash Screen */}
        <link rel="apple-touch-startup-image" href="/Logo.jpg" />
        
        {/* Prevent zoom on iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* iOS Safari specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeRegistry>
          <NextIntlClientProvider messages={messages} locale={lang} timeZone="Asia/Riyadh">
            <PWAManager>
              {children}
            </PWAManager>
          </NextIntlClientProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
