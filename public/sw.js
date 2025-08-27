const CACHE_NAME = 'toq-app-v2';
const urlsToCache = [
  '/',
  '/user',
  '/user/notifications',
  '/talent',
  '/talent/notifications',
  '/admin',
  '/logo.png',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
  // تفعيل Service Worker فوراً
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // السيطرة على الصفحات فوراً
  event.waitUntil(clients.claim());
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات POST
  if (event.request.method === 'POST') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع الملف من الكاش إذا كان موجوداً
        if (response) {
          return response;
        }
        
        // محاولة جلب الملف من الشبكة
        return fetch(event.request).then((response) => {
          // التحقق من أن الاستجابة صالحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // نسخ الاستجابة للكاش
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // في حالة فشل الشبكة، إرجاع صفحة offline
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// استقبال الإشعارات
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من منصة طوق',
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض',
        icon: '/logo.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('طوق - إشعار جديد', options)
  );
});

// التعامل مع النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    // فتح التطبيق عند النقر على "عرض"
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // إغلاق الإشعار
    event.notification.close();
  } else {
    // النقر على الإشعار نفسه
    event.waitUntil(
      clients.openWindow('/user/notifications')
    );
  }
});

// استقبال الرسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
