'use client';

import { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Delete, CheckCircle, Error } from '@mui/icons-material';

export default function ClearCachePage() {
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const clearAllCache = async () => {
    setIsClearing(true);
    setResult(null);

    try {
      // تنظيف Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }

      // تنظيف Cache Storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // تنظيف Local Storage
      localStorage.clear();

      // تنظيف Session Storage
      sessionStorage.clear();

      // تنظيف الكوكيز
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // حذف الكوكي من جميع المسارات والنطاقات
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname + ";";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname + ";";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost;";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost;";
      }

      // إعادة تحميل الصفحة
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      setResult({
        type: 'success',
        message: 'تم تنظيف جميع أنواع Cache بنجاح! سيتم إعادة تحميل الصفحة...'
      });

    } catch (error) {
      setResult({
        type: 'error',
        message: 'حدث خطأ أثناء تنظيف Cache: ' + error
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default'
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          تنظيف Cache
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          هذه الصفحة تساعد في تنظيف جميع أنواع Cache من المتصفح
        </Typography>

        {result && (
          <Alert 
            severity={result.type} 
            icon={result.type === 'success' ? <CheckCircle /> : <Error />}
            sx={{ mb: 3 }}
          >
            {result.message}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={isClearing ? <CircularProgress size={20} /> : <Delete />}
          onClick={clearAllCache}
          disabled={isClearing}
          sx={{ py: 1.5 }}
        >
          {isClearing ? 'جاري التنظيف...' : 'تنظيف جميع أنواع Cache'}
        </Button>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>سيتم تنظيف:</strong>
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Service Worker Cache</li>
            <li>Browser Cache</li>
            <li>Local Storage</li>
            <li>Session Storage</li>
            <li>Application Cache</li>
            <li>Cookies</li>
          </ul>
        </Box>
      </Box>
    </Box>
  );
}
