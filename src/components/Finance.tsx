import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Modal } from './ui';
import { Transaction, CATEGORIES, Category, formatCurrency, getCategoryColor, getCategoryLabel } from '../lib/types';
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign,
  Download, BarChart3, Receipt, Filter, Search, AlertCircle
} from 'lucide-react';

export const Finance: React.FC = () => {
  const {
    transactions, addTransaction, deleteTransaction,
    projects, currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    description: '',
    category: 'F&B' as Category,
    debit: 0,
    projectId: '',
    projectName: '',
    no: '',
    hasTaxInvoice: false,
    notes: '',
  });

  // ── حسابات KPI ──────────────────────────────────────────────
  const totalRevenue = transactions.reduce((s, t) => s + (t.credit || 0), 0);
  const totalExpenses = transactions.reduce((s, t) => s + (t.debit || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // تفكيك المصروفات حسب الفئة
  const expenseByCategory = CATEGORIES.map(cat => ({
    category: cat,
    label: getCategoryLabel(cat),
    color: getCategoryColor(cat),
    amount: transactions.filter(t => t.category === cat).reduce((s, t) => s + (t.debit || 0), 0),
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  // الإيرادات المحصّلة (معاملات لديها credit)
  const collectedRevenue = transactions.filter(t => t.credit > 0).reduce((s, t) => s + t.credit, 0);

  // ── فلترة المصروفات ──────────────────────────────────────────
  const allExpenses = transactions.filter(t => t.debit > 0);
  const filteredExpenses = allExpenses.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // ── إضافة مصروف ─────────────────────────────────────────────
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction({
      ...expenseForm,
      credit: 0,
      no: expenseForm.no || `EXP-${Date.now()}`,
      projectId: expenseForm.projectId || '',
      projectName: expenseForm.projectName || '',
      createdBy: currentUser?.name || 'محاسب',
    });
    setShowExpenseModal(false);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      supplierName: '',
      description: '',
      category: 'F&B',
      debit: 0,
      projectId: '',
      projectName: '',
      no: '',
      hasTaxInvoice: false,
      notes: '',
    });
  };

  // ── تصدير CSV المالي ─────────────────────────────────────────
  const exportFinancialCSV = () => {
    const rows = [
      ['التاريخ', 'المورد', 'الوصف', 'الفئة', 'مدين (مصروف)', 'دائن (إيراد)', 'المشروع'],
      ...transactions.map(t => [
        t.date, t.supplierName, t.description, getCategoryLabel(t.category as Category),
        t.debit || 0, t.credit || 0, t.projectName,
      ]),
      [],
      ['', '', '', 'إجمالي الإيرادات', '', totalRevenue, ''],
      ['', '', '', 'إجمالي المصروفات', totalExpenses, '', ''],
      ['', '', '', 'صافي الربح', netProfit, '', ''],
      ['', '', '', 'هامش الربح %', `${profitMargin}%`, '', ''],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beeforce-financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المالية</h1>
          <p className="text-gray-500">لوحة الحسابات والتقارير المالية</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={exportFinancialCSV} icon={Download}>
            تصدير CSV
          </Button>
          <Button onClick={() => setShowExpenseModal(true)} icon={Plus}>
            + مصروف
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* إجمالي الإيرادات */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-700">إجمالي الإيرادات</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-green-600 mt-1">محصّل: {formatCurrency(collectedRevenue)}</p>
        </Card>

        {/* إجمالي المصروفات */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-700">إجمالي المصروفات</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-red-600 mt-1">{allExpenses.length} بند مصروف</p>
        </Card>

        {/* صافي الربح */}
        <Card className={`bg-gradient-to-br border ${netProfit >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-orange-50 to-red-50 border-orange-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <span className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>صافي الربح</span>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(Math.abs(netProfit))}
          </p>
          {netProfit < 0 && <p className="text-xs text-orange-600 mt-1">⚠️ خسارة</p>}
        </Card>

        {/* هامش الربح */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-700">هامش الربح</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{profitMargin}%</p>
          <div className="mt-2 h-1.5 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(Math.max(parseFloat(profitMargin), 0), 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📊 تفكيك المصروفات
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'expenses' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📋 قائمة المصروفات ({allExpenses.length})
        </button>
      </div>

      {/* ── Tab: تفكيك المصروفات بصري ────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {expenseByCategory.length === 0 ? (
            <Card className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد مصروفات بعد</p>
              <Button className="mt-4" onClick={() => setShowExpenseModal(true)} icon={Plus}>
                أضف أول مصروف
              </Button>
            </Card>
          ) : (
            expenseByCategory.map(({ category, label, color, amount }) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const barColor = color.split(' ')[0].replace('bg-', 'bg-').replace('100', '500');
              return (
                <Card key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
                      <span className="text-sm text-gray-500 mr-2">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: '#1E3A5F' }}
                    />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: قائمة المصروفات ─────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في المصروفات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            >
              <option value="all">جميع الفئات</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{getCategoryLabel(c)}</option>
              ))}
            </select>
          </div>

          {/* Expenses Table */}
          {filteredExpenses.length === 0 ? (
            <Card className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد مصروفات مطابقة</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map(t => (
                <Card key={t.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.description || t.supplierName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(t.category as Category)}`}>
                            {getCategoryLabel(t.category as Category)}
                          </span>
                          <span className="text-xs text-gray-400">{t.date}</span>
                          {t.projectName && (
                            <span className="text-xs text-blue-600">📁 {t.projectName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-600 text-lg">{formatCurrency(t.debit)}</span>
                      <button
                        onClick={() => setDeleteConfirm(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal: إضافة مصروف ──────────────────────────────── */}
      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="➕ إضافة مصروف جديد" size="lg">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select
                value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as Category })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                required
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{getCategoryLabel(c)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المورد / الجهة</label>
              <input
                type="text"
                value={expenseForm.supplierName}
                onChange={e => setExpenseForm({ ...expenseForm, supplierName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="اسم المورد"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ر.س)</label>
              <input
                type="number"
                value={expenseForm.debit || ''}
                onChange={e => setExpenseForm({ ...expenseForm, debit: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              placeholder="وصف المصروف"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المشروع (اختياري)</label>
            <select
              value={expenseForm.projectId}
              onChange={e => {
                const proj = projects.find(p => p.id === e.target.value);
                setExpenseForm({ ...expenseForm, projectId: e.target.value, projectName: proj?.name || '' });
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            >
              <option value="">-- بدون مشروع --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasTaxInvoice"
              checked={expenseForm.hasTaxInvoice}
              onChange={e => setExpenseForm({ ...expenseForm, hasTaxInvoice: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="hasTaxInvoice" className="text-sm text-gray-700">يوجد فاتورة ضريبية</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowExpenseModal(false)} className="flex-1">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1">
              حفظ المصروف
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete ──────────────────────────────────── */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
        <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">إلغاء</Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (deleteConfirm) {
                deleteTransaction(deleteConfirm);
                setDeleteConfirm(null);
              }
            }}
          >
            حذف
          </Button>
        </div>
      </Modal>
    </div>
  );
};