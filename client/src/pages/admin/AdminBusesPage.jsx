import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Bus,
  Plus,
  Edit2,
  Armchair,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

export const AdminBusesPage = () => {
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
      } else {
        await api.post('/admin/buses', payload);
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
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Fleet Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Registered Bus Fleet
          </h1>
          <p className="text-xs text-slate-500">
            Configure vehicle registrations, seat layout capacities, and cabin amenities.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Bus</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading buses...</p>
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
                  <th className="py-3 px-5">Reg Number</th>
                  <th className="py-3 px-5">Operator</th>
                  <th className="py-3 px-5">Bus Type & Layout</th>
                  <th className="py-3 px-5 text-center">Seats</th>
                  <th className="py-3 px-5">Amenities</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {buses.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5">
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {b.registrationNumber}
                      </p>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300">
                      {b.operatorId?.name || 'N/A'}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold">{b.busType}</p>
                      <p className="text-[10px] text-slate-400">Layout: {b.seatLayout?.layoutType || '2+2'}</p>
                    </td>
                    <td className="py-4 px-5 text-center font-black text-indigo-600 dark:text-indigo-400">
                      {b.totalSeats}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {b.amenities?.map((a, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                {editingBus ? 'Edit Bus Fleet Details' : 'Register New Bus into Fleet'}
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
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Operating Agency *
                  </label>
                  <select
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    required
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {operators.map((op) => (
                      <option key={op._id} value={op._id}>
                        {op.name} ({op.operatorCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-01-AB-1234"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Bus Category *
                  </label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Volvo Multi-Axle AC (2+2)">Volvo Multi-Axle AC (2+2)</option>
                    <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                    <option value="AC Seater (2+2)">AC Seater (2+2)</option>
                    <option value="Deluxe Express (2+2)">Deluxe Express (2+2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Seat Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={60}
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="AC, WiFi, Charging Point, Blanket"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBus ? 'Update Bus' : 'Register Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

