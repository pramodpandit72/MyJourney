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
import { Bus, Plus, Edit2 } from 'lucide-react';

export const AdminBusesPage = () => {
  const { toast } = useToast();
  const [buses, setBuses] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [operatorId, setOperatorId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [busType, setBusType] = useState('Volvo Multi-Axle AC (2+2)');
  const [totalSeats, setTotalSeats] = useState(40);
  const [layoutType, setLayoutType] = useState('2+2');
  const [status, setStatus] = useState('ACTIVE');
  const [amenitiesInput, setAmenitiesInput] = useState('AC, WiFi, Charging Point, Water Bottle');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBusesAndOperators = async () => {
    setLoading(true);
    setError('');
    try {
      const [busRes, opRes] = await Promise.all([
        api.get('/admin/buses'),
        api.get('/admin/operators')
      ]);
      setBuses(busRes?.data?.buses || []);
      const opList = opRes?.data?.operators || [];
      setOperators(opList);
      if (opList.length > 0 && !operatorId) {
        setOperatorId(opList[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusesAndOperators();
  }, []);

  const openCreateModal = () => {
    setEditingBus(null);
    setRegistrationNumber('');
    setBusType('Volvo Multi-Axle AC (2+2)');
    setTotalSeats(40);
    setLayoutType('2+2');
    setStatus('ACTIVE');
    setAmenitiesInput('AC, WiFi, Charging Point, Water Bottle');
    setFormError('');
    if (operators.length > 0) setOperatorId(operators[0]._id);
    setModalOpen(true);
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setOperatorId(bus.operatorId?._id || bus.operatorId);
    setRegistrationNumber(bus.registrationNumber);
    setBusType(bus.busType);
    setTotalSeats(bus.totalSeats);
    setLayoutType(bus.seatLayout?.layoutType || '2+2');
    setStatus(bus.status || 'ACTIVE');
    setAmenitiesInput(bus.amenities?.join(', ') || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const amenities = amenitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        operatorId,
        registrationNumber: registrationNumber.toUpperCase().trim(),
        busType,
        totalSeats: Number(totalSeats),
        seatLayoutType: layoutType,
        amenities,
        status
      };

      if (editingBus) {
        await api.put(`/admin/buses/${editingBus._id}`, payload);
        toast.success('Bus fleet configuration updated.');
      } else {
        await api.post('/admin/buses', payload);
        toast.success('New vehicle registered into fleet.');
      }

      setModalOpen(false);
      await fetchBusesAndOperators();
    } catch (err) {
      setFormError(err.message || 'Failed to save bus.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Fleet Management
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Registered Bus Fleet
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Configure vehicle registrations, seat layout capacities, and cabin amenities.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add Bus to Fleet
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBusesAndOperators} />
      ) : buses.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="No Buses Registered"
          description="Register buses under active operators to assign them to intercity schedules."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Add Bus
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Reg Number</Th>
                <Th>Operator</Th>
                <Th>Bus Type & Layout</Th>
                <Th className="text-center">Seats</Th>
                <Th>Amenities</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {buses.map((b) => (
                <Tr key={b._id}>
                  <Td className="font-mono font-bold text-[#14532D] dark:text-[#F0FDF4] text-sm">
                    {b.registrationNumber}
                  </Td>
                  <Td className="font-semibold text-[#172B24] dark:text-[#D1E7D8]">
                    {b.operatorId?.name || 'N/A'}
                  </Td>
                  <Td>
                    <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">{b.busType}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                      Layout: {b.seatLayout?.layoutType || '2+2'}
                    </p>
                  </Td>
                  <Td className="text-center font-bold text-[#166534] dark:text-[#4ADE80]">
                    {b.totalSeats}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {b.amenities?.map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#F0FDF4] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-[10px] font-medium text-[#14532D] dark:text-[#D1E7D8]"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={b.status} />
                  </Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => openEditModal(b)}
                      aria-label={`Edit ${b.registrationNumber}`}
                    >
                      Edit
                    </Button>
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
        title={editingBus ? 'Edit Bus Fleet Details' : 'Register New Bus into Fleet'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Select
                label="Operator *"
                required
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
              >
                {operators.map((op) => (
                  <option key={op._id} value={op._id}>
                    {op.name} ({op.operatorCode})
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Registration Plate *"
              type="text"
              required
              placeholder="DL-01-PC-9942"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="uppercase font-mono"
            />

            <Select
              label="Fleet Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>

            <div className="sm:col-span-2">
              <Input
                label="Coach Model / Type *"
                type="text"
                required
                placeholder="Volvo 9600 Multi-Axle AC"
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
              />
            </div>

            <Input
              label="Total Seats *"
              type="number"
              min="10"
              max="60"
              required
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
            />

            <Select
              label="Seat Layout Format"
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
            >
              <option value="2+2">2+2 Seater Coach</option>
              <option value="2+1">2+1 Semi-Sleeper</option>
              <option value="1+2">1+2 Executive</option>
            </Select>

            <div className="sm:col-span-2">
              <Input
                label="Onboard Amenities (Comma Separated)"
                type="text"
                placeholder="AC, WiFi, Charging Point, GPS Tracking"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingBus ? 'Update Vehicle' : 'Register Bus'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
