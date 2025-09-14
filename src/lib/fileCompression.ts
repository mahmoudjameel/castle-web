/**
 * مكتبة ضغط الملفات - الصور والفيديوهات
 * تقوم بضغط الملفات لتقليل حجمها قبل الرفع
 */

// ضغط الصور
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // تعيين أبعاد الكانفاس
      canvas.width = width;
      canvas.height = height;

      // رسم الصورة مع الأبعاد الجديدة
      ctx?.drawImage(img, 0, 0, width, height);

      // تحويل إلى blob مع ضغط
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('فشل في ضغط الصورة'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
    img.src = URL.createObjectURL(file);
  });
}

// ضغط الفيديوهات - محسن لـ Safari
export async function compressVideo(file: File, maxSizeMB: number = 10): Promise<File> {
  return new Promise((resolve, reject) => {
    // التحقق من دعم MediaRecorder في Safari
    if (!window.MediaRecorder) {
      console.warn('MediaRecorder غير مدعوم، سيتم إرجاع الملف الأصلي');
      resolve(file);
      return;
    }

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // إعدادات الفيديو لـ Safari
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.muted = true; // مهم لـ Safari
    video.crossOrigin = 'anonymous'; // مهم لملفات MOV
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // حساب الأبعاد الجديدة
      let { videoWidth, videoHeight } = video;
      const maxWidth = 1280; // أقصى عرض للفيديو
      
      if (videoWidth > maxWidth) {
        videoHeight = (videoHeight * maxWidth) / videoWidth;
        videoWidth = maxWidth;
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // تشغيل الفيديو مع معالجة خاصة لـ Safari
      video.play().catch(err => {
        console.error('خطأ في تشغيل الفيديو:', err);
        // محاولة تشغيل الفيديو مرة أخرى مع إعدادات مختلفة
        video.muted = true;
        video.play().catch(secondErr => {
          console.error('فشل في تشغيل الفيديو مرة أخرى:', secondErr);
          reject(new Error('فشل في تشغيل الفيديو'));
        });
      });
    };

    video.oncanplay = () => {
      try {
        // تسجيل الفيديو كصور
        const stream = canvas.captureStream(30); // 30 FPS
        
        // التحقق من دعم أنواع MIME المختلفة
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'video/webm';
            }
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 1000000, // 1 Mbps
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, `.${mimeType.split('/')[1].split(';')[0]}`), {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        };

        mediaRecorder.onerror = (event) => {
          console.error('خطأ في MediaRecorder:', event);
          reject(new Error('فشل في تسجيل الفيديو'));
        };

        // بدء التسجيل
        mediaRecorder.start();
        
        // رسم إطارات الفيديو على الكانفاس
        const drawFrame = () => {
          if (!video.paused && !video.ended) {
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          } else {
            mediaRecorder.stop();
          }
        };

        drawFrame();
      } catch (error) {
        console.error('خطأ في إنشاء MediaRecorder:', error);
        reject(new Error('فشل في إنشاء مسجل الفيديو'));
      }
    };

    video.onerror = () => reject(new Error('فشل في تحميل الفيديو'));
    video.src = URL.createObjectURL(file);
  });
}

// دالة مساعدة لضغط الملفات حسب النوع - محسنة لـ Safari
export async function compressFile(file: File): Promise<File> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // التحقق من نوع الملف
  if (fileType.startsWith('image/')) {
    // ضغط الصور
    return await compressImage(file);
  } else if (fileType.startsWith('video/') || 
             fileName.endsWith('.mov') || 
             fileName.endsWith('.avi') || 
             fileName.endsWith('.mkv') || 
             fileName.endsWith('.webm') || 
             fileName.endsWith('.3gp') || 
             fileName.endsWith('.m4v')) {
    // التحقق من دعم MediaRecorder في Safari
    if (!window.MediaRecorder) {
      console.warn('MediaRecorder غير مدعوم في هذا المتصفح، سيتم إرجاع الملف الأصلي');
      return file;
    }
    
    // ضغط الفيديوهات
    try {
      return await compressVideo(file);
    } catch (error) {
      console.error('فشل في ضغط الفيديو:', error);
      // إرجاع الملف الأصلي في حالة فشل الضغط
      return file;
    }
  } else {
    // إرجاع الملف كما هو إذا لم يكن صورة أو فيديو
    return file;
  }
}

// دالة لضغط عدة ملفات - محسنة لـ Safari
export async function compressFiles(files: File[]): Promise<File[]> {
  const compressedFiles: File[] = [];
  
  for (const file of files) {
    try {
      const compressedFile = await compressFile(file);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error('خطأ في ضغط الملف:', file.name, error);
      // إضافة الملف الأصلي في حالة فشل الضغط
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
}

// دالة للتحقق من حجم الملف
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

// دالة للتحقق من أن الملف صغير بما فيه الكفاية
export function isFileSizeAcceptable(file: File, maxSizeMB: number = 50): boolean {
  return getFileSizeMB(file) <= maxSizeMB;
}
