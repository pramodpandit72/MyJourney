import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
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
  EmptyState
} from '../../components/ui/index.js';
import { Calendar, Plus } from 'lucide-react';

export const AdminTripsPage = () => {
  const { toast } = useToast();
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [departureAt, setDepartureAt] = useState('');
  const [arrivalAt, setArrivalAt] = useState('');
  const [baseFare, setBaseFare] = useState(750);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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
    const now = new Date();
    const dep = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const arr = new Date(dep.getTime() + 5 * 60 * 60 * 1000);

    const formatInputDateTime = (d) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setDepartureAt(formatInputDateTime(dep));
    setArrivalAt(formatInputDateTime(arr));
    setBaseFare(750);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
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
      toast.success('New intercity trip scheduled and seat inventory initialized.');
      await fetchAllData();
    } catch (err) {
      setFormError(err.message || 'Failed to schedule trip.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Dispatch Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Trip Schedules & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Publish new transit trips, assign fleets, set base fares, and initialize seat inventories.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Schedule New Trip
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAllData} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Scheduled Trips"
          description="Schedule your first bus departure linking an active route, fleet bus, and operator."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Schedule Trip
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Corridor Route</Th>
                <Th>Bus & Operator</Th>
                <Th>Departure (IST)</Th>
                <Th>Arrival (IST)</Th>
                <Th>Base Fare</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {trips.map((t) => (
                <Tr key={t._id}>
                  <Td>
                    <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                      {t.routeId?.routeName || 'N/A'}
                    </p>
                    <p className="text-[11px] font-mono text-[#0F766E] dark:text-[#5EEAD4]">
                      {t.routeId?.routeCode}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                      {t.busId?.registrationNumber} ({t.busId?.busType})
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                      {t.operatorId?.name}
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
                    {t.status === 'SCHEDULED' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancelTripId(t._id)}
                      >
                        Cancel Trip
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Schedule Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule New Intercity Trip"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold">
              {formError}
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
              Publish Trip & Seats
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTripId)}
        onClose={() => setCancelTripId(null)}
        onConfirm={handleConfirmCancelTrip}
        loading={cancelling}
        title="Cancel Scheduled Trip?"
        message="This will mark the scheduled departure as cancelled. Existing bookings will remain visible in the ledger for review."
        confirmLabel="Confirm Cancellation"
      />
    </div>
  );
};
