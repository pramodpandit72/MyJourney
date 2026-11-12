import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  StatCard,
  ChartCard,
  LoadingSkeleton,
  ErrorState,
  Button,
  Card,
  CardContent
} from '../../components/ui/index.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Ticket,
  Building2,
  Bus,
  GitFork,
  Calendar,
  Percent,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      setData(res?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load administrator dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;
  if (error || !data) return <ErrorState message={error || 'No analytics returned.'} onRetry={fetchDashboard} />;

  const { summary, routeStats, statusStats, bookingTrends } = data;

  const axisColor = isDark ? '#A7C4B0' : '#475569';
  const gridColor = isDark ? '#294A38' : '#DCE7DF';
  const primaryGreen = isDark ? '#4ADE80' : '#166534';
  const aquaColor = isDark ? '#5EEAD4' : '#0F766E';
  const cancelColor = isDark ? '#F87171' : '#B91C1C';
  const tooltipStyle = {
    backgroundColor: isDark ? '#162B22' : '#FFFFFF',
    borderColor: isDark ? '#294A38' : '#DCE7DF',
    color: isDark ? '#F0FDF4' : '#172B24',
    borderRadius: '8px',
    fontSize: '12px'
  };

  const PIE_COLORS = [primaryGreen, cancelColor];

  const occupancyData = [
    {
      name: 'Booked Seats',
      seats: summary.bookedSeatsInventory || 0
    },
    {
      name: 'Available Seats',
      seats: Math.max(0, (summary.totalSeatsInventory || 0) - (summary.bookedSeatsInventory || 0))
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Contextual Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Executive Operations Overview
          </span>
          <h1 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            MyJourney Operations Dashboard
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5">
            Live backend-aggregated operational statistics across fleets, corridors, bookings, and seat occupancy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/trips">
            <Button variant="primary" size="sm">
              <span>Manage Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm">
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary 8 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings"
          value={summary.totalBookings}
          subtext={`Revenue: ₹${summary.totalRevenue}`}
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Confirmed Bookings"
          value={summary.confirmedBookings}
          subtext="Active PNR tickets"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Cancelled Bookings"
          value={summary.cancelledBookings}
          subtext="Simulated refunds processed"
          icon={XCircle}
          tone="error"
        />
        <StatCard
          label="Overall Occupancy"
          value={`${summary.occupancyPercentage}%`}
          subtext={`${summary.bookedSeatsInventory}/${summary.totalSeatsInventory} seats booked`}
          icon={Percent}
          tone="aqua"
        />
        <StatCard
          label="Total Operators"
          value={summary.totalOperators}
          subtext="Authorized agencies"
          icon={Building2}
          tone="green"
        />
        <StatCard
          label="Total Buses"
          value={summary.totalBuses}
          subtext="Registered coaches"
          icon={Bus}
          tone="aqua"
        />
        <StatCard
          label="Active Routes"
          value={summary.totalRoutes}
          subtext={`${summary.totalStops} connected terminals`}
          icon={GitFork}
          tone="green"
        />
        <StatCard
          label="Upcoming Trips"
          value={summary.upcomingTrips}
          subtext="Scheduled departures"
          icon={Calendar}
          tone="aqua"
        />
      </div>

      {/* Charts Row 1: Booking Trends + Booking Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          className="lg:col-span-2"
          title="Booking Trends (Past 7 Days)"
          subtitle="Daily confirmed reservations versus cancellations"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  bookingTrends?.length > 0
                    ? bookingTrends
                    : [
                        {
                          date: 'Current',
                          confirmed: summary.confirmedBookings,
                          cancelled: summary.cancelledBookings
                        }
                      ]
                }
              >
                <defs>
                  <linearGradient id="mjConfirmedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryGreen} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={primaryGreen} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" stroke={axisColor} fontSize={11} />
                <YAxis stroke={axisColor} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="confirmed"
                  stroke={primaryGreen}
                  strokeWidth={2}
                  fill="url(#mjConfirmedFill)"
                  name="Confirmed"
                />
                <Area
                  type="monotone"
                  dataKey="cancelled"
                  stroke={cancelColor}
                  strokeWidth={2}
                  fill={cancelColor}
                  fillOpacity={0.12}
                  name="Cancelled"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Booking Status Distribution" subtitle="Ratio of confirmed vs. cancelled PNRs">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusStats.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DCE7DF] dark:border-[#294A38] text-center text-xs">
            <div>
              <span className="font-semibold text-[#15803D] dark:text-[#4ADE80] block">Confirmed</span>
              <span className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4]">
                {summary.confirmedBookings}
              </span>
            </div>
            <div>
              <span className="font-semibold text-[#B91C1C] dark:text-[#F87171] block">Cancelled</span>
              <span className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4]">
                {summary.cancelledBookings}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2: Route Performance + Seat Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          className="lg:col-span-2"
          title="Route Performance"
          subtitle="Confirmed passenger bookings across major operating corridors"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeStats} margin={{ top: 10, right: 10, left: -16, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="route"
                  stroke={axisColor}
                  fontSize={10}
                  tickFormatter={(val) => val.split('to')[0]?.trim() || val}
                />
                <YAxis stroke={axisColor} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="bookings" fill={aquaColor} radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Seat Occupancy Inventory" subtitle="Total network seat utilization across active trips">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" stroke={axisColor} fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={11} width={95} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="seats" fill={primaryGreen} radius={[0, 4, 4, 0]} name="Seats" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Card className="bg-[#F0FDF4] dark:bg-[#10231B]">
            <CardContent className="p-3 flex justify-between items-center text-xs">
              <span className="font-semibold text-[#14532D] dark:text-[#D1E7D8]">
                Load Factor
              </span>
              <span className="font-bold text-base text-[#0F766E] dark:text-[#5EEAD4]">
                {summary.occupancyPercentage}%
              </span>
            </CardContent>
          </Card>
        </ChartCard>
      </div>
    </div>
  );
};
