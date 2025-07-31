"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, ArrowLeft, User, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

interface Report {
  id: number;
  reason: string;
  description: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  reportedUser: {
    id: number;
    name: string;
    profileImageData?: string;
  };
}

const statusLabels: { [key: string]: string } = {
  pending: "في الانتظار",
  under_review: "قيد المراجعة",
  resolved: "تم الحل",
  dismissed: "مرفوض"
};

const statusColors: { [key: string]: string } = {
  pending: "from-yellow-400 to-orange-500",
  under_review: "from-blue-400 to-purple-500",
  resolved: "from-green-400 to-blue-500",
  dismissed: "from-red-400 to-pink-500"
};

const statusIcons: { [key: string]: React.ReactNode } = {
  pending: <Clock className="w-5 h-5" />,
  under_review: <Eye className="w-5 h-5" />,
  resolved: <CheckCircle className="w-5 h-5" />,
  dismissed: <XCircle className="w-5 h-5" />
};

const reasonLabels: { [key: string]: string } = {
  inappropriate_content: "محتوى غير لائق",
  spam: "رسائل مزعجة",
  fraud: "احتيال أو غش",
  harassment: "مضايقة أو إساءة",
  fake_profile: "حساب مزيف",
  other: "أخرى"
};

export default function UserReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userStr);
      const response = await fetch(`/api/reports?reporterId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('فشل في جلب البلاغات');
      }
    } catch (error) {
      console.error('خطأ في جلب البلاغات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل البلاغات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl mb-4 transform rotate-12 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              بلاغاتي المرسلة
            </h1>
            <p className="text-blue-200/80 text-lg">تابع حالة البلاغات التي أرسلتها</p>
          </div>

          {/* زر العودة */}
          <div className="mb-8">
            <button
              onClick={() => window.location.href = '/user'}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl text-white font-semibold hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للوحة التحكم
            </button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = reports.filter(r => r.status === status).length;
              return (
                <div key={status} className="bg-white/5 rounded-xl border border-white/10 p-5 text-center group hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className={`w-12 h-12 bg-gradient-to-r ${statusColors[status]} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {statusIcons[status]}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {count}
                  </div>
                  <div className="text-blue-200/80 text-sm font-medium">{label}</div>
                </div>
              );
            })}
          </div>

          {/* قائمة البلاغات */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              البلاغات المرسلة
            </h3>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">لا توجد بلاغات</h4>
                <p className="text-blue-200/80">لم تقم بإرسال أي بلاغات بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleReportClick(report)}
                    className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {report.reportedUser.profileImageData ? (
                              <img
                                src={`data:image/png;base64,${report.reportedUser.profileImageData}`}
                                alt={report.reportedUser.name}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-white/20"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center border-2 border-white/20">
                                <User className="w-6 h-6 text-blue-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">
                              {report.reportedUser.name}
                            </h4>
                            <p className="text-blue-200/80 text-sm">
                              {reasonLabels[report.reason] || report.reason}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 bg-gradient-to-r ${statusColors[report.status]} rounded-full`}></div>
                          <span className="text-white font-semibold">
                            {statusLabels[report.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-200/80 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(report.createdAt)}
                        </div>
                        <div className="text-orange-400 group-hover:text-orange-300 transition-colors">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* موديل تفاصيل البلاغ */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-white/20">
          <DialogTitle className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            تفاصيل البلاغ
          </DialogTitle>

          {selectedReport && (
            <div className="space-y-6">
              {/* معلومات الموهبة المبلغ عنها */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h4 className="text-lg font-bold text-white mb-4">الموهبة المبلغ عنها</h4>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {selectedReport.reportedUser.profileImageData ? (
                      <img
                        src={`data:image/png;base64,${selectedReport.reportedUser.profileImageData}`}
                        alt={selectedReport.reportedUser.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center border-2 border-white/20">
                        <User className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-white">{selectedReport.reportedUser.name}</h5>
                    <p className="text-blue-200/80">ID: {selectedReport.reportedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* تفاصيل البلاغ */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h4 className="text-lg font-bold text-white mb-4">تفاصيل البلاغ</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium">سبب البلاغ</label>
                    <p className="text-white font-semibold mt-1">
                      {reasonLabels[selectedReport.reason] || selectedReport.reason}
                    </p>
                  </div>
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium">الوصف</label>
                    <p className="text-white mt-1 leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium">تاريخ الإرسال</label>
                    <p className="text-white mt-1">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* حالة البلاغ */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h4 className="text-lg font-bold text-white mb-4">حالة البلاغ</h4>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${statusColors[selectedReport.status]} rounded-xl flex items-center justify-center`}>
                    {statusIcons[selectedReport.status]}
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-white">
                      {statusLabels[selectedReport.status]}
                    </h5>
                    <p className="text-blue-200/80">
                      {selectedReport.status === 'pending' && 'سيتم مراجعة البلاغ في أقرب وقت'}
                      {selectedReport.status === 'under_review' && 'جاري مراجعة البلاغ من قبل الإدارة'}
                      {selectedReport.status === 'resolved' && 'تم حل المشكلة واتخاذ الإجراء المناسب'}
                      {selectedReport.status === 'dismissed' && 'تم رفض البلاغ لعدم كفاية الأدلة'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ملاحظات الإدارة */}
              {selectedReport.adminNotes && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                  <h4 className="text-lg font-bold text-white mb-4">ملاحظات الإدارة</h4>
                  <p className="text-white leading-relaxed">
                    {selectedReport.adminNotes}
                  </p>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl text-white font-semibold hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 