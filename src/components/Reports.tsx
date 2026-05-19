import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel, CATEGORIES, UNIT_TYPES } from '../lib/types';
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Package,
  Truck,
  AlertTriangle
} from 'lucide-react';

interface ReportsProps {}

export const Reports: React.FC<ReportsProps> = () => {
  const { transactions, projects, users, clients, stockItems, units, getFinancialStats, getMonthlySummary } = useApp();
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

  // Helper to escape CSV fields
  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    str = str.replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
      return `"${str}"`;
    }
    return str;
  };

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

  // 1. تقرير مالي CSV (طلبات + مصروفات + صافي ربح)
  const exportFinancialCSV = () => {
    const csvRows: string[][] = [];

    // Header
    csvRows.push(['--- تقرير الأداء المالي الشامل للطلبات والمصروفات ---']);
    csvRows.push([]);

    // 1. Projects Section
    csvRows.push(['1. قائمة الطلبات والمشاريع']);
    csvRows.push(['اسم المشروع', 'العميل', 'المصروفات', 'الإيرادات', 'صافي الربح', 'الحالة']);
    projects.forEach(p => {
      const pTrans = transactions.filter(t => t.projectId === p.id || t.projectName === p.name);
      const expenses = pTrans.reduce((sum, t) => sum + (t.debit || 0), 0);
      const income = pTrans.reduce((sum, t) => sum + (t.credit || 0), 0);
      const net = income - expenses;
      const statusLabel = p.status === 'paid' ? 'مدفوع' : p.status === 'completed' ? 'مكتمل' : p.status === 'in-progress' ? 'قيد التنفيذ' : 'مسودة';
      csvRows.push([p.name, p.clientName, String(expenses), String(income), String(net), statusLabel]);
    });
    csvRows.push([]);

    // 2. Expenses Section
    csvRows.push(['2. قائمة تفاصيل المصروفات']);
    csvRows.push(['التاريخ', 'المورد/الجهة', 'الوصف', 'الفئة', 'المشروع المرتبط', 'المبلغ (ر.س)']);
    transactions.filter(t => t.debit > 0).forEach(t => {
      csvRows.push([
        t.date,
        t.supplierName,
        t.description,
        getCategoryLabel(t.category),
        t.projectName || 'عام',
        String(t.debit)
      ]);
    });
    csvRows.push([]);

    // 3. Summary Section
    csvRows.push(['3. الخلاصة والربحية']);
    csvRows.push(['إجمالي الإيرادات', 'إجمالي المصروفات', 'صافي الربح', 'هامش الربح %']);
    const totalRev = transactions.reduce((s, t) => s + (t.credit || 0), 0);
    const totalExp = transactions.reduce((s, t) => s + (t.debit || 0), 0);
    const netProfit = totalRev - totalExp;
    const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(2) : '0.00';
    csvRows.push([String(totalRev), String(totalExp), String(netProfit), `${profitMargin}%`]);

    // Format & Download
    const csvContent = '\uFEFF' + csvRows.map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `beeforce_financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 2. تقرير شامل CSV (طلبات + عملاء + فريق)
  const exportComprehensiveCSV = () => {
    const csvRows: string[][] = [];

    // Header
    csvRows.push(['--- تقرير النظام الشامل (المشاريع والعملاء وفريق العمل) ---']);
    csvRows.push([]);

    // 1. Projects Section
    csvRows.push(['1. قائمة المشاريع والطلبات']);
    csvRows.push(['اسم المشروع', 'العميل', 'تاريخ التصوير', 'الحساب التحليلي', 'الحالة', 'ملاحظات']);
    projects.forEach(p => {
      const statusLabel = p.status === 'paid' ? 'مدفوع' : p.status === 'completed' ? 'مكتمل' : p.status === 'in-progress' ? 'قيد التنفيذ' : 'مسودة';
      csvRows.push([p.name, p.clientName, p.shootDates, p.analyticalAccount, statusLabel, p.notes || '']);
    });
    csvRows.push([]);

    // 2. Clients Section
    csvRows.push(['2. قائمة العملاء']);
    csvRows.push(['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الشركة/الجهة', 'العنوان', 'ملاحظات']);
    clients.forEach(c => {
      csvRows.push([c.name, c.email, c.phone, c.company, c.address, c.notes || '']);
    });
    csvRows.push([]);

    // 3. Team Section
    csvRows.push(['3. قائمة فريق العمل والموظفين']);
    csvRows.push(['الاسم', 'البريد الإلكتروني', 'اسم المستخدم', 'الدور', 'الحالة']);
    users.forEach(u => {
      const roleLabel = u.role === 'admin' ? '👑 مدير' : u.role === 'accountant' ? '📊 محاسب' : '👤 موظف';
      const activeLabel = u.isActive ? 'نشط' : 'غير نشط';
      csvRows.push([u.name, u.email, u.username || '', roleLabel, activeLabel]);
    });
    csvRows.push([]);

    // 4. Stock Section
    csvRows.push(['4. قائمة المخزون والمواد']);
    csvRows.push(['اسم العنصر', 'الفئة', 'الكمية', 'الحد الأدنى', 'وحدة القياس', 'تكلفة الوحدة (ر.س)', 'المورد', 'ملاحظات']);
    stockItems.forEach(item => {
      csvRows.push([
        item.name,
        item.category,
        String(item.quantity),
        String(item.minQuantity),
        item.unit,
        String(item.costPerUnit),
        item.supplier || '',
        item.notes || ''
      ]);
    });
    csvRows.push([]);

    // 5. Units Section
    csvRows.push(['5. قائمة الوحدات والمرافق']);
    csvRows.push(['اسم الوحدة', 'النوع', 'الحالة', 'السعة', 'ملاحظات']);
    units.forEach(u => {
      const typeLabel = UNIT_TYPES.find(t => t.value === u.type)?.label || u.type;
      const statusLabel = u.status === 'available' ? 'متاح' : u.status === 'occupied' ? 'مشغول' : u.status === 'maintenance' ? 'صيانة' : u.status;
      csvRows.push([
        u.name,
        typeLabel,
        statusLabel,
        String(u.capacity),
        u.notes || ''
      ]);
    });

    // Format & Download
    const csvContent = '\uFEFF' + csvRows.map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `beeforce_system_comprehensive_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportStockCSV = () => {
    const csvRows: string[][] = [];
    csvRows.push(['--- تقرير المخزون والمواد الشامل ---']);
    csvRows.push([]);
    csvRows.push(['اسم العنصر', 'الفئة', 'الكمية', 'الحد الأدنى', 'وحدة القياس', 'تكلفة الوحدة (ر.س)', 'المورد', 'ملاحظات']);
    stockItems.forEach(item => {
      csvRows.push([
        item.name,
        item.category,
        String(item.quantity),
        String(item.minQuantity),
        item.unit,
        String(item.costPerUnit),
        item.supplier || '',
        item.notes || ''
      ]);
    });

    const csvContent = '\uFEFF' + csvRows.map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `beeforce_stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportUnitsCSV = () => {
    const csvRows: string[][] = [];
    csvRows.push(['--- تقرير الوحدات والمرافق الشامل ---']);
    csvRows.push([]);
    csvRows.push(['اسم الوحدة', 'النوع', 'الحالة', 'السعة', 'ملاحظات']);
    units.forEach(u => {
      const typeLabel = UNIT_TYPES.find(t => t.value === u.type)?.label || u.type;
      const statusLabel = u.status === 'available' ? 'متاح' : u.status === 'occupied' ? 'مشغول' : u.status === 'maintenance' ? 'صيانة' : u.status;
      csvRows.push([
        u.name,
        typeLabel,
        statusLabel,
        String(u.capacity),
        u.notes || ''
      ]);
    });

    const csvContent = '\uFEFF' + csvRows.map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `beeforce_units_report_${new Date().toISOString().split('T')[0]}.csv`;
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
        <Button
          variant={selectedReport === 'stock' ? 'primary' : 'secondary'}
          onClick={() => setSelectedReport('stock')}
          icon={Package}
        >
          تقرير المخزون
        </Button>
        <Button
          variant={selectedReport === 'units' ? 'primary' : 'secondary'}
          onClick={() => setSelectedReport('units')}
          icon={Truck}
        >
          تقرير الوحدات
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

        {selectedReport === 'stock' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">تقرير المخزون والمواد</h2>
                <p className="text-sm text-gray-500">متابعة كميات المواد، تكاليفها، وتنبيهات انخفاض المخزون</p>
              </div>
              <Button variant="secondary" icon={Download} size="sm" onClick={exportStockCSV}>
                تصدير المخزون CSV
              </Button>
            </div>

            {/* Stock KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">إجمالي المواد الفريدة</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stockItems.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">القيمة الإجمالية للمخزون</p>
                <p className="text-xl font-bold text-[#1E3A5F] mt-1">
                  {formatCurrency(stockItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0))}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 font-semibold">مواد منخفضة المخزون</p>
                  <p className="text-xl font-bold text-amber-900 mt-1">
                    {stockItems.filter(item => item.quantity <= item.minQuantity).length}
                  </p>
                </div>
                {stockItems.filter(item => item.quantity <= item.minQuantity).length > 0 && (
                  <AlertTriangle className="w-8 h-8 text-amber-600 animate-pulse" />
                )}
              </div>
            </div>

            {/* Stock Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المادة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الفئة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية الحالية</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحد الأدنى</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">وحدة القياس</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تكلفة الوحدة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">القيمة الكلية</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">لا توجد مواد في المخزون حالياً</td>
                    </tr>
                  ) : (
                    stockItems.map((item) => {
                      const isLow = item.quantity <= item.minQuantity;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.minQuantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.costPerUnit)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#1E3A5F]">
                            {formatCurrency(item.quantity * item.costPerUnit)}
                          </td>
                          <td className="px-4 py-3">
                            {isLow ? (
                              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                طلب إمداد ⚠️
                              </Badge>
                            ) : (
                              <Badge variant="success">كافٍ 🟢</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'units' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">تقرير الوحدات والمرافق</h2>
                <p className="text-sm text-gray-500">متابعة حالة إشغال المرافق والوحدات وسعتها الاستيعابية</p>
              </div>
              <Button variant="secondary" icon={Download} size="sm" onClick={exportUnitsCSV}>
                تصدير الوحدات CSV
              </Button>
            </div>

            {/* Units KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">إجمالي الوحدات والمرافق</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{units.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">الوحدات المشغولة</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {units.filter(u => u.status === 'occupied').length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold">نسبة الإشغال</p>
                <p className="text-xl font-bold text-[#1E3A5F] mt-1">
                  {units.length > 0
                    ? ((units.filter(u => u.status === 'occupied').length / units.length) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>

            {/* Units Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الوحدة/المرفق</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السعة الاستيعابية</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {units.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">لا توجد وحدات أو مرافق مسجلة حالياً</td>
                    </tr>
                  ) : (
                    units.map((u) => {
                      const typeLabel = UNIT_TYPES.find(t => t.value === u.type)?.label || u.type;
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{typeLabel}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.capacity} أشخاص</td>
                          <td className="px-4 py-3">
                            {u.status === 'available' && (
                              <Badge variant="success">متاح 🟢</Badge>
                            )}
                            {u.status === 'occupied' && (
                              <Badge variant="info">مشغول 🔵</Badge>
                            )}
                            {u.status === 'maintenance' && (
                              <Badge variant="warning">صيانة 🔴</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={u.notes || ''}>
                            {u.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CSV 1 */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-emerald-200 bg-emerald-50/50" onClick={exportFinancialCSV}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-xl text-white">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-emerald-800">التقرير المالي الشامل CSV</p>
              <p className="text-xs text-emerald-600 mt-1">طلبات + مصروفات + صافي ربح</p>
            </div>
          </div>
        </Card>

        {/* CSV 2 */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50/50" onClick={exportComprehensiveCSV}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-blue-800">التقرير الشامل للنظام CSV</p>
              <p className="text-xs text-blue-600 mt-1">طلبات + عملاء + فريق عمل</p>
            </div>
          </div>
        </Card>

        {/* TXT Summary */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('summary')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1E3A5F]/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">الملخص المالي TXT</p>
              <p className="text-xs text-gray-500 mt-1">تقرير ملخص سريع</p>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('category')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">المصروفات بالفئة TXT</p>
              <p className="text-xs text-gray-500 mt-1">التوزيع والتفكيك</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};