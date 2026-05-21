import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge, EmptyState, Modal } from './ui';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  User,
  Check,
  X,
  Lock
} from 'lucide-react';

interface UsersManagementProps {}

export const UsersManagement: React.FC<UsersManagementProps> = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.username && (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Permission options
  const permissionOptions = [
    { value: 'view_projects', label: 'عرض المشاريع' },
    { value: 'add_project', label: 'إضافة مشاريع' },
    { value: 'add_transaction', label: 'إضافة معاملات' },
    { value: 'view_reports', label: 'عرض التقارير' },
    { value: 'edit_projects', label: 'تعديل المشاريع (بدون حذف)' },
    { value: 'review_invoices', label: 'مراجعة الفواتير (المحاسبة)' },
    { value: 'manage_stock', label: 'إدارة المخزون' },
    { value: 'manage_units', label: 'إدارة الوحدات' },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-gray-500">إدارة حسابات الموظفين وصلاحياتهم</p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>
            إضافة موظف
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن موظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="all">جميع الأدوار</option>
          <option value="admin">مدير</option>
          <option value="accountant">محاسب</option>
          <option value="employee">موظف</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-500">إجمالي الأعضاء</p>
        </Card>
        <Card className="text-center">
          <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-sm text-gray-500">المدراء</p>
        </Card>
        <Card className="text-center">
          <User className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'employee').length}</p>
          <p className="text-sm text-gray-500">الموظفين</p>
        </Card>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="relative">
              {/* Active Status */}
              <div className="absolute top-4 left-4">
                {user.isActive ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    نشط
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    غير نشط
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={user.role === 'admin' ? 'info' : user.role === 'accountant' ? 'warning' : 'default'}>
                      {user.role === 'admin' ? '👑 مدير' : user.role === 'accountant' ? '📊 محاسب' : '👤 موظف'}
                    </Badge>
                    {user.username && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                        @{user.username}
                      </span>
                    )}
                  </div>

                  {/* Permissions */}
                  {user.role === 'employee' && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">الصلاحيات:</p>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.includes('all') ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            جميع الصلاحيات
                          </span>
                        ) : (
                          user.permissions.map((p) => {
                            const perm = permissionOptions.find(o => o.value === p);
                            return perm ? (
                              <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {perm.label}
                              </span>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isAdmin && user.id !== currentUser?.id && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit}
                    onClick={() => {
                      setEditingUser(user.id);
                      setShowAddModal(true);
                    }}
                    className="flex-1"
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={user.isActive ? X : Check}
                    onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                    className={user.isActive ? 'text-amber-600' : 'text-green-600'}
                  >
                    {user.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setShowDeleteConfirm(user.id)}
                    className="text-red-600 hover:bg-red-50"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="لا توجد موظفين"
          description="ابدأ بإضافة موظفين جدد"
          action={
            isAdmin && (
              <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                إضافة موظف
              </Button>
            )
          }
        />
      )}

      {/* Add/Edit Modal */}
      <UserModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingUser(null);
        }}
        user={editingUser ? users.find(u => u.id === editingUser) : undefined}
        onSave={(data) => {
          if (editingUser) {
            updateUser(editingUser, data);
          } else {
            addUser(data);
          }
          setShowAddModal(false);
          setEditingUser(null);
        }}
        permissionOptions={permissionOptions}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا الموظف؟ سيتم حذف جميع بيانات账号.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (showDeleteConfirm) {
                deleteUser(showDeleteConfirm);
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

// User Form Modal
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSave: (data: any) => void;
  permissionOptions: { value: string; label: string }[];
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave, permissionOptions }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'employee',
    permissions: user?.permissions || [] as string[],
    isActive: user?.isActive ?? true,
  });

  const [newPermission, setNewPermission] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, perm] });
    }
  };

  const addCustomPermission = () => {
    if (newPermission && !formData.permissions.includes(newPermission)) {
      setFormData({ ...formData, permissions: [...formData.permissions, newPermission] });
      setNewPermission('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'تعديل الموظف' : 'إضافة موظف'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              placeholder="اسم المستخدم للدخول"
              required={!user}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {user ? 'كلمة المرور الجديدة (اتركها فارغة إذا لم تريد تغييرها)' : 'كلمة المرور'}
          </label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              placeholder={user ? 'اتركها فارغة للحفاظ على كلمة المرور' : '••••••••'}
              required={!user}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          >
            <option value="employee">👤 موظف</option>
            <option value="accountant">📊 محاسب (يرى جميع المعاملات المالية)</option>
            <option value="admin">👑 مدير (صلاحيات كاملة)</option>
          </select>
        </div>

        {formData.role === 'employee' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {permissionOptions.map((perm) => (
                <button
                  key={perm.value}
                  type="button"
                  onClick={() => togglePermission(perm.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.permissions.includes(perm.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {perm.label}
                </button>
              ))}
            </div>

            {/* Custom permission input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="إضافة صلاحية جديدة..."
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addCustomPermission}>
                إضافة
              </Button>
            </div>

            {formData.permissions.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">لم يتم اختيار أي صلاحيات</p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
          <Button type="submit" className="flex-1">
            {user ? 'حفظ التغييرات' : 'إضافة الموظف'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};