'use client';

import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import ThemeRegistry from '@/components/ThemeRegistry';
import PWAManager from '@/components/PWAManager';

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
