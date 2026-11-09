import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Ticket,
  Printer,
  Bus,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  XCircle,
  RefreshCw,
  Info
} from 'lucide-react';

export const TicketPage = () => {
  const { pnr } = useParams();
  const [searchParams] = useSearchParams();
  const isNewConfirmation = searchParams.get('confirmed') === 'true';
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Personal reasons');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/bookings/${pnr}`);
      setBooking(res?.data?.booking || null);
    } catch (err) {
      setError(err.message || 'Unable to retrieve ticket details for this PNR.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pnr) {
      fetchBooking();
    }
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    setCancelling(true);
    setCancelError('');
    try {
      const res = await api.post(`/bookings/${pnr}/cancel`, {
        cancellationReason: cancelReason
      });
      setCancelSuccess(res.message || 'Booking cancelled successfully.');
      setCancelModalOpen(false);
      // Refresh booking to reflect cancelled state
      await fetchBooking();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  // Helper date formatter in IST
  const formatDateTimeIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Retrieving digital ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ticket Not Accessible</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error || 'No booking records found for PNR ' + pnr}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Portal</span>
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const trip = booking.tripId;
  const isTripDeparted = trip && new Date(trip.departureAt).getTime() <= Date.now();
  const canCancel = isConfirmed && !isTripDeparted;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner if Just Confirmed */}
      {isNewConfirmation && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Booking Confirmed Successfully!</h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Your reservation has been locked in the database with PNR #{booking.pnr}.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase hidden sm:inline-block">
            Simulated Paid
          </span>
        </div>
      )}

      {/* Action Bar (Print / Cancel / Back) */}
      <div className="flex flex-wrap justify-between items-center gap-3 print:hidden">
        <Link
          to="/my-bookings"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>

        <div className="flex items-center space-x-2">
          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
            >
              Cancel Ticket
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print E-Ticket</span>
          </button>
        </div>
      </div>

      {/* Printable E-Ticket Card */}
      <div
        id="printable-ticket"
        className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden print:border-black print:text-black"
      >
        {/* Ticket Header */}
        <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tight text-white">
                  Yatra<span className="text-blue-400">Setu</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                  E-Ticket
                </span>
              </div>
              <p className="text-xs text-slate-400">National Public Transport Booking Platform</p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 uppercase font-mono block">Booking Reference / PNR</span>
            <span className="text-2xl font-black font-mono tracking-widest text-blue-400">
              {booking.pnr}
            </span>
            <div className="mt-1">
              <span
                className={`inline-block text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  isConfirmed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                ● Status: {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation details alert if cancelled */}
        {!isConfirmed && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs space-y-1">
            <p className="font-bold flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>This ticket was cancelled on {formatDateTimeIST(booking.cancellationDetails?.cancelledAt)}.</span>
            </p>
            <p className="text-[11px] text-rose-800 dark:text-rose-300">
              Simulated Refund Amount: ₹{booking.refundAmount} ({booking.cancellationDetails?.refundPercentage}% of fare). Status: {booking.refundStatus}
            </p>
          </div>
        )}

        {/* Main Journey Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            {/* Route & Operator */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Service Operator</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {trip?.operatorId?.name || 'Authorized State Transport'}
                </p>
                <p className="text-xs text-slate-500">
                  {trip?.busId?.busType} • Vehicle Reg: {trip?.busId?.registrationNumber}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Route Corridor</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {trip?.routeId?.routeName || 'Intercity Express Service'}
                </p>
              </div>
            </div>

            {/* Timings */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Departure</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDateTimeIST(trip?.departureAt)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Boarding: {booking.boardingStopId?.name || 'Origin Stop'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Arrival</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDateTimeIST(trip?.arrivalAt)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Dropping: {booking.droppingStopId?.name || 'Destination Stop'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Standard Display Timezone: Asia/Kolkata (IST)</span>
              </div>
            </div>
          </div>

          {/* Passenger & Seat Allocation Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              Passenger Manifest & Seat Assignments
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Passenger Name</th>
                    <th className="py-2.5 px-4">Age / Gender</th>
                    <th className="py-2.5 px-4">Seat Number</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {booking.passengers?.map((p, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-mono text-slate-400">{i + 1}</td>
                      <td className="py-3 px-4 font-bold">{p.name}</td>
                      <td className="py-3 px-4 text-slate-500">{p.age} yrs / {p.gender}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-black bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {p.seatNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Confirmed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-slate-500 space-y-1">
              <p>Booking Date: {formatDateTimeIST(booking.bookingDate)}</p>
              <p>Payment Mode: Simulated Academic Gateway (Direct Confirmation)</p>
            </div>

            <div className="text-right self-end sm:self-auto space-y-1 text-xs">
              <div className="flex justify-between space-x-6 text-slate-500">
                <span>Base Fare Total:</span>
                <span className="font-mono font-semibold">₹{booking.fareBreakdown?.baseFareTotal || booking.totalAmount - 20}</span>
              </div>
              <div className="flex justify-between space-x-6 text-slate-500">
                <span>GST (5%):</span>
                <span className="font-mono font-semibold">₹{booking.fareBreakdown?.gstAmount || 0}</span>
              </div>
              <div className="flex justify-between space-x-6 text-slate-500">
                <span>Platform Fee:</span>
                <span className="font-mono font-semibold">₹{booking.fareBreakdown?.serviceFee || 20}</span>
              </div>
              <div className="flex justify-between space-x-6 text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Fare Paid:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Footer Rules */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>* Valid government photo ID is required during boarding.</span>
          <span className="italic">YatraSetu Academic Demonstration Platform</span>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Confirm Ticket Cancellation</span>
              </h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {cancelError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {cancelError}
              </div>
            )}

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Are you sure you want to cancel ticket for PNR <strong>{booking.pnr}</strong>?
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">Cancellation Policy Reminder:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>≥ 24 hours before departure: 100% simulated refund</li>
                  <li>6 - 24 hours before departure: 50% simulated refund</li>
                  <li>&lt; 6 hours before departure: 0% refund</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Cancellation
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Change of travel plans"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
