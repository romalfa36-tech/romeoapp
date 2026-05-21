import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Card, Badge, EmptyState, Modal, Button } from './ui';
import { Unit, UNIT_TYPES } from '../lib/types';
import { Plus, Search, Edit, Trash2, Car, Shirt, Bath, Coffee, Warehouse, Box } from 'lucide-react';

const typeIcons: Record<string, any> = {
  changing_room: Shirt,
  bathroom: Bath,
  car: Car,
  lounge: Coffee,
  kitchen: Warehouse,
  storage: Box,
  other: Box,
};

export const Units: React.FC = () => {
  const { units, addUnit, updateUnit, deleteUnit } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as 'changing_room' | 'bathroom' | 'car' | 'lounge' | 'kitchen' | 'storage' | 'other',
    status: 'available' as 'available' | 'occupied' | 'maintenance',
    capacity: 0,
    notes: '',
  });

  const filteredUnits = units.filter(unit => {
    const matchesSearch = (unit.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    available: 'متاح',
    occupied: 'مشغول',
    maintenance: 'صيانة',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await updateUnit(editingUnit.id, formData);
      } else {
        await addUnit(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save unit:', error);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      type: unit.type,
      status: unit.status,
      capacity: unit.capacity,
      notes: unit.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      await deleteUnit(id);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingUnit(null);
    setFormData({
      name: '',
      type: 'other',
      status: 'available',
      capacity: 0,
      notes: '',
    });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الوحدات</h1>
          <p className="text-gray-500">إدارة الوحدات والمرافق</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة وحدة
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن وحدة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                statusFilter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              متاح
            </button>
            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                statusFilter === 'occupied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              مشغول
            </button>
            <button
              onClick={() => setStatusFilter('maintenance')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                statusFilter === 'maintenance' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              صيانة
            </button>
          </div>
        </div>
      </Card>

      {/* Units Grid */}
      {filteredUnits.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => {
            const Icon = typeIcons[unit.type] || Box;
            return (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      unit.status === 'available' ? 'bg-green-100' :
                      unit.status === 'occupied' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        unit.status === 'available' ? 'text-green-600' :
                        unit.status === 'occupied' ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{unit.name}</h3>
                      <Badge className={statusColors[unit.status]}>
                        {statusLabels[unit.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(unit)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">النوع:</span>
                    <span className="text-gray-700">
                      {UNIT_TYPES.find(t => t.value === unit.type)?.label || 'أخرى'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">السعة:</span>
                    <span className="text-gray-700">{unit.capacity} شخص</span>
                  </div>
                </div>

                {unit.notes && (
                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    {unit.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Car}
          title="لا يوجد وحدات"
          description="ابدأ بإضافة وحدات جديدة"
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الوحدة</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              placeholder="مثال: غرفة تبديل 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                {UNIT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                <option value="available">متاح</option>
                <option value="occupied">مشغول</option>
                <option value="maintenance">صيانة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعة (عدد الأشخاص)</label>
            <input
              type="number"
              min="0"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
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
              {editingUnit ? 'تعديل' : 'إضافة'}
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