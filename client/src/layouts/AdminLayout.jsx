import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  ShieldAlert,
  BarChart3,
  Building2,
  Bus,
  MapPin,
  GitFork,
  Calendar,
  Ticket,
  Scale,
  History,
  LogOut,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview Analytics', path: '/admin', icon: BarChart3 },
    { label: 'Transport Operators', path: '/admin/operators', icon: Building2 },
    { label: 'Bus Fleet', path: '/admin/buses', icon: Bus },
    { label: 'Bus Stops', path: '/admin/stops', icon: MapPin },
    { label: 'Route Corridors', path: '/admin/routes', icon: GitFork },
    { label: 'Trip Schedules', path: '/admin/trips', icon: Calendar },
    { label: 'All Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Cancellation Policy', path: '/admin/policy', icon: Scale },
    { label: 'System Audit Logs', path: '/admin/audit-logs', icon: History }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-200">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-5 border-r border-slate-800 shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">YatraSetu</span>
              <span className="block text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Admin User Info */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
              System Administrator
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-slate-400">Theme</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Portal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
