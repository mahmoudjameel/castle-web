// حذف جميع الكوكيز تلقائياً
function clearAllCookies() {
  // الحصول على جميع الكوكيز
  const cookies = document.cookie.split(";");
  
  // حذف كل كوكي
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
  
  console.log('تم حذف جميع الكوكيز');
}

// تشغيل حذف الكوكيز عند تحميل الصفحة
if (typeof window !== 'undefined') {
  // حذف الكوكيز فوراً
  clearAllCookies();
  
  // حذف الكوكيز مرة أخرى بعد تحميل الصفحة بالكامل
  window.addEventListener('load', clearAllCookies);
  
  // حذف الكوكيز عند تغيير الصفحة
  window.addEventListener('beforeunload', clearAllCookies);
}
