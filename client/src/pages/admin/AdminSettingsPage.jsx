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
import {
  Sun,
  Moon,
  Type,
  ShieldCheck,
  Scale,
  Database,
  ArrowRight,
  UserCheck,
  Lock,
  ShieldAlert,
  Save,
  Loader2,
  CheckCircle2,
  EyeOff
} from 'lucide-react';

export const AdminSettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme, textScale, setTextScale } = useTheme();
  const { toast } = useToast();

  const isSuperAdmin = (user?.assignedState || 'ALL') === 'ALL';

  const [policy, setPolicy] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    maskPassengerPii: true,
    restrictCrossStateViewing: true,
    requireConsentForBooking: true,
    auditLogRetentionDays: 180
  });
  const [privacyLoading, setPrivacyLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    // Load cancellation policy
    api
      .get('/admin/cancellation-policy')
      .then((res) => {
        if (res?.data?.policy) setPolicy(res.data.policy);
      })
      .catch(() => {});

    // Load privacy settings
    api
      .get('/admin/privacy-settings')
      .then((res) => {
        if (res?.data?.settings) {
          setPrivacySettings({
            maskPassengerPii: res.data.settings.maskPassengerPii ?? true,
            restrictCrossStateViewing: res.data.settings.restrictCrossStateViewing ?? true,
            requireConsentForBooking: res.data.settings.requireConsentForBooking ?? true,
            auditLogRetentionDays: res.data.settings.auditLogRetentionDays ?? 180
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load privacy settings:', err);
      })
      .finally(() => {
        setPrivacyLoading(false);
      });
  }, []);

  const handleThemeSelect = (next) => {
    setTheme(next);
    toast.success(`Portal theme switched to ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}.`);
  };

  const handleScaleSelect = (next) => {
    setTextScale(next);
    toast.info('Accessibility text scale updated.');
  };

  const handleSavePrivacySettings = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error('Permission Denied: Only the National Super Administrator can modify privacy settings.');
      return;
    }

    setSavingPrivacy(true);
    try {
      const res = await api.put('/admin/privacy-settings', privacySettings);
      if (res?.data?.settings) {
        setPrivacySettings({
          maskPassengerPii: res.data.settings.maskPassengerPii ?? true,
          restrictCrossStateViewing: res.data.settings.restrictCrossStateViewing ?? true,
          requireConsentForBooking: res.data.settings.requireConsentForBooking ?? true,
          auditLogRetentionDays: res.data.settings.auditLogRetentionDays ?? 180
        });
      }
      toast.success('Privacy & data protection settings saved successfully.');
    } catch (err) {
      toast.error(err?.message || 'Failed to save privacy settings.');
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
          Portal & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0] mt-0.5">
          Manage interface appearance, administrator identity, data protection, and system privacy governance.
        </p>
      </div>

      {/* Top Grid: Appearance & Identity */}
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
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors cursor-pointer ${
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
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors cursor-pointer ${
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
            <CardTitle>Administrator Identity & Scope</CardTitle>
            <CardDescription>
              Authenticated account credentials and governance jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F0FDF4] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#166534] dark:bg-[#234B35] text-white dark:text-[#4ADE80] flex items-center justify-center font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                    {user?.name || 'Portal Admin'}
                  </div>
                  <div className="text-xs text-[#475569] dark:text-[#A7C4B0]">
                    {user?.email || 'admin@myjourney.in'}
                  </div>
                </div>
              </div>
              <StatusBadge status="ACTIVE" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[#DCE7DF] dark:border-[#294A38]">
                <span className="text-[#64748B] dark:text-[#A7C4B0] block">Jurisdiction Scope</span>
                <span className="font-bold text-[#14532D] dark:text-[#F0FDF4] inline-flex items-center gap-1 mt-1 uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
                  {isSuperAdmin ? 'National (All States)' : `${user?.assignedState} State`}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#DCE7DF] dark:border-[#294A38]">
                <span className="text-[#64748B] dark:text-[#A7C4B0] block">Governance Role</span>
                <span className="font-bold text-[#0F766E] dark:text-[#5EEAD4] inline-flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isSuperAdmin ? 'Super Administrator' : 'State Administrator'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIVACY & DATA PROTECTION GOVERNANCE SECTION (SUPER ADMIN ONLY PERMISSION) */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE7DF] dark:border-[#294A38] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-[#166534] dark:text-[#4ADE80]" />
              <CardTitle>Data Privacy & Security Settings</CardTitle>
            </div>
            <CardDescription className="mt-1">
              National passenger data protection, cross-state administration isolation, and PII masking controls.
            </CardDescription>
          </div>

          <div>
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] border border-[#166534]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Super Admin Permission Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] dark:bg-[#3B2D15] text-[#B45309] dark:text-[#FBBF24] border border-[#B45309]/20">
                <Lock className="w-3.5 h-3.5" />
                <span>Super Admin Restricted</span>
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-6">
          {/* Permission Notice Banner for State Admins */}
          {!isSuperAdmin && (
            <div className="p-4 rounded-xl bg-[#FEF3C7]/60 dark:bg-[#3B2D15]/60 border border-[#F59E0B]/30 text-[#92400E] dark:text-[#FDE68A] text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                <span>Privacy Settings Are Restricted to National Super Administrator</span>
              </div>
              <p className="leading-relaxed">
                You are currently signed in as <strong>{user?.assignedState} State Administrator</strong>. Under public transport governance policy, only the National Super Administrator (<code>nwdpramod12305901@gmail.com</code>) holds the permission to configure passenger privacy, contact masking, and cross-state visibility boundaries. The active settings below are displayed in read-only mode.
              </p>
            </div>
          )}

          <form onSubmit={handleSavePrivacySettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Setting 1: PII Masking */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  privacySettings.maskPassengerPii
                    ? 'bg-[#F0FDF4] dark:bg-[#10231B] border-[#166534]/30 dark:border-[#4ADE80]/30'
                    : 'bg-[#F8FAF9] dark:bg-[#142B20] border-[#DCE7DF] dark:border-[#294A38]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#14532D] dark:text-[#F0FDF4] block">
                      Passenger Contact Masking (PII Privacy)
                    </span>
                    <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0] mt-1 leading-relaxed">
                      Mask phone numbers (e.g. <code>+91-98****3210</code>) and emails on operator manifests and public ticket lookups to safeguard traveler privacy.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isSuperAdmin || savingPrivacy}
                    checked={privacySettings.maskPassengerPii}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        maskPassengerPii: e.target.checked
                      }))
                    }
                    className="w-5 h-5 accent-[#166534] rounded cursor-pointer disabled:cursor-not-allowed mt-0.5"
                  />
                </div>
              </div>

              {/* Setting 2: Cross-State Administration Isolation */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  privacySettings.restrictCrossStateViewing
                    ? 'bg-[#F0FDF4] dark:bg-[#10231B] border-[#166534]/30 dark:border-[#4ADE80]/30'
                    : 'bg-[#F8FAF9] dark:bg-[#142B20] border-[#DCE7DF] dark:border-[#294A38]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#14532D] dark:text-[#F0FDF4] block">
                      Cross-State Administration Isolation
                    </span>
                    <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0] mt-1 leading-relaxed">
                      Enforce strict state privacy: Only the Super Admin can view other states' administration. State Admins are restricted strictly to their own assigned state.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isSuperAdmin || savingPrivacy}
                    checked={privacySettings.restrictCrossStateViewing}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        restrictCrossStateViewing: e.target.checked
                      }))
                    }
                    className="w-5 h-5 accent-[#166534] rounded cursor-pointer disabled:cursor-not-allowed mt-0.5"
                  />
                </div>
              </div>

              {/* Setting 3: DPDP Consent */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  privacySettings.requireConsentForBooking
                    ? 'bg-[#F0FDF4] dark:bg-[#10231B] border-[#166534]/30 dark:border-[#4ADE80]/30'
                    : 'bg-[#F8FAF9] dark:bg-[#142B20] border-[#DCE7DF] dark:border-[#294A38]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#14532D] dark:text-[#F0FDF4] block">
                      DPDP Act 2023 Explicit Consent
                    </span>
                    <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0] mt-1 leading-relaxed">
                      Require travelers to review and accept statutory data processing and journey disclosure terms prior to ticket payment.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isSuperAdmin || savingPrivacy}
                    checked={privacySettings.requireConsentForBooking}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        requireConsentForBooking: e.target.checked
                      }))
                    }
                    className="w-5 h-5 accent-[#166534] rounded cursor-pointer disabled:cursor-not-allowed mt-0.5"
                  />
                </div>
              </div>

              {/* Setting 4: Audit Retention */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#142B20] border border-[#DCE7DF] dark:border-[#294A38]">
                <div>
                  <span className="text-xs font-bold text-[#14532D] dark:text-[#F0FDF4] block">
                    Security Audit Log Retention Window
                  </span>
                  <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0] mt-1 mb-2.5">
                    Specifies how long security audit logs and administrative session trails are retained before archival.
                  </p>
                  <select
                    disabled={!isSuperAdmin || savingPrivacy}
                    value={privacySettings.auditLogRetentionDays}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        auditLogRetentionDays: Number(e.target.value)
                      }))
                    }
                    className="w-full h-9 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-xs font-semibold text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value={90}>90 Days (Standard Compliance)</option>
                    <option value={180}>180 Days (Recommended)</option>
                    <option value={365}>365 Days (Extended Governance)</option>
                    <option value={0}>Permanent Retention (No Purge)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button for Super Admin */}
            {isSuperAdmin && (
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingPrivacy}
                >
                  {savingPrivacy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Privacy Controls...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Privacy Settings</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* System Refund Policy Section */}
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
          {isSuperAdmin ? (
            <Link to="/admin/policy">
              <Button variant="secondary" size="sm">
                <span>Configure Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <span className="text-xs text-[#64748B] dark:text-[#A7C4B0] font-medium">
              National Policy (Read-Only)
            </span>
          )}
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
