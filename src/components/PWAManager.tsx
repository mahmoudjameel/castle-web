'use client';

import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Download, Notifications, NotificationsOff, Close, CheckCircle } from '@mui/icons-material';

interface PWAManagerProps {
  children: React.ReactNode;
}

const PWAManager: React.FC<PWAManagerProps> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [notificationsActivated, setNotificationsActivated] = useState(false);

  useEffect(() => {
    // التحقق من تثبيت التطبيق
    const checkInstallation = () => {
      // التحقق من عدة طرق للتثبيت
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInApp = window.navigator.userAgent.includes('wv'); // WebView
      
      if (isStandalone || isIOSStandalone || isInApp) {
        console.log('App is installed/standalone');
        setIsInstalled(true);
      } else {
        console.log('App is not installed');
        setIsInstalled(false);
      }
    };

    // التحقق من نوع الجهاز (إخفاء على الأجهزة المكتبية)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      console.log('Desktop device detected, hiding PWA buttons');
      setIsInstalled(true); // إخفاء الأزرار على الأجهزة المكتبية
    }

    checkInstallation();

    // استقبال حدث تثبيت التطبيق
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setInstallError(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // التحقق من حالة الإشعارات
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationPermission(permission);
      // إذا كانت الإشعارات مفعلة، أخف زر "إشعار تجريبي"
      if (permission === 'granted') {
        setNotificationsActivated(true);
      }
    }

    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('SW registered successfully: ', registration);
          setSwRegistration(registration);
          
          // التحقق من تحديثات Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New SW installed, prompting for update');
                  // يمكن إضافة منطق لتحديث التطبيق
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError);
        });
    }

    // تنظيف عند إلغاء المكون
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // تثبيت التطبيق
  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      setInstallError('لا يمكن تثبيت التطبيق في الوقت الحالي');
      return;
    }

    try {
      console.log('Prompting for install...');
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallPrompt(false);
        // إعادة التحقق من التثبيت بعد فترة
        setTimeout(() => {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
          const isIOSStandalone = (window.navigator as any).standalone === true;
          if (isStandalone || isIOSStandalone) {
            setIsInstalled(true);
          }
        }, 2000);
      } else {
        console.log('User dismissed the install prompt');
        setInstallError('تم رفض تثبيت التطبيق');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install:', error);
      setInstallError('حدث خطأ أثناء التثبيت');
    }
  };

  // طلب إذن الإشعارات
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        setShowNotificationPrompt(false);
        
        if (permission === 'granted' && swRegistration) {
          // طلب subscription للإشعارات
          const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
          });
          
          // إرسال subscription للخادم
          await fetch('/api/push-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription })
          });
          
          // إخفاء زر "إشعار تجريبي" وإظهار رسالة النجاح
          setNotificationsActivated(true);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  // تحويل VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // إرسال إشعار تجريبي
  const sendTestNotification = async () => {
    if (notificationPermission === 'granted' && swRegistration) {
      try {
        await swRegistration.showNotification('إشعار تجريبي', {
          body: 'هذا إشعار تجريبي من منصة طوق',
          icon: '/logo.png',
          badge: '/logo.png'
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  return (
    <>
      {children}
      
      {/* نافذة تثبيت التطبيق */}
      <Dialog open={showInstallPrompt && !isInstalled} onClose={() => setShowInstallPrompt(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Download color="primary" />
            تثبيت تطبيق طوق
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            قم بتثبيت تطبيق طوق على جهازك للحصول على تجربة أفضل وأسرع
          </Typography>
          {installError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {installError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstallPrompt(false)} color="inherit">
            لاحقاً
          </Button>
          <Button onClick={handleInstallApp} variant="contained" color="primary">
            تثبيت التطبيق
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة طلب إذن الإشعارات */}
      <Dialog open={showNotificationPrompt} onClose={() => setShowNotificationPrompt(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Notifications color="primary" />
            تفعيل الإشعارات
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            فعّل الإشعارات لتلقي تنبيهات فورية عن الطلبات الجديدة والتحديثات المهمة
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotificationPrompt(false)} color="inherit">
            لاحقاً
          </Button>
          <Button onClick={requestNotificationPermission} variant="contained" color="primary">
            تفعيل الإشعارات
          </Button>
        </DialogActions>
      </Dialog>

      {/* أزرار PWA - تظهر فقط على الهواتف */}
      {!isInstalled && typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
        <Box
          position="fixed"
          bottom={20}
          left={20}
          zIndex={1000}
          display="flex"
          flexDirection="column"
          gap={1}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={() => setShowInstallPrompt(true)}
            sx={{ borderRadius: 2, boxShadow: 3 }}
          >
            تثبيت التطبيق
          </Button>
          
          {notificationPermission !== 'granted' && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={notificationPermission === 'denied' ? <NotificationsOff /> : <Notifications />}
              onClick={() => setShowNotificationPrompt(true)}
              sx={{ borderRadius: 2 }}
            >
              {notificationPermission === 'denied' ? 'إعادة تفعيل الإشعارات' : 'تفعيل الإشعارات'}
            </Button>
          )}
          
          {/* إظهار رسالة نجاح بدلاً من زر "إشعار تجريبي" */}
          {notificationsActivated && (
            <Box
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                fontWeight: 'medium'
              }}
            >
              <CheckCircle fontSize="small" />
              تم تفعيل الإشعارات بنجاح!
            </Box>
          )}
        </Box>
      )}

      {/* رسائل الحالة */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" icon={<Notifications />}>
          تم تفعيل الإشعارات بنجاح!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAManager;
