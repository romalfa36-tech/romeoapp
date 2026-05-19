import React, { useState } from 'react';
import { useApp, useLanguage } from '../lib/context';
import { Card, Button, Modal } from './ui';
import { formatCurrency, formatDate } from '../lib/types';
import {
  User,
  LogOut,
  Settings,
  Bell,
  Shield,
  ChevronRight,
  Globe
} from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const { currentUser, getProjectStats, getFinancialStats, stockItems, units, notifications, markAsRead, clearNotifications } = useApp();
  const { language, setLanguage, t } = useLanguage();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (!currentUser) return null;

  const stats = getProjectStats();
  const financialStats = getFinancialStats();

  const roleLabel = currentUser.role === 'admin' ? 'مدير النظام' : currentUser.role === 'accountant' ? 'محاسب' : 'موظف';
  const roleColor = currentUser.role === 'admin' ? 'bg-[#1E3A5F]' : currentUser.role === 'accountant' ? 'bg-amber-600' : 'bg-green-600';

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Profile Header */}
      <Card className="text-center py-8">
        <div className="w-24 h-24 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {currentUser.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
        <p className="text-gray-500">{currentUser.email}</p>
        <span className={`inline-block mt-3 px-4 py-1 rounded-full text-white text-sm ${roleColor}`}>
          {roleLabel}
        </span>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">المشاريع</p>
          <p className="text-2xl font-bold text-[#1E3A5F]">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">الرصيد</p>
          <p className={`text-2xl font-bold ${financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(financialStats.balance)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">المواد بالمخزون</p>
          <p className="text-2xl font-bold text-blue-600">{stockItems.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">إجمالي الوحدات</p>
          <p className="text-2xl font-bold text-purple-600">{units.length}</p>
        </Card>
      </div>

      {/* Permissions (for employees) */}
      {currentUser.role === 'employee' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            الصلاحيات
          </h2>
          <div className="space-y-2">
            {currentUser.permissions.map((perm) => (
              <div key={perm} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  {perm === 'view_projects' && 'عرض المشاريع'}
                  {perm === 'add_transaction' && 'إضافة معاملات مالية'}
                  {perm === 'view_reports' && 'عرض التقارير'}
                  {perm === 'edit_projects' && 'تعديل المشاريع'}
                  {perm === 'manage_stock' && 'إدارة المخزون'}
                  {perm === 'manage_units' && 'إدارة الوحدات'}
                  {perm === 'all' && 'جميع الصلاحيات'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Menu Items */}
      <div className="space-y-2">
        <Card onClick={() => setShowProfileModal(true)} className="cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#1E3A5F]" />
              <span className="font-medium text-gray-900">بيانات الملف الشخصي</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card onClick={() => setShowNotificationsModal(true)} className="cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-gray-900">سجل الإشعارات ({notifications.filter(n=>!n.isRead).length})</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card onClick={() => setShowSettingsModal(true)} className="cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900">إعدادات النظام</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Logout Button */}
      <Button
        variant="danger"
        icon={LogOut}
        onClick={onLogout}
        className="w-full"
      >
        تسجيل الخروج
      </Button>

      {/* Profile Details Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="بيانات الملف الشخصي" size="sm">
        <div className="space-y-4">
          <div className="flex flex-col items-center py-4 border-b">
            <div className="w-20 h-20 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
              {currentUser.name.charAt(0)}
            </div>
            <h3 className="font-bold text-lg text-gray-900">{currentUser.name}</h3>
            <p className="text-sm text-gray-500">{roleLabel}</p>
          </div>
          <div className="space-y-3 pt-2 text-right" style={{ direction: 'rtl' }}>
            <div>
              <span className="text-xs text-gray-400">اسم المستخدم</span>
              <p className="text-sm font-semibold text-gray-800">{currentUser.username || '-'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">البريد الإلكتروني</span>
              <p className="text-sm font-semibold text-gray-800">{currentUser.email}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">تاريخ الانضمام</span>
              <p className="text-sm font-semibold text-gray-800">{formatDate(currentUser.createdAt)}</p>
            </div>
          </div>
          <Button onClick={() => setShowProfileModal(false)} className="w-full mt-4">إغلاق</Button>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} title="سجل الإشعارات" size="md">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm text-gray-500">إجمالي التنبيهات: {notifications.length}</span>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="text-xs text-red-500 hover:underline">مسح الكل</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد إشعارات حالياً</p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-right ${!n.isRead ? 'bg-blue-50 border-blue-100' : 'bg-white'}`}
                  style={{ direction: 'rtl' }}
                >
                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                  <span className="text-[10px] text-gray-400 block mt-2">{formatDate(n.createdAt)}</span>
                </div>
              ))
            )}
          </div>
          <Button onClick={() => setShowNotificationsModal(false)} className="w-full mt-4">إغلاق</Button>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="إعدادات النظام" size="sm">
        <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
          {/* Language option */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="font-medium text-sm text-gray-700">لغة النظام (Language)</span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-500" />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Theme Option */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="font-medium text-sm text-gray-700">الوضع المظلم (Dark Mode)</span>
            <span className="text-xs text-gray-400">قريباً</span>
          </div>

          <Button onClick={() => setShowSettingsModal(false)} className="w-full mt-4">حفظ وإغلاق</Button>
        </div>
      </Modal>

      {/* App Info */}
      <div className="text-center text-sm text-gray-400 mt-8">
        <p>Beeforce Management System v1.0</p>
        <p>© 2026 جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
};