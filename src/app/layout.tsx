'use client';

import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';

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
        <NextIntlClientProvider messages={messages} locale={lang} timeZone="Asia/Riyadh">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
