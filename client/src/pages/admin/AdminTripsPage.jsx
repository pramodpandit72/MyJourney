import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
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
  Calendar,
  Plus,
  Edit2,
  ShieldCheck,
  Lock,
  Filter,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const formatInputDateTime = (d) => {
  if (!d) return '';
  const dateObj = new Date(d);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
};

export const AdminTripsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const assignedState = user?.assignedState || 'ALL';
  const isSuperAdmin = assignedState === 'ALL';
  const isVerified = isSuperAdmin || user?.verificationStatus === 'VERIFIED';

  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State filtering
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  // Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [departureAt, setDepartureAt] = useState('');
  const [arrivalAt, setArrivalAt] = useState('');
  const [baseFare, setBaseFare] = useState(750);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Timetable Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editDep, setEditDep] = useState('');
  const [editArr, setEditArr] = useState('');
  const [editFare, setEditFare] = useState('');
  const [editStatus, setEditStatus] = useState('SCHEDULED');
  const [editBusId, setEditBusId] = useState('');
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Cancel confirmation dialog
  const [cancelTripId, setCancelTripId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, rRes, bRes, oRes] = await Promise.all([
        api.get('/admin/trips'),
        api.get('/admin/routes'),
        api.get('/admin/buses'),
        api.get('/admin/operators')
      ]);

      setTrips(tRes?.data?.trips || []);
      const rList = rRes?.data?.routes || [];
      const bList = bRes?.data?.buses || [];
      const oList = oRes?.data?.operators || [];

      setRoutes(rList);
      setBuses(bList);
      setOperators(oList);

      if (rList.length > 0 && !routeId) setRouteId(rList[0]._id);
      if (bList.length > 0 && !busId) setBusId(bList[0]._id);
      if (oList.length > 0 && !operatorId) setOperatorId(oList[0]._id);
    } catch (err) {
      setError(err.message || 'Failed to load trip schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openCreateModal = () => {
    if (!isVerified) {
      toast.error('Account pending Super Admin approval. Timetable creation is locked.');
      return;
    }
    const now = new Date();
    const dep = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const arr = new Date(dep.getTime() + 5 * 60 * 60 * 1000);

    setDepartureAt(formatInputDateTime(dep));
    setArrivalAt(formatInputDateTime(arr));
    setBaseFare(750);
    setFormError('');

    // Preselect a route matching user's state if not super admin
    if (!isSuperAdmin) {
      const stateRoute = routes.find(
        (r) =>
          r.routeName?.toLowerCase().includes(assignedState.toLowerCase()) ||
          r.stops?.some((s) => s.stopId?.state?.toLowerCase().includes(assignedState.toLowerCase()))
      );
      if (stateRoute) setRouteId(stateRoute._id);
    }

    setModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        routeId,
        busId,
        operatorId,
        departureAt: new Date(departureAt).toISOString(),
        arrivalAt: new Date(arrivalAt).toISOString(),
        baseFare: Number(baseFare)
      };

      await api.post('/admin/trips', payload);
      setModalOpen(false);
      toast.success('New timetable scheduled and seat inventory initialized.');
      await fetchAllData();
    } catch (err) {
      setFormError(err.message || 'Failed to schedule trip timetable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (t) => {
    if (!isVerified) {
      toast.error('Account pending Super Admin approval. Editing is locked.');
      return;
    }
    if (!t.canEdit && !isSuperAdmin) {
      toast.error(`Permission Denied: You are authorized for ${assignedState} state only.`);
      return;
    }
    setEditingTrip(t);
    setEditDep(formatInputDateTime(t.departureAt));
    setEditArr(formatInputDateTime(t.arrivalAt));
    setEditFare(t.baseFare);
    setEditStatus(t.status || 'SCHEDULED');
    setEditBusId(t.busId?._id || t.busId || '');
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTrip) return;
    setEditSubmitting(true);
    setEditError('');

    try {
      const payload = {
        departureAt: new Date(editDep).toISOString(),
        arrivalAt: new Date(editArr).toISOString(),
        baseFare: Number(editFare),
        status: editStatus,
        busId: editBusId
      };

      await api.put(`/admin/trips/${editingTrip._id}`, payload);
      setEditModalOpen(false);
      toast.success('Bus timetable updated successfully.');
      await fetchAllData();
    } catch (err) {
      setEditError(err.message || 'Failed to update bus timetable.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmCancelTrip = async () => {
    if (!cancelTripId) return;
    setCancelling(true);
    try {
      await api.put(`/admin/trips/${cancelTripId}/cancel`);
      toast.success('Trip cancelled successfully.');
      setCancelTripId(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel trip.');
    } finally {
      setCancelling(false);
    }
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const availableStates = [
    'ALL',
    ...Array.from(new Set(['Punjab', 'Delhi', 'Rajasthan', 'Haryana', 'Uttar Pradesh', 'Jharkhand', ...trips.map((t) => t.state).filter(Boolean)]))
  ];

  const filteredTrips = trips.filter((t) => {
    if (selectedStateFilter === 'ALL') return true;
    const filterLower = selectedStateFilter.toLowerCase();
    return (
      t.state?.toLowerCase() === filterLower ||
      t.routeStates?.some((s) => s.toLowerCase().includes(filterLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Pending Super Admin Verification Banner (if unverified state admin) */}
      {!isVerified && (
        <Card className="bg-[#FFFBEB] dark:bg-[#2B2313] border-[#F59E0B]/40 dark:border-[#F59E0B]/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-[#F59E0B] text-white shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] dark:text-[#FBBF24]">
                  Account Pending Super Admin Approval
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#78350F] text-[#92400E] dark:text-[#FDE68A]">
                  LOCKED
                </span>
              </div>
              <p className="text-xs text-[#92400E] dark:text-[#FDE68A] leading-relaxed">
                Your administrator account for <strong>{assignedState} State</strong> is awaiting review and verification by the National Super Admin.
                Timetable scheduling, modification, and cancellation permissions remain locked until your credentials are confirmed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* State Authority Scope Banner */}
      <Card
        className={`border ${
          isSuperAdmin
            ? 'bg-[#F0FDF4] dark:bg-[#10231B] border-[#166534]/30 dark:border-[#4ADE80]/30'
            : 'bg-[#CCFBF1]/40 dark:bg-[#132A24] border-[#0F766E]/30 dark:border-[#5EEAD4]/30'
        }`}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isSuperAdmin
                  ? 'bg-[#166534] dark:bg-[#15803D] text-white'
                  : 'bg-[#0F766E] dark:bg-[#115E59] text-white'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#4ADE80]">
                  {isSuperAdmin ? 'National Portal Administration' : `${assignedState} State Administrator`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80]">
                  {isSuperAdmin ? 'Full Scope' : `${assignedState} Scope`}
                </span>
              </div>
              <p className="text-xs text-[#475569] dark:text-[#D1E7D8] mt-0.5">
                {isSuperAdmin
                  ? 'You possess unrestricted authorization to schedule and edit bus timetables across all states.'
                  : `You are authorized to add, modify, and publish bus timetables specifically for routes within or serving ${assignedState}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              variant="primary"
              icon={Plus}
              onClick={openCreateModal}
              disabled={!isVerified}
              title={!isVerified ? 'Disabled: Account pending Super Admin verification' : ''}
            >
              Schedule New Trip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
            Bus Timetables & Schedules
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Review, adjust departure/arrival times, change fare rates, and update fleet statuses.
          </p>
        </div>

        {/* State Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#162B22] p-1.5 rounded-lg border border-[#DCE7DF] dark:border-[#294A38]">
          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#166534] dark:text-[#4ADE80]" />
            <span>State:</span>
          </span>
          {availableStates.map((st) => {
            const active = selectedStateFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStateFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#166534] dark:bg-[#15803D] text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                }`}
              >
                {st === 'ALL' ? 'All Corridors' : st}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAllData} />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Matching Timetables Found"
          description={`No bus departures match your current state filter (${selectedStateFilter}).`}
          action={
            <Button variant="outline" size="sm" onClick={() => setSelectedStateFilter('ALL')}>
              Show All Corridors
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Corridor Route</Th>
                <Th>Jurisdiction State</Th>
                <Th>Bus Fleet & Operator</Th>
                <Th>Departure (IST)</Th>
                <Th>Arrival (IST)</Th>
                <Th>Base Fare</Th>
                <Th>Status</Th>
                <Th className="text-right">Timetable Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTrips.map((t) => {
                const canEdit = (t.canEdit || isSuperAdmin) && isVerified;
                return (
                  <Tr key={t._id}>
                    <Td>
                      <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                        {t.routeId?.routeName || 'N/A'}
                      </p>
                      <p className="text-[11px] font-mono text-[#0F766E] dark:text-[#5EEAD4]">
                        {t.routeId?.routeCode} • {t.routeId?.totalDistance || 0} km
                      </p>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F0FDF4] dark:bg-[#10231B] text-[#166534] dark:text-[#4ADE80] border border-[#DCE7DF] dark:border-[#294A38]">
                        <MapPin className="w-3 h-3 text-[#0F766E] dark:text-[#5EEAD4]" />
                        <span>{t.state || 'Interstate'}</span>
                      </span>
                    </Td>
                    <Td>
                      <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                        {t.busId?.registrationNumber}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                        {t.operatorId?.name} ({t.busId?.busType})
                      </p>
                    </Td>
                    <Td className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                      {formatIST(t.departureAt)}
                    </Td>
                    <Td className="text-[#475569] dark:text-[#D1E7D8]">{formatIST(t.arrivalAt)}</Td>
                    <Td className="font-bold font-mono text-[#15803D] dark:text-[#4ADE80]">
                      ₹{t.baseFare}
                    </Td>
                    <Td>
                      <StatusBadge status={t.status} />
                    </Td>
                    <Td className="text-right">
                      {canEdit ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Edit2}
                            onClick={() => handleOpenEditModal(t)}
                            title="Edit departure, arrival, or fare"
                          >
                            Edit
                          </Button>
                          {t.status === 'SCHEDULED' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setCancelTripId(t._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      ) : !isVerified ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-[#FEF3C7] dark:bg-[#78350F]/50 text-[#B45309] dark:text-[#FDE68A]"
                          title="Locked: Account pending Super Admin verification"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]"
                          title={`Locked: Managed by ${t.state} State Transport`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{t.state || 'Other State'}</span>
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

      {/* Edit Timetable Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Bus Timetable & Schedule"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          {editingTrip && (
            <div className="p-3.5 rounded-lg bg-[#F7FAF8] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                  {editingTrip.routeId?.routeName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80]">
                  State: {editingTrip.state || 'Interstate'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                Route Code: <span className="font-mono">{editingTrip.routeId?.routeCode}</span> • Operator: {editingTrip.operatorId?.name}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Departure Timetable (IST) *"
              type="datetime-local"
              required
              value={editDep}
              onChange={(e) => setEditDep(e.target.value)}
            />

            <Input
              label="Arrival Timetable (IST) *"
              type="datetime-local"
              required
              value={editArr}
              onChange={(e) => setEditArr(e.target.value)}
            />

            <Input
              label="Base Fare (₹ INR) *"
              type="number"
              required
              min={1}
              value={editFare}
              onChange={(e) => setEditFare(e.target.value)}
            />

            <Select
              label="Timetable Status *"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              required
            >
              <option value="SCHEDULED">SCHEDULED (Normal)</option>
              <option value="DELAYED">DELAYED (Schedule shifted)</option>
              <option value="COMPLETED">COMPLETED (Journey done)</option>
              <option value="CANCELLED">CANCELLED (Suspended)</option>
            </Select>

            <div className="sm:col-span-2">
              <Select
                label="Assigned Bus Fleet *"
                value={editBusId}
                onChange={(e) => setEditBusId(e.target.value)}
                required
              >
                {buses.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.registrationNumber} — {b.busType} ({b.totalSeats} seats)
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Discard
            </Button>
            <Button type="submit" variant="primary" loading={editSubmitting}>
              Save Timetable Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule New Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule New Bus Timetable"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {!isSuperAdmin && (
            <div className="p-3 rounded-lg bg-[#CCFBF1]/40 dark:bg-[#132A24] border border-[#0F766E]/30 text-[#0F766E] dark:text-[#5EEAD4] text-xs font-medium">
              You are publishing as <strong>{assignedState} State Administrator</strong>. Select a route connecting stops within or serving {assignedState}.
            </div>
          )}

          <Select
            label="Route Corridor *"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            required
          >
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName} ({r.routeCode})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Bus Fleet Vehicle *"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              required
            >
              {buses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.registrationNumber} ({b.busType})
                </option>
              ))}
            </Select>

            <Select
              label="Operating Agency *"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              required
            >
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name}
                </option>
              ))}
            </Select>

            <Input
              label="Departure Time *"
              type="datetime-local"
              required
              value={departureAt}
              onChange={(e) => setDepartureAt(e.target.value)}
            />

            <Input
              label="Arrival Time *"
              type="datetime-local"
              required
              value={arrivalAt}
              onChange={(e) => setArrivalAt(e.target.value)}
            />

            <div className="sm:col-span-2">
              <Input
                label="Base Fare (₹ INR) *"
                type="number"
                required
                min={1}
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publish Timetable & Seats
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelTripId)}
        onClose={() => setCancelTripId(null)}
        onConfirm={handleConfirmCancelTrip}
        loading={cancelling}
        title="Cancel Scheduled Departure?"
        message="This will update the timetable status to CANCELLED. Any existing passenger bookings will be notified."
        confirmLabel="Confirm Cancellation"
      />
    </div>
  );
};
