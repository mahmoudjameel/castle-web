// تنظيف Service Worker Cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// تنظيف Cache Storage
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
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

console.log('تم تنظيف جميع أنواع Cache والكوكيز');
