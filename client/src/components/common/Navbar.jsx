import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Bus,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ClipboardList,
  Ticket,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isOperator, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Top National Portal Ribbon */}
      <div className="bg-[#0f172a] text-slate-300 text-xs py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>National Public Transport Booking & Operations System</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Standard Time: IST (UTC+05:30)</span>
            <span>•</span>
            <span>Toll-Free Helpline: 1800-11-2048</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:shadow-md transition-all">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Yatra<span className="text-emerald-600 dark:text-emerald-400">Setu</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Bus Booking & Operations
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search')
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              Search Buses
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/my-bookings')
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60'
                }`}
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-md text-sm font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 transition-colors flex items-center space-x-1.5 border border-teal-200 dark:border-teal-800/50"
              >
                <ShieldAlert className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Admin Portal</span>
              </Link>
            )}
            {isOperator && (
              <Link
                to="/operator"
                className="px-3 py-2 rounded-md text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 transition-colors flex items-center space-x-1.5 border border-emerald-200 dark:border-emerald-800/50"
              >
                <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Operator Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons: Theme Toggle + Auth */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-800/70 transition-colors text-slate-800 dark:text-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-800 dark:text-slate-200 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Ticket className="w-4 h-4 text-slate-500" />
                      <span>My Bookings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-teal-700 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ShieldAlert className="w-4 h-4 text-teal-600" />
                        <span>Administrator Panel</span>
                      </Link>
                    )}

                    {isOperator && (
                      <Link
                        to="/operator"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Operator Manifests</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Search Buses
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              My Bookings
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40"
            >
              Admin Portal
            </Link>
          )}
          {isOperator && (
            <Link
              to="/operator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
            >
              Operator Portal
            </Link>
          )}
          {!isAuthenticated && (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:text-emerald-600"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm shadow-emerald-500/20"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
