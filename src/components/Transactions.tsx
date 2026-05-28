import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../lib/context';
import { Card, Button, Badge, EmptyState, Input, Select, Modal } from './ui';
import { formatCurrency, getCategoryColor, getCategoryLabel, CATEGORIES, Category, generateId } from '../lib/types';
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
  Camera,
  ImagePlus,
  X,
  ZoomIn,
  Upload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { safeFormatDate } from '../lib/types';
import { parseReceiptWithAI } from '../lib/gemini';

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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isAccountant = currentUser?.role === 'accountant';
  const canAddTransaction = currentUser?.permissions.includes('add_transaction') || isAdmin;
  const stats = getFinancialStats();

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter(t => {
    const matchesSearch = (t.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
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
            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="all">جميع الفئات</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{getCategoryLabel(c)}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">صور</th>
                  {isAdmin && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((t, index) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {safeFormatDate(t.date)}
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
                    {/* Receipt images thumbnails */}
                    <td className="px-4 py-3">
                      {t.receiptImages && t.receiptImages.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {t.receiptImages.slice(0, 2).map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setLightboxImage(img)}
                              className="relative group"
                            >
                              <img
                                src={img}
                                alt="إيصال"
                                className="w-8 h-8 rounded object-cover border border-gray-200 hover:border-indigo-400 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded flex items-center justify-center transition-all">
                                <ZoomIn className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
                              </div>
                            </button>
                          ))}
                          {t.receiptImages.length > 2 && (
                            <button
                              onClick={() => setLightboxImage(t.receiptImages![2])}
                              className="w-8 h-8 rounded bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold flex items-center justify-center hover:bg-indigo-100 transition-colors"
                            >
                              +{t.receiptImages.length - 2}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">لا يوجد</span>
                      )}
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

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="صورة الإيصال"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// Helper to compress images client-side before uploading to Supabase
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    // Only compress images (exclude PDFs)
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio resizing
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile.size < file.size ? compressedFile : file);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// =============================================================
// Transaction Form Modal with Receipt Photo Upload
// =============================================================
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  projects: any[];
  onSave: (data: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction, projects, onSave }) => {
  const { currentUser, uploadReceiptImage } = useApp();
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
    receiptImages: (transaction?.receiptImages || []) as string[],
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [parsingAI, setParsingAI] = useState(false);
  const localBase64Cache = useRef<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isElectron = typeof window !== 'undefined' && window.navigator && window.navigator.userAgent.toLowerCase().includes('electron');

  // Temporary ID for new transactions (for upload path)
  const tempId = useRef(transaction?.id || generateId());

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setFormData({
      ...formData,
      projectId,
      projectName: project?.name || ''
    });
  };

  const handleAIParsing = async () => {
    if (formData.receiptImages.length === 0) return;
    
    const apiKey = 'AIzaSyCcUWRJIKEV4AU7vk97UjAI1DZIOTKANnM';

    setParsingAI(true);
    try {
      const targetUrl = formData.receiptImages[0];
      // Use local base64 cache if available to bypass CORS/Network issues entirely
      const sourceData = localBase64Cache.current[targetUrl] || targetUrl;
      const parsedData = await parseReceiptWithAI(sourceData, apiKey);
      
      if (parsedData) {
        setFormData(prev => ({
          ...prev,
          supplierName: parsedData.supplierName || prev.supplierName,
          date: parsedData.date || prev.date,
          debit: parsedData.amount || prev.debit,
          hasTaxInvoice: parsedData.hasTaxInvoice !== undefined ? parsedData.hasTaxInvoice : prev.hasTaxInvoice,
          description: parsedData.description || prev.description,
        }));
      } else {
        alert('لم نتمكن من تحليل الفاتورة. يرجى التأكد من جودة الصورة أو صحة مفتاح الـ API.');
      }
    } catch (err: any) {
      console.error('AI parsing error:', err);
      // Give extremely clear, Arabic explanations for potential geoblocks or network errors
      const errMsg = err.message || '';
      if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
        alert(`فشل الاتصال بالذكاء الاصطناعي (Failed to fetch).\n\nالأسباب المحتملة:\n1. إذا كنت في سوريا أو لبنان أو دولة أخرى محظورة من خدمات Google، يرجى تشغيل برنامج كاسر بروكسي (VPN) والمحاولة مرة أخرى.\n2. تأكد من اتصال جهازك بالإنترنت.\n3. قد يكون هناك مشكلة مؤقتة في خوادم Google.`);
      } else {
        alert(`حدث خطأ أثناء قراءة الفاتورة بالذكاء الاصطناعي: ${errMsg}`);
      }
    } finally {
      setParsingAI(false);
    }
  };

  // Helper to convert base64 dataUrl to File (for Electron/Web webcam uploads)
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // ---- Camera ----
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia is not supported on this browser');
      if (mobileCameraInputRef.current) {
        mobileCameraInputRef.current.click();
      } else {
        alert('تعذر الوصول إلى الكاميرا في هذا المتصفح. يرجى استخدام خيار رفع الملف.');
      }
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try high-quality environment camera first (typically back camera on mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (innerErr) {
        console.warn('Failed with environment facingMode and constraints, trying fallback:', innerErr);
        // Fallback to default user/back camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 150);
    } catch (err) {
      console.error('Camera access denied:', err);
      // Auto-fallback: trigger native file/camera chooser
      if (mobileCameraInputRef.current) {
        mobileCameraInputRef.current.click();
      } else {
        alert('تعذر الوصول إلى الكاميرا. يرجى منح الإذن أو استخدام خيار رفع الملف.');
      }
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setShowCamera(false);
    setCapturedPreview(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreview(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedPreview(null);
  };

  const confirmCapturedPhoto = async () => {
    if (!capturedPreview) return;
    setUploadingImages(true);
    try {
      const file = dataURLtoFile(capturedPreview, `capture_${Date.now()}.jpg`);
      const compressedFile = await compressImage(file);
      const url = await uploadReceiptImage(compressedFile, tempId.current);
      if (url) {
        // Cache the base64 preview for instant AI parsing without network fetch
        localBase64Cache.current[url] = capturedPreview;
        setFormData(prev => ({ ...prev, receiptImages: [...prev.receiptImages, url] }));
      } else {
        alert('فشل رفع الصورة الملتقطة. يرجى التأكد من تشغيل SQL الخاص بالصلاحيات (storage-setup.sql) in Supabase.');
      }
    } catch (err) {
      console.error('Captured photo upload error:', err);
      alert('حدث خطأ أثناء معالجة ورفع الصورة.');
    }
    setUploadingImages(false);
    stopCamera();
  };

  // ---- File Upload ----
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const newProgress: string[] = [];
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newProgress.push(`جاري رفع ${file.name}...`);
      setUploadProgress([...newProgress]);
      try {
        const compressedFile = await compressImage(file);
        const url = await uploadReceiptImage(compressedFile, tempId.current);
        if (url) {
          newUrls.push(url);
          // Load compressed file as base64 and cache it locally for direct AI parsing
          const reader = new FileReader();
          reader.onloadend = () => {
            localBase64Cache.current[url] = reader.result as string;
          };
          reader.readAsDataURL(compressedFile);
        } else {
          alert(`فشل رفع الملف: ${file.name}. يرجى التأكد من تشغيل SQL الخاص بالصلاحيات (storage-setup.sql) in Supabase.`);
        }
      } catch (err) {
        console.error('File upload error:', err);
        alert(`حدث خطأ أثناء رفع الملف ${file.name}`);
      }
    }
    setFormData(prev => ({ ...prev, receiptImages: [...prev.receiptImages, ...newUrls] }));
    setUploadProgress([]);
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      receiptImages: prev.receiptImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdBy: currentUser?.id || '',
    });
  };

  return (
    <>
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              rows={2}
            />
          </div>

          {/* ======== Receipt / Invoice Images Section ======== */}
          <div className="border border-dashed border-indigo-300 rounded-xl p-4 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                صور الإيصالات والفواتير
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={uploadingImages}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  تصوير
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  رفع صورة
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={e => handleFileUpload(e.target.files)}
                />
                <input
                  ref={mobileCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => handleFileUpload(e.target.files)}
                />
              </div>
            </div>

            {/* Upload progress */}
            {uploadingImages && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-100 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgress[0] || 'جاري الرفع...'}</span>
              </div>
            )}

            {/* AI Receipt Parsing Button */}
            {formData.receiptImages.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAIParsing}
                  disabled={parsingAI || uploadingImages}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all animate-pulse"
                >
                  {parsingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>جاري قراءة الفاتورة بالذكاء الاصطناعي... 🧠</span>
                    </>
                  ) : (
                    <>
                      <span>قراءة وتحليل الفاتورة بالذكاء الاصطناعي ✨</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Existing images grid */}
            {formData.receiptImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {formData.receiptImages.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={img}
                      alt={`إيصال ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setLightboxImage(img)}
                        className="p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white transition-colors"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !uploadingImages && (
                <div className="text-center py-4 space-y-1 bg-indigo-50/20 rounded-lg border border-dashed border-indigo-100 p-3">
                  <p className="text-xs text-gray-400">
                    لم يتم إرفاق أي صور بعد
                  </p>
                  <p className="text-[10px] text-indigo-600 font-semibold flex items-center justify-center gap-1">
                    ✨ ارفع صورة أو التقط إيصالاً لتفعيل خيار "التحليل الذكي بالذكاء الاصطناعي" تلقائياً
                  </p>
                </div>
              )
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1" disabled={uploadingImages}>
              {uploadingImages ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />جاري الرفع...</span>
              ) : transaction ? 'حفظ التغييرات' : 'إضافة المعاملة'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80">
              <span className="text-white font-semibold">📷 تصوير الإيصال</span>
              <button onClick={stopCamera} className="text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video / Preview */}
            <div className="relative aspect-[4/3] bg-black">
              {capturedPreview ? (
                <img src={capturedPreview} alt="preview" className="w-full h-full object-contain" />
              ) : (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              )}
            </div>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 bg-black/90 py-5">
              {capturedPreview ? (
                <>
                  <button
                    onClick={retakePhoto}
                    className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs">إعادة</span>
                  </button>
                  <button
                    onClick={confirmCapturedPhoto}
                    disabled={uploadingImages}
                    className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors">
                      {uploadingImages ? (
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <span className="text-xs">{uploadingImages ? 'جاري الرفع...' : 'حفظ'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={capturePhoto}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-gray-400" />
                  </div>
                  <span className="text-white text-xs">التقاط</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[10001] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="صورة الإيصال"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};