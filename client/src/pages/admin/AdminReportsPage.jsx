import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  StatCard,
  ChartCard,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  StatusBadge,
  LoadingSkeleton,
  ErrorState
} from '../../components/ui/index.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, Printer, BarChart3, Ticket, IndianRupee, Percent, RefreshCw } from 'lucide-react';

export const AdminReportsPage = () => {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, bookingsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/bookings', { params: { limit: 50 } })
      ]);
      setDashboardData(dashRes?.data || null);
      setBookings(bookingsRes?.data?.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load operational reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    if (!bookings.length) {
      toast.warning('No booking records available to export.');
      return;
    }

    const headers = ['PNR', 'Passenger', 'Email', 'Route', 'Booking Date', 'Seats', 'Total Paid (INR)', 'Status'];
    const rows = bookings.map((b) => [
      b.pnr || '',
      `"${(b.passengers?.[0]?.name || b.userId?.name || 'Passenger').replace(/"/g, '""')}"`,
      b.userId?.email || '',
      `"${(b.tripId?.routeId?.routeName || 'N/A').replace(/"/g, '""')}"`,
      b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : '',
      `"${(b.seatNumbers || []).join(', ')}"`,
      b.totalAmount ?? 0,
      b.status || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myjourney-bookings-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Booking ledger exported to CSV.');
  };

  if (loading) return <LoadingSkeleton rows={6} />;
  if (error || !dashboardData) {
    return <ErrorState message={error || 'Unable to generate reports.'} onRetry={fetchReports} />;
  }

  const { summary, routeStats = [] } = dashboardData;
  const totalConfirmedRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);

  const axisColor = isDark ? '#A7C4B0' : '#475569';
  const gridColor = isDark ? '#294A38' : '#DCE7DF';
  const barColor = isDark ? '#4ADE80' : '#166534';
  const tooltipStyle = {
    backgroundColor: isDark ? '#162B22' : '#FFFFFF',
    borderColor: isDark ? '#294A38' : '#DCE7DF',
    color: isDark ? '#F0FDF4' : '#172B24',
    borderRadius: '8px',
    fontSize: '12px'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
            Operational & Revenue Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0] mt-0.5">
            Corridor performance, seat load utilization, and exportable PNR transaction summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchReports}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Report
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings"
          value={summary.totalBookings}
          subtext={`${summary.confirmedBookings} confirmed / ${summary.cancelledBookings} cancelled`}
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Sample Ledger Revenue"
          value={`₹${totalConfirmedRevenue.toLocaleString('en-IN')}`}
          subtext="Across latest 50 PNR records"
          icon={IndianRupee}
          tone="aqua"
        />
        <StatCard
          label="Network Seat Occupancy"
          value={`${summary.occupancyPercentage}%`}
          subtext={`${summary.bookedSeatsInventory} / ${summary.totalSeatsInventory} seats booked`}
          icon={Percent}
          tone="success"
        />
        <StatCard
          label="Active Corridors"
          value={summary.totalRoutes}
          subtext={`${summary.activeTrips} active scheduled trips`}
          icon={BarChart3}
          tone="neutral"
        />
      </div>

      {/* Route Performance Chart */}
      <ChartCard
        title="Corridor Demand Breakdown"
        subtitle="Total confirmed bookings per active intercity bus route"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeStats} margin={{ top: 10, right: 12, left: -12, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="route"
                stroke={axisColor}
                fontSize={11}
                tickFormatter={(val) => val.split('to')[0]?.trim() || val}
              />
              <YAxis stroke={axisColor} fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="bookings" fill={barColor} radius={[4, 4, 0, 0]} name="Confirmed Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4]">
            Recent Transaction Summary ({bookings.length} records)
          </h2>
        </div>

        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>PNR</Th>
                <Th>Passenger</Th>
                <Th>Route / Corridor</Th>
                <Th>Seats</Th>
                <Th>Total Fare</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bookings.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center py-8 text-[#64748B] dark:text-[#A7C4B0]">
                    No booking transactions found.
                  </Td>
                </Tr>
              ) : (
                bookings.map((b) => (
                  <Tr key={b._id}>
                    <Td className="font-mono font-bold text-[#166534] dark:text-[#4ADE80]">{b.pnr}</Td>
                    <Td>
                      <div className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                        {b.passengers?.[0]?.name || b.userId?.name || 'Passenger'}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                        {b.userId?.email || '—'}
                      </div>
                    </Td>
                    <Td>
                      <div className="font-medium">
                        {b.tripId?.routeId?.routeName || 'N/A'}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                        {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : ''}
                      </div>
                    </Td>
                    <Td className="font-mono">{(b.seatNumbers || []).join(', ')}</Td>
                    <Td className="font-semibold">₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</Td>
                    <Td>
                      <StatusBadge status={b.status} />
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
