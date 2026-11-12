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
import { Building2, Plus, Edit2 } from 'lucide-react';

export const AdminOperatorsPage = () => {
  const { toast } = useToast();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchOperators = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/operators');
      setOperators(res?.data?.operators || []);
    } catch (err) {
      setError(err.message || 'Failed to load operators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const openCreateModal = () => {
    setEditingOperator(null);
    setFormName('');
    setFormCode('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormStatus('ACTIVE');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (op) => {
    setEditingOperator(op);
    setFormName(op.name);
    setFormCode(op.operatorCode);
    setFormEmail(op.contactEmail);
    setFormPhone(op.phone);
    setFormAddress(op.address || '');
    setFormStatus(op.status || 'ACTIVE');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name: formName,
        operatorCode: formCode.toUpperCase(),
        contactEmail: formEmail,
        phone: formPhone,
        address: formAddress,
        status: formStatus
      };

      if (editingOperator) {
        await api.put(`/admin/operators/${editingOperator._id}`, payload);
        toast.success('Operator details updated.');
      } else {
        await api.post('/admin/operators', payload);
        toast.success('New transit operator registered.');
      }

      setModalOpen(false);
      await fetchOperators();
    } catch (err) {
      setFormError(err.message || 'Failed to save operator details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Fleet & Partners
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Transit Operators Management
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Add, update, and verify state road transport agencies and licensed fleet carriers.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add Operator
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOperators} />
      ) : operators.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Operators Registered"
          description="Register your first bus operator partner to start assigning vehicles and routes."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Register Operator
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Operator Name & Code</Th>
                <Th>Contact Email</Th>
                <Th>Phone Number</Th>
                <Th>Address</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {operators.map((op) => (
                <Tr key={op._id}>
                  <Td>
                    <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">{op.name}</p>
                    <span className="font-mono text-[11px] text-[#0F766E] dark:text-[#5EEAD4] font-semibold">
                      CODE: {op.operatorCode}
                    </span>
                  </Td>
                  <Td className="font-mono text-[#475569] dark:text-[#D1E7D8]">{op.contactEmail}</Td>
                  <Td className="font-mono text-[#475569] dark:text-[#D1E7D8]">{op.phone}</Td>
                  <Td className="text-[#475569] dark:text-[#A7C4B0] max-w-xs truncate">
                    {op.address || 'N/A'}
                  </Td>
                  <Td>
                    <StatusBadge status={op.status} />
                  </Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => openEditModal(op)}
                      aria-label={`Edit ${op.name}`}
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
        title={editingOperator ? 'Edit Operator Details' : 'Register New Transit Operator'}
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
              <Input
                label="Operator Official Name *"
                type="text"
                required
                placeholder="e.g. Haryana State Transport (Haryana Roadways)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <Input
              label="Operator Code *"
              type="text"
              required
              placeholder="e.g. HR-RDW"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              className="uppercase font-mono"
            />

            <Select
              label="Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>

            <Input
              label="Contact Email *"
              type="email"
              required
              placeholder="ops@myjourney.in"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />

            <Input
              label="Phone Helpline *"
              type="tel"
              required
              placeholder="+91-11-23860000"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />

            <div className="sm:col-span-2">
              <Input
                label="Headquarters Address"
                type="text"
                placeholder="Central Bus Stand, Sector 17, Chandigarh"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingOperator ? 'Update Operator' : 'Register Operator'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
