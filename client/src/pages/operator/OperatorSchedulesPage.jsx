import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Calendar,
  Bus,
  Clock,
  MapPin,
  Users,
  Search,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';

export const OperatorSchedulesPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await api.get('/operator/trips');
        setTrips(res?.data?.trips || []);
      } catch (err) {
        setError(err.message || 'Failed to load assigned schedules.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const filtered = trips.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Timetable Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Assigned Bus Schedules
          </h1>
          <p className="text-xs text-slate-500">
            Trips assigned to your authorized operator fleet.
          </p>
        </div>

        {/* Status filter */}
        <div className="flex space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading schedules...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="font-bold">No assigned schedules found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Route & Corridor</th>
                  <th className="py-3 px-5">Bus & Type</th>
                  <th className="py-3 px-5">Departure (IST)</th>
                  <th className="py-3 px-5">Occupancy</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filtered.map((trip) => (
                  <tr key={trip._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {trip.routeId?.routeName || 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500">{trip.routeId?.routeCode}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {trip.busId?.registrationNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">{trip.busId?.busType}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-semibold">{formatIST(trip.departureAt)}</p>
                      <p className="text-[11px] text-slate-400">Arr: {formatIST(trip.arrivalAt)}</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{trip.bookedSeats} / {trip.totalSeats}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{trip.occupancyPercentage}%</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${trip.occupancyPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/operator/manifests?tripId=${trip._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white font-bold transition-all shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Manifest</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

