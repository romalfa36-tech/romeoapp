import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
const USERS_KEY = 'beeforce_users';
const PROJECTS_KEY = 'beeforce_projects';
const TRANSACTIONS_KEY = 'beeforce_transactions';
const CLIENTS_KEY = 'beeforce_clients';
const STOCK_KEY = 'beeforce_stock';
const UNITS_KEY = 'beeforce_units';
const INVOICES_KEY = 'beeforce_invoices';

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
    const initializeApp = () => {
      try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        let initialUsers: User[] = [];
        if (storedUsers) {
          initialUsers = JSON.parse(storedUsers);
        } else {
          // Initialize default admin
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
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load data from LocalStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

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
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    
    if (currentUser?.id === id) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const deleteUser = async (id: string) => {
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
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
    const newProjects = [newProject, ...projects];
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
    addNotification({
      type: 'project',
      title: 'مشروع جديد',
      message: `تم إنشاء مشروع جديد: ${project.name}`,
      isRead: false,
    });
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    const newProjects = projects.map(p => p.id === id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p);
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
  };

  const deleteProject = async (id: string) => {
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
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
      message: `تم إضافة معاملة: ${transaction.description}`,
      isRead: false,
    });
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    const newTransactions = transactions.map(t => t.id === id ? { ...t, ...transactionData } : t);
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
  };

  const deleteTransaction = async (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
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
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const newClients = clients.map(c => c.id === id ? { ...c, ...clientData } : c);
    setClients(newClients);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(newClients));
  };

  const deleteClient = async (id: string) => {
    const newClients = clients.filter(c => c.id !== id);
    setClients(newClients);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(newClients));
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
  };

  const updateStockItem = async (id: string, itemData: Partial<StockItem>) => {
    const newStock = stockItems.map(i => i.id === id ? { ...i, ...itemData } : i);
    setStockItems(newStock);
    localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));
    
    const updatedItem = newStock.find(i => i.id === id);
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
    const newStock = stockItems.filter(i => i.id !== id);
    setStockItems(newStock);
    localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));
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
  };

  const updateUnit = async (id: string, unitData: Partial<Unit>) => {
    const newUnits = units.map(u => u.id === id ? { ...u, ...unitData } : u);
    setUnits(newUnits);
    localStorage.setItem(UNITS_KEY, JSON.stringify(newUnits));
  };

  const deleteUnit = async (id: string) => {
    const newUnits = units.filter(u => u.id !== id);
    setUnits(newUnits);
    localStorage.setItem(UNITS_KEY, JSON.stringify(newUnits));
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
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    const newInvoices = invoices.map(i => i.id === id ? { ...i, ...invoiceData } : i);
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
  };

  const deleteInvoice = async (id: string) => {
    const newInvoices = invoices.filter(i => i.id !== id);
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
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