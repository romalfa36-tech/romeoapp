// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'accountant';
  permissions: string[];
  username?: string;
  password?: string;
  createdAt: string;
  isActive: boolean;
}

// Notification type
export interface Notification {
  id: string;
  type: 'project' | 'transaction' | 'low_stock' | 'invoice' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdBy?: string;
  createdByRole?: 'admin' | 'employee' | 'accountant';
  createdAt: string;
  _isRemote?: boolean;
}

// New types for Clients
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  createdAt: string;
}

// New types for Stock/Inventory
export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  supplier: string;
  notes: string;
  createdAt: string;
}

// New types for Units
export interface Unit {
  id: string;
  name: string;
  type: 'changing_room' | 'bathroom' | 'car' | 'lounge' | 'kitchen' | 'storage' | 'other';
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  notes: string;
  createdAt: string;
}

// Invoice types
export type InvoiceStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'invoice' | 'quote';
  projectId: string;
  projectName: string;
  clientName: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  items: InvoiceItem[];
  attachments: string[];
  notes: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProjectComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  shootDates: string;
  analyticalAccount: string;
  status: 'draft' | 'in-progress' | 'paid' | 'completed';
  hasTaxInvoice: boolean;
  notes: string;
  createdBy: string;
  assignedTo: string[];
  comments?: ProjectComment[];
  createdAt: string;
  updatedAt: string;
}


export type Category = 'F&B' | 'Transportation' | 'Maintenance' | 'Labors' | 'Salary' | 'Other Expenses';

export interface Transaction {
  id: string;
  no: string;
  date: string;
  supplierName: string;
  description: string;
  category: Category;
  debit: number;
  credit: number;
  balance: number;
  projectId: string;
  projectName: string;
  hasTaxInvoice: boolean;
  notes: string;
  createdBy: string;
  createdAt: string;
  receiptImages?: string[]; // URLs of uploaded receipt/invoice images
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

// Categories
export const CATEGORIES: Category[] = ['F&B', 'Transportation', 'Maintenance', 'Labors', 'Salary', 'Other Expenses'];

// Status options
export const PROJECT_STATUSES = [
  { value: 'draft', label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-progress', label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-700' },
  { value: 'paid', label: 'مدفوع', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'مكتمل', color: 'bg-purple-100 text-purple-700' },
] as const;

// Initial data from Excel (for local fallback only)
export const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'MBC GROUP', clientName: 'FILM PUDDING', shootDates: '5/6-JAN-26', analyticalAccount: 'MBC Group Film Pudding 1.26', status: 'draft', hasTaxInvoice: false, notes: 'tres contant', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '2', name: 'JOY AWARDS', clientName: 'LETTERGRAY', shootDates: '17/18-JAN-26', analyticalAccount: 'Joy Awards Letter Gray 1.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '3', name: 'STA', clientName: 'LETTERGRAY', shootDates: '17/18-JAN-26', analyticalAccount: 'STA Letter Gray 1.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '4', name: 'STC Marcom', clientName: 'Dream Box', shootDates: '25/26/27-JAN-26', analyticalAccount: 'STC Marcom Dreambox 1.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '5', name: 'Saudia Founding Day', clientName: 'FILM PUDDING', shootDates: '2026-01-26', analyticalAccount: 'Saudi Founding Day Film Pudding 1.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '6', name: 'STC Business App', clientName: 'Dream Box', shootDates: '2026-01-30', analyticalAccount: 'STC Business App Dreambox 1.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '7', name: 'AlMarai', clientName: 'FILM PUDDING', shootDates: '28/29/30/31-Jan-26', analyticalAccount: 'Almarai Film Pudding 1.26', status: 'paid', hasTaxInvoice: true, notes: 'elie', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '8', name: 'Yow Films', clientName: '-', shootDates: 'Jan', analyticalAccount: 'Yow Films 1.26', status: 'draft', hasTaxInvoice: false, notes: 'Cash In Lebanon', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '9', name: 'BUJAIRI TERRACE', clientName: 'LETTERGRAY', shootDates: '1/2-Feb-26', analyticalAccount: 'Letter Gray BUJAIRI TERRACE 2.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '10', name: 'MACDO', clientName: 'SADU/MACDO', shootDates: '2026-02-02', analyticalAccount: 'Macdo 2.26', status: 'paid', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '11', name: 'National Day/RUA AL HARAM', clientName: 'Purple Brain', shootDates: '7/8-Feb-26', analyticalAccount: 'Purple Brain National Day/RUA AL HARAM 2.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '12', name: 'Nice One', clientName: 'Sadu', shootDates: '7/8/9-Feb-26', analyticalAccount: 'Nice One 2.26', status: 'paid', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '13', name: 'AQUA ARABIA', clientName: 'SSUP', shootDates: '12/13 FEB-26', analyticalAccount: 'SSUP Aqua Arabia 2.26', status: 'paid', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '14', name: 'AlMarai', clientName: 'DREAM BOX', shootDates: '12/13/14-FEB-26', analyticalAccount: 'Almarai Dreambox 2.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '15', name: 'SAB BANK', clientName: 'TRUFFLE', shootDates: '14/15/FEB-26', analyticalAccount: 'Truffle Sab Bank 2.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '16', name: 'VISION 2030', clientName: 'Purple Brain', shootDates: '18/19/FEB 26', analyticalAccount: 'Vision 2030 2.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '17', name: 'lays pepsico', clientName: 'film pudding', shootDates: '1/2/3/4 mars', analyticalAccount: 'Film Pudding Pepsico', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '18', name: 'RUSH', clientName: '-', shootDates: '2026-04-02', analyticalAccount: 'Rush 4.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '19', name: 'DREAM BOX', clientName: '-', shootDates: '1/2/ APRIL', analyticalAccount: 'Dreambox Marai Bashayer', status: 'paid', hasTaxInvoice: false, notes: 'Marai Bashayer', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '20', name: 'TRUFFLE', clientName: '-', shootDates: '3/4/5/6 APRIL', analyticalAccount: 'Truffle 4.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '21', name: 'NEED A FIXER', clientName: '-', shootDates: '6/7/8 APRIL', analyticalAccount: 'Aqua Arabia Need A fixer 4.26', status: 'draft', hasTaxInvoice: false, notes: '', createdBy: '', assignedTo: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

// Initial users
export const INITIAL_USERS: User[] = [
  { id: 'admin1', email: 'admin@beeforce.com', name: 'المدير العام', role: 'admin', permissions: ['all'], createdAt: '2026-01-01', isActive: true },
  { id: 'emp1', email: 'elie@beeforce.com', name: 'إيلي', role: 'employee', permissions: ['view_projects', 'add_transaction', 'view_reports'], createdAt: '2026-01-01', isActive: true },
];

// Helper functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Safe date formatting - never crashes on invalid dates
export const safeFormatDate = (dateStr: string | null | undefined): string => {
  try {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateStr || '-';
  }
};

export const safeFormatDateTime = (dateStr: string | null | undefined): string => {
  try {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr || '-';
  }
};

export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Category colors
export const getCategoryColor = (category: Category): string => {
  const colors: Record<Category, string> = {
    'F&B': 'bg-orange-100 text-orange-700',
    'Transportation': 'bg-blue-100 text-blue-700',
    'Maintenance': 'bg-purple-100 text-purple-700',
    'Labors': 'bg-green-100 text-green-700',
    'Salary': 'bg-teal-100 text-teal-700',
    'Other Expenses': 'bg-gray-100 text-gray-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

// Category labels
export const getCategoryLabel = (category: Category): string => {
  const labels: Record<Category, string> = {
    'F&B': 'الطعام والمشروبات',
    'Transportation': 'النقل',
    'Maintenance': 'الصيانة',
    'Labors': 'العمالة',
    'Salary': 'الرواتب',
    'Other Expenses': 'مصروفات أخرى',
  };
  return labels[category] || category;
};

// Unit types
export const UNIT_TYPES = [
  { value: 'changing_room', label: 'غرفة تبديل ملابس' },
  { value: 'bathroom', label: 'حمام' },
  { value: 'car', label: 'سيارة' },
  { value: 'lounge', label: 'صالة إستراحة' },
  { value: 'kitchen', label: 'مطبخ' },
  { value: 'storage', label: 'مستودع' },
  { value: 'other', label: 'أخرى' },
];

// Invoice status
export const INVOICE_STATUSES = [
  { value: 'draft', label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  { value: 'pending', label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'approved', label: 'موافق عليه', color: 'bg-blue-100 text-blue-700' },
  { value: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-700' },
  { value: 'paid', label: 'مدفوع', color: 'bg-green-100 text-green-700' },
];