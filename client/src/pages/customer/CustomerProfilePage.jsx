import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  StatCard
} from '../../components/ui/index.js';
import { User, Mail, Phone, Shield, Ticket, CheckCircle2, XCircle, Search } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, isAdmin, isOperator } = useAuth();
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/bookings/my');
        const list = res?.data?.bookings || [];
        setStats({
          total: list.length,
          confirmed: list.filter((b) => b.status === 'CONFIRMED').length,
          cancelled: list.filter((b) => b.status === 'CANCELLED').length
        });
      } catch (err) {
        console.error('Failed to fetch profile booking summary:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'My Profile' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Account Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-1">
            Passenger Profile
          </h1>
        </div>

        <Link to="/search">
          <Button variant="primary" size="sm">
            <Search className="w-4 h-4" />
            <span>Book New Trip</span>
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          subtext="All reservation records"
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Confirmed Tickets"
          value={stats.confirmed}
          subtext="Active PNR bookings"
          icon={CheckCircle2}
          tone="aqua"
        />
        <StatCard
          label="Cancelled Tickets"
          value={stats.cancelled}
          subtext="Refunds processed"
          icon={XCircle}
          tone="error"
        />
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                  Full Name
                </p>
                <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">{user?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                  Email Address
                </p>
                <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">{user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                  Mobile Number
                </p>
                <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                  {user?.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6F1] dark:bg-[#1C382C] text-[#475569] dark:text-[#D1E7D8] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#A7C4B0] uppercase">
                  Portal Role
                </p>
                <div className="mt-1">
                  <StatusBadge variant="success">{user?.role || 'CUSTOMER'}</StatusBadge>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE7DF] dark:border-[#294A38] flex flex-wrap gap-3">
            <Link to="/my-bookings">
              <Button variant="secondary" size="sm">View My Bookings</Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="aqua" size="sm">Open Admin Dashboard</Button>
              </Link>
            )}
            {isOperator && (
              <Link to="/operator">
                <Button variant="aqua" size="sm">Open Operator Dashboard</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

