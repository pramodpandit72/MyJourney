import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  StatusBadge
} from '../../components/ui/index.js';
import { Sun, Moon, Type, ShieldCheck, Scale, Database, ArrowRight, UserCheck } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme, textScale, setTextScale } = useTheme();
  const { toast } = useToast();
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    api
      .get('/admin/cancellation-policy')
      .then((res) => {
        if (res?.data?.policy) setPolicy(res.data.policy);
      })
      .catch(() => {});
  }, []);

  const handleThemeSelect = (next) => {
    setTheme(next);
    toast.success(`Portal theme switched to ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}.`);
  };

  const handleScaleSelect = (next) => {
    setTextScale(next);
    toast.info('Accessibility text scale updated.');
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
          Portal & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0] mt-0.5">
          Manage interface appearance, accessibility scale, administrator session identity, and active rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Accessibility</CardTitle>
            <CardDescription>
              Light Mode is the default MyJourney theme. Preferences persist locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14532D] dark:text-[#D1E7D8] uppercase tracking-wider">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeSelect('light')}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                    theme === 'light'
                      ? 'border-[#166534] bg-[#F0FDF4] text-[#14532D] font-semibold'
                      : 'border-[#DCE7DF] dark:border-[#294A38] text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F7FAF8] dark:hover:bg-[#1C382C]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-[#166534] dark:text-[#4ADE80]" />
                  <div>
                    <div className="text-sm">Light Mode</div>
                    <div className="text-[11px] opacity-75">Default Portal Theme</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeSelect('dark')}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                    theme === 'dark'
                      ? 'border-[#4ADE80] bg-[#1C382C] text-[#F0FDF4] font-semibold'
                      : 'border-[#DCE7DF] dark:border-[#294A38] text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F7FAF8] dark:hover:bg-[#1C382C]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
                  <div>
                    <div className="text-sm">Dark Mode</div>
                    <div className="text-[11px] opacity-75">Low-Glare Contrast</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14532D] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                <span>Typography Size</span>
              </label>
              <div className="flex items-center gap-2">
                {[
                  { key: 'sm', label: 'A- Compact' },
                  { key: 'base', label: 'A Standard' },
                  { key: 'lg', label: 'A+ Large' }
                ].map((opt) => (
                  <Button
                    key={opt.key}
                    variant={textScale === opt.key ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleScaleSelect(opt.key)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Admin Session */}
        <Card>
          <CardHeader>
            <CardTitle>Administrator Identity</CardTitle>
            <CardDescription>
              Authenticated account details and access-control scope.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F0FDF4] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#166534] dark:bg-[#234B35] text-white dark:text-[#4ADE80] flex items-center justify-center font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="font-bold text-[#14532D] dark:text-[#F0FDF4]">{user?.name || 'Portal Admin'}</div>
                  <div className="text-xs text-[#475569] dark:text-[#A7C4B0]">{user?.email || 'admin@myjourney.in'}</div>
                </div>
              </div>
              <StatusBadge status="ACTIVE" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[#DCE7DF] dark:border-[#294A38]">
                <span className="text-[#64748B] dark:text-[#A7C4B0] block">Role Scope</span>
                <span className="font-bold text-[#14532D] dark:text-[#F0FDF4] inline-flex items-center gap-1 mt-1 uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#DCE7DF] dark:border-[#294A38]">
                <span className="text-[#64748B] dark:text-[#A7C4B0] block">Persistence</span>
                <span className="font-bold text-[#0F766E] dark:text-[#5EEAD4] inline-flex items-center gap-1 mt-1">
                  <Database className="w-3.5 h-3.5" />
                  MongoDB Atlas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Policies & Governance */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#166534] dark:text-[#4ADE80]" />
              <span>Active Refund & Cancellation Policy</span>
            </CardTitle>
            <CardDescription>
              {policy?.policyName || 'Standard MyJourney Intercity Refund Tiers'}
            </CardDescription>
          </div>
          <Link to="/admin/policy">
            <Button variant="secondary" size="sm">
              <span>Configure Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {policy?.refundTiers?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {policy.refundTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-xs"
                >
                  <div className="text-[#64748B] dark:text-[#A7C4B0]">
                    {tier.minHoursBeforeDeparture}+ hours before departure
                  </div>
                  <div className="text-base font-bold text-[#15803D] dark:text-[#4ADE80] mt-0.5">
                    {tier.refundPercentage}% Refund
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#64748B] dark:text-[#A7C4B0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#166534] dark:text-[#4ADE80]" />
              <span>Standard server-side refund rules enforced automatically on cancellation.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
