import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  StatusBadge,
  StatCard,
  Input
} from '../../components/ui/index.js';
import {
  User,
  Mail,
  Phone,
  Shield,
  Ticket,
  CheckCircle2,
  XCircle,
  Search,
  Edit3,
  Save,
  X,
  KeyRound,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, isAdmin, isOperator, updateUser } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync state whenever user loads or changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/bookings/my');
        const list = res?.data?.bookings || [];
        setStats({
          total: list.length,
          confirmed: list.filter((b) => b.status === 'CONFIRMED').length,
          cancelled: list.filter((b) => b.status === 'CANCELLED').length
        });
      } catch (err) {
        console.error('Failed to fetch profile booking summary:', err);
      }
    };
    loadStats();
  }, []);

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setFormError('');
    setShowPasswordFields(false);
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    if (showPasswordFields) {
      if (!formData.currentPassword) {
        setFormError('Please enter your current password to change password.');
        return;
      }
      if (!formData.newPassword || formData.newPassword.length < 6) {
        setFormError('New password must be at least 6 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setFormError('New password and confirmation do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      if (showPasswordFields && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res?.data?.user) {
        updateUser(res.data.user, res.data.token);
      }

      toast.success('Your profile details have been successfully updated.');
      setIsEditing(false);
      setShowPasswordFields(false);
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to update profile. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'My Profile' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Passenger Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-1">
            Passenger Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0] mt-1">
            Manage your personal contact information, travel statistics, and account security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-[#166534] dark:border-[#4ADE80] text-[#166534] dark:text-[#4ADE80] hover:bg-[#F0FDF4] dark:hover:bg-[#162B22]"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}

          <Link to="/search">
            <Button variant="primary" size="sm">
              <Search className="w-4 h-4" />
              <span>Book New Trip</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          subtext="All reservation records"
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Confirmed Tickets"
          value={stats.confirmed}
          subtext="Active PNR bookings"
          icon={CheckCircle2}
          tone="aqua"
        />
        <StatCard
          label="Cancelled Tickets"
          value={stats.cancelled}
          subtext="Refunds processed"
          icon={XCircle}
          tone="error"
        />
      </div>

      {/* Account Details / Edit Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{isEditing ? 'Edit Passenger Profile' : 'Registered Account Details'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your full name, email, contact phone number, or change your password.'
                : 'Your verified credentials used for ticket bookings and digital SMS/email dispatch.'}
            </CardDescription>
          </div>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {isEditing ? (
            /* Edit Profile Form */
            <form onSubmit={handleSave} className="space-y-5">
              {formError && (
                <div className="p-3.5 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  id="profile-name"
                  placeholder="Enter Full Name"
                  icon={User}
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />

                <Input
                  label="Email Address *"
                  id="profile-email"
                  type="email"
                  placeholder="Enter email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />

                <Input
                  label="Mobile Number"
                  id="profile-phone"
                  type="tel"
                  placeholder="Enter mobile no."
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  hint="Used for PNR status SMS and payment receipts"
                />

                <div className="space-y-1.5 w-full">
                  <label className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider">
                    Portal Role
                  </label>
                  <div className="h-10 flex items-center px-3 bg-[#F8FAF9] dark:bg-[#142B20] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg">
                    <StatusBadge variant="success">{user?.role || 'CUSTOMER'}</StatusBadge>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                    Managed by system administrators
                  </p>
                </div>
              </div>

              {/* Password Section Toggle */}
              <div className="pt-2 border-t border-[#DCE7DF] dark:border-[#294A38]">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields((prev) => !prev)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#166534] dark:text-[#4ADE80] hover:underline cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showPasswordFields ? 'Hide Password Change' : 'Change Account Password'}</span>
                </button>

                {showPasswordFields && (
                  <div className="mt-3 p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#142B20] border border-[#DCE7DF] dark:border-[#294A38] space-y-3">
                    <p className="text-xs text-[#475569] dark:text-[#A7C4B0] font-medium">
                      Enter your current password to authorize setting a new secure password.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Current Password *"
                        id="profile-current-password"
                        type="password"
                        placeholder="Enter current password"
                        icon={Lock}
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, currentPassword: e.target.value }))
                        }
                      />

                      <Input
                        label="New Password *"
                        id="profile-new-password"
                        type="password"
                        placeholder="Enter new password (min. 6 chars)"
                        icon={Lock}
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, newPassword: e.target.value }))
                        }
                      />

                      <Input
                        label="Confirm New Password *"
                        id="profile-confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, confirmPassword: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE7DF] dark:border-[#294A38]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Read-Only Details View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#142B20]/60 border border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                      Full Name
                    </p>
                    <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                      {user?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#142B20]/60 border border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                      Email Address
                    </p>
                    <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                      {user?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#142B20]/60 border border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                      Mobile Number
                    </p>
                    <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                      {user?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#142B20]/60 border border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <div className="w-9 h-9 rounded-lg bg-[#EFF6F1] dark:bg-[#1C382C] text-[#475569] dark:text-[#D1E7D8] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                      Portal Role
                    </p>
                    <div className="mt-1">
                      <StatusBadge variant="success">{user?.role || 'CUSTOMER'}</StatusBadge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCE7DF] dark:border-[#294A38] flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>

                <Link to="/my-bookings">
                  <Button variant="secondary" size="sm">
                    View My Bookings
                  </Button>
                </Link>

                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="aqua" size="sm">
                      Open Admin Dashboard
                    </Button>
                  </Link>
                )}

                {isOperator && (
                  <Link to="/operator">
                    <Button variant="aqua" size="sm">
                      Open Operator Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
