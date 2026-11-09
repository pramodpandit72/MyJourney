import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  MapPin,
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

export const AdminStopsPage = () => {
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
      } else {
        await api.post('/admin/stops', payload);
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
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
            Station Network
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Bus Stops & Intercity Terminals
          </h1>
          <p className="text-xs text-slate-500">
            Designate official boarding, transit, and terminus stations across jurisdictions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stop</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading stops...</p>
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
                  <th className="py-3 px-5">Stop Code</th>
                  <th className="py-3 px-5">Stop Name</th>
                  <th className="py-3 px-5">City</th>
                  <th className="py-3 px-5">State</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {stops.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {s.stopCode}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-4 px-5 font-medium">{s.city}</td>
                    <td className="py-4 px-5 text-slate-500">{s.state}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => openEditModal(s)}
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingStop ? 'Edit Stop / Terminal' : 'Create New Stop / Terminal'}
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
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Terminal / Stop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmere Gate ISBT"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Stop Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEL-KG"
                    value={stopCode}
                    onChange={(e) => setStopCode(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
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
                  {submitting ? 'Saving...' : editingStop ? 'Update Stop' : 'Create Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

