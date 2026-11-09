import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Phone,
  Mail,
  X
} from 'lucide-react';

export const AdminOperatorsPage = () => {
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
      } else {
        await api.post('/admin/operators', payload);
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
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
            Fleet Administration
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Transport Operators
          </h1>
          <p className="text-xs text-slate-500">
            Authorized state transport corporations and private transit operators.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Operator</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading operators...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Operator Name & Code</th>
                  <th className="py-3 px-5">Contact Email</th>
                  <th className="py-3 px-5">Phone Number</th>
                  <th className="py-3 px-5">Address</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {operators.map((op) => (
                  <tr key={op._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white">{op.name}</p>
                      <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                        CODE: {op.operatorCode}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-400">{op.contactEmail}</td>
                    <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-400">{op.phone}</td>
                    <td className="py-4 px-5 text-slate-500 max-w-xs truncate">{op.address || 'N/A'}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          op.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {op.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => openEditModal(op)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingOperator ? 'Edit Operator Details' : 'Register New Transit Operator'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Operator Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haryana State Transport (Haryana Roadways)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Operator Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HR-RDW"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ops@operator.gov.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Phone Helpline *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91-11-23860000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Headquarters Address
                  </label>
                  <input
                    type="text"
                    placeholder="Central Bus Stand, Sector 17, Chandigarh"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingOperator ? 'Update Operator' : 'Register Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

