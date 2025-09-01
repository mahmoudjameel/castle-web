'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Settings, Eye, FileText, Activity } from 'lucide-react';
import { LogLevel } from '@/lib/logger';

interface LogStats {
  totalFiles: number;
  totalSize: number;
}

interface LogsData {
  stats: LogStats;
  latestLogs: string[];
  timestamp: string;
}

const LogsPage = () => {
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>(LogLevel.INFO);
  const [consoleEnabled, setConsoleEnabled] = useState(true);
  const [fileEnabled, setFileEnabled] = useState(true);

  // جلب بيانات الـ logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      if (data.success) {
        setLogsData(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // تغيير مستوى الـ logging
  const changeLogLevel = async (level: LogLevel) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setLevel', level })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedLevel(level);
        await fetchLogs();
      }
    } catch (error) {
      console.error('Error changing log level:', error);
    }
  };

  // تفعيل/إلغاء تفعيل console logging
  const toggleConsole = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setConsole', enabled })
      });
      const data = await response.json();
      if (data.success) {
        setConsoleEnabled(enabled);
      }
    } catch (error) {
      console.error('Error toggling console:', error);
    }
  };

  // تفعيل/إلغاء تفعيل file logging
  const toggleFile = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setFile', enabled })
      });
      const data = await response.json();
      if (data.success) {
        setFileEnabled(enabled);
      }
    } catch (error) {
      console.error('Error toggling file:', error);
    }
  };

  // مسح جميع الـ logs
  const clearLogs = async () => {
    if (!confirm('هل أنت متأكد من مسح جميع الـ logs؟')) return;

    try {
      const response = await fetch('/api/logs', {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        await fetchLogs();
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  // تحويل حجم الملف إلى قراءة
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // تنسيق timestamp
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('ar-SA');
  };

  useEffect(() => {
    fetchLogs();
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* الهيدر */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الـ Logs</h1>
              <p className="text-gray-600 mt-1">مراقبة وإدارة سجلات النظام</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                مسح الكل
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* إعدادات الـ Logging */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">إعدادات الـ Logging</h2>
              </div>

              {/* مستوى الـ Log */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الـ Log
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => changeLogLevel(e.target.value as LogLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={LogLevel.ERROR}>Error</option>
                  <option value={LogLevel.WARN}>Warning</option>
                  <option value={LogLevel.INFO}>Info</option>
                  <option value={LogLevel.DEBUG}>Debug</option>
                </select>
              </div>

              {/* تفعيل Console */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={consoleEnabled}
                    onChange={(e) => toggleConsole(e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">تفعيل Console Logging</span>
                </label>
              </div>

              {/* تفعيل File */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fileEnabled}
                    onChange={(e) => toggleFile(e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">تفعيل File Logging</span>
                </label>
              </div>
            </div>
          </div>

          {/* إحصائيات الـ Logs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">إحصائيات الـ Logs</h2>
              </div>

              {logsData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">عدد الملفات</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {logsData.stats.totalFiles}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">الحجم الإجمالي</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatFileSize(logsData.stats.totalSize)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    آخر تحديث: {formatTimestamp(logsData.timestamp)}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading ? 'جاري التحميل...' : 'لا توجد بيانات'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* عرض آخر الـ Logs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">آخر الـ Logs</h2>
          </div>

          {logsData?.latestLogs && logsData.latestLogs.length > 0 ? (
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <div className="space-y-1">
                {logsData.latestLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد logs لعرضها
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
