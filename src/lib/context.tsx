import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { User, Project, Transaction, Client, StockItem, Unit, Invoice, Notification, generateId } from './types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Current user key for local storage
const CURRENT_USER_KEY = 'beeforce_current_user';

// Helper to convert Supabase user
const convertUser = (data: any): User => ({
  id: data.id,
  email: data.email,
  name: data.name,
  role: data.role,
  permissions: data.permissions || [],
  username: data.username,
  createdAt: data.created_at,
  isActive: data.is_active,
});

// Helper to convert Supabase project
const convertProject = (data: any): Project => ({
  id: data.id,
  name: data.name,
  clientName: data.client_name,
  shootDates: data.shoot_dates || '',
  analyticalAccount: data.analytical_account || '',
  status: data.status || 'draft',
  hasTaxInvoice: data.has_tax_invoice || false,
  notes: data.notes || '',
  createdBy: data.created_by || '',
  assignedTo: data.assigned_to || [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

// Helper to convert Supabase transaction
const convertTransaction = (data: any): Transaction => ({
  id: data.id,
  no: data.no || '',
  date: data.date,
  supplierName: data.supplier_name,
  description: data.description || '',
  category: data.category,
  debit: data.debit || 0,
  credit: data.credit || 0,
  balance: data.balance || 0,
  projectId: data.project_id || '',
  projectName: data.project_name || '',
  hasTaxInvoice: data.has_tax_invoice || false,
  notes: data.notes || '',
  createdBy: data.created_by || '',
  createdAt: data.created_at,
});

// Helper to convert Supabase client
const convertClient = (data: any): Client => ({
  id: data.id,
  name: data.name,
  email: data.email || '',
  phone: data.phone || '',
  company: data.company || '',
  address: data.address || '',
  notes: data.notes || '',
  createdAt: data.created_at,
});

// Helper to convert Supabase stock item
const convertStockItem = (data: any): StockItem => ({
  id: data.id,
  name: data.name,
  category: data.category || '',
  unit: data.unit || '',
  quantity: data.quantity || 0,
  minQuantity: data.min_quantity || 0,
  costPerUnit: data.cost_per_unit || 0,
  supplier: data.supplier || '',
  notes: data.notes || '',
  createdAt: data.created_at,
});

// Helper to convert Supabase unit
const convertUnit = (data: any): Unit => ({
  id: data.id,
  name: data.name,
  type: data.type || 'other',
  status: data.status || 'available',
  capacity: data.capacity || 0,
  notes: data.notes || '',
  createdAt: data.created_at,
});

// Helper to convert Supabase invoice
const convertInvoice = (data: any): Invoice => ({
  id: data.id,
  invoiceNumber: data.invoice_number || '',
  type: data.type || 'invoice',
  projectId: data.project_id || '',
  projectName: data.project_name || '',
  clientName: data.client_name || '',
  amount: data.amount || 0,
  vatAmount: data.vat_amount || 0,
  totalAmount: data.total_amount || 0,
  status: data.status || 'draft',
  dueDate: data.due_date || '',
  items: data.items || [],
  attachments: data.attachments || [],
  notes: data.notes || '',
  createdBy: data.created_by || '',
  reviewedBy: data.reviewed_by,
  reviewedAt: data.reviewed_at,
  createdAt: data.created_at,
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

  const isAdmin = currentUser?.role === 'admin';
  const isAccountant = currentUser?.role === 'accountant';
  const canViewFinance = isAdmin || isAccountant;

  // Filtered data based on role
  const filteredProjects = filterByUserAccess(projects, currentUser?.id || '', isAdmin, isAccountant);
  const filteredTransactions = filterByUserAccess(transactions, currentUser?.id || '', isAdmin, isAccountant);
  const filteredInvoices = filterByUserAccess(invoices, currentUser?.id || '', isAdmin, isAccountant);
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minQuantity);

  // Initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: existingProjects, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .limit(1);

        if (projectsError) {
          setIsLoading(false);
          return;
        }

        if (!existingProjects || existingProjects.length === 0) {
          setIsLoading(false);
          return;
        }

        await loadAllData();
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadAllData = async () => {
    try {
      const { data: usersData } = await supabase.from('users').select('*').eq('is_active', true);
      if (usersData) setUsers(usersData.map(convertUser));

      const { data: projectsData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projectsData) setProjects(projectsData.map(convertProject));

      const { data: transactionsData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (transactionsData) setTransactions(transactionsData.map(convertTransaction));

      const { data: clientsData } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (clientsData) setClients(clientsData.map(convertClient));

      const { data: stockData } = await supabase.from('stock_items').select('*').order('created_at', { ascending: false });
      if (stockData) setStockItems(stockData.map(convertStockItem));

      const { data: unitsData } = await supabase.from('units').select('*').order('created_at', { ascending: false });
      if (unitsData) setUnits(unitsData.map(convertUnit));

      const { data: invoicesData } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (invoicesData) setInvoices(invoicesData.map(convertInvoice));
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.isActive);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const loginWithUsername = async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => (u.username === username || u.email === username) && u.isActive);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // Notification functions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // User functions
  const addUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('users').insert([{
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      is_active: user.isActive,
    }]).select().single();
    if (error) throw error;
    if (data) setUsers([...users, convertUser(data)]);
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const updateData: any = {};
    if (userData.email) updateData.email = userData.email;
    if (userData.name) updateData.name = userData.name;
    if (userData.role) updateData.role = userData.role;
    if (userData.permissions) updateData.permissions = userData.permissions;
    if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
    await supabase.from('users').update(updateData).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, ...userData } : u));
    if (currentUser?.id === id) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const deleteUser = async (id: string) => {
    await supabase.from('users').update({ is_active: false }).eq('id', id);
    setUsers(users.filter(u => u.id !== id));
  };

  // Project functions
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const projectData = {
      ...project,
      created_by: currentUser?.name || '',
      assigned_to: project.assignedTo || [],
    };
    const { data, error } = await supabase.from('projects').insert([projectData]).select().single();
    if (error) throw error;
    if (data) {
      const newProject = convertProject(data);
      setProjects([newProject, ...projects]);
      // Notify admin
      addNotification({
        type: 'project',
        title: 'مشروع جديد',
        message: `تم إنشاء مشروع جديد: ${project.name}`,
        isRead: false,
      });
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    const updateData: any = {};
    if (projectData.name) updateData.name = projectData.name;
    if (projectData.clientName) updateData.client_name = projectData.clientName;
    if (projectData.shootDates !== undefined) updateData.shoot_dates = projectData.shootDates;
    if (projectData.analyticalAccount !== undefined) updateData.analytical_account = projectData.analyticalAccount;
    if (projectData.status) updateData.status = projectData.status;
    if (projectData.hasTaxInvoice !== undefined) updateData.has_tax_invoice = projectData.hasTaxInvoice;
    if (projectData.notes !== undefined) updateData.notes = projectData.notes;
    if (projectData.assignedTo !== undefined) updateData.assigned_to = projectData.assignedTo;
    updateData.updated_at = new Date().toISOString();
    await supabase.from('projects').update(updateData).eq('id', id);
    setProjects(projects.map(p => p.id === id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p));
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  // Transaction functions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'balance'>) => {
    const { data, error } = await supabase.from('transactions').insert([{
      ...transaction,
      created_by: currentUser?.name || '',
    }]).select().single();
    if (error) throw error;
    if (data) {
      setTransactions([convertTransaction(data), ...transactions]);
      addNotification({
        type: 'transaction',
        title: 'معاملة جديدة',
        message: `تم إضافة معاملة: ${transaction.description}`,
        isRead: false,
      });
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    const updateData: any = {};
    Object.keys(transactionData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateData[dbKey] = (transactionData as any)[key];
    });
    await supabase.from('transactions').update(updateData).eq('id', id);
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...transactionData } : t));
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Client functions
  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('clients').insert([client]).select().single();
    if (error) throw error;
    if (data) setClients([convertClient(data), ...clients]);
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const updateData: any = {};
    Object.keys(clientData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateData[dbKey] = (clientData as any)[key];
    });
    await supabase.from('clients').update(updateData).eq('id', id);
    setClients(clients.map(c => c.id === id ? { ...c, ...clientData } : c));
  };

  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(clients.filter(c => c.id !== id));
  };

  // Stock functions
  const addStockItem = async (item: Omit<StockItem, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('stock_items').insert([item]).select().single();
    if (error) throw error;
    if (data) setStockItems([convertStockItem(data), ...stockItems]);
  };

  const updateStockItem = async (id: string, itemData: Partial<StockItem>) => {
    const updateData: any = {};
    Object.keys(itemData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateData[dbKey] = (itemData as any)[key];
    });
    await supabase.from('stock_items').update(updateData).eq('id', id);
    const updated = stockItems.map(i => i.id === id ? { ...i, ...itemData } : i);
    setStockItems(updated);
    // Check for low stock
    const updatedItem = updated.find(i => i.id === id);
    if (updatedItem && updatedItem.quantity <= updatedItem.minQuantity) {
      addNotification({
        type: 'low_stock',
        title: 'تنبيه مخزون',
        message: `المادة "${updatedItem.name}" وصلت للحد الأدنى`,
        isRead: false,
      });
    }
  };

  const deleteStockItem = async (id: string) => {
    await supabase.from('stock_items').delete().eq('id', id);
    setStockItems(stockItems.filter(i => i.id !== id));
  };

  // Unit functions
  const addUnit = async (unit: Omit<Unit, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('units').insert([unit]).select().single();
    if (error) throw error;
    if (data) setUnits([convertUnit(data), ...units]);
  };

  const updateUnit = async (id: string, unitData: Partial<Unit>) => {
    const updateData: any = {};
    Object.keys(unitData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateData[dbKey] = (unitData as any)[key];
    });
    await supabase.from('units').update(updateData).eq('id', id);
    setUnits(units.map(u => u.id === id ? { ...u, ...unitData } : u));
  };

  const deleteUnit = async (id: string) => {
    await supabase.from('units').delete().eq('id', id);
    setUnits(units.filter(u => u.id !== id));
  };

  // Invoice functions
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('invoices').insert([{
      ...invoice,
      created_by: currentUser?.name || '',
    }]).select().single();
    if (error) throw error;
    if (data) setInvoices([convertInvoice(data), ...invoices]);
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    const updateData: any = {};
    Object.keys(invoiceData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateData[dbKey] = (invoiceData as any)[key];
    });
    await supabase.from('invoices').update(updateData).eq('id', id);
    setInvoices(invoices.map(i => i.id === id ? { ...i, ...invoiceData } : i));
  };

  const deleteInvoice = async (id: string) => {
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices(invoices.filter(i => i.id !== id));
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