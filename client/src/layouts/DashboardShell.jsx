import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { BrandLogo, Breadcrumb, StatusBadge } from '../components/ui/index.js';
import { LogOut, Sun, Moon, ArrowLeft, Menu, X } from 'lucide-react';

export const DashboardShell = ({ portalLabel, roleBadge, navItems = [], rootPath = '/' }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentItem =
    navItems.find((item) => item.path === location.pathname) ||
    navItems.find((item) => item.path !== rootPath && location.pathname.startsWith(item.path)) ||
    navItems[0];

  const breadcrumbItems =
    currentItem && currentItem.path !== rootPath
      ? [{ label: portalLabel, to: rootPath }, { label: currentItem.label }]
      : [{ label: portalLabel }];

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <BrandLogo size="sm" subtitle={portalLabel} />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-lg text-[#475569] dark:text-[#A7C4B0] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-lg bg-[#F0FDF4] dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] space-y-1">
          <p className="text-xs font-bold text-[#14532D] dark:text-[#F0FDF4] truncate">
            {user?.name}
          </p>
          <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0] truncate">{user?.email}</p>
          <div className="pt-1">
            <StatusBadge variant="aqua">{roleBadge}</StatusBadge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1" aria-label={`${portalLabel} Navigation`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#166534] dark:bg-[#15803D] text-white'
                    : 'text-[#172B24] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] hover:text-[#14532D] dark:hover:text-[#F0FDF4]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Links */}
      <div className="pt-4 mt-4 border-t border-[#DCE7DF] dark:border-[#294A38] space-y-1.5">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Public Booking Portal</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] hover:bg-[#FEE2E2]/60 dark:hover:bg-[#3B1517] rounded-lg text-left transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#0B1712] text-[#172B24] dark:text-[#F0FDF4] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-[#10231B] border-r border-[#DCE7DF] dark:border-[#294A38] shrink-0 sticky top-0 h-screen overflow-y-auto print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-[#0B1712]/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-68 max-w-[85vw] bg-white dark:bg-[#10231B] border-r border-[#DCE7DF] dark:border-[#294A38] h-full overflow-y-auto shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white dark:bg-[#10231B] border-b border-[#DCE7DF] dark:border-[#294A38] px-4 sm:px-6 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation drawer"
              className="lg:hidden p-1.5 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              <Breadcrumb items={breadcrumbItems} homePath="/" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#162B22] text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FBBF24]" />
              ) : (
                <Moon className="w-4 h-4 text-[#166534]" />
              )}
            </button>

            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#162B22] text-xs font-semibold text-[#14532D] dark:text-[#F0FDF4]"
            >
              <span className="w-5 h-5 rounded bg-[#166534] text-white flex items-center justify-center text-[10px] font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              <span className="max-w-[120px] truncate">{user?.name}</span>
            </Link>
          </div>
        </header>

        {/* Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

