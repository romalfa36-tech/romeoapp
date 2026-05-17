import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel, CATEGORIES } from '../lib/types';
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2
} from 'lucide-react';

interface ReportsProps {}

export const Reports: React.FC<ReportsProps> = () => {
  const { transactions, projects, getFinancialStats, getMonthlySummary } = useApp();
  const [selectedReport, setSelectedReport] = useState('summary');

  const stats = getFinancialStats();
  const monthlySummary = getMonthlySummary();

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map(category => {
    const categoryTransactions = transactions.filter(t => t.category === category);
    const totalExpenses = categoryTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const count = categoryTransactions.length;
    return { category, totalExpenses, count };
  }).filter(c => c.count > 0).sort((a, b) => b.totalExpenses - a.totalExpenses);

  // Project breakdown
  const projectBreakdown = projects.map(project => {
    const projectTransactions = transactions.filter(t => t.projectId === project.id || t.projectName === project.name);
    const totalExpenses = projectTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalIncome = projectTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    return { ...project, totalExpenses, totalIncome, transactionCount: projectTransactions.length };
  }).filter(p => p.transactionCount > 0).sort((a, b) => b.totalExpenses - a.totalExpenses);

  // Tax invoices
  const taxInvoices = transactions.filter(t => t.hasTaxInvoice);
  const totalTaxExpenses = taxInvoices.reduce((sum, t) => sum + (t.debit || 0), 0);

  // Export reports
  const exportReport = (type: string) => {
    let content = '';
    let filename = '';

    if (type === 'summary') {
      filename = 'financial_summary';
      content = `تقرير الملخص المالي\n${'='.repeat(30)}\n\n`;
      content += `إجمالي الإيرادات: ${formatCurrency(stats.totalIncome)}\n`;
      content += `إجمالي المصروفات: ${formatCurrency(stats.totalExpenses)}\n`;
      content += `الرصيد: ${formatCurrency(stats.balance)}\n`;
      content += `\nتاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`;
    } else if (type === 'category') {
      filename = 'category_breakdown';
      content = `تقرير breakdown حسب الفئة\n${'='.repeat(30)}\n\n`;
      categoryBreakdown.forEach(c => {
        content += `${getCategoryLabel(c.category)}: ${formatCurrency(c.totalExpenses)} (${c.count} معاملة)\n`;
      });
    } else if (type === 'project') {
      filename = 'project_costs';
      content = `تقرير تكاليف المشاريع\n${'='.repeat(30)}\n\n`;
      projectBreakdown.forEach(p => {
        content += `${p.name} (${p.clientName}):\n`;
        content += `  المصروفات: ${formatCurrency(p.totalExpenses)}\n`;
        content += `  الإيرادات: ${formatCurrency(p.totalIncome)}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-500">عرض وتحميل التقارير المالية</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-3 bg-green-100 rounded-xl inline-flex mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
        </Card>
        <Card className="text-center">
          <div className="p-3 bg-red-100 rounded-xl inline-flex mb-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-500">إجمالي المصروفات</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
        </Card>
        <Card className="text-center">
          <div className="p-3 bg-blue-100 rounded-xl inline-flex mb-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500">الرصيد</p>
          <p className={`text-xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            {formatCurrency(stats.balance)}
          </p>
        </Card>
        <Card className="text-center">
          <div className="p-3 bg-purple-100 rounded-xl inline-flex mb-2">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500">الفواتير الضريبية</p>
          <p className="text-xl font-bold text-purple-600">{taxInvoices.length}</p>
        </Card>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedReport === 'summary' ? 'primary' : 'secondary'}
          onClick={() => setSelectedReport('summary')}
          icon={BarChart3}
        >
          الملخص المالي
        </Button>
        <Button
          variant={selectedReport === 'category' ? 'primary' : 'secondary'}
          onClick={() => setSelectedReport('category')}
          icon={PieChart}
        >
          breakdown حسب الفئة
        </Button>
        <Button
          variant={selectedReport === 'project' ? 'primary' : 'secondary'}
          onClick={() => setSelectedReport('project')}
          icon={Building2}
        >
          تكاليف المشاريع
        </Button>
        <Button
          variant={selectedReport === 'tax' ? 'primary' : 'secondary'}
          onClick={() => setSelectedReport('tax')}
          icon={FileText}
        >
          الفواتير الضريبية
        </Button>
      </div>

      {/* Report Content */}
      <Card>
        {selectedReport === 'summary' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">الملخص المالي</h2>
              <Button variant="secondary" icon={Download} size="sm" onClick={() => exportReport('summary')}>
                تصدير التقرير
              </Button>
            </div>

            {/* Monthly Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الشهر</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإيرادات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المصروفات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الفرق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlySummary.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.month}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(m.income)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(m.expenses)}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${m.income - m.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(m.income - m.expenses)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-sm">الإجمالي</td>
                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(stats.totalIncome)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(stats.totalExpenses)}</td>
                    <td className={`px-4 py-3 text-sm ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'category' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">breakdown حسب الفئة</h2>
              <Button variant="secondary" icon={Download} size="sm" onClick={() => exportReport('category')}>
                تصدير التقرير
              </Button>
            </div>

            <div className="space-y-4">
              {categoryBreakdown.map(({ category, totalExpenses, count }) => {
                const percentage = (totalExpenses / stats.totalExpenses) * 100;
                return (
                  <div key={category} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                          {getCategoryLabel(category)}
                        </span>
                        <span className="text-sm text-gray-500">{count} معاملة</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1E3A5F] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% من إجمالي المصروفات</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedReport === 'project' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">تكاليف المشاريع</h2>
              <Button variant="secondary" icon={Download} size="sm" onClick={() => exportReport('project')}>
                تصدير التقرير
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المشروع</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">العميل</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المصروفات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإيرادات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">عدد المعاملات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectBreakdown.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.clientName}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(p.totalExpenses)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(p.totalIncome)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'tax' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">الفواتير الضريبية</h2>
              <div className="text-sm text-gray-500">
                المجموع: <span className="font-semibold text-gray-900">{formatCurrency(totalTaxExpenses)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المورد</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الوصف</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الفئة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المشروع</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxInvoices.map((t, i) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.date}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.supplierName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.description}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(t.category)}`}>
                          {getCategoryLabel(t.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.projectName}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">{formatCurrency(t.debit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('summary')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1E3A5F]/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">تصدير الملخص المالي</p>
              <p className="text-sm text-gray-500">تقرير شامل بصيغة نصية</p>
            </div>
          </div>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('category')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">تصدير breakdown الفئات</p>
              <p className="text-sm text-gray-500">تفاصيل المصروفات حسب الفئة</p>
            </div>
          </div>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('project')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">تصدير تكاليف المشاريع</p>
              <p className="text-sm text-gray-500">تقرير تفصيلي لكل مشروع</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};