import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Badge, EmptyState, Modal, Button } from './ui';
import { StockItem } from '../lib/types';
import { formatCurrency } from '../lib/types';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

export const Stock: React.FC = () => {
  const { stockItems, addStockItem, updateStockItem, deleteStockItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: 0,
    minQuantity: 0,
    costPerUnit: 0,
    supplier: '',
    notes: '',
  });

  const categories = ['مواد غذائية', 'معدات', 'وقود', ' أدوات تنظيف', 'مستلزمات', 'أخرى'];
  const units = ['قطعة', 'كجم', 'لتر', 'علبة', 'كيس', 'وحدة'];

  const filteredItems = stockItems.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get items that need restocking
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minQuantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, formData);
      } else {
        await addStockItem(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save stock item:', error);
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      costPerUnit: item.costPerUnit,
      supplier: item.supplier,
      notes: item.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      await deleteStockItem(id);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      unit: '',
      quantity: 0,
      minQuantity: 0,
      costPerUnit: 0,
      supplier: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المخزون</h1>
          <p className="text-gray-500">إدارة المواد والمستلزمات</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة عنصر
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">تنبيه المخزون المنخفض</h3>
              <p className="text-sm text-amber-600">
                يوجد {lowStockItems.length} عناصر تحتاج لإعادة تعبئة
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المخزون..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>
      </Card>

      {/* Stock List */}
      {filteredItems.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isLowStock = item.quantity <= item.minQuantity;
            return (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${isLowStock ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <Badge variant={item.category === 'مواد غذائية' ? 'success' : 'info'}>
                      {item.category || 'غير محدد'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">الكمية:</span>
                    <span className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                      {item.quantity} {item.unit}
                      {isLowStock && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">الحد الأدنى:</span>
                    <span className="text-gray-700">{item.minQuantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">سعر الوحدة:</span>
                    <span className="text-gray-700">{formatCurrency(item.costPerUnit)}</span>
                  </div>
                  {item.supplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">المورد:</span>
                      <span className="text-gray-700">{item.supplier}</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    {item.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="لا يوجد مخزون"
          description="ابدأ بإضافة عناصر للمخزون"
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم العنصر</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                <option value="">اختر الوحدة</option>
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى</label>
              <input
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر الوحدة (SAR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingItem ? 'تعديل' : 'إضافة'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};