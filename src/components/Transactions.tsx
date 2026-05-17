import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge, EmptyState, Input, Select, Modal } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel, CATEGORIES, Category } from '../lib/types';
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TransactionsProps {
  onNavigate: (page: string, id?: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ onNavigate }) => {
  const { transactions, projects, addTransaction, updateTransaction, deleteTransaction, currentUser, getFinancialStats } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const canAddTransaction = currentUser?.permissions.includes('add_transaction') || isAdmin;
  const stats = getFinancialStats();

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter(t => {
    const matchesSearch = t.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesProject = projectFilter === 'all' || t.projectId === projectFilter || t.projectName === projectFilter;
    const matchesDate = !dateFilter || t.date.startsWith(dateFilter);
    return matchesSearch && matchesCategory && matchesProject && matchesDate;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['التاريخ', 'المورد', 'الوصف', 'الفئة', 'مدين', 'دائن', 'المشروع', 'فاتورة ضريبية', 'ملاحظات'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.supplierName,
      t.description,
      t.category,
      t.debit,
      t.credit,
      t.projectName,
      t.hasTaxInvoice ? 'نعم' : 'لا',
      t.notes
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المعاملات المالية</h1>
          <p className="text-gray-500">سجل جميع المعاملات المالية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download} onClick={exportToCSV}>
            تصدير CSV
          </Button>
          {canAddTransaction && (
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>
              إضافة معاملة
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">إجمالي المصروفات</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">إجمالي الإيرادات</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">الرصيد</p>
          <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            {formatCurrency(stats.balance)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        >
          <option value="all">جميع الفئات</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{getCategoryLabel(c)}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        >
          <option value="all">جميع المشاريع</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
          <option value="General Expenses">المصروفات العامة</option>
        </select>
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        />
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <Card className="overflow-hidden">
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
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">مدين</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">دائن</th>
                  {isAdmin && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((t, index) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(parseISO(t.date), 'dd/MM/yyyy', { locale: ar })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.supplierName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(t.category)}`}>
                        {getCategoryLabel(t.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.projectName}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      {t.debit > 0 ? formatCurrency(t.debit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                      {t.credit > 0 ? formatCurrency(t.credit) : '-'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(t.id);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(t.id)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
            عرض {filteredTransactions.length} من {transactions.length} معاملة
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Receipt}
          title="لا توجد معاملات"
          description={canAddTransaction ? "ابدأ بإضافة معاملات مالية جديدة" : "لم يتم العثور على معاملات تطابق البحث"}
          action={
            canAddTransaction && (
              <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                إضافة معاملة
              </Button>
            )
          }
        />
      )}

      {/* Add/Edit Modal */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction ? transactions.find(t => t.id === editingTransaction) : undefined}
        projects={projects}
        onSave={(data) => {
          if (editingTransaction) {
            updateTransaction(editingTransaction, data);
          } else {
            addTransaction(data);
          }
          setShowAddModal(false);
          setEditingTransaction(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذه المعاملة؟</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (showDeleteConfirm) {
                deleteTransaction(showDeleteConfirm);
                setShowDeleteConfirm(null);
              }
            }}
            className="flex-1"
          >
            حذف
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Transaction Form Modal
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  projects: any[];
  onSave: (data: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction, projects, onSave }) => {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    no: transaction?.no || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    supplierName: transaction?.supplierName || '',
    description: transaction?.description || '',
    category: transaction?.category || 'F&B' as Category,
    debit: transaction?.debit || 0,
    credit: transaction?.credit || 0,
    projectId: transaction?.projectId || '',
    projectName: transaction?.projectName || '',
    hasTaxInvoice: transaction?.hasTaxInvoice || false,
    notes: transaction?.notes || '',
  });

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setFormData({
      ...formData,
      projectId,
      projectName: project?.name || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdBy: currentUser?.id || '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'تعديل المعاملة' : 'إضافة معاملة'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="رقم المعاملة"
            type="number"
            value={formData.no}
            onChange={(e) => setFormData({ ...formData, no: e.target.value })}
            placeholder="1"
          />
          <Input
            label="التاريخ"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <Input
          label="اسم المورد"
          value={formData.supplierName}
          onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
          placeholder="مثال: Tamimi Market"
          required
        />

        <Input
          label="الوصف"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="مثال: مواد غذائية"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="الفئة"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            options={CATEGORIES.map(c => ({ value: c, label: getCategoryLabel(c) }))}
          />
          <Select
            label="المشروع"
            value={formData.projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            options={[
              { value: '', label: 'المصروفات العامة' },
              ...projects.map(p => ({ value: p.id, label: p.name }))
            ]}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="مبلغ مدين (المصروفات)"
            type="number"
            step="0.01"
            value={formData.debit || ''}
            onChange={(e) => setFormData({ ...formData, debit: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
          <Input
            label="مبلغ دائن (الإيرادات)"
            type="number"
            step="0.01"
            value={formData.credit || ''}
            onChange={(e) => setFormData({ ...formData, credit: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasTaxInvoice"
            checked={formData.hasTaxInvoice}
            onChange={(e) => setFormData({ ...formData, hasTaxInvoice: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300"
          />
          <label htmlFor="hasTaxInvoice" className="text-sm text-gray-700">
            فاتورة ضريبية
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
          <Button type="submit" className="flex-1">
            {transaction ? 'حفظ التغييرات' : 'إضافة المعاملة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};