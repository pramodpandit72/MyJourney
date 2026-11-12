import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
  Input
} from '../../components/ui/index.js';
import { Ticket, Bus, Clock, ChevronRight, Search } from 'lucide-react';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [pnrQuery, setPnrQuery] = useState('');

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

  const now = Date.now();
  const filteredBookings = bookings.filter((b) => {
    if (pnrQuery.trim()) {
      const q = pnrQuery.trim().toLowerCase();
      const matchPnr = (b.pnr || '').toLowerCase().includes(q);
      const matchRoute = (b.tripId?.routeId?.routeName || '').toLowerCase().includes(q);
      if (!matchPnr && !matchRoute) return false;
    }

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
      <Breadcrumb items={[{ label: 'My Bookings' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Passenger Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-1">
            My Bookings & Tickets
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5">
            View your confirmed reservations, download official e-tickets, or manage cancellations.
          </p>
        </div>

        <Link to="/search">
          <Button variant="primary" size="md">
            <Search className="w-4 h-4" />
            <span>Book New Journey</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs + Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-[#DCE7DF] dark:border-[#294A38]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Bookings' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' }
          ].map((tab) => {
            const active = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#166534] dark:bg-[#15803D] text-white'
                    : 'text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <Input
            icon={Search}
            placeholder="Filter by PNR or route..."
            value={pnrQuery}
            onChange={(e) => setPnrQuery(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Bookings Feed */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookings} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Bookings Found"
          description={`You do not have any bookings matching your current filter criteria.`}
          actionLabel="Search Available Buses"
          onAction={() => (window.location.href = '/search')}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const trip = b.tripId;

            return (
              <Card key={b._id} hoverable>
                <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#14532D] dark:text-[#F0FDF4] bg-[#F0FDF4] dark:bg-[#234B35] px-2.5 py-0.5 rounded-md border border-[#DCE7DF] dark:border-[#294A38]">
                        PNR: {b.pnr}
                      </span>
                      <StatusBadge variant={isConfirmed ? 'success' : 'error'}>
                        {b.status}
                      </StatusBadge>
                      <span className="text-xs text-[#64748B] dark:text-[#A7C4B0]">
                        Booked {formatIST(b.bookingDate)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#14532D] dark:text-[#F0FDF4] truncate">
                      {trip?.routeId?.routeName || 'Intercity Bus Service'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#475569] dark:text-[#D1E7D8]">
                      <span className="inline-flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                        <span>
                          {trip?.operatorId?.name} ({trip?.busId?.busType})
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
                        <span>Dep: {formatIST(trip?.departureAt)}</span>
                      </span>
                      <span>
                        Seats:{' '}
                        <strong className="text-[#14532D] dark:text-[#F0FDF4]">
                          {b.seatNumbers?.join(', ')}
                        </strong>
                      </span>
                    </div>

                    {!isConfirmed && (
                      <p className="text-xs text-[#B91C1C] dark:text-[#F87171] font-medium">
                        Simulated Refund: ₹{b.refundAmount} • Status: {b.refundStatus}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#DCE7DF] dark:border-[#294A38] shrink-0">
                    <div className="sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0] block">
                        Total Fare
                      </span>
                      <span className="text-lg font-bold text-[#166534] dark:text-[#4ADE80] font-mono">
                        ₹{b.totalAmount}
                      </span>
                    </div>

                    <Link to={`/ticket/${b.pnr}`}>
                      <Button variant="secondary" size="sm">
                        <span>View Ticket</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
