import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { BrandLogo, Button, StatusBadge } from '../ui/index.js';
import {
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ClipboardList,
  Ticket,
  ChevronDown,
  PhoneCall,
  HelpCircle
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isOperator, logout } = useAuth();
  const { theme, toggleTheme, textScale, setTextScale } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Search Buses', path: '/search' },
    { label: 'My Bookings', path: '/my-bookings', authOnly: false },
    { label: 'About Us', path: '/about' },
    { label: 'Help & Support', path: '/help' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#10231B] border-b border-[#DCE7DF] dark:border-[#294A38] print:hidden transition-colors duration-150">
      {/* Top Government-Style Information Ribbon */}
      <div className="bg-[#14532D] dark:bg-[#0B1712] text-[#F0FDF4] border-b border-[#166534] dark:border-[#294A38] text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5EEAD4]" aria-hidden="true" />
            <span className="font-medium tracking-wide">Public Transport Booking Portal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#D1E7D8]">
            <Link
              to="/help"
              className="hidden sm:inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-[#5EEAD4]" />
              <span>Help & Support</span>
            </Link>
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-[#5EEAD4]" />
              <span>Contact</span>
            </Link>

            {/* Accessibility Text Size Switcher */}
            <div
              className="flex items-center gap-1 border-l border-[#294A38] pl-3"
              aria-label="Text size accessibility controls"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#A7C4B0] mr-1 hidden md:inline">
                Text:
              </span>
              {[
                { key: 'sm', label: 'A-' },
                { key: 'base', label: 'A' },
                { key: 'lg', label: 'A+' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTextScale(item.key)}
                  aria-label={`Set text size ${item.label}`}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    textScale === item.key
                      ? 'bg-[#CCFBF1] text-[#14532D]'
                      : 'text-[#D1E7D8] hover:bg-[#1C382C]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Custom MyJourney Logo */}
          <Link to="/" className="shrink-0 focus:outline-none">
            <BrandLogo size="md" subtitle="Your Journey. Your Comfort." />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    active
                      ? 'text-[#166534] dark:text-[#4ADE80] bg-[#DCFCE7]/70 dark:bg-[#234B35] font-semibold'
                      : 'text-[#172B24] dark:text-[#D1E7D8] hover:text-[#166534] dark:hover:text-[#4ADE80] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#CCFBF1] text-[#0F766E] border border-[#0F766E]/25 dark:bg-[#134E4A] dark:text-[#5EEAD4] dark:border-[#5EEAD4]/25 hover:opacity-90 flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}

            {isOperator && (
              <Link
                to="/operator"
                className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#DCFCE7] text-[#14532D] border border-[#166534]/25 dark:bg-[#234B35] dark:text-[#4ADE80] dark:border-[#4ADE80]/25 hover:opacity-90 flex items-center gap-1.5"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Operator Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Controls: Theme Switcher + Auth */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#162B22] text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FBBF24]" />
              ) : (
                <Moon className="w-4 h-4 text-[#166534]" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((o) => !o)}
                  aria-expanded={profileDropdownOpen}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] bg-white dark:bg-[#162B22] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] text-[#172B24] dark:text-[#F0FDF4] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-[#166534] dark:bg-[#15803D] text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#A7C4B0]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#162B22] rounded-xl shadow-lg border border-[#DCE7DF] dark:border-[#294A38] py-1.5 z-50 text-sm">
                    <div className="px-4 py-2.5 border-b border-[#DCE7DF] dark:border-[#294A38]">
                      <p className="font-bold text-[#14532D] dark:text-[#F0FDF4] truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-[#475569] dark:text-[#A7C4B0] truncate">
                        {user?.email}
                      </p>
                      <div className="mt-1.5">
                        <StatusBadge variant="success">{user?.role}</StatusBadge>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]"
                    >
                      <UserIcon className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]"
                    >
                      <Ticket className="w-4 h-4 text-[#166534] dark:text-[#4ADE80]" />
                      <span>My Bookings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0F766E] dark:text-[#5EEAD4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {isOperator && (
                      <Link
                        to="/operator"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#166534] dark:text-[#4ADE80] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Operator Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-[#DCE7DF] dark:border-[#294A38] my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] hover:bg-[#FEE2E2]/50 dark:hover:bg-[#3B1517] text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE7DF] dark:border-[#294A38] bg-white dark:bg-[#10231B] px-4 pt-3 pb-5 space-y-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-[#DCFCE7] dark:bg-[#234B35] text-[#14532D] dark:text-[#F0FDF4] font-semibold'
                    : 'text-[#172B24] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#0F766E] dark:text-[#5EEAD4] bg-[#CCFBF1]/60 dark:bg-[#134E4A]"
            >
              Admin Dashboard
            </Link>
          )}

          {isOperator && (
            <Link
              to="/operator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#14532D] dark:text-[#4ADE80] bg-[#DCFCE7]/70 dark:bg-[#234B35]"
            >
              Operator Dashboard
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-3 grid grid-cols-2 gap-2 border-t border-[#DCE7DF] dark:border-[#294A38]">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
