'use client';

import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Download, Notifications, NotificationsOff, Close, CheckCircle, Info, Apple, Android } from '@mui/icons-material';

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
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // تحديد نوع الجهاز
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroidDevice = /Android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    if (!isMobile) {
      console.log('Desktop device detected, hiding PWA buttons');
      setIsInstalled(true); // إخفاء الأزرار على الأجهزة المكتبية
    }

    checkInstallation();

    // استقبال حدث تثبيت التطبيق (Android فقط)
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setInstallError(null);
    };

    // iOS لا يدعم beforeinstallprompt - لا نضيف المستمع له
    if (!isIOSDevice) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    } else {
      console.log('iOS device detected - beforeinstallprompt not supported');
      // على iOS، لا نحتاج deferredPrompt
      setDeferredPrompt(null);
    }

    // التحقق من حالة الإشعارات
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationPermission(permission);
      // إذا كانت الإشعارات مفعلة، أخف زر "إشعار تجريبي"
      if (permission === 'granted') {
        setNotificationsActivated(true);
      }
    }

    // مراقبة تغيير حالة الإشعارات
    const handleNotificationPermissionChange = () => {
      if ('Notification' in window) {
        const currentPermission = Notification.permission;
        setNotificationPermission(currentPermission);
        if (currentPermission === 'granted') {
          setNotificationsActivated(true);
        }
      }
    };

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

    // إضافة مستمع لتغيير حالة التطبيق
    const handleDisplayModeChange = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInApp = window.navigator.userAgent.includes('wv');
      
      if (isStandalone || isIOSStandalone || isInApp) {
        console.log('App became standalone/installed');
        setIsInstalled(true);
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    };

    // مراقبة تغيير وضع العرض
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // مراقبة تغيير حالة الإشعارات
    if ('Notification' in window) {
      // مراقبة تغيير الإذن
      const checkPermission = () => {
        const permission = Notification.permission;
        setNotificationPermission(permission);
        if (permission === 'granted') {
          setNotificationsActivated(true);
        }
      };
      
      // فحص كل 2 ثانية للتأكد من حالة الإشعارات
      const permissionInterval = setInterval(checkPermission, 2000);
      
      // تنظيف عند إلغاء المكون
      return () => {
        if (!isIOSDevice) {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
        clearInterval(permissionInterval);
      };
    } else {
      // تنظيف عند إلغاء المكون
      return () => {
        if (!isIOSDevice) {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      };
    }
  }, []);

  // تثبيت التطبيق
  const handleInstallApp = async () => {
    if (isIOS) {
      // على iOS، نعرض تعليمات التثبيت مباشرة
      setShowIOSInstructions(true);
      return;
    }

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
        setDeferredPrompt(null);
        
        // إخفاء الزر فوراً
        setIsInstalled(true);
        
        // إعادة التحقق من التثبيت بعد فترة للتأكد
        setTimeout(() => {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
          const isIOSStandalone = (window.navigator as any).standalone === true;
          if (isStandalone || isIOSStandalone) {
            console.log('Installation confirmed');
          }
        }, 2000);
      } else {
        console.log('User dismissed the install prompt');
        setInstallError('تم رفض تثبيت التطبيق');
      }
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
          // على iOS، لا نستطيع استخدام Push API
          if (!isIOS) {
            try {
              // طلب subscription للإشعارات (Android فقط)
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
            } catch (error) {
              console.log('Push subscription not supported on this device');
            }
          }
          
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
          icon: '/Logo.jpg',
          badge: '/Logo.jpg'
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

      {/* نافذة تعليمات iOS */}
      <Dialog open={showIOSInstructions} onClose={() => setShowIOSInstructions(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Apple color="primary" />
            تثبيت التطبيق على iPhone/iPad
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            اتبع هذه الخطوات:
          </Typography>
          <Box component="ol" sx={{ pl: 2, mt: 2 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>اضغط على زر <Chip label="شارك" size="small" color="primary" /> في المتصفح (أسفل الشاشة)</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>اختر <Chip label="أضف إلى الشاشة الرئيسية" size="small" color="secondary" /></Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>اضغط <Chip label="إضافة" size="small" color="success" /></Typography>
            </Box>
            <Box component="li">
              <Typography>سيظهر التطبيق في الشاشة الرئيسية</Typography>
            </Box>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>ملاحظة:</strong> على iOS، يجب إضافة التطبيق للشاشة الرئيسية يدوياً من خلال زر المشاركة. هذا هو الطريقة الوحيدة المتاحة.
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>مميزات التطبيق:</strong> بعد التثبيت، ستحصل على تجربة أسرع وأفضل مع إمكانية الوصول السريع من الشاشة الرئيسية.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIOSInstructions(false)} variant="contained" color="primary">
            فهمت
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
          {isIOS && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>iOS:</strong> الإشعارات تعمل فقط عند فتح التطبيق من الشاشة الرئيسية
              </Typography>
            </Alert>
          )}
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
          {/* زر تثبيت التطبيق */}
          <Button
            variant="contained"
            color="primary"
            startIcon={isIOS ? <Apple /> : <Download />}
            onClick={() => {
              if (isIOS) {
                setShowIOSInstructions(true);
              } else {
                setShowInstallPrompt(true);
              }
            }}
            sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              background: isIOS ? 'linear-gradient(45deg, #007AFF 30%, #5856D6 90%)' : undefined
            }}
          >
            {isIOS ? 'إضافة للشاشة الرئيسية' : 'تثبيت التطبيق'}
          </Button>
          
          {/* زر تفعيل الإشعارات */}
          {notificationPermission !== 'granted' && !notificationsActivated && (
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
          
          {/* رسالة نجاح - مخفية من الشاشة الرئيسية */}
          {/* {notificationsActivated && (
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
          )} */}

          {/* معلومات الجهاز */}
          <Box
            sx={{
              bgcolor: 'info.main',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.75rem',
              opacity: 0.8
            }}
          >
            {isIOS ? <Apple fontSize="small" /> : <Android fontSize="small" />}
            {isIOS ? 'iPhone/iPad' : 'Android'}
          </Box>
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
