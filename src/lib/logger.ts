// Browser-safe logger with Node.js fallbacks
let fs: any = null;
let path: any = null;

// Check if we're in a Node.js environment
if (typeof window === 'undefined') {
  try {
    fs = require('fs');
    path = require('path');
  } catch (error) {
    console.warn('Node.js modules not available');
  }
}

// أنواع الـ logs
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// تكوين الـ logger
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDir: string;
  maxFileSize: number; // بالبايت
  maxFiles: number;
}

// الـ config الافتراضي
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  logDir: 'logs',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10
};

class Logger {
  private config: LoggerConfig;
  private logQueue: string[] = [];
  private isWriting = false;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    // Only ensure log directory if we're in Node.js environment
    if (typeof window === 'undefined' && fs) {
      this.ensureLogDirectory();
    }
  }

  // إنشاء مجلد الـ logs إذا لم يكن موجوداً
  private ensureLogDirectory(): void {
    if (this.config.enableFile && fs && !fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  // تنسيق الرسالة
  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}\n`;
  }

  // كتابة إلى الملف
  private async writeToFile(logMessage: string): Promise<void> {
    if (!this.config.enableFile || typeof window !== 'undefined' || !fs) return;

    try {
      const logFile = path.join(this.config.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      
      // التحقق من حجم الملف
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.config.maxFileSize) {
          this.rotateLogFiles(logFile);
        }
      }

      fs.appendFileSync(logFile, logMessage);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  // تدوير ملفات الـ logs
  private rotateLogFiles(currentLogFile: string): void {
    if (typeof window !== 'undefined' || !fs) return;

    try {
      const logDir = path.dirname(currentLogFile);
      const baseName = path.basename(currentLogFile, '.log');
      
      // حذف أقدم ملف إذا تجاوز العدد المسموح
      for (let i = this.config.maxFiles - 1; i >= 0; i--) {
        const oldFile = path.join(logDir, `${baseName}-${i}.log`);
        if (fs.existsSync(oldFile)) {
          if (i === this.config.maxFiles - 1) {
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, path.join(logDir, `${baseName}-${i + 1}.log`));
          }
        }
      }

      // إعادة تسمية الملف الحالي
      fs.renameSync(currentLogFile, path.join(logDir, `${baseName}-0.log`));
    } catch (error) {
      console.error('Error rotating log files:', error);
    }
  }

  // كتابة الـ log
  private async log(level: LogLevel, message: string, context?: any): Promise<void> {
    const logMessage = this.formatMessage(level, message, context);

    // طباعة في الـ console
    if (this.config.enableConsole) {
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // أحمر
        [LogLevel.WARN]: '\x1b[33m',  // أصفر
        [LogLevel.INFO]: '\x1b[36m',  // أزرق فاتح
        [LogLevel.DEBUG]: '\x1b[35m'  // بنفسجي
      };
      const reset = '\x1b[0m';
      
      console.log(`${colors[level]}${logMessage.trim()}${reset}`);
    }

    // كتابة في الملف
    if (this.config.enableFile) {
      await this.writeToFile(logMessage);
    }
  }

  // دوال الـ logging
  async error(message: string, context?: any): Promise<void> {
    if (this.shouldLog(LogLevel.ERROR)) {
      await this.log(LogLevel.ERROR, message, context);
    }
  }

  async warn(message: string, context?: any): Promise<void> {
    if (this.shouldLog(LogLevel.WARN)) {
      await this.log(LogLevel.WARN, message, context);
    }
  }

  async info(message: string, context?: any): Promise<void> {
    if (this.shouldLog(LogLevel.INFO)) {
      await this.log(LogLevel.INFO, message, context);
    }
  }

  async debug(message: string, context?: any): Promise<void> {
    if (this.shouldLog(LogLevel.DEBUG)) {
      await this.log(LogLevel.DEBUG, message, context);
    }
  }

  // التحقق من مستوى الـ log
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  // تغيير مستوى الـ log
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  // تفعيل/إلغاء تفعيل الـ console
  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  // تفعيل/إلغاء تفعيل الملف
  setFileEnabled(enabled: boolean): void {
    this.config.enableFile = enabled;
  }

  // الحصول على إحصائيات الـ logs
  getLogStats(): { totalFiles: number; totalSize: number } {
    if (!this.config.enableFile || typeof window !== 'undefined' || !fs) return { totalFiles: 0, totalSize: 0 };

    try {
      const files = fs.readdirSync(this.config.logDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      let totalSize = 0;

      logFiles.forEach(file => {
        const filePath = path.join(this.config.logDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });

      return { totalFiles: logFiles.length, totalSize };
    } catch (error) {
      return { totalFiles: 0, totalSize: 0 };
    }
  }

  // مسح جميع الـ logs
  clearLogs(): void {
    if (!this.config.enableFile || typeof window !== 'undefined' || !fs) return;

    try {
      const files = fs.readdirSync(this.config.logDir);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(this.config.logDir, file));
        }
      });
      this.info('All log files cleared');
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  }
}

// إنشاء instance افتراضي
export const logger = new Logger();

// دوال مساعدة للاستخدام السريع
export const logError = (message: string, context?: any) => logger.error(message, context);
export const logWarn = (message: string, context?: any) => logger.warn(message, context);
export const logInfo = (message: string, context?: any) => logger.info(message, context);
export const logDebug = (message: string, context?: any) => logger.debug(message, context);

export default logger;
