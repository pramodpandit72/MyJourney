import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Pagination,
  Button,
  Input,
  Select,
  StatusBadge,
  LoadingSkeleton,
  ErrorState,
  EmptyState
} from '../../components/ui/index.js';
import { Ticket, Search, Eye } from 'lucide-react';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pnrSearch, setPnrSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15'
      });
      if (pnrSearch) params.append('pnr', pnrSearch);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(res?.data?.bookings || []);
      setPagination(res?.data?.pagination || { total: 0, pages: 1, page });
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Ticketing Ledger
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Global Booking Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Real-time database records of all passenger ticket reservations and cancellations.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="w-full sm:w-56">
            <Input
              icon={Search}
              type="text"
              placeholder="Search PNR..."
              value={pnrSearch}
              onChange={(e) => setPnrSearch(e.target.value)}
              className="uppercase font-mono"
            />
          </div>

          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </Select>
          </div>

          <Button type="submit" variant="primary" size="md">
            Filter
          </Button>
        </form>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Matching Bookings"
          description="No reservations match your PNR query or status filter."
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>PNR</Th>
                <Th>Primary Passenger / User</Th>
                <Th>Route & Operator</Th>
                <Th>Seats</Th>
                <Th>Booking Date</Th>
                <Th>Total Paid</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bookings.map((b) => (
                <Tr key={b._id}>
                  <Td>
                    <span className="font-mono font-bold text-xs text-[#166534] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#234B35] px-2 py-1 rounded border border-[#166534]/20 dark:border-[#4ADE80]/30">
                      {b.pnr}
                    </span>
                  </Td>
                  <Td>
                    <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                      {b.passengers?.[0]?.name || b.userId?.name || 'N/A'}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] font-mono">
                      {b.userId?.email || '—'}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                      {b.tripId?.routeId?.routeName || 'N/A'}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                      {b.tripId?.operatorId?.name || '—'}
                    </p>
                  </Td>
                  <Td className="font-semibold font-mono">
                    {b.seatNumbers?.join(', ')} ({b.seatNumbers?.length})
                  </Td>
                  <Td className="text-[#475569] dark:text-[#D1E7D8] whitespace-nowrap">
                    {formatIST(b.bookingDate)}
                  </Td>
                  <Td className="font-bold font-mono text-[#15803D] dark:text-[#4ADE80]">
                    ₹{b.totalAmount}
                  </Td>
                  <Td>
                    <StatusBadge status={b.status} />
                  </Td>
                  <Td className="text-right">
                    <Link to={`/ticket/${b.pnr}`}>
                      <Button variant="outline" size="sm" icon={Eye}>
                        Ticket
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Pagination
            page={pagination.page || page}
            totalPages={pagination.pages}
            onPageChange={(next) => setPage(next)}
          />
        </TableContainer>
      )}
    </div>
  );
};
