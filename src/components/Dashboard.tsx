import React from 'react';
import { useApp, useLanguage } from '../lib/context';
import { Card, StatCard, Badge, EmptyState } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel } from '../lib/types';
import {
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Clock
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, projects, transactions, getProjectStats, getFinancialStats, getMonthlySummary } = useApp();
  const { language } = useLanguage();
  const txt = (ar: string, en: string) => language === 'ar' ? ar : en;

  const projectStats = getProjectStats();
  const financialStats = getFinancialStats();
  const monthlySummary = getMonthlySummary();

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get active projects
  const activeProjects = projects.filter(p => p.status === 'draft' || p.status === 'in-progress').slice(0, 5);

  const isAdmin = currentUser?.role === 'admin';
  const isEmployee = currentUser?.role === 'employee';

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {txt('مرحباً،', 'Welcome,')} {currentUser?.name}
          </h1>
          <p className="text-gray-500">
            {isAdmin 
              ? txt('لوحة التحكم الرئيسية', 'Main Administration Dashboard') 
              : txt('إدارة مهامك ومشاريعك المشتركة', 'Manage your tasks and shared projects')}
          </p>
        </div>
        <div className="text-left">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            isAdmin 
              ? 'bg-[#1E3A5F]/10 text-[#1E3A5F]' 
              : currentUser?.role === 'accountant' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
          }`}>
            {currentUser?.role === 'admin' 
              ? txt('مدير', 'Admin') 
              : currentUser?.role === 'accountant' 
                ? txt('محاسب', 'Accountant') 
                : txt('موظف', 'Employee')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={txt('إجمالي المشاريع', 'Total Projects')}
          value={projectStats.total}
          icon={Building2}
          color="text-[#1E3A5F]"
        />
        <StatCard
          label={txt('المشاريع النشطة', 'Active Projects')}
          value={projectStats.active}
          icon={Clock}
          color="text-amber-600"
        />
        <StatCard
          label={txt('إجمالي الإيرادات', 'Total Income')}
          value={formatCurrency(financialStats.totalIncome)}
          icon={ArrowUpRight}
          color="text-green-600"
        />
        <StatCard
          label={txt('إجمالي المصروفات', 'Total Expenses')}
          value={formatCurrency(financialStats.totalExpenses)}
          icon={ArrowDownRight}
          color="text-red-600"
        />
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-l from-[#1E3A5F] to-[#2D7D46] text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">{txt('الرصيد الحالي', 'Current Balance')}</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(financialStats.balance)}</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      {(isAdmin || isEmployee) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow animate-hover" onClick={() => onNavigate('Projects')}>
            <Plus className="w-6 h-6 text-[#1E3A5F] mb-2" />
            <p className="font-medium text-gray-900">{txt('مشروع جديد', 'New Project')}</p>
            <p className="text-sm text-gray-500">{txt('إضافة مشروع للشبكة', 'Add project to network')}</p>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow animate-hover" onClick={() => onNavigate('Transactions')}>
            <DollarSign className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">{txt('إضافة معاملة', 'New Transaction')}</p>
            <p className="text-sm text-gray-500">{txt('تسجيل إيراد أو مصروف', 'Record income/expense')}</p>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow animate-hover" onClick={() => onNavigate('Reports')}>
            <Eye className="w-6 h-6 text-amber-600 mb-2" />
            <p className="font-medium text-gray-900">{txt('التقارير المالية', 'Financial Reports')}</p>
            <p className="text-sm text-gray-500">{txt('تحميل وعرض كشوفات', 'View & export sheets')}</p>
          </Card>
          {isAdmin && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow animate-hover" onClick={() => onNavigate('Users')}>
              <Building2 className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">{txt('إدارة الموظفين', 'Staff Management')}</p>
              <p className="text-sm text-gray-500">{txt('تعديل صلاحيات وحسابات', 'Roles and credentials')}</p>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{txt('أحدث المعاملات', 'Recent Transactions')}</h2>
            <button
              onClick={() => onNavigate('Transactions')}
              className="text-sm text-[#1E3A5F] hover:underline font-medium"
            >
              {txt('عرض الكل', 'View All')}
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{t.supplierName}</p>
                    <p className="text-sm text-gray-500">{t.projectName}</p>
                  </div>
                  <div className="text-left">
                    {t.debit > 0 ? (
                      <span className="text-red-600 font-semibold">-{formatCurrency(t.debit)}</span>
                    ) : (
                      <span className="text-green-600 font-semibold">+{formatCurrency(t.credit)}</span>
                    )}
                    <span className={`block text-xs mt-1 px-2 py-0.5 rounded-full ${getCategoryColor(t.category)}`}>
                      {getCategoryLabel(t.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={DollarSign}
              title={txt('لا توجد معاملات بعد', 'No transactions yet')}
              description={txt('ابدأ بإضافة معاملات مالية جديدة للمشاريع', 'Start recording cash operations')}
            />
          )}
        </Card>

        {/* Active Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{txt('المشاريع النشطة', 'Active Projects')}</h2>
            <button
              onClick={() => onNavigate('Projects')}
              className="text-sm text-[#1E3A5F] hover:underline font-medium"
            >
              {txt('عرض الكل', 'View All')}
            </button>
          </div>

          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer border border-gray-100 hover:bg-gray-100/50 hover:shadow-xs transition-all"
                  onClick={() => onNavigate('projectDetails', p.id)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.clientName}</p>
                  </div>
                  <Badge variant={p.status === 'draft' ? 'warning' : 'info'}>
                    {p.status === 'draft' ? txt('مسودة', 'Draft') : txt('قيد التنفيذ', 'In Progress')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title={txt('لا توجد مشاريع نشطة', 'No active projects')}
              description={isAdmin ? txt('أضف مشروعاً جديداً للبدء', 'Create a new project to start') : txt('لم يتم إسناد مشاريع نشطة إليك حالياً', 'No active projects assigned to you')}
            />
          )}
        </Card>
      </div>

      {/* Monthly Summary Chart Placeholder */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{txt('الملخص المالي الشهري', 'Monthly Financial Summary')}</h2>
        <div className="grid grid-cols-4 gap-4">
          {monthlySummary.slice(-4).map((m, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition-colors">
              <p className="text-sm text-gray-500 mb-1 font-medium">{m.month}</p>
              <p className="text-green-600 font-bold text-sm">+{formatCurrency(m.income)}</p>
              <p className="text-red-600 text-sm font-semibold">-{formatCurrency(m.expenses)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};