import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  StatCard,
  Card,
  CardContent,
  Button,
  LoadingSkeleton,
  ErrorState
} from '../../components/ui/index.js';
import { Bus, Calendar, Users, Percent, ArrowRight } from 'lucide-react';

export const OperatorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/operator/dashboard');
      setSummary(res?.data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load operator dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
          Fleet Operations
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
          Assigned Service Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
          Real-time manifest counts, seat occupancy reconciliation, and upcoming departures.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Trips"
          value={summary?.assignedTripsCount || 0}
          subtext="Total assigned scheduled runs"
          icon={Bus}
          tone="aqua"
        />
        <StatCard
          label="Today's Departures"
          value={summary?.todaysTripsCount || 0}
          subtext="Trips departing today (IST)"
          icon={Calendar}
          tone="warning"
        />
        <StatCard
          label="Confirmed Passengers"
          value={summary?.totalConfirmedPassengers || 0}
          subtext="Checked across active bookings"
          icon={Users}
          tone="green"
        />
        <StatCard
          label="Seat Occupancy"
          value={`${summary?.occupancyRate || 0}%`}
          subtext={`${summary?.bookedInventorySeats || 0} / ${summary?.totalInventorySeats || 0} seats booked`}
          icon={Percent}
          tone="success"
        />
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex flex-col justify-between gap-4 h-full">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#14532D] dark:text-[#F0FDF4]">
                Trip Passenger Manifests
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1E7D8] leading-relaxed">
                Generate and print the verified passenger manifest for any assigned departure. Verify boarding passengers against seat numbers and unique PNR records.
              </p>
            </div>
            <div>
              <Link to="/operator/manifests">
                <Button variant="primary">
                  <span>Open Passenger Manifest</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-4 h-full">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#14532D] dark:text-[#F0FDF4]">
                Occupancy Reconciliation Report
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1E7D8] leading-relaxed">
                Review trip-by-trip seat utilization. Check confirmed bookings, available seats, and load factors across all operating routes.
              </p>
            </div>
            <div>
              <Link to="/operator/occupancy">
                <Button variant="secondary">
                  <span>View Occupancy Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
