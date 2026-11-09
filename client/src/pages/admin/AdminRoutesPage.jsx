import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  GitFork,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

export const AdminRoutesPage = () => {
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
      } else {
        await api.post('/admin/routes', payload);
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
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Corridor Mapping
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Route Corridors & Stoppages
          </h1>
          <p className="text-xs text-slate-500">
            Define stop sequence order, intermediate distances, and duration benchmarks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Route</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading route corridors...</p>
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
                  <th className="py-3 px-5">Route Name & Code</th>
                  <th className="py-3 px-5">Distance</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Stops Sequence</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {routes.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{r.routeName}</p>
                      <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {r.routeCode}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold">{r.totalDistance} km</td>
                    <td className="py-4 px-5 font-semibold text-slate-500">{r.estimatedDuration}</td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                        {r.stops?.map((st, i) => (
                          <React.Fragment key={i}>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                              {st.stopId?.name || st.stopId?.city || `Stop ${st.stopOrder}`}
                            </span>
                            {i < r.stops.length - 1 && <ArrowRight className="w-3 h-3 text-slate-400" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {r.status}
                      </span>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Configure Route Corridor
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
                    Route Corridor Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi ISBT to Jaipur Sindhi Camp"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Route Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEL-JAI-EXP"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium uppercase font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Total Distance (km) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalDistance}
                    onChange={(e) => setTotalDistance(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Estimated Travel Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5h 30m"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Stop Sequencer */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Ordered Sequence of Stops (Min 2)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    + Add Intermediate Stop
                  </button>
                </div>

                <div className="space-y-2">
                  {routeStops.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <span className="w-5 font-bold font-mono text-slate-400">{i + 1}</span>
                      <select
                        value={st.stopId}
                        onChange={(e) => handleStopChange(i, 'stopId', e.target.value)}
                        className="flex-1 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium"
                      >
                        {stops.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.city} — {s.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center space-x-1 w-28">
                        <input
                          type="number"
                          placeholder="km"
                          value={st.distanceKm}
                          onChange={(e) => handleStopChange(i, 'distanceKm', e.target.value)}
                          className="w-16 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                        />
                        <span className="text-slate-400 text-[10px]">km</span>
                      </div>

                      {routeStops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(i)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
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
                  {submitting ? 'Saving...' : 'Save Route Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

