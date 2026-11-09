import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Ticket,
  Search,
  Filter,
  Eye,
  Loader2,
  AlertCircle,
  Clock,
  Bus,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pnrSearch, setPnrSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15'
      });
      if (pnrSearch) params.append('pnr', pnrSearch);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(res?.data?.bookings || []);
      setPagination(res?.data?.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
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
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Ticketing Ledger
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Global Booking Registry
          </h1>
          <p className="text-xs text-slate-500">
            Real-time database records of all passenger ticket reservations and cancellations.
          </p>
        </div>

        {/* Filter controls */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search PNR..."
              value={pnrSearch}
              onChange={(e) => setPnrSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading bookings registry...</p>
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
                  <th className="py-3 px-5">PNR</th>
                  <th className="py-3 px-5">Primary Passenger / User</th>
                  <th className="py-3 px-5">Route & Operator</th>
                  <th className="py-3 px-5">Seats</th>
                  <th className="py-3 px-5">Booking Date</th>
                  <th className="py-3 px-5">Total Paid</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-5">
                      <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                        {b.pnr}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {b.passengers?.[0]?.name || b.userId?.name || 'N/A'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.userId?.email}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold">{b.tripId?.routeId?.routeName || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500">{b.tripId?.operatorId?.name}</p>
                    </td>
                    <td className="py-4 px-5 font-bold">
                      {b.seatNumbers?.join(', ')} ({b.seatNumbers?.length} seats)
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-500">{formatIST(b.bookingDate)}</td>
                    <td className="py-4 px-5 font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/ticket/${b.pnr}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white font-bold transition-all text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} bookings total)
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

