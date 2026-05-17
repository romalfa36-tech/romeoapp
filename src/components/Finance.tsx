import React, { useState, useRef } from 'react';
import { useApp } from '../lib/context';
import { Card, Badge, EmptyState, Modal, Button } from './ui';
import { Invoice, InvoiceStatus, INVOICE_STATUSES, InvoiceItem } from '../lib/types';
import { formatCurrency } from '../lib/types';
import {
  Plus, Search, Edit, Trash2, FileText, Upload, Check, X, Eye,
  Clock, AlertCircle, CheckCircle, DollarSign, Receipt, FileUp
} from 'lucide-react';

export const Finance: React.FC = () => {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, projects, clients, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForUpload, setSelectedInvoiceForUpload] = useState<Invoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    type: 'invoice' as 'invoice' | 'quote',
    projectId: '',
    projectName: '',
    clientName: '',
    amount: 0,
    vatAmount: 0,
    totalAmount: 0,
    status: 'draft' as InvoiceStatus,
    dueDate: '',
    items: [] as InvoiceItem[],
    attachments: [] as string[],
    notes: '',
  });
  const [attachment, setAttachment] = useState<string>('');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.permissions.includes('review_invoices');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = INVOICE_STATUSES.find(s => s.value === status);
    return <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>;
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setFormData({
        ...formData,
        projectId,
        projectName: project.name,
        clientName: project.clientName,
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat;
    setFormData({
      ...formData,
      amount: subtotal,
      vatAmount: vat,
      totalAmount: total,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setFormData({ ...formData, items: newItems });
    calculateTotals();
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        createdBy: currentUser?.name || '',
        attachments: formData.attachments || [],
      };
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, invoiceData);
      } else {
        await addInvoice(invoiceData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      projectId: invoice.projectId,
      projectName: invoice.projectName,
      clientName: invoice.clientName,
      amount: invoice.amount,
      vatAmount: invoice.vatAmount,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      items: invoice.items,
      attachments: invoice.attachments,
      notes: invoice.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      await deleteInvoice(id);
    }
  };

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    await updateInvoice(id, {
      status: newStatus,
      reviewedBy: currentUser?.name,
      reviewedAt: new Date().toISOString(),
    });
  };

  const handleUpload = (invoice: Invoice) => {
    setSelectedInvoiceForUpload(invoice);
    setShowUploadModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, you would upload to a storage service
      // For now, we'll store the file name as a placeholder
      const fileUrl = URL.createObjectURL(file);
      setAttachment(fileUrl);
    }
  };

  const saveAttachment = async () => {
    if (selectedInvoiceForUpload && attachment) {
      const updatedAttachments = [...selectedInvoiceForUpload.attachments, attachment];
      await updateInvoice(selectedInvoiceForUpload.id, {
        attachments: updatedAttachments,
      });
      setShowUploadModal(false);
      setAttachment('');
      setSelectedInvoiceForUpload(null);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setFormData({
      invoiceNumber: '',
      type: 'invoice',
      projectId: '',
      projectName: '',
      clientName: '',
      amount: 0,
      vatAmount: 0,
      totalAmount: 0,
      status: 'draft',
      dueDate: '',
      items: [],
      attachments: [],
      notes: '',
    });
  };

  // Get pending invoices count for accounting review
  const pendingCount = invoices.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المالية</h1>
          <p className="text-gray-500">إدارة الفواتير وعروض الأسعار</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إنشاء مستند
        </Button>
      </div>

      {/* Pending Review Alert */}
      {isAdmin && pendingCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">المستندات تنتظر المراجعة</h3>
                <p className="text-sm text-blue-600">
                  يوجد {pendingCount} مستند في انتظار مراجعة المحاسبة
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setStatusFilter('pending')}>
              عرض الكل
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-xl">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي المستندات</p>
              <p className="text-xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">في الانتظار</p>
              <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">approved</p>
              <p className="text-xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">المدفوع</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المستندات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value="all">الكل الأنواع</option>
              <option value="invoice">فواتير</option>
              <option value="quote">عروض أسعار</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value="all">الكل الحالات</option>
              <option value="draft">مسودة</option>
              <option value="pending">في الانتظار</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
              <option value="paid">مدفوع</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${invoice.type === 'invoice' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {invoice.type === 'invoice' ? (
                      <Receipt className="w-6 h-6 text-blue-600" />
                    ) : (
                      <FileText className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <Badge variant={invoice.type === 'invoice' ? 'info' : 'success'}>
                        {invoice.type === 'invoice' ? 'فاتورة' : 'عرض سعر'}
                      </Badge>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {invoice.projectName} | {invoice.clientName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                    <p className="text-xs text-gray-400">
                      شامل الضريبة: {formatCurrency(invoice.vatAmount)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {invoice.attachments.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                        {invoice.attachments.length} مرفق
                      </span>
                    )}
                    <button
                      onClick={() => handleUpload(invoice)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="رفع مرفق"
                    >
                      <FileUp className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    {invoice.status === 'pending' && isAdmin && (
                      <>
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'approved')}
                          className="p-2 hover:bg-green-50 rounded-lg"
                          title="موافقة"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'rejected')}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          title="رفض"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Invoice Items Preview */}
              {invoice.items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">البنود:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {invoice.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">{item.description}</span>
                        <span className="text-gray-400 mx-2">×</span>
                        <span className="font-medium">{item.quantity}</span>
                        <span className="text-gray-400 mx-2">=</span>
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                    {invoice.items.length > 3 && (
                      <div className="text-sm text-gray-500 p-2">
                        +{invoice.items.length - 3} بنود أخرى
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                <span>أنشئ بواسطة: {invoice.createdBy}</span>
                <span>تاريخ الاستحقاق: {invoice.dueDate || 'غير محدد'}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="لا يوجد مستندات"
          description="ابدأ بإنشاء فاتورة أو عرض سعر"
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingInvoice ? 'تعديل المستند' : 'إنشاء مستند جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم المستند</label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                placeholder="مثال: INV-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              >
                <option value="invoice">فاتورة</option>
                <option value="quote">عرض سعر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المشروع</label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              >
                <option value="">اختر المشروع</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">البنود</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                إضافة بند
              </Button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="الوصف"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                />
                <input
                  type="number"
                  placeholder="الكمية"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="w-20 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                />
                <input
                  type="number"
                  placeholder="السعر"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                  className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                />
                <span className="w-24 text-center">{formatCurrency(item.total)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              >
                {INVOICE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">المجموع الفرعي:</span>
              <span className="font-medium">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">ضريبة القيمة المضافة (15%):</span>
              <span className="font-medium">{formatCurrency(formData.vatAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>الإجمالي:</span>
              <span className="text-[#1E3A5F]">{formatCurrency(formData.totalAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingInvoice ? 'تعديل' : 'إنشاء'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Attachment Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setAttachment('');
        }}
        title={`رفع مرفق - ${selectedInvoiceForUpload?.invoiceNumber}`}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">اسحب الصورة أو المستند هنا</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="w-4 h-4 mr-2" />
              اختر ملف
            </Button>
          </div>

          {attachment && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-700">تم اختيار الملف بنجاح</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={saveAttachment} disabled={!attachment} className="flex-1">
              حفظ المرفق
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setAttachment('');
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};