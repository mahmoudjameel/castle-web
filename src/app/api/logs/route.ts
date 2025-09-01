import { NextRequest, NextResponse } from 'next/server';
import { logger, LogLevel } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

// GET - عرض إحصائيات الـ logs
export async function GET(req: NextRequest) {
  try {
    const stats = logger.getLogStats();
    const logDir = 'logs';
    
    // قراءة آخر 100 سطر من آخر ملف log
    let latestLogs: string[] = [];
    if (stats.totalFiles > 0) {
      try {
        const files = fs.readdirSync(logDir);
        const logFiles = files.filter(file => file.endsWith('.log'));
        if (logFiles.length > 0) {
          const latestFile = logFiles.sort().reverse()[0];
          const logContent = fs.readFileSync(path.join(logDir, latestFile), 'utf-8');
          latestLogs = logContent.split('\n').slice(-100).filter(line => line.trim());
        }
      } catch (error) {
        await logger.error('Error reading log files', { error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      latestLogs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await logger.error('Error getting log stats', { error: error.message });
    return NextResponse.json(
      { success: false, message: 'Error getting log stats' },
      { status: 500 }
    );
  }
}

// POST - تغيير مستوى الـ logging
export async function POST(req: NextRequest) {
  try {
    const { action, level, enabled } = await req.json();

    switch (action) {
      case 'setLevel':
        if (Object.values(LogLevel).includes(level)) {
          logger.setLevel(level as LogLevel);
          await logger.info('Log level changed', { newLevel: level });
          return NextResponse.json({
            success: true,
            message: `Log level set to ${level}`,
            currentLevel: level
          });
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid log level' },
            { status: 400 }
          );
        }

      case 'setConsole':
        logger.setConsoleEnabled(enabled);
        await logger.info('Console logging toggled', { enabled });
        return NextResponse.json({
          success: true,
          message: `Console logging ${enabled ? 'enabled' : 'disabled'}`,
          consoleEnabled: enabled
        });

      case 'setFile':
        logger.setFileEnabled(enabled);
        await logger.info('File logging toggled', { enabled });
        return NextResponse.json({
          success: true,
          message: `File logging ${enabled ? 'enabled' : 'disabled'}`,
          fileEnabled: enabled
        });

      case 'clear':
        logger.clearLogs();
        return NextResponse.json({
          success: true,
          message: 'All logs cleared'
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    await logger.error('Error in logs API', { error: error.message });
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
}

// DELETE - مسح جميع الـ logs
export async function DELETE() {
  try {
    logger.clearLogs();
    await logger.info('All logs cleared via API');
    
    return NextResponse.json({
      success: true,
      message: 'All logs cleared successfully'
    });
  } catch (error) {
    await logger.error('Error clearing logs via API', { error: error.message });
    return NextResponse.json(
      { success: false, message: 'Error clearing logs' },
      { status: 500 }
    );
  }
}
