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
  Button,
  Input,
  Select,
  StatusBadge,
  LoadingSkeleton,
  ErrorState,
  EmptyState
} from '../../components/ui/index.js';
import { GitFork, Plus, Trash2, ArrowRight } from 'lucide-react';

export const AdminRoutesPage = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [totalDistance, setTotalDistance] = useState(250);
  const [estimatedDuration, setEstimatedDuration] = useState('5h 0m');
  const [status, setStatus] = useState('ACTIVE');
  const [routeStops, setRouteStops] = useState([
    { stopId: '', distanceKm: 0, timeOffsetMinutes: 0 },
    { stopId: '', distanceKm: 250, timeOffsetMinutes: 300 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRoutesAndStops = async () => {
    setLoading(true);
    setError('');
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/admin/routes'),
        api.get('/admin/stops')
      ]);
      setRoutes(rRes?.data?.routes || []);
      const stopsList = sRes?.data?.stops || [];
      setStops(stopsList);

      if (stopsList.length >= 2) {
        setRouteStops([
          { stopId: stopsList[0]._id, distanceKm: 0, timeOffsetMinutes: 0 },
          { stopId: stopsList[1]._id, distanceKm: 250, timeOffsetMinutes: 300 }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutesAndStops();
  }, []);

  const openCreateModal = () => {
    setEditingRoute(null);
    setRouteName('');
    setRouteCode('');
    setTotalDistance(250);
    setEstimatedDuration('5h 0m');
    setStatus('ACTIVE');
    if (stops.length >= 2) {
      setRouteStops([
        { stopId: stops[0]._id, distanceKm: 0, timeOffsetMinutes: 0 },
        { stopId: stops[1]._id, distanceKm: 250, timeOffsetMinutes: 300 }
      ]);
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleAddStop = () => {
    if (stops.length > 0) {
      setRouteStops((prev) => [
        ...prev,
        { stopId: stops[0]._id, distanceKm: totalDistance, timeOffsetMinutes: 0 }
      ]);
    }
  };

  const handleRemoveStop = (idx) => {
    if (routeStops.length <= 2) {
      setFormError('A route must have at least 2 stops.');
      return;
    }
    setRouteStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStopChange = (idx, field, value) => {
    const updated = [...routeStops];
    updated[idx][field] = value;
    setRouteStops(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const formattedStops = routeStops.map((s, idx) => ({
        stopId: s.stopId,
        stopOrder: idx + 1,
        distanceKm: Number(s.distanceKm),
        timeOffsetMinutes: Number(s.timeOffsetMinutes || 0)
      }));

      const payload = {
        routeName,
        routeCode: routeCode.toUpperCase().trim(),
        totalDistance: Number(totalDistance),
        estimatedDuration,
        stops: formattedStops,
        status
      };

      if (editingRoute) {
        await api.put(`/admin/routes/${editingRoute._id}`, payload);
        toast.success('Route corridor updated.');
      } else {
        await api.post('/admin/routes', payload);
        toast.success('New route corridor configured.');
      }

      setModalOpen(false);
      await fetchRoutesAndStops();
    } catch (err) {
      setFormError(err.message || 'Failed to save route corridor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Corridor Mapping
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Route Corridors & Stoppages
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Define stop sequence order, intermediate distances, and duration benchmarks.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Create New Route
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRoutesAndStops} />
      ) : routes.length === 0 ? (
        <EmptyState
          icon={GitFork}
          title="No Route Corridors Defined"
          description="Create an ordered corridor linking at least two terminals to schedule trips."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Create Route
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Route Name & Code</Th>
                <Th>Distance</Th>
                <Th>Duration</Th>
                <Th>Stops Sequence</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {routes.map((r) => (
                <Tr key={r._id}>
                  <Td>
                    <p className="font-bold text-[#14532D] dark:text-[#F0FDF4] text-sm">{r.routeName}</p>
                    <span className="font-mono text-[11px] text-[#0F766E] dark:text-[#5EEAD4] font-semibold">
                      {r.routeCode}
                    </span>
                  </Td>
                  <Td className="font-bold whitespace-nowrap">{r.totalDistance} km</Td>
                  <Td className="font-medium text-[#475569] dark:text-[#D1E7D8] whitespace-nowrap">
                    {r.estimatedDuration}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                      {r.stops?.map((st, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-0.5 rounded bg-[#F0FDF4] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-[11px] font-semibold text-[#14532D] dark:text-[#D1E7D8]">
                            {st.stopId?.name || st.stopId?.city || `Stop ${st.stopOrder}`}
                          </span>
                          {i < r.stops.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-[#0F766E] dark:text-[#5EEAD4]" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Configure Route Corridor"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Route Corridor Title *"
                type="text"
                required
                placeholder="e.g. Delhi ISBT to Jaipur Sindhi Camp"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>

            <Input
              label="Route Code *"
              type="text"
              required
              placeholder="DEL-JAI-101"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              className="uppercase font-mono"
            />

            <Input
              label="Total Distance (km) *"
              type="number"
              required
              min="10"
              value={totalDistance}
              onChange={(e) => setTotalDistance(e.target.value)}
            />

            <Input
              label="Estimated Duration *"
              type="text"
              required
              placeholder="e.g. 5h 30m"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />

            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </div>

          <div className="pt-2 space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#14532D] dark:text-[#D1E7D8] uppercase tracking-wider">
                Ordered Sequence of Stops (Min 2)
              </label>
              <button
                type="button"
                onClick={handleAddStop}
                className="text-xs text-[#166534] dark:text-[#4ADE80] font-bold hover:underline"
              >
                + Add Intermediate Stop
              </button>
            </div>

            <div className="space-y-2">
              {routeStops.map((st, i) => (
                <div
                  key={i}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-lg bg-[#F7FAF8] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-xs"
                >
                  <span className="w-5 font-bold font-mono text-[#0F766E] dark:text-[#5EEAD4]">
                    {i + 1}
                  </span>
                  <select
                    value={st.stopId}
                    onChange={(e) => handleStopChange(i, 'stopId', e.target.value)}
                    className="flex-1 h-9 px-2.5 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-md text-xs font-medium text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:ring-2 focus:ring-[#166534]/30"
                  >
                    {stops.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.city} — {s.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5 w-28">
                    <input
                      type="number"
                      placeholder="km"
                      value={st.distanceKm}
                      onChange={(e) => handleStopChange(i, 'distanceKm', e.target.value)}
                      className="w-16 h-9 px-2 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-md text-xs text-[#172B24] dark:text-[#F0FDF4]"
                    />
                    <span className="text-[#64748B] dark:text-[#A7C4B0] text-[11px]">km</span>
                  </div>

                  {routeStops.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(i)}
                      className="p-1.5 rounded text-[#B91C1C] dark:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#3B1517]"
                      aria-label={`Remove stop ${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Route Corridor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
