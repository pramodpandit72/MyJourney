import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Ticket,
  Bus,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Search
} from 'lucide-react';

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/my');
      setBookings(res?.data?.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Filter logic
  const now = Date.now();
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filterStatus === 'CANCELLED') return b.status === 'CANCELLED';
    if (filterStatus === 'UPCOMING') {
      const dep = new Date(b.tripId?.departureAt).getTime();
      return b.status === 'CONFIRMED' && dep > now;
    }
    if (filterStatus === 'COMPLETED') {
      const dep = new Date(b.tripId?.departureAt).getTime();
      return b.status === 'CONFIRMED' && dep <= now;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Passenger Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            My Bookings & Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View your confirmed reservations, download official e-tickets, or manage cancellations.
          </p>
        </div>

        <Link
          to="/search"
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-emerald-500/20"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Book New Journey</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Bookings' },
          { id: 'UPCOMING', label: 'Upcoming Trips' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterStatus === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading bookings from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-center space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mx-auto">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Bookings Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You do not have any bookings under the "{filterStatus.toLowerCase()}" filter.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20"
          >
            <span>Search Buses Now</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const trip = b.tripId;

            return (
              <div
                key={b._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Left details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                      PNR: {b.pnr}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Booked on {formatIST(b.bookingDate)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {trip?.routeId?.routeName || 'Intercity Bus Service'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Bus className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip?.operatorId?.name} ({trip?.busId?.busType})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dep: {formatIST(trip?.departureAt)}</span>
                    </span>
                    <span>
                      Seats: <strong className="text-slate-800 dark:text-slate-200">{b.seatNumbers?.join(', ')}</strong>
                    </span>
                  </div>

                  {!isConfirmed && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      Simulated Refund: ₹{b.refundAmount} • Status: {b.refundStatus}
                    </p>
                  )}
                </div>

                {/* Right Fare & View Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Total Fare</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">₹{b.totalAmount}</span>
                  </div>

                  <Link
                    to={`/ticket/${b.pnr}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center space-x-1 shadow-sm"
                  >
                    <span>View Ticket</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
