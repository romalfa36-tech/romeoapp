import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { useLanguage, Language } from '../lib/context';
import { Login } from './Login';
import { Dashboard } from './Dashboard';
import { Projects } from './Projects';
import { ProjectDetails } from './ProjectDetails';
import { Transactions } from './Transactions';
import { Reports } from './Reports';
import { UsersManagement } from './Users';
import { Profile } from './Profile';
import { Clients } from './Clients';
import { Stock } from './Stock';
import { Units } from './Units';
import { Finance } from './Finance';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  FileText,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  UsersRound,
  Package,
  Truck,
  DollarSign,
  Globe
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, isAuthenticated, logout, notifications, markAsRead, canViewFinance, toasts, removeToast } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navItems = [
    { id: 'Dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'Projects', label: t('nav.projects'), icon: Building2 },
    ...(canViewFinance ? [{ id: 'Finance', label: t('nav.finance'), icon: DollarSign }] : []),
    { id: 'Transactions', label: t('nav.transactions'), icon: Receipt },
    ...(isAdmin ? [] : canViewFinance ? [{ id: 'Reports', label: t('nav.reports'), icon: FileText }] : []),
  ];

  const adminNavItems = [
    { id: 'Clients', label: t('nav.clients'), icon: UsersRound },
    { id: 'Stock', label: t('nav.stock'), icon: Package },
    { id: 'Units', label: t('nav.units'), icon: Truck },
    { id: 'Users', label: t('nav.users'), icon: Users },
    { id: 'Reports', label: t('nav.reports'), icon: FileText },
  ];

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'projectDetails' && id) {
      setSelectedProjectId(id);
      setCurrentPage('ProjectDetails');
    } else {
      setCurrentPage(page);
      setSelectedProjectId(null);
    }
    setMobileMenuOpen(false);
  };

  const handleBackFromProject = () => {
    setCurrentPage('Projects');
    setSelectedProjectId(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('Dashboard');
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const Navigation = () => (
    <>
      {/* Desktop Sidebar - Dynamic Right/Left side for RTL/LTR */}
      <aside className={`hidden md:flex flex-col w-64 bg-white h-screen fixed top-0 z-40 ${
        language === 'ar' ? 'right-0 border-l border-gray-200' : 'left-0 border-r border-gray-200'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">BF</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Beeforce</h1>
              <p className="text-xs text-gray-500">{t('nav.management')}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.role === 'admin' ? t('common.admin') : currentUser?.role === 'accountant' ? t('common.accountant') : t('common.employee')}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id ||
              (item.id === 'Projects' && currentPage === 'ProjectDetails');
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <>
              <div className="py-2">
                <p className="px-4 text-xs text-gray-400 uppercase">{t('nav.management')}</p>
              </div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-1">
          <button
            onClick={() => handleNavigate('Profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              currentPage === 'Profile'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">{t('nav.profile')}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id ||
              (item.id === 'Projects' && currentPage === 'ProjectDetails');
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-[#1E3A5F]' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'Projects':
        return <Projects onNavigate={handleNavigate} />;
      case 'ProjectDetails':
        return selectedProjectId ? (
          <ProjectDetails projectId={selectedProjectId} onBack={handleBackFromProject} />
        ) : (
          <Projects onNavigate={handleNavigate} />
        );
      case 'Finance':
        return canViewFinance ? <Finance /> : <Dashboard onNavigate={handleNavigate} />;
      case 'Transactions':
        return <Transactions onNavigate={handleNavigate} />;
      case 'Reports':
        return (isAdmin || canViewFinance) ? <Reports /> : <Dashboard onNavigate={handleNavigate} />;
      case 'Clients':
        return isAdmin ? <Clients /> : <Dashboard onNavigate={handleNavigate} />;
      case 'Stock':
        return isAdmin ? <Stock /> : <Dashboard onNavigate={handleNavigate} />;
      case 'Units':
        return isAdmin ? <Units /> : <Dashboard onNavigate={handleNavigate} />;
      case 'Users':
        return isAdmin ? <UsersManagement /> : <Dashboard onNavigate={handleNavigate} />;
      case 'Profile':
        return <Profile onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Custom click-safe Toasts overlay */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl p-4 pointer-events-auto flex items-start gap-3 fade-in border-r-4 border-r-[#1E3A5F] max-w-md w-full"
            style={{ direction: 'rtl' }}
          >
            <div className="w-8 h-8 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F] flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-semibold text-gray-900 text-sm leading-tight">{t.title}</p>
              {t.message && <p className="text-xs text-gray-500 mt-1 leading-snug">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Content - dynamic margin to avoid sidebar overlap */}
      <main className={`pb-20 md:pb-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'}`}>
        {/* Top Header (Mobile) */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BF</span>
            </div>
            <span className="font-bold text-gray-900">Beeforce</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Desktop Language Switcher */}
        <div className="hidden md:flex items-center justify-end p-4 gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">{t('notifications.noNotifications')}</p>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          !notif.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};