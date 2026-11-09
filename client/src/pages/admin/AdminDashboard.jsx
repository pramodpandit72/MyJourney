import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
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
  MapPin,
  Calendar,
  Percent,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/dashboard');
        setData(res?.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load administrator dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Aggregating system statistics and operational trends...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-center space-y-2">
        <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
        <p className="text-sm font-bold">{error || 'No data returned.'}</p>
      </div>
    );
  }

  const { summary, routeStats, statusStats, bookingTrends } = data;

  const PIE_COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          Executive Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          System Overview & Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend-aggregated figures across operators, routes, bookings, and seat occupancy.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Bookings</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalBookings}</p>
          <span className="text-[10px] text-slate-500">All-time PNR records</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-500 uppercase block">Confirmed</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.confirmedBookings}</p>
          <span className="text-[10px] text-slate-500">Active tickets</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-rose-500 uppercase block">Cancelled</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.cancelledBookings}</p>
          <span className="text-[10px] text-slate-500">Refunds processed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-500 uppercase block">Total Revenue</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{summary.totalRevenue}</p>
          <span className="text-[10px] text-slate-500">Simulated collections</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-amber-500 uppercase block">Seat Occupancy</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.occupancyPercentage}%</p>
          <span className="text-[10px] text-slate-500">{summary.bookedSeatsInventory}/{summary.totalSeatsInventory} seats</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-blue-500 uppercase block">Upcoming Trips</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.upcomingTrips}</p>
          <span className="text-[10px] text-slate-500">Future scheduled runs</span>
        </div>
      </div>

      {/* Infrastructure Aggregate Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Operators</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.totalOperators}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Fleet Buses</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.totalBuses}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Stops & Terminals</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.totalStops}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Route Corridors</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.totalRoutes}</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Booking Volume Trends</h3>
              <p className="text-xs text-slate-500">Confirmed vs. Cancelled bookings over past 7 days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrends?.length > 0 ? bookingTrends : [{ date: 'Today', confirmed: summary.confirmedBookings, cancelled: summary.cancelledBookings }]}>
                <defs>
                  <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="confirmed" stroke="#10b981" fillOpacity={1} fill="url(#colorConfirmed)" name="Confirmed" />
                <Area type="monotone" dataKey="cancelled" stroke="#f43f5e" fill="#fecdd3" name="Cancelled" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Booking Status Ratio</h3>
            <p className="text-xs text-slate-500">Confirmed versus Cancelled tickets</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-emerald-500 font-bold block">● Confirmed</span>
              <span className="font-black text-sm">{summary.confirmedBookings}</span>
            </div>
            <div>
              <span className="text-rose-500 font-bold block">● Cancelled</span>
              <span className="font-black text-sm">{summary.cancelledBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route-Wise Booking Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Route-Wise Passenger Bookings</h3>
          <p className="text-xs text-slate-500">Confirmed bookings categorized by major operating corridors</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="route" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('to')[0] || val} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Confirmed Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

