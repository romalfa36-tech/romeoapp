import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge, EmptyState, Input, Select, Modal } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel, PROJECT_STATUSES, Category } from '../lib/types';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  DollarSign,
  FileText,
  ChevronRight
} from 'lucide-react';

interface ProjectsProps {
  onNavigate: (page: string, id?: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onNavigate }) => {
  const { projects, addProject, updateProject, deleteProject, transactions, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get project stats
  const getProjectStats = (projectId: string) => {
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const totalExpenses = projectTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalIncome = projectTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    return { totalExpenses, totalIncome, transactionCount: projectTransactions.length };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.value === status);
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-700'}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
          <p className="text-gray-500">إدارة وتتبع جميع المشاريع</p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>
            إضافة مشروع
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن مشروع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        >
          <option value="all">جميع الحالات</option>
          <option value="draft">مسودة</option>
          <option value="in-progress">قيد التنفيذ</option>
          <option value="paid">مدفوع</option>
          <option value="completed">مكتمل</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.clientName}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{project.shootDates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{project.analyticalAccount}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">المصروفات</p>
                    <p className="font-semibold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">عدد المعاملات</p>
                    <p className="font-semibold text-gray-900">{stats.transactionCount}</p>
                  </div>
                  <div className="text-center">
                    {project.hasTaxInvoice && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        فاتورة ضريبية
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => onNavigate('projectDetails', project.id)}
                    className="flex-1"
                  >
                    التفاصيل
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => {
                          setEditingProject(project.id);
                          setShowAddModal(true);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setShowDeleteConfirm(project.id)}
                        className="text-red-600 hover:bg-red-50"
                      />
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="لا توجد مشاريع"
          description="ابدأ بإضافة مشروع جديد"
          action={
            isAdmin && (
              <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                إضافة مشروع
              </Button>
            )
          }
        />
      )}

      {/* Add/Edit Modal */}
      <ProjectModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProject(null);
        }}
        project={editingProject ? projects.find(p => p.id === editingProject) : undefined}
        onSave={(data) => {
          if (editingProject) {
            updateProject(editingProject, data);
          } else {
            addProject(data);
          }
          setShowAddModal(false);
          setEditingProject(null);
        }}
        isAdmin={isAdmin}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (showDeleteConfirm) {
                deleteProject(showDeleteConfirm);
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

// Project Form Modal
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
  onSave: (data: any) => void;
  isAdmin: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project, onSave, isAdmin }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    clientName: project?.clientName || '',
    shootDates: project?.shootDates || '',
    analyticalAccount: project?.analyticalAccount || '',
    status: project?.status || 'draft',
    hasTaxInvoice: project?.hasTaxInvoice || false,
    notes: project?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'تعديل المشروع' : 'إضافة مشروع'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="اسم المشروع"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="اسم العميل"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="تاريخ التصوير"
            value={formData.shootDates}
            onChange={(e) => setFormData({ ...formData, shootDates: e.target.value })}
            placeholder="مثال: 5/6-JAN-26"
          />
          <Input
            label="الحساب التحليلي"
            value={formData.analyticalAccount}
            onChange={(e) => setFormData({ ...formData, analyticalAccount: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="الحالة"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={PROJECT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
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
              يوجد فاتورة ضريبية
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
          <Button type="submit" className="flex-1">
            {project ? 'حفظ التغييرات' : 'إضافة المشروع'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};