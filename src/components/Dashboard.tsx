import React from 'react';
import { useApp } from '../lib/context';
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

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مرحباً، {currentUser?.name}
          </h1>
          <p className="text-gray-500">
            {isAdmin ? 'لوحة التحكم الرئيسية' : 'إدارة مهامك ومشاريعك'}
          </p>
        </div>
        <div className="text-left">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${isAdmin ? 'bg-[#1E3A5F]/10 text-[#1E3A5F]' : 'bg-green-100 text-green-700'}`}>
            {isAdmin ? 'مدير' : 'موظف'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي المشاريع"
          value={projectStats.total}
          icon={Building2}
          color="text-[#1E3A5F]"
        />
        <StatCard
          label="المشاريع النشطة"
          value={projectStats.active}
          icon={Clock}
          color="text-amber-600"
        />
        <StatCard
          label="إجمالي الإيرادات"
          value={formatCurrency(financialStats.totalIncome)}
          icon={ArrowUpRight}
          color="text-green-600"
        />
        <StatCard
          label="إجمالي المصروفات"
          value={formatCurrency(financialStats.totalExpenses)}
          icon={ArrowDownRight}
          color="text-red-600"
        />
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-l from-[#1E3A5F] to-[#2D7D46] text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">الرصيد الحالي</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(financialStats.balance)}</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('Projects')}>
            <Plus className="w-6 h-6 text-[#1E3A5F] mb-2" />
            <p className="font-medium text-gray-900">مشروع جديد</p>
            <p className="text-sm text-gray-500">إضافة مشروع</p>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('Transactions')}>
            <DollarSign className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">إضافة معاملة</p>
            <p className="text-sm text-gray-500">تسجيل مصروف</p>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('Reports')}>
            <Eye className="w-6 h-6 text-amber-600 mb-2" />
            <p className="font-medium text-gray-900">التقارير</p>
            <p className="text-sm text-gray-500">عرض التقارير</p>
          </Card>
          {isAdmin && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('Users')}>
              <Building2 className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">إدارة الموظفين</p>
              <p className="text-sm text-gray-500">صلاحيات</p>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">أحدث المعاملات</h2>
            <button
              onClick={() => onNavigate('Transactions')}
              className="text-sm text-[#1E3A5F] hover:underline"
            >
              عرض الكل
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{t.supplierName}</p>
                    <p className="text-sm text-gray-500">{t.projectName}</p>
                  </div>
                  <div className="text-left">
                    {t.debit > 0 ? (
                      <span className="text-red-600 font-medium">-{formatCurrency(t.debit)}</span>
                    ) : (
                      <span className="text-green-600 font-medium">+{formatCurrency(t.credit)}</span>
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
              title="لا توجد معاملات"
              description="ابدأ بإضافة معاملات جديدة"
            />
          )}
        </Card>

        {/* Active Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">المشاريع النشطة</h2>
            <button
              onClick={() => onNavigate('Projects')}
              className="text-sm text-[#1E3A5F] hover:underline"
            >
              عرض الكل
            </button>
          </div>

          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onNavigate('projectDetails', p.id)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.clientName}</p>
                  </div>
                  <Badge variant={p.status === 'draft' ? 'warning' : 'info'}>
                    {p.status === 'draft' ? 'مسودة' : 'قيد التنفيذ'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="لا توجد مشاريع نشطة"
              description={isAdmin ? "أضف مشروعاً جديداً للبدء" : "لم يتم إسناد مشاريع إليك بعد"}
            />
          )}
        </Card>
      </div>

      {/* Monthly Summary Chart Placeholder */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص شهري</h2>
        <div className="grid grid-cols-4 gap-4">
          {monthlySummary.slice(-4).map((m, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">{m.month}</p>
              <p className="text-green-600 font-medium">{formatCurrency(m.income)}</p>
              <p className="text-red-600 text-sm">{formatCurrency(m.expenses)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};