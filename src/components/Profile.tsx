import React from 'react';
import { useApp } from '../lib/context';
import { Card, Button } from './ui';
import { formatCurrency } from '../lib/types';
import {
  User,
  LogOut,
  Settings,
  Bell,
  Shield,
  ChevronRight
} from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const { currentUser, getProjectStats, getFinancialStats } = useApp();

  if (!currentUser) return null;

  const stats = getProjectStats();
  const financialStats = getFinancialStats();

  const roleLabel = currentUser.role === 'admin' ? 'مدير النظام' : 'موظف';
  const roleColor = currentUser.role === 'admin' ? 'bg-[#1E3A5F]' : 'bg-green-600';

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
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">المشاريع</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">الرصيد</p>
          <p className={`text-2xl font-bold ${financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(financialStats.balance)}
          </p>
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
                  {perm === 'all' && 'جميع الصلاحيات'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Menu Items */}
      <div className="space-y-2">
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">الملف الشخصي</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">الإشعارات</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">الإعدادات</span>
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

      {/* App Info */}
      <div className="text-center text-sm text-gray-400">
        <p>Beeforce Management System v1.0</p>
        <p>© 2026 جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
};