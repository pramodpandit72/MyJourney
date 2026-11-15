import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { DEFAULT_AVAILABLE_STATES } from '../../constants/states.js';
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ConfirmDialog,
  Button,
  Input,
  Select,
  StatusBadge,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
  Card,
  CardContent
} from '../../components/ui/index.js';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  User,
  MapPin
} from 'lucide-react';

export const AdminStateAdminsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const isSuperAdmin = (user?.assignedState || 'ALL') === 'ALL';

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Filter: 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Verify / Reject Modal
  const [actionAdmin, setActionAdmin] = useState(null);
  const [actionType, setActionType] = useState(''); // 'VERIFY' | 'REJECT'
  const [actionLoading, setActionLoading] = useState(false);

  // Super Admin Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('Password@123');
  const [createPhone, setCreatePhone] = useState('');
  const [createState, setCreateState] = useState('Jharkhand');
  const [createStatus, setCreateStatus] = useState('VERIFIED');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  const [availableStates, setAvailableStates] = useState(DEFAULT_AVAILABLE_STATES);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/state-admins');
      setAdmins(res?.data?.admins || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve state administrator records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await api.get('/auth/available-states');
      const list = res?.data?.states || res?.states || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setAvailableStates(list);
      }
    } catch (err) {
      console.warn('Failed to load available states, using fallback:', err);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchStates();
  }, []);

  const handleVerify = async () => {
    if (!actionAdmin) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/state-admins/${actionAdmin._id}/verify`);
      toast.success(
        `State Administrator for ${actionAdmin.assignedState} (${actionAdmin.name}) approved and verified.`
      );
      setActionAdmin(null);
      await fetchAdmins();
      await fetchStates();
    } catch (err) {
      toast.error(err.message || 'Failed to verify state administrator.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionAdmin) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/state-admins/${actionAdmin._id}/reject`);
      toast.info(`Application for ${actionAdmin.assignedState} (${actionAdmin.name}) rejected.`);
      setActionAdmin(null);
      await fetchAdmins();
      await fetchStates();
    } catch (err) {
      toast.error(err.message || 'Failed to reject state administrator.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError('');

    try {
      await api.post('/admin/state-admins', {
        name: createName,
        email: createEmail,
        password: createPassword,
        phone: createPhone,
        assignedState: createState,
        verificationStatus: createStatus
      });

      toast.success(
        `State Administrator for ${createState} created and verified by Super Admin.`
      );
      setCreateModalOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePhone('');
      await fetchAdmins();
      await fetchStates();
    } catch (err) {
      setCreateError(err.message || 'Failed to create state administrator.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.verificationStatus === statusFilter;
  });

  const pendingCount = admins.filter((a) => a.verificationStatus === 'PENDING').length;
  const verifiedCount = admins.filter((a) => a.verificationStatus === 'VERIFIED').length;
  const uniqueStates = new Set(admins.filter((a) => a.verificationStatus === 'VERIFIED').map((a) => a.assignedState)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            National Transport Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            State Administrator Governance & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Review self-registered state administrators, approve timetable editing rights, and provision multiple admins per state.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setCreateError('');
              setCreateModalOpen(true);
            }}
          >
            Provision State Admin
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-[#162B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] dark:text-[#A7C4B0] font-semibold">Total Admins</p>
              <p className="text-2xl font-bold text-[#172B24] dark:text-[#F0FDF4] mt-1">{admins.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] dark:bg-[#1C382C] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#162B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] dark:text-[#A7C4B0] font-semibold">Pending Approval</p>
              <p className="text-2xl font-bold text-[#B45309] dark:text-[#FBBF24] mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] dark:bg-[#3B2D15] text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#162B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] dark:text-[#A7C4B0] font-semibold">Verified Active</p>
              <p className="text-2xl font-bold text-[#15803D] dark:text-[#4ADE80] mt-1">{verifiedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#162B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] dark:text-[#A7C4B0] font-semibold">Active States</p>
              <p className="text-2xl font-bold text-[#0F766E] dark:text-[#5EEAD4] mt-1">{uniqueStates}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#162B22] p-1.5 rounded-lg border border-[#DCE7DF] dark:border-[#294A38]">
          {[
            { id: 'ALL', label: `All Admins (${admins.length})` },
            { id: 'PENDING', label: `Pending Approvals (${pendingCount})` },
            { id: 'VERIFIED', label: `Verified (${verifiedCount})` },
            { id: 'REJECTED', label: 'Rejected' }
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#166534] dark:bg-[#15803D] text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {!isSuperAdmin && (
          <div className="text-xs text-[#64748B] dark:text-[#A7C4B0] font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
            <span>Only National Super Administrator has approval rights.</span>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdmins} />
      ) : filteredAdmins.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No State Administrators Found"
          description={`No records match the current status filter (${statusFilter}).`}
          actionLabel="Show All Records"
          onAction={() => setStatusFilter('ALL')}
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Administrator Name & Email</Th>
                <Th>State Jurisdiction</Th>
                <Th>Contact Phone</Th>
                <Th>Verification Status</Th>
                <Th>Approval Details</Th>
                <Th className="text-right">Super Admin Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAdmins.map((a) => {
                const isPending = a.verificationStatus === 'PENDING';
                const isVerified = a.verificationStatus === 'VERIFIED';
                const isRejected = a.verificationStatus === 'REJECTED';

                return (
                  <Tr key={a._id}>
                    <Td>
                      <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">{a.name}</p>
                      <p className="text-xs font-mono text-[#0F766E] dark:text-[#5EEAD4]">{a.email}</p>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#F0FDF4] dark:bg-[#10231B] text-[#166534] dark:text-[#4ADE80] border border-[#DCE7DF] dark:border-[#294A38]">
                        <Building2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                        <span>{a.assignedState}</span>
                      </span>
                    </Td>
                    <Td className="text-xs font-mono text-[#475569] dark:text-[#D1E7D8]">
                      {a.phone || 'N/A'}
                    </Td>
                    <Td>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FEF3C7] dark:bg-[#3B2D15] text-[#92400E] dark:text-[#FBBF24] border border-[#F59E0B]/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] border border-[#166534]/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified & Authorized</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FEE2E2] dark:bg-[#3B1517] text-[#991B1B] dark:text-[#F87171] border border-[#B91C1C]/30">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-[#64748B] dark:text-[#A7C4B0]">
                      {isVerified ? (
                        <span>
                          Approved by: {a.verifiedBy?.name || 'Super Admin'}
                          {a.verifiedAt && (
                            <span className="block text-[10px]">
                              {new Date(a.verifiedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>Awaiting Verification</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      {isSuperAdmin && isPending && (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={UserCheck}
                            onClick={() => {
                              setActionAdmin(a);
                              setActionType('VERIFY');
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={UserX}
                            onClick={() => {
                              setActionAdmin(a);
                              setActionType('REJECT');
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {isSuperAdmin && isVerified && (
                        <span className="text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Authority</span>
                        </span>
                      )}
                      {!isSuperAdmin && (
                        <span className="text-xs text-[#64748B] dark:text-[#A7C4B0]">
                          Super Admin Only
                        </span>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog for Approve/Reject */}
      <ConfirmDialog
        open={Boolean(actionAdmin)}
        onClose={() => setActionAdmin(null)}
        onConfirm={actionType === 'VERIFY' ? handleVerify : handleReject}
        loading={actionLoading}
        title={
          actionType === 'VERIFY'
            ? `Approve State Administrator for ${actionAdmin?.assignedState}?`
            : `Reject State Administrator Application for ${actionAdmin?.assignedState}?`
        }
        message={
          actionType === 'VERIFY'
            ? `By approving ${actionAdmin?.name} (${actionAdmin?.email}), this officer will be granted full administrative permission to publish, modify, and manage bus timetables for ${actionAdmin?.assignedState} routes.`
            : `Are you sure you want to reject ${actionAdmin?.name} (${actionAdmin?.email})? Their account will be deactivated and denied timetable access.`
        }
        confirmLabel={actionType === 'VERIFY' ? 'Confirm & Approve' : 'Confirm Rejection'}
        confirmVariant={actionType === 'VERIFY' ? 'primary' : 'danger'}
      />

      {/* Super Admin Provision Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision State Administrator (Super Admin Authority)"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold">
              {createError}
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#F0FDF4] dark:bg-[#10231B] border border-[#166534]/30 text-xs text-[#166534] dark:text-[#4ADE80] leading-relaxed">
            As the <strong>National Super Administrator</strong>, you possess the authority to appoint more than one administrator for any state (including Jharkhand, Punjab, Delhi, etc.) with pre-verified status.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Officer Name *"
              required
              placeholder="Enter Full Name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />

            <Input
              label="Official Email *"
              type="email"
              required
              placeholder="Enter email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
            />

            <Input
              label="Initial Password *"
              type="password"
              required
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
            />

            <Input
              label="Contact Phone"
              placeholder="Enter mobile no."
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
            />

            <Select
              label="State Jurisdiction *"
              value={createState}
              onChange={(e) => setCreateState(e.target.value)}
              required
            >
              {availableStates.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} {s.adminCount > 0 ? `(${s.adminCount} existing admins - Multiple Allowed)` : '(No admins yet)'}
                </option>
              ))}
            </Select>

            <Select
              label="Initial Verification Status *"
              value={createStatus}
              onChange={(e) => setCreateStatus(e.target.value)}
              required
            >
              <option value="VERIFIED">VERIFIED (Active immediately)</option>
              <option value="PENDING">PENDING (Review later)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createSubmitting}>
              Provision & Appoint Administrator
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
