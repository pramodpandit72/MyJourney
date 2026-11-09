import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  History,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Clock,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (actionFilter) params.append('action', actionFilter);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res?.data?.logs || []);
      setPagination(res?.data?.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Security & Compliance
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            System Operational Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of state-changing transactions, booking locks, cancellations, and administrative actions.
          </p>
        </div>

        {/* Filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">All Operational Actions</option>
          <option value="BOOKING_CONFIRMED">BOOKING_CONFIRMED</option>
          <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
          <option value="OPERATOR_CREATED">OPERATOR_CREATED</option>
          <option value="BUS_CREATED">BUS_CREATED</option>
          <option value="TRIP_CREATED">TRIP_CREATED</option>
          <option value="CANCELLATION_POLICY_UPDATED">CANCELLATION_POLICY_UPDATED</option>
          <option value="USER_LOGGED_IN">USER_LOGGED_IN</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading audit trail...</p>
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
                  <th className="py-3 px-5">Timestamp (IST)</th>
                  <th className="py-3 px-5">Actor & Role</th>
                  <th className="py-3 px-5">Action Event</th>
                  <th className="py-3 px-5">Target Entity</th>
                  <th className="py-3 px-5">Event Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 whitespace-nowrap text-slate-500 font-sans text-xs">
                      {formatIST(log.timestamp)}
                    </td>
                    <td className="py-3 px-5 font-sans">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {log.actorId?.name || 'System / Guest'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ROLE: {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-sans text-xs text-slate-500">
                      {log.entityType} ({log.entityId?.slice?.(-6) || log.entityId})
                    </td>
                    <td className="py-3 px-5 font-sans text-xs text-slate-700 dark:text-slate-300 max-w-md truncate">
                      {log.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-sans">
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} audit events total)
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

