'use client';

import React, { useEffect, useState } from 'react';
import { User, Phone, Mail, Calendar, Shield, CheckCircle, XCircle, Eye, Search, Filter, ArrowLeft, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  approved: boolean;
  createdAt: string;
  profileImageData?: string;
  bio?: string;
  age?: number;
  jobTitle?: string;
  workArea?: string;
  canTravelAbroad?: boolean;
  accent?: string;
  eyeColor?: string;
  features?: string;
  hairColor?: string;
  hairStyle?: string;
  height?: number;
  language?: string;
  skinColor?: string;
  weight?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved: true })
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, approved: true } : user
        ));
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved: false })
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, approved: false } : user
        ));
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole;
    const matchesApproval = filterApproval === 'all' || 
                           (filterApproval === 'approved' && user.approved) ||
                           (filterApproval === 'pending' && !user.approved);
    
    return matchesSearch && matchesRole && matchesApproval;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'from-red-400 to-pink-500';
      case 'talent': return 'from-purple-400 to-indigo-500';
      case 'user': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'مدير';
      case 'talent': return 'موهبة';
      case 'user': return 'مستخدم';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">إدارة المستخدمين والمواهب</h1>
                <p className="text-blue-200/80">عرض وإدارة جميع المستخدمين في النظام</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">جميع الأدوار</option>
                <option value="admin">مدير</option>
                <option value="talent">موهبة</option>
                <option value="user">مستخدم</option>
              </select>
              
              <select
                value={filterApproval}
                onChange={(e) => setFilterApproval(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">جميع الحالات</option>
                <option value="approved">معتمد</option>
                <option value="pending">في الانتظار</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-200">جاري تحميل المستخدمين...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-right text-blue-200 font-semibold">المستخدم</th>
                      <th className="px-6 py-4 text-right text-blue-200 font-semibold">الدور</th>
                      <th className="px-6 py-4 text-right text-blue-200 font-semibold">الهاتف</th>
                      <th className="px-6 py-4 text-right text-blue-200 font-semibold">تاريخ التسجيل</th>
                      <th className="px-6 py-4 text-right text-blue-200 font-semibold">الحالة</th>
                      <th className="px-6 py-4 text-right text-blue-200 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profileImageData ? (
                              <Image
                                src={`data:image/png;base64,${user.profileImageData}`}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="text-white font-semibold">{user.name}</div>
                              <div className="text-blue-200/80 text-sm">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-blue-200">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone || 'غير محدد'}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-blue-200">
                          {formatDate(user.createdAt)}
                        </td>
                        
                        <td className="px-6 py-4">
                          {user.approved ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                              <CheckCircle className="w-4 h-4" />
                              معتمد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              <AlertTriangle className="w-4 h-4" />
                              في الانتظار
                            </span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowModal(true);
                              }}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {!user.approved && (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                                title="اعتماد"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {user.approved && (
                              <button
                                onClick={() => handleRejectUser(user.id)}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                title="إلغاء الاعتماد"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* User Details Modal */}
          {showModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">تفاصيل المستخدم</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                  >
                    <XCircle className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-center gap-4">
                    {selectedUser.profileImageData ? (
                      <Image
                        src={`data:image/png;base64,${selectedUser.profileImageData}`}
                        alt={selectedUser.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-white">{selectedUser.name}</h4>
                      <p className="text-blue-200/80">{selectedUser.email}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(selectedUser.role)} text-white mt-2`}>
                        {getRoleLabel(selectedUser.role)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-200 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-semibold">رقم الهاتف</span>
                      </div>
                      <p className="text-white">{selectedUser.phone || 'غير محدد'}</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-200 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">تاريخ التسجيل</span>
                      </div>
                      <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Additional Info for Talents */}
                  {selectedUser.role.toLowerCase() === 'talent' && (
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-white">معلومات الموهبة</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUser.bio && (
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-blue-200 font-semibold mb-2">نبذة شخصية</div>
                            <p className="text-white text-sm">{selectedUser.bio}</p>
                          </div>
                        )}
                        
                        {selectedUser.jobTitle && (
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-blue-200 font-semibold mb-2">المهنة</div>
                            <p className="text-white">{selectedUser.jobTitle}</p>
                          </div>
                        )}
                        
                        {selectedUser.age && (
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-blue-200 font-semibold mb-2">العمر</div>
                            <p className="text-white">{selectedUser.age} سنة</p>
                          </div>
                        )}
                        
                        {selectedUser.height && (
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-blue-200 font-semibold mb-2">الطول</div>
                            <p className="text-white">{selectedUser.height} سم</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
