import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Calendar,
  Plus,
  Bus,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  X,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export const AdminTripsPage = () => {
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

  const fetchAllData = async () => {
    setLoading(true);
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
    // Generate default future datetime string YYYY-MM-DDTHH:mm
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
      await fetchAllData();
    } catch (err) {
      setFormError(err.message || 'Failed to schedule trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTrip = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled trip?')) return;
    try {
      await api.put(`/admin/trips/${id}/cancel`);
      await fetchAllData();
    } catch (err) {
      alert(err.message || 'Failed to cancel trip.');
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
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Dispatch Center
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Trip Schedules & Dispatch
          </h1>
          <p className="text-xs text-slate-500">
            Publish new transit trips, assign fleets, set base fares, and initialize seat inventories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Trip</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading trips...</p>
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
                  <th className="py-3 px-5">Corridor Route</th>
                  <th className="py-3 px-5">Bus & Operator</th>
                  <th className="py-3 px-5">Departure (IST)</th>
                  <th className="py-3 px-5">Arrival (IST)</th>
                  <th className="py-3 px-5">Base Fare</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {trips.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white">{t.routeId?.routeName || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400">{t.routeId?.routeCode}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold">{t.busId?.registrationNumber} ({t.busId?.busType})</p>
                      <p className="text-[10px] text-slate-500">{t.operatorId?.name}</p>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">{formatIST(t.departureAt)}</td>
                    <td className="py-4 px-5 font-medium text-slate-500">{formatIST(t.arrivalAt)}</td>
                    <td className="py-4 px-5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{t.baseFare}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          t.status === 'SCHEDULED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {t.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleCancelTrip(t._id)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-[11px]"
                        >
                          Cancel Trip
                        </button>
                      )}
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
                Schedule New Intercity Trip
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
                  Route Corridor *
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  required
                  className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.routeName} ({r.routeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Bus Fleet Vehicle *
                  </label>
                  <select
                    value={busId}
                    onChange={(e) => setBusId(e.target.value)}
                    required
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {buses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.registrationNumber} ({b.busType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Operating Agency *
                  </label>
                  <select
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    required
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {operators.map((op) => (
                      <option key={op._id} value={op._id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Departure Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={departureAt}
                    onChange={(e) => setDepartureAt(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Arrival Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={arrivalAt}
                    onChange={(e) => setArrivalAt(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Base Fare (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={baseFare}
                    onChange={(e) => setBaseFare(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Trip & Initialize Seats'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

