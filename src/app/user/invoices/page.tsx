"use client";

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../../assets/Amiri-Bold-normal.js'; // استيراد الخط العربي

export default function UserInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user?.id) throw new Error('لم يتم العثور على المستخدم');
        const res = await fetch(`/api/invoices?clientId=${user.id}`);
        if (!res.ok) throw new Error('فشل في جلب الفواتير');
        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  // معالجة النص العربي للعرض الصحيح
  const processArabicText = (text: string) => {
    if (!text) return text;
    
    // إزالة الأحرف الخاصة
    let cleanText = text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
    
    // للنص العربي، عكس ترتيب الكلمات
    if (isArabic(cleanText)) {
      const words = cleanText.trim().split(/\s+/);
      return words.reverse().join(' ');
    }
    
    return cleanText;
  };

  const handleDownloadPDF = async (invoice: any) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // استخدام الخط العربي المستورد
    try {
      doc.setFont('Amiri-Bold', 'normal');
      console.log('Arabic font loaded successfully');
    } catch (e) {
      console.error('Failed to set Arabic font:', e);
      doc.setFont('helvetica', 'normal');
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Background
    doc.setFillColor(44, 62, 80, 0.08);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(102, 51, 153, 0.06);
    doc.rect(0, pageHeight/2, pageWidth, pageHeight/2, 'F');

    // Logo
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.addImage(logoBase64, 'PNG', 10, 10, 30, 30, '', 'FAST');
    } catch (e) {
      console.warn('Logo not found');
    }

    const services = invoice.orderServices ? JSON.parse(invoice.orderServices) : [];

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // العنوان الرئيسي
    doc.text('Tawq Talent', 105, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(255, 99, 71); // العنوان الفرعي
    doc.text('Service Purchase Invoice - Secure & Trusted', 105, 30, { align: 'center' });
    doc.setTextColor(255, 255, 255); // لون أبيض للنصوص الرئيسية

    // Invoice details
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`Invoice No: ${invoice.id}`, 10, 48);
    doc.text(`Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : ''}`, 10, 56);
    doc.text(`Status: ${invoice.status}`, 10, 64);

    // Client info
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175); // لون مميز للعناوين
    doc.text('Client Info:', 10, 74);
    doc.setFont('Amiri-Bold', 'normal');
    
    // كتابة النص العربي
    const clientName = processArabicText(invoice.client?.name || '-');
    if (isArabic(invoice.client?.name || '')) {
      doc.text(`Name: ${clientName}`, 80, 82, { align: 'right' });
    } else {
      doc.text(`Name: ${clientName}`, 15, 82);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`Email: ${invoice.client?.email || '-'}`, 15, 90);
    doc.text(`Phone: ${invoice.client?.phone || '-'}`, 15, 98);

    // Talent info
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Talent Info:', 110, 74);
    doc.setFont('Amiri-Bold', 'normal');
    
    const talentName = processArabicText(invoice.talent?.name || '-');
    if (isArabic(invoice.talent?.name || '')) {
      doc.text(`Name: ${talentName}`, 180, 82, { align: 'right' });
    } else {
      doc.text(`Name: ${talentName}`, 115, 82);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`Email: ${invoice.talent?.email || '-'}`, 115, 90);
    doc.text(`Phone: ${invoice.talent?.phone || '-'}`, 115, 98);

    // Services table
    const tableBody = services.map((srv: any) => [
      processArabicText(srv.name || ''),
      `${srv.price || 0} SAR`
    ]);

    autoTable(doc, {
      startY: 110,
      head: [["Service Name", "Price (SAR)"]],
      body: tableBody,
      styles: { 
        font: 'Amiri-Bold',
        fontStyle: 'normal', 
        halign: 'center', 
        textColor: [30,64,175],
        fontSize: 10
      },
      headStyles: { 
        fillColor: [255, 165, 0], 
        textColor: 255, 
        fontStyle: 'bold', 
        halign: 'center',
        font: 'helvetica'
      },
      bodyStyles: { 
        fillColor: [245, 245, 255] 
      },
      columnStyles: { 
        0: { halign: 'center' },
        1: { halign: 'center' }
      },
      margin: { left: 10, right: 10 },
    });

    // Payment summary
    const summaryY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 130;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 64, 175);
    doc.text('Payment Summary:', 10, summaryY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    
    const commission = Math.round(invoice.amount * 0.1);
    const net = invoice.amount - commission;
    
    doc.text(`Total Amount: ${invoice.amount} SAR`, 15, summaryY + 8);
    doc.text(`Net Profit: ${net} SAR`, 15, summaryY + 16);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120,120,120);
    doc.text('This invoice was generated electronically by Tawq Digital Platform.', 10, 280);
    doc.text('For inquiries: info@tawq.sa', 10, 285);
    
    doc.save(`invoice-${invoice.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-10 px-2 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center">فواتيري</h1>
        {loading && <div className="text-center text-blue-200">جاري التحميل...</div>}
        {error && <div className="text-center text-red-400 font-bold">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-blue-400/20 bg-white/90 backdrop-blur-md">
            <table className="min-w-full text-right text-blue-900">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100">
                <tr>
                  <th className="py-3 px-4 font-bold text-blue-900">#</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الموهبة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الخدمة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">المبلغ</th>
                  <th className="py-3 px-4 font-bold text-blue-900">الحالة</th>
                  <th className="py-3 px-4 font-bold text-blue-900">تحميل الفاتورة</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="border-b border-blue-100 hover:bg-blue-50/60 transition">
                    <td className="py-2 px-4 font-bold text-blue-700">{invoice.id}</td>
                    <td className="py-2 px-4">{invoice.talent?.name || invoice.talentId}</td>
                    <td className="py-2 px-4 text-xs">{invoice.orderServices ? JSON.parse(invoice.orderServices).map((s:any)=>s.name).join(', ') : '-'}</td>
                    <td className="py-2 px-4 font-bold text-orange-600">{invoice.amount} ر.س</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{invoice.status}</span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition text-xs font-bold"
                        onClick={() => handleDownloadPDF(invoice)}
                      >تحميل PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}