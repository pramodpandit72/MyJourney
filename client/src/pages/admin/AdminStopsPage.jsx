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
import { MapPin, Plus, Edit2 } from 'lucide-react';

export const AdminStopsPage = () => {
  const { toast } = useToast();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [stopCode, setStopCode] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStops = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stops');
      setStops(res?.data?.stops || []);
    } catch (err) {
      setError(err.message || 'Failed to load stops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const openCreateModal = () => {
    setEditingStop(null);
    setName('');
    setCity('');
    setState('');
    setStopCode('');
    setStatus('ACTIVE');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingStop(s);
    setName(s.name);
    setCity(s.city);
    setState(s.state);
    setStopCode(s.stopCode);
    setStatus(s.status || 'ACTIVE');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name,
        city,
        state,
        stopCode: stopCode.toUpperCase().trim(),
        status
      };

      if (editingStop) {
        await api.put(`/admin/stops/${editingStop._id}`, payload);
        toast.success('Stop terminal updated.');
      } else {
        await api.post('/admin/stops', payload);
        toast.success('New bus stop terminal created.');
      }

      setModalOpen(false);
      await fetchStops();
    } catch (err) {
      setFormError(err.message || 'Failed to save stop.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Station Network
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Bus Terminals & Stops
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Manage registered city terminals, ISBTs, and intermediate boarding/dropping points.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add Stop Terminal
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStops} />
      ) : stops.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Bus Stops Configured"
          description="Add city terminals and boarding stations before building intercity route corridors."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Add Terminal
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Stop Code</Th>
                <Th>Stop Name</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stops.map((s) => (
                <Tr key={s._id}>
                  <Td className="font-mono font-bold text-[#0F766E] dark:text-[#5EEAD4]">
                    {s.stopCode}
                  </Td>
                  <Td className="font-bold text-[#14532D] dark:text-[#F0FDF4]">{s.name}</Td>
                  <Td className="font-medium">{s.city}</Td>
                  <Td className="text-[#475569] dark:text-[#A7C4B0]">{s.state}</Td>
                  <Td>
                    <StatusBadge status={s.status} />
                  </Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => openEditModal(s)}
                      aria-label={`Edit ${s.name}`}
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
        title={editingStop ? 'Edit Stop / Terminal' : 'Create New Stop / Terminal'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Terminal / Stop Name *"
            type="text"
            required
            placeholder="Kashmere Gate ISBT"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City *"
              type="text"
              required
              placeholder="New Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="State *"
              type="text"
              required
              placeholder="Delhi"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="Stop Code *"
              type="text"
              required
              placeholder="DEL-ISBT"
              value={stopCode}
              onChange={(e) => setStopCode(e.target.value)}
              className="uppercase font-mono"
            />
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingStop ? 'Update Terminal' : 'Create Stop'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
