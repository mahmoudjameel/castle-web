/**
 * مكتبة دعم Safari - Safari Support Library
 * للتحقق من دعم الميزات في Safari على iPhone
 */

// التحقق من نوع المتصفح
export function isSafari(): boolean {
  const userAgent = navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/Edge/.test(userAgent);
}

// التحقق من Safari على iPhone
export function isSafariOniPhone(): boolean {
  const userAgent = navigator.userAgent;
  return /iPhone/.test(userAgent) && isSafari();
}

// التحقق من دعم MediaRecorder
export function supportsMediaRecorder(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window;
}

// التحقق من دعم أنواع MIME للفيديو
export function getSupportedVideoMimeTypes(): string[] {
  if (!supportsMediaRecorder()) return [];
  
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  
  return mimeTypes.filter(type => MediaRecorder.isTypeSupported(type));
}

// التحقق من دعم Canvas
export function supportsCanvas(): boolean {
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext && canvas.getContext('2d'));
}

// التحقق من دعم FileReader
export function supportsFileReader(): boolean {
  return typeof window !== 'undefined' && 'FileReader' in window;
}

// التحقق من دعم جميع الميزات المطلوبة
export function supportsAllFeatures(): boolean {
  return supportsMediaRecorder() && supportsCanvas() && supportsFileReader();
}

// الحصول على معلومات المتصفح
export function getBrowserInfo(): {
  isSafari: boolean;
  isSafariOniPhone: boolean;
  supportsMediaRecorder: boolean;
  supportsCanvas: boolean;
  supportsFileReader: boolean;
  supportedVideoMimeTypes: string[];
  userAgent: string;
} {
  return {
    isSafari: isSafari(),
    isSafariOniPhone: isSafariOniPhone(),
    supportsMediaRecorder: supportsMediaRecorder(),
    supportsCanvas: supportsCanvas(),
    supportsFileReader: supportsFileReader(),
    supportedVideoMimeTypes: getSupportedVideoMimeTypes(),
    userAgent: navigator.userAgent
  };
}

// طباعة معلومات المتصفح في وحدة التحكم
export function logBrowserInfo(): void {
  const info = getBrowserInfo();
  console.log('معلومات المتصفح:', info);
  
  if (info.isSafariOniPhone) {
    console.log('تم اكتشاف Safari على iPhone');
    if (!info.supportsMediaRecorder) {
      console.warn('MediaRecorder غير مدعوم في هذا الإصدار من Safari');
    }
  }
}
