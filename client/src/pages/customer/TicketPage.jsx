import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  BrandLogo,
  Breadcrumb,
  Button,
  ConfirmDialog,
  LoadingSkeleton,
  ErrorState,
  StatusBadge
} from '../../components/ui/index.js';
import {
  Printer,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  XCircle,
  MapPin
} from 'lucide-react';

export const TicketPage = () => {
  const { pnr } = useParams();
  const [searchParams] = useSearchParams();
  const isNewConfirmation = searchParams.get('confirmed') === 'true';
  const { toast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Personal travel schedule change');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

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
    if (pnr) fetchBooking();
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await api.post(`/bookings/${pnr}/cancel`, {
        cancellationReason: cancelReason
      });
      toast.success(res?.message || 'Booking cancelled and seat inventory released.');
      setCancelModalOpen(false);
      await fetchBooking();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-14 space-y-4">
        <ErrorState
          title="Ticket Not Accessible"
          message={error || `No booking records found for PNR ${pnr}`}
          onRetry={fetchBooking}
        />
        <div className="text-center">
          <Link to="/my-bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Bookings</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const trip = booking.tripId;
  const isTripDeparted = trip && new Date(trip.departureAt).getTime() <= Date.now();
  const canCancel = isConfirmed && !isTripDeparted;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="print:hidden">
        <Breadcrumb
          items={[{ label: 'My Bookings', to: '/my-bookings' }, { label: `Ticket ${booking.pnr}` }]}
        />
      </div>

      {/* Confirmation Banner */}
      {isNewConfirmation && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] dark:bg-[#143323] border border-[#15803D]/30 dark:border-[#4ADE80]/30 text-[#14532D] dark:text-[#F0FDF4] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#166534] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#14532D] dark:text-[#F0FDF4]">
                Booking Confirmed Successfully
              </h2>
              <p className="text-xs text-[#15803D] dark:text-[#D1E7D8]">
                Your seats are locked under official PNR <strong className="font-mono">{booking.pnr}</strong>.
              </p>
            </div>
          </div>
          <StatusBadge variant="success">Simulated Paid</StatusBadge>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3 print:hidden">
        <Link to="/my-bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2.5">
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setCancelModalOpen(true)}>
              <XCircle className="w-4 h-4" />
              <span>Cancel Ticket</span>
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            <span>Print E-Ticket</span>
          </Button>
        </div>
      </div>

      {/* Official Printable E-Ticket Document (Always clean white surface for legibility & print) */}
      <article
        id="printable-ticket"
        className="bg-white text-[#172B24] rounded-xl border border-[#DCE7DF] shadow-sm overflow-hidden print:border-[#172B24] print:shadow-none"
      >
        {/* Official Deep-Green Ticket Header */}
        <div className="bg-[#14532D] text-[#F0FDF4] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-[#0F766E]">
          <div className="space-y-1">
            <BrandLogo size="md" variant="light" subtitle="Official Electronic Bus Reservation Document" />
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-[#D1E7D8] uppercase font-mono block tracking-wider">
              PNR / Reference Number
            </span>
            <span className="text-2xl font-bold font-mono tracking-widest text-[#5EEAD4]">
              {booking.pnr}
            </span>
            <div className="mt-1.5">
              <span
                className={`inline-block text-[11px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                  isConfirmed
                    ? 'bg-[#234B35] text-[#4ADE80] border-[#4ADE80]/40'
                    : 'bg-[#3B1517] text-[#F87171] border-[#F87171]/40'
                }`}
              >
                Status: {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Notice */}
        {!isConfirmed && (
          <div className="p-4 bg-[#FEE2E2] border-b border-[#B91C1C]/30 text-[#991B1B] text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>
                Ticket cancelled on {formatDateTimeIST(booking.cancellationDetails?.cancelledAt)}.
              </span>
            </p>
            <p>
              Simulated Refund Amount: <strong>₹{booking.refundAmount}</strong> (
              {booking.cancellationDetails?.refundPercentage}% of fare) • Status: {booking.refundStatus}
            </p>
            {booking.cancellationDetails?.reason && (
              <p>Reason: {booking.cancellationDetails.reason}</p>
            )}
          </div>
        )}

        {/* Journey Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#DCE7DF]">
            <div className="space-y-3.5">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Transport Operator & Fleet
                </span>
                <p className="text-base font-bold text-[#14532D] mt-0.5">
                  {trip?.operatorId?.name || 'Authorized Public Transport Operator'}
                </p>
                <p className="text-xs text-[#475569]">
                  {trip?.busId?.busType} • Vehicle Reg:{' '}
                  <span className="font-mono font-semibold">{trip?.busId?.registrationNumber}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Route Corridor
                </span>
                <p className="text-sm font-semibold text-[#172B24] mt-0.5">
                  {trip?.routeId?.routeName || 'Intercity Bus Service'}
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Departure (IST)
                  </span>
                  <p className="text-sm font-bold text-[#14532D] mt-0.5">
                    {formatDateTimeIST(trip?.departureAt)}
                  </p>
                  <p className="text-xs text-[#475569] flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Boarding: {booking.boardingStopId?.name || 'Origin Stop'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Arrival (IST)
                  </span>
                  <p className="text-sm font-bold text-[#14532D] mt-0.5">
                    {formatDateTimeIST(trip?.arrivalAt)}
                  </p>
                  <p className="text-xs text-[#475569] flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                    <span>Dropping: {booking.droppingStopId?.name || 'Destination Stop'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>All scheduled timings are in Asia/Kolkata (IST).</span>
              </div>
            </div>
          </div>

          {/* Passenger & Seat Table */}
          <div>
            <h3 className="text-xs font-bold text-[#14532D] uppercase tracking-wider mb-3">
              Passenger Manifest & Seat Allocation
            </h3>
            <div className="overflow-x-auto rounded-lg border border-[#DCE7DF]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F0FDF4] text-[#14532D] font-bold uppercase tracking-wider border-b border-[#DCE7DF]">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Passenger Name</th>
                    <th className="py-2.5 px-4">Age / Gender</th>
                    <th className="py-2.5 px-4">Seat</th>
                    <th className="py-2.5 px-4 text-right">Allocation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE7DF]/70 text-[#172B24]">
                  {booking.passengers?.map((p, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-mono text-[#64748B]">{i + 1}</td>
                      <td className="py-3 px-4 font-bold">{p.name}</td>
                      <td className="py-3 px-4 text-[#475569]">
                        {p.age} yrs / {p.gender}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold bg-[#DCFCE7] text-[#14532D] border border-[#15803D]/25">
                          {p.seatNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#15803D]">
                        {isConfirmed ? 'Confirmed' : 'Released'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Summary */}
          <div className="p-4 rounded-lg bg-[#F7FAF8] border border-[#DCE7DF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-[#475569] space-y-1">
              <p>
                <strong>Booked On:</strong> {formatDateTimeIST(booking.bookingDate)}
              </p>
              <p>
                <strong>Transaction Type:</strong> Simulated Academic Checkout (No Real Payment)
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1 text-xs">
              <div className="flex justify-between text-[#475569]">
                <span>Base Fare Total:</span>
                <span className="font-mono font-semibold">
                  ₹{booking.fareBreakdown?.baseFareTotal || booking.totalAmount - 20}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>GST (5%):</span>
                <span className="font-mono font-semibold">
                  ₹{booking.fareBreakdown?.gstAmount || 0}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Portal Service Fee:</span>
                <span className="font-mono font-semibold">
                  ₹{booking.fareBreakdown?.serviceFee || 20}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#14532D] pt-1.5 border-t border-[#DCE7DF]">
                <span>Total Fare:</span>
                <span className="font-mono text-[#166534]">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Rule Strip */}
        <div className="bg-[#F0FDF4] px-6 py-3.5 border-t border-[#DCE7DF] text-[11px] text-[#475569] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>* Carry a valid government photo ID during boarding.</span>
          <span>MyJourney — Independent Academic Project</span>
        </div>
      </article>

      {/* Cancel Ticket Confirmation Dialog */}
      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
        loading={cancelling}
        title="Cancel Confirmed Ticket"
        description={`Cancelling PNR ${booking.pnr} will immediately release seat(s) ${booking.seatNumbers?.join(
          ', '
        )} back to public inventory and compute your simulated refund according to active cancellation policy tiers.`}
        confirmLabel="Confirm Cancellation"
      >
        {cancelError && (
          <div className="p-2.5 rounded-lg bg-[#FEE2E2] text-[#991B1B] text-xs font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cancelError}</span>
          </div>
        )}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase">
            Cancellation Reason
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation"
            className="w-full h-10 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-xs text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534]"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
};
