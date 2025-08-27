'use client';

import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Download, Notifications, NotificationsOff, Close } from '@mui/icons-material';

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

  useEffect(() => {
    // التحقق من تثبيت التطبيق
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    // التحقق من نوع الجهاز (إخفاء على الأجهزة المكتبية)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      setIsInstalled(true); // إخفاء الأزرار على الأجهزة المكتبية
    }

    checkInstallation();

    // استقبال حدث تثبيت التطبيق
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    // التحقق من حالة الإشعارات
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          setSwRegistration(registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // تثبيت التطبيق
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
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
          
          // إظهار رسالة النجاح وإخفاؤها بعد 3 ثواني
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
          
          {notificationPermission === 'granted' && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<Notifications />}
              onClick={sendTestNotification}
              sx={{ borderRadius: 2 }}
            >
              إشعار تجريبي
            </Button>
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
