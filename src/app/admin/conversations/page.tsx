'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, User, Clock, Send, ArrowLeft, Eye, Reply } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Conversation {
  conversationId: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    profileImageData: string | null;
    createdAt: string;
  };
  talent: {
    id: number;
    name: string;
    email: string;
    role: string;
    profileImageData: string | null;
    createdAt: string;
  };
  lastMessage: string;
  lastMessageDate: string;
  lastMessageSender: number;
  totalMessages: number;
  unreadCount: number;
  messages: Array<{
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    createdAt: string;
    isRead: boolean;
  }>;
}

export default function AdminConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    // جلب بيانات المدير
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setAdmin(u);
      }
    } catch {}

    // جلب المحادثات
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/admin/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAdminMessage = async () => {
    if (!selectedConversation || !adminMessage.trim() || !admin) return;

    setSending(true);
    try {
      const response = await fetch('/api/admin/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.conversationId,
          adminMessage: adminMessage.trim(),
          adminId: admin.id
        })
      });

      if (response.ok) {
        setAdminMessage('');
        // تحديث المحادثات
        await fetchConversations();
        // إعادة تحديد المحادثة المحددة
        const updatedConversation = conversations.find(c => c.conversationId === selectedConversation.conversationId);
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Error sending admin message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return 'منذ يوم';
    return date.toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">جاري تحميل المحادثات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-indigo-950/95 border-b border-blue-400/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              العودة للوحة التحكم
            </Link>
            <h1 className="text-2xl font-bold text-white">إدارة المحادثات</h1>
          </div>
          <div className="text-blue-200">
            إجمالي المحادثات: {conversations.length}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة المحادثات */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                المحادثات
              </h2>
              
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center text-blue-200 py-8">
                    لا توجد محادثات حالياً
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                        selectedConversation?.conversationId === conversation.conversationId
                          ? 'bg-white/20 border-orange-400/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">
                            {conversation.user.name}
                          </div>
                          <div className="text-blue-200/80 text-xs">
                            إلى: {conversation.talent.name}
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-blue-200/80 text-xs mb-2 truncate">
                        {conversation.lastMessage}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-blue-200/60">
                        <span>{formatDate(conversation.lastMessageDate)}</span>
                        <span>{conversation.totalMessages} رسالة</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* تفاصيل المحادثة */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
                {/* رأس المحادثة */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedConversation.user.name}
                      </h3>
                      <p className="text-blue-200/80 text-sm">
                        محادثة مع {selectedConversation.talent.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-blue-200/80">
                    <div>آخر رسالة: {formatDate(selectedConversation.lastMessageDate)}</div>
                    <div>إجمالي الرسائل: {selectedConversation.totalMessages}</div>
                  </div>
                </div>

                {/* الرسائل */}
                <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === selectedConversation.user.id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[70%] ${message.senderId === selectedConversation.user.id ? 'bg-blue-900/60' : 'bg-gradient-to-l from-orange-400 to-pink-500'} rounded-xl p-3`}>
                        <div className="text-sm mb-1 font-semibold">
                          {message.senderId === selectedConversation.user.id 
                            ? selectedConversation.user.name 
                            : selectedConversation.talent.name
                          }
                        </div>
                        <div className="text-sm whitespace-pre-line break-words">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {new Date(message.createdAt).toLocaleString('ar-EG')}
                          {!message.isRead && message.senderId === selectedConversation.user.id && (
                            <span className="mr-2 text-orange-400">●</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* إرسال رسالة من الإدارة */}
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Reply className="w-4 h-4" />
                    رد من الإدارة
                  </h4>
                  <div className="flex gap-2">
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="اكتب رد الإدارة هنا..."
                      className="flex-1 px-3 py-2 bg-blue-900/40 border border-blue-400/20 rounded-lg text-white placeholder:text-blue-200 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleSendAdminMessage}
                      disabled={sending || !adminMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      إرسال
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl border border-white/20 p-8 text-center">
                <MessageCircle className="w-16 h-16 text-blue-200/60 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">اختر محادثة</h3>
                <p className="text-blue-200/80">
                  اختر محادثة من القائمة اليسرى لعرض تفاصيلها والرد عليها
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



