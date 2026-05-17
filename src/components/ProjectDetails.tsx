import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge, EmptyState, Input, Select, Modal } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel, CATEGORIES, Category, PROJECT_STATUSES } from '../lib/types';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  DollarSign,
  FileText,
  Download,
  Filter,
  ChevronRight,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onBack }) => {
  const { projects, transactions, addTransaction, updateTransaction, deleteTransaction, currentUser } = useApp();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);
  const projectTransactions = transactions.filter(t => t.projectId === projectId || t.projectName === project?.name);

  const isAdmin = currentUser?.role === 'admin';
  const canAddTransaction = currentUser?.permissions.includes('add_transaction') || isAdmin;

  // Calculate project stats
  const totalExpenses = projectTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalIncome = projectTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">المشروع غير موجود</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          العودة للمشاريع
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500">{project.clientName}</p>
        </div>
        {canAddTransaction && (
          <Button icon={Plus} onClick={() => setShowAddTransaction(true)}>
            إضافة معاملة
          </Button>
        )}
      </div>

      {/* Project Info Card */}
      <Card className="bg-gradient-to-l from-[#1E3A5F]/5 to-transparent">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">تاريخ التصوير</p>
            <p className="font-medium text-gray-900">{project.shootDates}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">الحساب التحليلي</p>
            <p className="font-medium text-gray-900">{project.analyticalAccount || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">الحالة</p>
            <Badge variant={project.status === 'paid' ? 'success' : project.status === 'draft' ? 'warning' : 'info'}>
              {PROJECT_STATUSES.find(s => s.value === project.status)?.label || project.status}
            </Badge>
          </div>
        </div>

        {project.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">ملاحظات</p>
            <p className="text-gray-700">{project.notes}</p>
          </div>
        )}

        {project.hasTaxInvoice && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <FileText className="w-4 h-4" />
              فاتورة ضريبية
            </span>
          </div>
        )}
      </Card>

      {/* Financial Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>

        <Card className={`border ${totalIncome - totalExpenses >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${totalIncome - totalExpenses >= 0 ? 'bg-blue-100' : 'bg-amber-100'}`}>
              <DollarSign className={`w-6 h-6 ${totalIncome - totalExpenses >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">صافي المشروع</p>
              <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">المعاملات المالية</h2>
          <span className="text-sm text-gray-500">{projectTransactions.length} معاملة</span>
        </div>

        {projectTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المورد</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الوصف</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الفئة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">مدين</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">دائن</th>
                  {isAdmin && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(parseISO(t.date), 'dd/MM/yyyy', { locale: ar })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.supplierName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.description}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(t.category)}`}>
                        {getCategoryLabel(t.category)}
                      </span>
                    </td>
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
                              setShowAddTransaction(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(t.id)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
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
        ) : (
          <EmptyState
            icon={Receipt}
            title="لا توجد معاملات"
            description="ابدأ بإضافة معاملات مالية لهذا المشروع"
            action={
              canAddTransaction && (
                <Button icon={Plus} onClick={() => setShowAddTransaction(true)}>
                  إضافة معاملة
                </Button>
              )
            }
          />
        )}
      </Card>

      {/* Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={showAddTransaction}
        onClose={() => {
          setShowAddTransaction(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction ? transactions.find(t => t.id === editingTransaction) : undefined}
        projectId={projectId}
        projectName={project.name}
        onSave={(data) => {
          if (editingTransaction) {
            updateTransaction(editingTransaction, data);
          } else {
            addTransaction(data);
          }
          setShowAddTransaction(false);
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
  projectId: string;
  projectName: string;
  onSave: (data: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction, projectId, projectName, onSave }) => {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    no: transaction?.no || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    supplierName: transaction?.supplierName || '',
    description: transaction?.description || '',
    category: transaction?.category || 'F&B' as Category,
    debit: transaction?.debit || 0,
    credit: transaction?.credit || 0,
    projectId: transaction?.projectId || projectId,
    projectName: transaction?.projectName || projectName,
    hasTaxInvoice: transaction?.hasTaxInvoice || false,
    notes: transaction?.notes || '',
  });

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
          <div className="flex items-center gap-3 pt-6">
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