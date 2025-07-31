'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageCircle, User, Calendar } from 'lucide-react';

interface Report {
  id: number;
  reporter: {
    id: number;
    name: string;
    email: string;
  };
  reportedUser: {
    id: number;
    name: string;
    email: string;
  };
  reason: string;
  description: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const reasonLabels: Record<string, string> = {
  inappropriate_content: 'محتوى غير لائق',
  fake_profile: 'ملف شخصي مزيف',
  spam: 'رسائل مزعجة',
  fraud: 'احتيال أو غش',
  harassment: 'تحرش أو إساءة',
  other: 'سبب آخر'
};

const statusLabels: Record<string, string> = {
  pending: 'في الانتظار',
  under_review: 'قيد المراجعة',
  resolved: 'تم الحل',
  dismissed: 'مرفوض'
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  resolved: 'bg-green-500',
  dismissed: 'bg-red-500'
};

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status: newStatus,
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        await fetchReports();
        setShowDetailsModal(false);
        setSelectedReport(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusCount = (status: string) => {
    return reports.filter(report => report.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 rounded-2xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">جاري تحميل البلاغات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="relative py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl mb-4 transform rotate-12 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              إدارة الشكاوى والبلاغات
            </h1>
            <p className="text-blue-200/80 text-lg">متابعة الشكاوى وحل النزاعات بين الأطراف</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{getStatusCount('pending')}</div>
              <div className="text-blue-200/80 text-sm font-medium">في الانتظار</div>
            </div>
            
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{getStatusCount('under_review')}</div>
              <div className="text-blue-200/80 text-sm font-medium">قيد المراجعة</div>
            </div>
            
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{getStatusCount('resolved')}</div>
              <div className="text-blue-200/80 text-sm font-medium">تم الحل</div>
            </div>
            
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{getStatusCount('dismissed')}</div>
              <div className="text-blue-200/80 text-sm font-medium">مرفوض</div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              قائمة البلاغات
            </h2>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-300" />
                </div>
                <p className="text-blue-200/80 text-lg">لا توجد بلاغات حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 ${statusColors[report.status]} rounded-full`}></div>
                          <span className="text-white font-semibold">{reasonLabels[report.reason]}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]} text-white`}>
                            {statusLabels[report.status]}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-300" />
                            <span className="text-blue-200">من: <span className="text-white font-medium">{report.reporter.name}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-red-300" />
                            <span className="text-blue-200">إلى: <span className="text-white font-medium">{report.reportedUser.name}</span></span>
                          </div>
                        </div>
                        
                        <p className="text-blue-200/80 text-sm mt-3 line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-blue-200/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(report.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                          {report.adminNotes && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>ملاحظات إدارية</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.adminNotes || '');
                            setShowDetailsModal(true);
                          }}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          تفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white relative">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 left-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all"
              >
                ×
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">تفاصيل البلاغ</h2>
                <p className="text-red-100">مراجعة وتحديث حالة البلاغ</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">معلومات البلاغ</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">السبب:</span> <span className="font-medium">{reasonLabels[selectedReport.reason]}</span></div>
                    <div><span className="text-gray-600">الحالة:</span> <span className={`font-medium px-2 py-1 rounded-full text-xs ${statusColors[selectedReport.status]} text-white`}>{statusLabels[selectedReport.status]}</span></div>
                    <div><span className="text-gray-600">التاريخ:</span> <span className="font-medium">{new Date(selectedReport.createdAt).toLocaleDateString('ar-EG')}</span></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">الأطراف المعنية</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">من أرسل البلاغ:</span> <span className="font-medium">{selectedReport.reporter.name}</span></div>
                    <div><span className="text-gray-600">من تم الإبلاغ عنه:</span> <span className="font-medium">{selectedReport.reportedUser.name}</span></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">تفاصيل البلاغ</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                  {selectedReport.description}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">ملاحظات إدارية</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                  rows={4}
                  placeholder="أضف ملاحظات إدارية..."
                />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">تحديث الحالة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'pending')}
                    disabled={updating}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    في الانتظار
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'under_review')}
                    disabled={updating}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    قيد المراجعة
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                    disabled={updating}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    تم الحل
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'dismissed')}
                    disabled={updating}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    مرفوض
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 