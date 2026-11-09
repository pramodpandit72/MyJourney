import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  ClipboardList,
  Bus,
  Clock,
  Loader2,
  AlertCircle,
  Percent
} from 'lucide-react';

export const OperatorOccupancyPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOccupancy = async () => {
      setLoading(true);
      try {
        const res = await api.get('/operator/reports/occupancy');
        setReports(res?.data?.reports || []);
      } catch (err) {
        setError(err.message || 'Failed to load occupancy reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchOccupancy();
  }, []);

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
      <div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          Fleet Capacity Utilization
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          Seat Occupancy Reconciliation
        </h1>
        <p className="text-xs text-slate-500">
          Reconciles scheduled bus trips directly with confirmed seat inventory records in MongoDB.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Reconciling seat inventory records...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <Percent className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="font-bold">No trips found to generate occupancy reports.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Corridor Route</th>
                  <th className="py-3 px-5">Bus Number</th>
                  <th className="py-3 px-5">Scheduled Departure</th>
                  <th className="py-3 px-5 text-center">Capacity</th>
                  <th className="py-3 px-5 text-center">Confirmed</th>
                  <th className="py-3 px-5 text-center">Available</th>
                  <th className="py-3 px-5 text-right">Occupancy %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                      {r.route}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold">{r.busNumber}</p>
                      <p className="text-[11px] text-slate-500">{r.busType}</p>
                    </td>
                    <td className="py-4 px-5 font-medium">{formatIST(r.departureAt)}</td>
                    <td className="py-4 px-5 text-center font-bold text-slate-600 dark:text-slate-400">
                      {r.totalSeats}
                    </td>
                    <td className="py-4 px-5 text-center font-black text-emerald-600 dark:text-emerald-400">
                      {r.confirmedSeats}
                    </td>
                    <td className="py-4 px-5 text-center font-bold text-blue-600 dark:text-blue-400">
                      {r.availableSeats}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <span className="font-black text-sm">{r.occupancyPercentage}%</span>
                        <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${r.occupancyPercentage}%` }}
                          ></div>
                        </div>
                      </div>
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

