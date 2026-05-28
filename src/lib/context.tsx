import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Transaction, Client, StockItem, Unit, Invoice, Notification, ProjectComment, generateId } from './types';
import { supabase } from './supabase';

// Supported languages
export type Language = 'ar' | 'en';

// Language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.dashboard': 'الرئيسية',
    'nav.projects': 'المشاريع',
    'nav.transactions': 'المعاملات',
    'nav.finance': 'المالية',
    'nav.clients': 'العملاء',
    'nav.stock': 'المخزون',
    'nav.units': 'الوحدات',
    'nav.users': 'الموظفين',
    'nav.reports': 'التقارير',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'nav.management': 'الإدارة',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً بك',
    'dashboard.totalProjects': 'إجمالي المشاريع',
    'dashboard.activeProjects': 'المشاريع النشطة',
    'dashboard.completedProjects': 'المشاريع المكتملة',
    'dashboard.draftProjects': 'المشاريع كمسودة',
    'dashboard.totalIncome': 'إجمالي الإيرادات',
    'dashboard.totalExpenses': 'إجمالي المصروفات',
    'dashboard.balance': 'الرصيد',
    'dashboard.recentProjects': 'المشاريع الأخيرة',
    'dashboard.recentTransactions': 'المعاملات الأخيرة',
    'dashboard.quickActions': 'إجراءات سريعة',

    // Common
    'common.add': 'إضافة',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.all': 'الكل',
    'common.status': 'الحالة',
    'common.name': 'الاسم',
    'common.email': 'البريد',
    'common.phone': 'الهاتف',
    'common.notes': 'ملاحظات',
    'common.admin': 'مدير',
    'common.employee': 'موظف',
    'common.accountant': 'محاسب',

    // Notifications
    'notifications.title': 'الإشعارات',
    'notifications.newProject': 'مشروع جديد',
    'notifications.newTransaction': 'معاملة جديدة',
    'notifications.lowStock': 'تنبيه مخزون',
    'notifications.noNotifications': 'لا توجد إشعارات',

    // Permissions
    'permissions.ownData': 'بياناتي فقط',
    'permissions.sharedWithMe': 'المشاركة معي',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.transactions': 'Transactions',
    'nav.finance': 'Finance',
    'nav.clients': 'Clients',
    'nav.stock': 'Stock',
    'nav.units': 'Units',
    'nav.users': 'Users',
    'nav.reports': 'Reports',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.management': 'Management',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.totalProjects': 'Total Projects',
    'dashboard.activeProjects': 'Active Projects',
    'dashboard.completedProjects': 'Completed Projects',
    'dashboard.draftProjects': 'Draft Projects',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.balance': 'Balance',
    'dashboard.recentProjects': 'Recent Projects',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.quickActions': 'Quick Actions',

    // Common
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.status': 'Status',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.notes': 'Notes',
    'common.admin': 'Admin',
    'common.employee': 'Employee',
    'common.accountant': 'Accountant',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.newProject': 'New Project',
    'notifications.newTransaction': 'New Transaction',
    'notifications.lowStock': 'Low Stock Alert',
    'notifications.noNotifications': 'No notifications',

    // Permissions
    'permissions.ownData': 'My Data Only',
    'permissions.sharedWithMe': 'Shared With Me',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('beeforce_language');
    return (saved === 'en' ? 'en' : 'ar') as Language;
  });

  useEffect(() => {
    localStorage.setItem('beeforce_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Context types
interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithUsername: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Users (Admin only)
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Projects
  projects: Project[];
  filteredProjects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addProjectComment: (projectId: string, content: string) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'balance'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Stock
  stockItems: StockItem[];
  lowStockItems: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id' | 'createdAt'>) => Promise<void>;
  updateStockItem: (id: string, item: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;

  // Units
  units: Unit[];
  addUnit: (unit: Omit<Unit, 'id' | 'createdAt'>) => Promise<void>;
  updateUnit: (id: string, unit: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;

  // Invoices
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Stats
  getProjectStats: () => { total: number; active: number; completed: number; draft: number };
  getFinancialStats: () => { totalIncome: number; totalExpenses: number; balance: number };
  getProjectTransactions: (projectId: string) => Transaction[];
  getMonthlySummary: () => { month: string; income: number; expenses: number }[];

  // Role checks
  isAdmin: boolean;
  isAccountant: boolean;
  canViewFinance: boolean;
  toasts: Array<{ id: string; title: string; message?: string }>;
  removeToast: (id: string) => void;

  // File Upload
  uploadReceiptImage: (file: File, transactionId: string) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Current user key for local storage
const CURRENT_USER_KEY = 'beeforce_current_user';
const USERS_KEY = 'beeforce_users';
const PROJECTS_KEY = 'beeforce_projects';
const TRANSACTIONS_KEY = 'beeforce_transactions';
const CLIENTS_KEY = 'beeforce_clients';
const STOCK_KEY = 'beeforce_stock';
const UNITS_KEY = 'beeforce_units';
const INVOICES_KEY = 'beeforce_invoices';
const NOTIFICATIONS_KEY = 'beeforce_notifications';

// Helper to convert Supabase user
const convertUser = (data: any): User => ({
  id: data.id || '',
  email: data.email || '',
  name: data.name || '',
  role: data.role || 'employee',
  permissions: data.permissions || [],
  username: data.username || '',
  password: data.password || '',
  createdAt: data.created_at || new Date().toISOString(),
  isActive: data.is_active !== undefined ? data.is_active : true,
  readNotifications: data.read_notifications || [],
});

// Helper to convert Supabase project
const convertProject = (data: any): Project => ({
  id: data.id || '',
  name: data.name || '',
  clientName: data.client_name || '',
  shootDates: data.shoot_dates || '',
  analyticalAccount: data.analytical_account || '',
  status: data.status || 'draft',
  hasTaxInvoice: data.has_tax_invoice || false,
  notes: data.notes || '',
  createdBy: data.created_by || '',
  assignedTo: data.assigned_to || [],
  comments: data.comments || [],
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString(),
});

// Helper to convert Supabase transaction
const convertTransaction = (data: any): Transaction => ({
  id: data.id || '',
  no: data.no || '',
  date: data.date || '',
  supplierName: data.supplier_name || '',
  description: data.description || '',
  category: data.category || '',
  debit: Number(data.debit) || 0,
  credit: Number(data.credit) || 0,
  balance: Number(data.balance) || 0,
  projectId: data.project_id || '',
  projectName: data.project_name || '',
  hasTaxInvoice: data.has_tax_invoice || false,
  notes: data.notes || '',
  createdBy: data.created_by || '',
  createdAt: data.created_at || new Date().toISOString(),
  receiptImages: data.receipt_images || [],
});

// Helper to convert Supabase client
const convertClient = (data: any): Client => ({
  id: data.id || '',
  name: data.name || '',
  email: data.email || '',
  phone: data.phone || '',
  company: data.company || '',
  address: data.address || '',
  notes: data.notes || '',
  createdAt: data.created_at || new Date().toISOString(),
});

// Helper to convert Supabase stock item
const convertStockItem = (data: any): StockItem => ({
  id: data.id || '',
  name: data.name || '',
  category: data.category || '',
  unit: data.unit || '',
  quantity: Number(data.quantity) || 0,
  minQuantity: Number(data.min_quantity) || 0,
  costPerUnit: Number(data.cost_per_unit) || 0,
  supplier: data.supplier || '',
  notes: data.notes || '',
  createdAt: data.created_at || new Date().toISOString(),
});

// Helper to convert Supabase unit
const convertUnit = (data: any): Unit => ({
  id: data.id || '',
  name: data.name || '',
  type: data.type || 'other',
  status: data.status || 'available',
  capacity: Number(data.capacity) || 0,
  notes: data.notes || '',
  createdAt: data.created_at || new Date().toISOString(),
});

// Helper to convert Supabase invoice
const convertInvoice = (data: any): Invoice => ({
  id: data.id || '',
  invoiceNumber: data.invoice_number || '',
  type: data.type || 'invoice',
  projectId: data.project_id || '',
  projectName: data.project_name || '',
  clientName: data.client_name || '',
  amount: Number(data.amount) || 0,
  vatAmount: Number(data.vat_amount) || 0,
  totalAmount: Number(data.total_amount) || 0,
  status: data.status || 'draft',
  dueDate: data.due_date || '',
  items: data.items || [],
  attachments: data.attachments || [],
  notes: data.notes || '',
  createdBy: data.created_by || '',
  reviewedBy: data.reviewed_by || '',
  reviewedAt: data.reviewed_at || '',
  createdAt: data.created_at || new Date().toISOString(),
});

// Helper to convert Supabase notification
const convertNotification = (data: any): Notification => ({
  id: data.id || '',
  type: data.type || 'general',
  title: data.title || '',
  message: data.message || '',
  isRead: data.is_read !== undefined ? data.is_read : false,
  createdBy: data.created_by || '',
  createdByRole: data.created_by_role || undefined,
  createdById: data.created_by_id || undefined,
  createdAt: data.created_at || new Date().toISOString(),
});

// Sync map functions (explicit fields)
const projectToDB = (p: any) => ({
  name: p.name,
  client_name: p.clientName,
  shoot_dates: p.shootDates,
  analytical_account: p.analyticalAccount,
  status: p.status,
  has_tax_invoice: p.hasTaxInvoice,
  notes: p.notes,
  created_by: p.createdBy,
  assigned_to: p.assignedTo,
  comments: p.comments || [],
});

const transactionToDB = (t: any) => ({
  no: t.no,
  date: t.date,
  supplier_name: t.supplierName,
  description: t.description,
  category: t.category,
  debit: t.debit,
  credit: t.credit,
  balance: t.balance,
  project_id: t.projectId || null,
  project_name: t.projectName,
  has_tax_invoice: t.hasTaxInvoice,
  notes: t.notes,
  created_by: t.createdBy,
  receipt_images: t.receiptImages || [],
});

const clientToDB = (c: any) => ({
  name: c.name,
  email: c.email,
  phone: c.phone,
  company: c.company,
  address: c.address,
  notes: c.notes,
});

const stockItemToDB = (s: any) => ({
  name: s.name,
  category: s.category,
  unit: s.unit,
  quantity: s.quantity,
  min_quantity: s.minQuantity,
  cost_per_unit: s.costPerUnit,
  supplier: s.supplier,
  notes: s.notes,
});

const unitToDB = (u: any) => ({
  name: u.name,
  type: u.type,
  status: u.status,
  capacity: u.capacity,
  notes: u.notes,
});

const invoiceToDB = (i: any) => ({
  invoice_number: i.invoiceNumber,
  type: i.type,
  project_id: i.projectId || null,
  project_name: i.projectName,
  client_name: i.clientName,
  amount: i.amount,
  vat_amount: i.vatAmount,
  total_amount: i.totalAmount,
  status: i.status,
  due_date: i.dueDate || null,
  items: i.items,
  attachments: i.attachments,
  notes: i.notes,
  created_by: i.createdBy,
  reviewed_by: i.reviewedBy || null,
  reviewed_at: i.reviewedAt || null,
});

const userToDB = (u: any) => ({
  email: u.email,
  name: u.name,
  username: u.username,
  password: u.password,
  role: u.role,
  permissions: u.permissions,
  is_active: u.isActive,
  read_notifications: u.readNotifications || [],
});

const notificationToDB = (n: any) => ({
  type: n.type,
  title: n.title,
  message: n.message,
  is_read: n.isRead,
  created_by: n.createdBy || null,
  created_by_role: n.createdByRole || null,
  created_by_id: n.createdById || null,
});

// Filter data based on user role
const filterByUserAccess = <T extends { createdBy?: string; assignedTo?: string[] }>(
  items: T[],
  userId: string,
  isAdmin: boolean,
  isAccountant: boolean
): T[] => {
  if (isAdmin || isAccountant) {
    return items;
  }
  // Employees see only their own data or shared with them
  return items.filter(item =>
    item.createdBy === userId ||
    (item.assignedTo && item.assignedTo.includes(userId))
  );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; message?: string }>>([]);

  const triggerToast = (title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 10000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getReadNotificationIds = (): Set<string> => {
    if (!currentUser) return new Set();
    const stored = localStorage.getItem(`read_notifications_${currentUser.id}`);
    const localSet = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    
    // Sync from database if user has remote read notifications
    if (currentUser.readNotifications && Array.isArray(currentUser.readNotifications)) {
      currentUser.readNotifications.forEach(id => localSet.add(id));
    }
    return localSet;
  };

  const saveReadNotificationIds = async (ids: Set<string>) => {
    if (!currentUser) return;
    const idsArray = Array.from(ids);
    localStorage.setItem(`read_notifications_${currentUser.id}`, JSON.stringify(idsArray));
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ read_notifications: idsArray })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error('Failed to sync read notifications to database:', error);
      } else {
        // Update currentUser locally to keep the memory state in sync
        setCurrentUser(prev => prev ? { ...prev, readNotifications: idsArray } : null);
        // Also update local users list
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, readNotifications: idsArray } : u));
      }
    } catch (e) {
      console.warn('Supabase read_notifications update failed (migration script might need to be run):', e);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAccountant = currentUser?.role === 'accountant';
  const canViewFinance = isAdmin || isAccountant;

  // Filtered data based on role - Employees now see all projects and transactions
  const filteredProjects = projects;
  const filteredTransactions = transactions;
  const filteredInvoices = filterByUserAccess(invoices, currentUser?.id || '', isAdmin, isAccountant);
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minQuantity);

  const syncData = async (tablesToSync?: string[]) => {
    const isLocalNew = (item: any) => item && item.id && !item._isRemote;

    try {
      // 1. Fetch Users
      if (!tablesToSync || tablesToSync.includes('users')) {
      try {
        const { data: usersData, error: uErr } = await supabase.from('users').select('*');
        if (!uErr && usersData) {
          const parsedUsers = usersData.map(convertUser).map(u => ({ ...u, _isRemote: true } as User));
          
          const localStr = localStorage.getItem(USERS_KEY);
          const localUsers: User[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced users
          const unsyncedUsers = localUsers.filter(lu => isLocalNew(lu) && !parsedUsers.some(su => su.id === lu.id));
          for (const uu of unsyncedUsers) {
            try {
              await supabase.from('users').insert([{
                id: uu.id,
                ...userToDB(uu)
              }]);
            } catch (e) {
              console.error('Auto-push user failed:', uu.id, e);
            }
          }
          
          const mergedUsers = [...unsyncedUsers, ...parsedUsers];
          const uniqueUsers = Array.from(new Map(mergedUsers.map(u => [u.id, u])).values());
          
          setUsers(uniqueUsers);
          localStorage.setItem(USERS_KEY, JSON.stringify(uniqueUsers));

          // Sync active user details in case status/role has changed on other devices
          const storedUser = localStorage.getItem(CURRENT_USER_KEY);
          if (storedUser) {
            const parsedStored = JSON.parse(storedUser);
            const latestUser = uniqueUsers.find(u => u.id === parsedStored.id);
            if (latestUser) {
              setCurrentUser(latestUser);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(latestUser));
            }
          }
        }
      } catch (err) {
        console.error('Fetch users error:', err);
      }
      }

      // 2. Fetch Projects
      if (!tablesToSync || tablesToSync.includes('projects')) {
      try {
        const { data: projectsData, error: pErr } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (pErr) {
          console.error('Fetch projects error from Supabase:', pErr);
        }
        if (!pErr && projectsData) {
          const parsed = projectsData.map(convertProject).map(p => ({ ...p, _isRemote: true } as Project));
          
          const localStr = localStorage.getItem(PROJECTS_KEY);
          const localProjects: Project[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced projects
          const unsynced = localProjects.filter(lp => isLocalNew(lp) && !parsed.some(sp => sp.id === lp.id));
          console.log(`[SYNC PROJECTS] localProjects count: ${localProjects.length}, parsed count: ${parsed.length}, unsynced count: ${unsynced.length}`);
          for (const up of unsynced) {
            try {
              const { error: insErr } = await supabase.from('projects').insert([{
                id: up.id,
                ...projectToDB(up)
              }]);
              if (insErr) {
                console.error('Auto-push project failed with Supabase DB error:', up.id, insErr);
              } else {
                console.log(`[SYNC PROJECTS] Successfully auto-pushed project ${up.id}`);
              }
            } catch (e) {
              console.error('Auto-push project failed with exception:', up.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed];
          const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
          console.log(`[SYNC PROJECTS] merged count: ${merged.length}, unique count: ${unique.length}`);
          
          setProjects(unique);
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch projects error:', err);
      }
      }

      // 3. Fetch Transactions
      if (!tablesToSync || tablesToSync.includes('transactions')) {
      try {
        const { data: transactionsData, error: tErr } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        if (!tErr && transactionsData) {
          const parsed = transactionsData.map(convertTransaction).map(t => ({ ...t, _isRemote: true } as Transaction));
          
          const localStr = localStorage.getItem(TRANSACTIONS_KEY);
          const localTransactions: Transaction[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced transactions
          const unsynced = localTransactions.filter(lt => isLocalNew(lt) && !parsed.some(st => st.id === lt.id));
          for (const ut of unsynced) {
            try {
              await supabase.from('transactions').insert([{
                id: ut.id,
                ...transactionToDB(ut)
              }]);
            } catch (e) {
              console.error('Auto-push transaction failed:', ut.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed];
          const unique = Array.from(new Map(merged.map(t => [t.id, t])).values());
          
          setTransactions(unique);
          localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch transactions error:', err);
      }
      }

      // 4. Fetch Clients
      if (!tablesToSync || tablesToSync.includes('clients')) {
      try {
        const { data: clientsData, error: cErr } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (!cErr && clientsData) {
          const parsed = clientsData.map(convertClient).map(c => ({ ...c, _isRemote: true } as Client));
          
          const localStr = localStorage.getItem(CLIENTS_KEY);
          const localClients: Client[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced clients
          const unsynced = localClients.filter(lc => isLocalNew(lc) && !parsed.some(sc => sc.id === lc.id));
          for (const uc of unsynced) {
            try {
              await supabase.from('clients').insert([{
                id: uc.id,
                ...clientToDB(uc)
              }]);
            } catch (e) {
              console.error('Auto-push client failed:', uc.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed];
          const unique = Array.from(new Map(merged.map(c => [c.id, c])).values());
          
          setClients(unique);
          localStorage.setItem(CLIENTS_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch clients error:', err);
      }
      }

      // 5. Fetch Stock Items
      if (!tablesToSync || tablesToSync.includes('stock_items')) {
      try {
        const { data: stockData, error: sErr } = await supabase.from('stock_items').select('*').order('created_at', { ascending: false });
        if (!sErr && stockData) {
          const parsed = stockData.map(convertStockItem).map(s => ({ ...s, _isRemote: true } as StockItem));
          
          const localStr = localStorage.getItem(STOCK_KEY);
          const localStock: StockItem[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced stock items
          const unsynced = localStock.filter(ls => isLocalNew(ls) && !parsed.some(ss => ss.id === ls.id));
          for (const us of unsynced) {
            try {
              await supabase.from('stock_items').insert([{
                id: us.id,
                ...stockItemToDB(us)
              }]);
            } catch (e) {
              console.error('Auto-push stock item failed:', us.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed];
          const unique = Array.from(new Map(merged.map(s => [s.id, s])).values());
          
          setStockItems(unique);
          localStorage.setItem(STOCK_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch stock error:', err);
      }
      }

      // 6. Fetch Units
      if (!tablesToSync || tablesToSync.includes('units')) {
      try {
        const { data: unitsData, error: unErr } = await supabase.from('units').select('*').order('created_at', { ascending: false });
        if (!unErr && unitsData) {
          const parsed = unitsData.map(convertUnit).map(u => ({ ...u, _isRemote: true } as Unit));
          
          const localStr = localStorage.getItem(UNITS_KEY);
          const localUnits: Unit[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced units
          const unsynced = localUnits.filter(lu => isLocalNew(lu) && !parsed.some(su => su.id === lu.id));
          for (const uu of unsynced) {
            try {
              await supabase.from('units').insert([{
                id: uu.id,
                ...unitToDB(uu)
              }]);
            } catch (e) {
              console.error('Auto-push unit failed:', uu.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed];
          const unique = Array.from(new Map(merged.map(u => [u.id, u])).values());
          
          setUnits(unique);
          localStorage.setItem(UNITS_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch units error:', err);
      }
      }

      // 7. Fetch Invoices
      if (!tablesToSync || tablesToSync.includes('invoices')) {
      try {
        const { data: invoicesData, error: iErr } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
        if (!iErr && invoicesData) {
          const parsed = invoicesData.map(convertInvoice).map(i => ({ ...i, _isRemote: true } as Invoice));
          
          const localStr = localStorage.getItem(INVOICES_KEY);
          const localInvoices: Invoice[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced invoices
          const unsynced = localInvoices.filter(li => isLocalNew(li) && !parsed.some(si => si.id === li.id));
          for (const ui of unsynced) {
            try {
              await supabase.from('invoices').insert([{
                id: ui.id,
                ...invoiceToDB(ui)
              }]);
            } catch (e) {
              console.error('Auto-push invoice failed:', ui.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed];
          const unique = Array.from(new Map(merged.map(i => [i.id, i])).values());
          
          setInvoices(unique);
          localStorage.setItem(INVOICES_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch invoices error:', err);
      }
      }

      // 8. Fetch Notifications
      if (!tablesToSync || tablesToSync.includes('notifications')) {
      try {
        const { data: notificationsData, error: nErr } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!nErr && notificationsData) {
          const readIds = getReadNotificationIds();
          const parsed = notificationsData.map(convertNotification).map(n => ({
            ...n,
            isRead: n.isRead || readIds.has(n.id),
            _isRemote: true
          } as Notification));
          
          const localStr = localStorage.getItem(NOTIFICATIONS_KEY);
          const localNotifications: Notification[] = localStr ? JSON.parse(localStr) : [];
          
          // Auto-push unsynced notifications
          const unsynced = localNotifications.filter(ln => isLocalNew(ln) && !parsed.some(sn => sn.id === ln.id));
          for (const un of unsynced) {
            try {
              await supabase.from('notifications').insert([{
                id: un.id,
                ...notificationToDB(un)
              }]);
            } catch (e) {
              console.error('Auto-push notification failed:', un.id, e);
            }
          }
          
          const merged = [...unsynced, ...parsed].map(n => ({
            ...n,
            isRead: n.isRead || readIds.has(n.id)
          }));
          const unique = Array.from(new Map(merged.map(n => [n.id, n])).values());
          
          // Sort by date descending
          unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setNotifications(unique);
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(unique));
        }
      } catch (err) {
        console.error('Fetch notifications error:', err);
      }
      }

      return true;
    } catch (err) {
      console.error('Supabase syncData error:', err);
      return false;
    }
  };

  // Offline-first initial load: load from LocalStorage immediately, then sync from Supabase in the background
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run migration first
        const isUUID = (str: string) => {
          if (!str) return false;
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        };

        let migratedAny = false;

        // 1. Projects
        const storedProjectsStr = localStorage.getItem(PROJECTS_KEY);
        let localProjectsList: Project[] = storedProjectsStr ? JSON.parse(storedProjectsStr) : [];
        const projectIdMapping: Record<string, string> = {};

        localProjectsList = localProjectsList.map(p => {
          if (!isUUID(p.id)) {
            const newId = generateId();
            projectIdMapping[p.id] = newId;
            migratedAny = true;
            return { ...p, id: newId };
          }
          return p;
        });

        // 2. Transactions
        const storedTransStr = localStorage.getItem(TRANSACTIONS_KEY);
        let localTransList: Transaction[] = storedTransStr ? JSON.parse(storedTransStr) : [];
        localTransList = localTransList.map(t => {
          let updated = { ...t };
          let changed = false;
          if (!isUUID(t.id)) {
            updated.id = generateId();
            changed = true;
            migratedAny = true;
          }
          if (t.projectId && projectIdMapping[t.projectId]) {
            updated.projectId = projectIdMapping[t.projectId];
            changed = true;
            migratedAny = true;
          }
          return changed ? updated : t;
        });

        // 3. Invoices
        const storedInvoicesStr = localStorage.getItem(INVOICES_KEY);
        let localInvoicesList: Invoice[] = storedInvoicesStr ? JSON.parse(storedInvoicesStr) : [];
        localInvoicesList = localInvoicesList.map(inv => {
          let updated = { ...inv };
          let changed = false;
          if (!isUUID(inv.id)) {
            updated.id = generateId();
            changed = true;
            migratedAny = true;
          }
          if (inv.projectId && projectIdMapping[inv.projectId]) {
            updated.projectId = projectIdMapping[inv.projectId];
            changed = true;
            migratedAny = true;
          }
          return changed ? updated : inv;
        });

        // 4. Clients
        const storedClientsStr = localStorage.getItem(CLIENTS_KEY);
        let localClientsList: Client[] = storedClientsStr ? JSON.parse(storedClientsStr) : [];
        localClientsList = localClientsList.map(c => {
          if (!isUUID(c.id)) {
            migratedAny = true;
            return { ...c, id: generateId() };
          }
          return c;
        });

        // 5. Stock
        const storedStockStr = localStorage.getItem(STOCK_KEY);
        let localStockList: StockItem[] = storedStockStr ? JSON.parse(storedStockStr) : [];
        localStockList = localStockList.map(s => {
          if (!isUUID(s.id)) {
            migratedAny = true;
            return { ...s, id: generateId() };
          }
          return s;
        });

        // 6. Units
        const storedUnitsStr = localStorage.getItem(UNITS_KEY);
        let localUnitsList: Unit[] = storedUnitsStr ? JSON.parse(storedUnitsStr) : [];
        localUnitsList = localUnitsList.map(u => {
          if (!isUUID(u.id)) {
            migratedAny = true;
            return { ...u, id: generateId() };
          }
          return u;
        });

        // 7. Users
        const storedUsersStr = localStorage.getItem(USERS_KEY);
        let localUsersList: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        localUsersList = localUsersList.map(u => {
          if (!isUUID(u.id)) {
            migratedAny = true;
            return { ...u, id: generateId() };
          }
          return u;
        });

        if (migratedAny) {
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(localProjectsList));
          localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(localTransList));
          localStorage.setItem(INVOICES_KEY, JSON.stringify(localInvoicesList));
          localStorage.setItem(CLIENTS_KEY, JSON.stringify(localClientsList));
          localStorage.setItem(STOCK_KEY, JSON.stringify(localStockList));
          localStorage.setItem(UNITS_KEY, JSON.stringify(localUnitsList));
          localStorage.setItem(USERS_KEY, JSON.stringify(localUsersList));
          console.log('Successfully migrated offline IDs to UUIDs.');
        }

        // Load everything from LocalStorage first to ensure instant 0ms startup
        const storedUsers = localStorage.getItem(USERS_KEY);
        let initialUsers: User[] = [];
        if (storedUsers) {
          initialUsers = JSON.parse(storedUsers);
        } else {
          const defaultAdmin: User = {
            id: generateId(),
            name: 'Admin',
            email: 'admin@beeforce.com',
            username: 'admin',
            role: 'admin',
            permissions: ['all'],
            createdAt: new Date().toISOString(),
            isActive: true
          };
          initialUsers = [defaultAdmin];
          localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        }
        setUsers(initialUsers);

        const storedProjects = localStorage.getItem(PROJECTS_KEY);
        if (storedProjects) setProjects(JSON.parse(storedProjects));

        const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));

        const storedClients = localStorage.getItem(CLIENTS_KEY);
        if (storedClients) setClients(JSON.parse(storedClients));

        const storedStock = localStorage.getItem(STOCK_KEY);
        if (storedStock) setStockItems(JSON.parse(storedStock));

        const storedUnits = localStorage.getItem(UNITS_KEY);
        if (storedUnits) setUnits(JSON.parse(storedUnits));

        const storedInvoices = localStorage.getItem(INVOICES_KEY);
        if (storedInvoices) setInvoices(JSON.parse(storedInvoices));

        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        let loadedUser = null;
        if (storedUser) {
          loadedUser = JSON.parse(storedUser);
          setCurrentUser(loadedUser);
        }

        const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
        if (storedNotifications) {
          const parsed = JSON.parse(storedNotifications);
          if (loadedUser) {
            const readIdsStr = localStorage.getItem(`read_notifications_${loadedUser.id}`);
            const readIds = readIdsStr ? new Set(JSON.parse(readIdsStr)) : new Set();
            setNotifications(parsed.map((n: any) => ({
              ...n,
              isRead: n.isRead || readIds.has(n.id)
            })));
          } else {
            setNotifications(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load local data:', err);
      } finally {
        // App becomes interactive instantly
        setIsLoading(false);
      }

      // 2. Perform background synchronization with Supabase cloud
      try {
        await syncData();
      } catch (err) {
        console.error('Background sync failed on initialize:', err);
      }
    };
    initializeApp();
  }, []);

  // Periodic background synchronization and immediate login refresh + Realtime listener
  useEffect(() => {
    if (currentUser) {
      // Immediate sync when currentUser session is detected
      syncData();

      // Setup Supabase Realtime channel subscription to listen to all public database changes
      const channel = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
          console.log('Realtime Notification change caught:', payload);
          if (payload.eventType === 'INSERT') {
            try {
              const newNotif = convertNotification(payload.new);
              // Trigger toast alert for everyone except the actor who created it
              const isSelf = newNotif.createdById 
                ? newNotif.createdById === currentUser?.id 
                : newNotif.createdBy === currentUser?.name;
              if (newNotif && !isSelf) {
                triggerToast(newNotif.title, newNotif.message);
              }
            } catch (err) {
              console.error('Error handling realtime notification toast:', err);
            }
          }
          syncData(['notifications']);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
          console.log('Realtime User change caught:', payload);
          syncData(['users']);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
          console.log('Realtime Project change caught:', payload);
          syncData(['projects']);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
          console.log('Realtime Transaction change caught:', payload);
          syncData(['transactions']);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload) => {
          console.log('Realtime Invoice change caught:', payload);
          syncData(['invoices']);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_items' }, (payload) => {
          console.log('Realtime Stock change caught:', payload);
          syncData(['stock_items']);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, (payload) => {
          console.log('Realtime Unit change caught:', payload);
          syncData(['units']);
        })
        .subscribe((status) => {
          console.log(`Supabase Realtime subscription status for user ${currentUser.name}:`, status);
        });

      // Periodic background synchronization every 15 seconds as a fallback
      const interval = setInterval(() => {
        syncData();
      }, 15000);

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.error('Login error:', error);
        return false;
      }

      // Fetch the full user profile from our public users table
      const { data: userData, error: uErr } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      
      if (userData && !uErr) {
        const u = convertUser(userData);
        setCurrentUser(u);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
        syncData();
        return true;
      }
    } catch (err) {
      console.error('Login exception:', err);
    }
    return false;
  };

  const loginWithUsername = async (username: string, password: string): Promise<boolean> => {
    try {
      // First, get the email for this username from our public table
      const { data: usersData, error: lookupErr } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();
        
      if (lookupErr || !usersData?.email) {
        // Fallback: try logging in treating username as email
        return await login(username, password);
      }
      
      return await login(usersData.email, password);
    } catch (err) {
      console.error('Username login exception:', err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // Notification functions
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
      createdBy: notification.createdBy || currentUser?.name || 'النظام',
      createdByRole: notification.createdByRole || (notification.createdBy ? undefined : currentUser?.role) || undefined,
      createdById: notification.createdById || currentUser?.id || undefined,
    };

    // Prepend to state & localStorage
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });

    triggerToast(newNotification.title, newNotification.message);

    try {
      await supabase.from('notifications').insert([{
        id: newNotification.id,
        ...notificationToDB(newNotification)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addNotification error:', err);
    }
  };

  const markAsRead = async (id: string) => {
    const readIds = getReadNotificationIds();
    readIds.add(id);
    await saveReadNotificationIds(readIds);

    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = async () => {
    // Mark all notifications as read locally instead of deleting from DB
    // This preserves notifications for other team members
    const readIds = getReadNotificationIds();
    notifications.forEach(n => {
      readIds.add(n.id);
    });
    await saveReadNotificationIds(readIds);

    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  };

  // User functions
  const addUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));

    addNotification({
      type: 'general',
      title: 'موظف جديد',
      message: `قام ${currentUser?.name || 'مدير'} بإضافة موظف جديد: ${newUser.name}`,
      isRead: false,
    });

    try {
      await supabase.from('users').insert([{
        id: newUser.id,
        ...userToDB(newUser)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addUser error:', err);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const targetUser = users.find(u => u.id === id);
    const newUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    
    if (currentUser?.id === id) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    addNotification({
      type: 'general',
      title: 'تعديل موظف',
      message: `قام ${currentUser?.name || 'مدير'} بتعديل بيانات الموظف: ${targetUser?.name || id}`,
      isRead: false,
    });

    try {
      const dbData: any = {};
      if (userData.email) dbData.email = userData.email;
      if (userData.name) dbData.name = userData.name;
      if (userData.role) dbData.role = userData.role;
      if (userData.permissions) dbData.permissions = userData.permissions;
      if (userData.isActive !== undefined) dbData.is_active = userData.isActive;
      if (userData.username) dbData.username = userData.username;
      if (userData.password) dbData.password = userData.password;
      await supabase.from('users').update(dbData).eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase updateUser error:', err);
    }
  };

  const deleteUser = async (id: string) => {
    const targetUser = users.find(u => u.id === id);
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));

    addNotification({
      type: 'general',
      title: 'حذف موظف',
      message: `قام ${currentUser?.name || 'مدير'} بحذف الموظف: ${targetUser?.name || id}`,
      isRead: false,
    });

    try {
      await supabase.from('users').delete().eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase deleteUser error:', err);
    }
  };

  // Project functions
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || '',
      assignedTo: project.assignedTo || [],
    };
    console.log(`[ADD PROJECT] newProject ID: ${newProject.id}`);
    const newProjects = [newProject, ...projects];
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
    console.log(`[ADD PROJECT] Saved to localStorage. Total projects now: ${newProjects.length}`);
    
    addNotification({
      type: 'project',
      title: 'مشروع جديد',
      message: `تم إنشاء مشروع جديد: ${project.name}`,
      isRead: false,
    });

    try {
      const { error } = await supabase.from('projects').insert([{
        id: newProject.id,
        ...projectToDB(newProject)
      }]);
      if (error) {
        console.error('Supabase addProject DB error:', error);
      } else {
        console.log(`[ADD PROJECT] Successfully inserted to Supabase: ${newProject.id}`);
      }
      console.log(`[ADD PROJECT] Calling syncData...`);
      await syncData();
    } catch (err) {
      console.error('Supabase addProject error:', err);
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    const targetProject = projects.find(p => p.id === id);
    const newProjects = projects.map(p => p.id === id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p);
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));

    addNotification({
      type: 'project',
      title: 'تعديل مشروع',
      message: `قام ${currentUser?.name || 'مستخدم'} بتعديل المشروع: ${targetProject?.name || id}`,
      isRead: false,
    });

    try {
      const dbData: any = {};
      if (projectData.name) dbData.name = projectData.name;
      if (projectData.clientName) dbData.client_name = projectData.clientName;
      if (projectData.shootDates !== undefined) dbData.shoot_dates = projectData.shootDates;
      if (projectData.analyticalAccount !== undefined) dbData.analytical_account = projectData.analyticalAccount;
      if (projectData.status) dbData.status = projectData.status;
      if (projectData.hasTaxInvoice !== undefined) dbData.has_tax_invoice = projectData.hasTaxInvoice;
      if (projectData.notes !== undefined) dbData.notes = projectData.notes;
      if (projectData.assignedTo !== undefined) dbData.assigned_to = projectData.assignedTo;
      dbData.updated_at = new Date().toISOString();

      const { error } = await supabase.from('projects').update(dbData).eq('id', id);
      if (error) {
        console.error('Supabase updateProject DB error:', error);
      }
      await syncData();
    } catch (err) {
      console.error('Supabase updateProject error:', err);
    }
  };

  const deleteProject = async (id: string) => {
    const targetProject = projects.find(p => p.id === id);
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));

    addNotification({
      type: 'project',
      title: 'حذف مشروع',
      message: `قام ${currentUser?.name || 'مستخدم'} بحذف المشروع: ${targetProject?.name || id}`,
      isRead: false,
    });

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteProject DB error:', error);
      }
      await syncData();
    } catch (err) {
      console.error('Supabase deleteProject error:', err);
    }
  };

  const addProjectComment = async (projectId: string, content: string) => {
    if (!currentUser) return;
    const newComment: ProjectComment = {
      id: generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role === 'admin' ? 'مدير' : currentUser.role === 'accountant' ? 'محاسب' : 'موظف',
      content,
      createdAt: new Date().toISOString(),
    };

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedComments = [...(project.comments || []), newComment];
    const updatedProject = { ...project, comments: updatedComments };

    const newProjects = projects.map(p => p.id === projectId ? updatedProject : p);
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));

    // Notify other users
    addNotification({
      type: 'project',
      title: 'تعليق جديد',
      message: `أضاف ${currentUser.name} تعليقاً على مشروع ${project.name}`,
      isRead: false,
    });

    try {
      const { error } = await supabase.from('projects').update({
        comments: updatedComments
      }).eq('id', projectId);
      if (error) {
        console.error('Supabase addProjectComment DB error:', error);
      }
      await syncData();
    } catch (err) {
      console.error('Supabase addProjectComment error:', err);
    }
  };

  // Transaction functions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'balance'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
      balance: transaction.credit ? transaction.credit : -(transaction.debit || 0),
      createdBy: currentUser?.name || '',
    };
    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
    
    addNotification({
      type: 'transaction',
      title: 'معاملة جديدة',
      message: `قام ${currentUser?.name || 'مستخدم'} بإضافة معاملة بقيمة ${transaction.debit || transaction.credit} للمورد ${transaction.supplierName} في مشروع ${transaction.projectName || 'عام'}: ${transaction.description}`,
      isRead: false,
    });

    try {
      await supabase.from('transactions').insert([{
        id: newTransaction.id,
        ...transactionToDB(newTransaction)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addTransaction error:', err);
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    const targetTransaction = transactions.find(t => t.id === id);
    const newTransactions = transactions.map(t => t.id === id ? { ...t, ...transactionData } : t);
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));

    addNotification({
      type: 'transaction',
      title: 'تعديل معاملة',
      message: `قام ${currentUser?.name || 'مستخدم'} بتعديل المعاملة (${targetTransaction?.description}) للمورد ${transactionData.supplierName || targetTransaction?.supplierName}`,
      isRead: false,
    });

    try {
      const dbData: any = {};
      if (transactionData.no) dbData.no = transactionData.no;
      if (transactionData.date) dbData.date = transactionData.date;
      if (transactionData.supplierName) dbData.supplier_name = transactionData.supplierName;
      if (transactionData.description) dbData.description = transactionData.description;
      if (transactionData.category) dbData.category = transactionData.category;
      if (transactionData.debit !== undefined) dbData.debit = transactionData.debit;
      if (transactionData.credit !== undefined) dbData.credit = transactionData.credit;
      if (transactionData.balance !== undefined) dbData.balance = transactionData.balance;
      if (transactionData.projectId !== undefined) dbData.project_id = transactionData.projectId || null;
      if (transactionData.projectName) dbData.project_name = transactionData.projectName;
      if (transactionData.hasTaxInvoice !== undefined) dbData.has_tax_invoice = transactionData.hasTaxInvoice;
      if (transactionData.notes !== undefined) dbData.notes = transactionData.notes;
      if (transactionData.receiptImages !== undefined) dbData.receipt_images = transactionData.receiptImages;

      await supabase.from('transactions').update(dbData).eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase updateTransaction error:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    const targetTransaction = transactions.find(t => t.id === id);
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));

    addNotification({
      type: 'transaction',
      title: 'حذف معاملة',
      message: `قام ${currentUser?.name || 'مستخدم'} بحذف المعاملة: ${targetTransaction?.description || id}`,
      isRead: false,
    });

    try {
      await supabase.from('transactions').delete().eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase deleteTransaction error:', err);
    }
  };

  // Client functions
  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newClients = [newClient, ...clients];
    setClients(newClients);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(newClients));

    addNotification({
      type: 'general',
      title: 'عميل جديد',
      message: `قام ${currentUser?.name || 'مستخدم'} بإضافة عميل جديد: ${newClient.name} (${newClient.company || 'بدون شركة'})`,
      isRead: false,
    });

    try {
      await supabase.from('clients').insert([{
        id: newClient.id,
        ...clientToDB(newClient)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addClient error:', err);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const targetClient = clients.find(c => c.id === id);
    const newClients = clients.map(c => c.id === id ? { ...c, ...clientData } : c);
    setClients(newClients);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(newClients));

    addNotification({
      type: 'general',
      title: 'تعديل عميل',
      message: `قام ${currentUser?.name || 'مستخدم'} بتعديل بيانات العميل: ${targetClient?.name || id}`,
      isRead: false,
    });

    try {
      const dbData: any = {};
      if (clientData.name) dbData.name = clientData.name;
      if (clientData.email) dbData.email = clientData.email;
      if (clientData.phone) dbData.phone = clientData.phone;
      if (clientData.company) dbData.company = clientData.company;
      if (clientData.address) dbData.address = clientData.address;
      if (clientData.notes !== undefined) dbData.notes = clientData.notes;

      await supabase.from('clients').update(dbData).eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase updateClient error:', err);
    }
  };

  const deleteClient = async (id: string) => {
    const targetClient = clients.find(c => c.id === id);
    const newClients = clients.filter(c => c.id !== id);
    setClients(newClients);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(newClients));

    addNotification({
      type: 'general',
      title: 'حذف عميل',
      message: `قام ${currentUser?.name || 'مستخدم'} بحذف العميل: ${targetClient?.name || id}`,
      isRead: false,
    });

    try {
      await supabase.from('clients').delete().eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase deleteClient error:', err);
    }
  };

  // Stock functions
  const addStockItem = async (item: Omit<StockItem, 'id' | 'createdAt'>) => {
    const newItem: StockItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newStock = [newItem, ...stockItems];
    setStockItems(newStock);
    localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));

    addNotification({
      type: 'general',
      title: 'إضافة مخزون',
      message: `قام ${currentUser?.name || 'مستخدم'} بإضافة مادة للمخزون: ${newItem.name}`,
      isRead: false,
    });

    try {
      await supabase.from('stock_items').insert([{
        id: newItem.id,
        ...stockItemToDB(newItem)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addStockItem error:', err);
    }
  };

  const updateStockItem = async (id: string, itemData: Partial<StockItem>) => {
    const targetItem = stockItems.find(i => i.id === id);
    const newStock = stockItems.map(i => i.id === id ? { ...i, ...itemData } : i);
    setStockItems(newStock);
    localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));
    
    const updatedItem = newStock.find(i => i.id === id);
    if (updatedItem && updatedItem.quantity <= updatedItem.minQuantity) {
      addNotification({
        type: 'low_stock',
        title: 'تنبيه مخزون منخفض',
        message: `قام ${currentUser?.name || 'مستخدم'} بتعديل المخزون - المادة "${updatedItem.name}" وصلت للحد الأدنى (${updatedItem.quantity})`,
        isRead: false,
      });
    } else {
      addNotification({
        type: 'general',
        title: 'تعديل مخزون',
        message: `قام ${currentUser?.name || 'مستخدم'} بتعديل المادة في المخزون: ${targetItem?.name || id}`,
        isRead: false,
      });
    }

    try {
      const dbData: any = {};
      if (itemData.name) dbData.name = itemData.name;
      if (itemData.category) dbData.category = itemData.category;
      if (itemData.unit) dbData.unit = itemData.unit;
      if (itemData.quantity !== undefined) dbData.quantity = itemData.quantity;
      if (itemData.minQuantity !== undefined) dbData.min_quantity = itemData.minQuantity;
      if (itemData.costPerUnit !== undefined) dbData.cost_per_unit = itemData.costPerUnit;
      if (itemData.supplier) dbData.supplier = itemData.supplier;
      if (itemData.notes !== undefined) dbData.notes = itemData.notes;

      await supabase.from('stock_items').update(dbData).eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase updateStockItem error:', err);
    }
  };

  const deleteStockItem = async (id: string) => {
    const targetItem = stockItems.find(i => i.id === id);
    const newStock = stockItems.filter(i => i.id !== id);
    setStockItems(newStock);
    localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));

    addNotification({
      type: 'general',
      title: 'حذف من المخزون',
      message: `قام ${currentUser?.name || 'مستخدم'} بحذف المادة من المخزون: ${targetItem?.name || id}`,
      isRead: false,
    });

    try {
      await supabase.from('stock_items').delete().eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase deleteStockItem error:', err);
    }
  };

  // Unit functions
  const addUnit = async (unit: Omit<Unit, 'id' | 'createdAt'>) => {
    const newUnit: Unit = {
      ...unit,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newUnits = [newUnit, ...units];
    setUnits(newUnits);
    localStorage.setItem(UNITS_KEY, JSON.stringify(newUnits));

    addNotification({
      type: 'general',
      title: 'وحدة جديدة',
      message: `قام ${currentUser?.name || 'مستخدم'} بإضافة وحدة جديدة: ${newUnit.name}`,
      isRead: false,
    });

    try {
      await supabase.from('units').insert([{
        id: newUnit.id,
        ...unitToDB(newUnit)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addUnit error:', err);
    }
  };

  const updateUnit = async (id: string, unitData: Partial<Unit>) => {
    const targetUnit = units.find(u => u.id === id);
    const newUnits = units.map(u => u.id === id ? { ...u, ...unitData } : u);
    setUnits(newUnits);
    localStorage.setItem(UNITS_KEY, JSON.stringify(newUnits));

    addNotification({
      type: 'general',
      title: 'تعديل وحدة',
      message: `قام ${currentUser?.name || 'مستخدم'} بتعديل الوحدة: ${targetUnit?.name || id}`,
      isRead: false,
    });

    try {
      const dbData: any = {};
      if (unitData.name) dbData.name = unitData.name;
      if (unitData.type) dbData.type = unitData.type;
      if (unitData.status) dbData.status = unitData.status;
      if (unitData.capacity !== undefined) dbData.capacity = unitData.capacity;
      if (unitData.notes !== undefined) dbData.notes = unitData.notes;

      await supabase.from('units').update(dbData).eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase updateUnit error:', err);
    }
  };

  const deleteUnit = async (id: string) => {
    const targetUnit = units.find(u => u.id === id);
    const newUnits = units.filter(u => u.id !== id);
    setUnits(newUnits);
    localStorage.setItem(UNITS_KEY, JSON.stringify(newUnits));

    addNotification({
      type: 'general',
      title: 'حذف وحدة',
      message: `قام ${currentUser?.name || 'مستخدم'} بحذف الوحدة: ${targetUnit?.name || id}`,
      isRead: false,
    });

    try {
      await supabase.from('units').delete().eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase deleteUnit error:', err);
    }
  };

  // Invoice functions
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || '',
    };
    const newInvoices = [newInvoice, ...invoices];
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));

    addNotification({
      type: 'invoice',
      title: 'فاتورة جديدة',
      message: `قام ${currentUser?.name || 'مستخدم'} بإنشاء فاتورة جديدة: ${newInvoice.invoiceNumber} للعميل ${newInvoice.clientName}`,
      isRead: false,
    });

    try {
      await supabase.from('invoices').insert([{
        id: newInvoice.id,
        ...invoiceToDB(newInvoice)
      }]);
      await syncData();
    } catch (err) {
      console.error('Supabase addInvoice error:', err);
    }
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    const targetInvoice = invoices.find(i => i.id === id);
    const newInvoices = invoices.map(i => i.id === id ? { ...i, ...invoiceData } : i);
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));

    addNotification({
      type: 'invoice',
      title: 'تعديل فاتورة',
      message: `قام ${currentUser?.name || 'مستخدم'} بتعديل الفاتورة: ${targetInvoice?.invoiceNumber || id}`,
      isRead: false,
    });

    try {
      const dbData: any = {};
      if (invoiceData.invoiceNumber) dbData.invoice_number = invoiceData.invoiceNumber;
      if (invoiceData.type) dbData.type = invoiceData.type;
      if (invoiceData.projectId !== undefined) dbData.project_id = invoiceData.projectId || null;
      if (invoiceData.projectName) dbData.project_name = invoiceData.projectName;
      if (invoiceData.clientName) dbData.client_name = invoiceData.clientName;
      if (invoiceData.amount !== undefined) dbData.amount = invoiceData.amount;
      if (invoiceData.vatAmount !== undefined) dbData.vat_amount = invoiceData.vatAmount;
      if (invoiceData.totalAmount !== undefined) dbData.total_amount = invoiceData.totalAmount;
      if (invoiceData.status) dbData.status = invoiceData.status;
      if (invoiceData.dueDate !== undefined) dbData.due_date = invoiceData.dueDate || null;
      if (invoiceData.items) dbData.items = invoiceData.items;
      if (invoiceData.attachments) dbData.attachments = invoiceData.attachments;
      if (invoiceData.notes !== undefined) dbData.notes = invoiceData.notes;
      if (invoiceData.reviewedBy !== undefined) dbData.reviewed_by = invoiceData.reviewedBy || null;
      if (invoiceData.reviewedAt !== undefined) dbData.reviewed_at = invoiceData.reviewedAt || null;

      await supabase.from('invoices').update(dbData).eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase updateInvoice error:', err);
    }
  };

  const deleteInvoice = async (id: string) => {
    const targetInvoice = invoices.find(i => i.id === id);
    const newInvoices = invoices.filter(i => i.id !== id);
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));

    addNotification({
      type: 'invoice',
      title: 'حذف فاتورة',
      message: `قام ${currentUser?.name || 'مستخدم'} بحذف الفاتورة: ${targetInvoice?.invoiceNumber || id}`,
      isRead: false,
    });

    try {
      await supabase.from('invoices').delete().eq('id', id);
      await syncData();
    } catch (err) {
      console.error('Supabase deleteInvoice error:', err);
    }
  };

  // Stats functions
  const getProjectStats = () => ({
    total: filteredProjects.length,
    active: filteredProjects.filter(p => p.status === 'in-progress').length,
    completed: filteredProjects.filter(p => p.status === 'completed' || p.status === 'paid').length,
    draft: filteredProjects.filter(p => p.status === 'draft').length,
  });

  const getFinancialStats = () => {
    const filteredData = canViewFinance ? transactions : filteredTransactions;
    const totalIncome = filteredData.reduce((sum, t) => sum + (t.credit || 0), 0);
    const totalExpenses = filteredData.reduce((sum, t) => sum + (t.debit || 0), 0);
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  };

  const getProjectTransactions = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    return transactions.filter(t => t.projectId === projectId || t.projectName === project.name);
  };

  const getMonthlySummary = () => {
    const filteredData = canViewFinance ? transactions : filteredTransactions;
    const months: Record<string, { income: number; expenses: number }> = {};
    filteredData.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
      if (!months[month]) months[month] = { income: 0, expenses: 0 };
      months[month].income += t.credit || 0;
      months[month].expenses += t.debit || 0;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  };

  // Upload a receipt image to Supabase Storage and return the public URL
  const uploadReceiptImage = async (file: File, transactionId: string): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${transactionId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, { upsert: false, contentType: file.type });
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      return urlData?.publicUrl || null;
    } catch (err) {
      console.error('uploadReceiptImage exception:', err);
      return null;
    }
  };

  const value: AppContextType = {
    currentUser,
    login,
    loginWithUsername,
    logout,
    isAuthenticated: !!currentUser,
    isLoading,
    users,
    addUser,
    updateUser,
    deleteUser,
    projects: filteredProjects,
    filteredProjects,
    addProject,
    updateProject,
    deleteProject,
    addProjectComment,
    transactions: filteredTransactions,
    filteredTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clients,
    addClient,
    updateClient,
    deleteClient,
    stockItems,
    lowStockItems,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    units,
    addUnit,
    updateUnit,
    deleteUnit,
    invoices: filteredInvoices,
    filteredInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    notifications,
    addNotification,
    markAsRead,
    clearNotifications,
    getProjectStats,
    getFinancialStats,
    getProjectTransactions,
    getMonthlySummary,
    isAdmin,
    isAccountant,
    canViewFinance,
    toasts,
    removeToast,
    uploadReceiptImage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};