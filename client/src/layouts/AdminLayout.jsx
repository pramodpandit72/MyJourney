import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardShell } from './DashboardShell.jsx';
import {
  BarChart3,
  Building2,
  Bus,
  MapPin,
  GitFork,
  Calendar,
  Ticket,
  Scale,
  FileBarChart2,
  History,
  Settings,
  ShieldCheck
} from 'lucide-react';

export const AdminLayout = () => {
  const { user } = useAuth();
  const isSuperAdmin = (user?.assignedState || 'ALL') === 'ALL';

  const navItems = [
    { label: 'Overview', path: '/admin', icon: BarChart3 },
    {
      label: isSuperAdmin ? 'State Admins' : `${user?.assignedState || 'My State'} Admin`,
      path: '/admin/state-admins',
      icon: ShieldCheck
    },
    { label: 'Operators', path: '/admin/operators', icon: Building2 },
    { label: 'Buses', path: '/admin/buses', icon: Bus },
    { label: 'Stops', path: '/admin/stops', icon: MapPin },
    { label: 'Routes', path: '/admin/routes', icon: GitFork },
    { label: 'Trips & Schedules', path: '/admin/trips', icon: Calendar },
    { label: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Cancellation Policy', path: '/admin/policy', icon: Scale },
    { label: 'Reports', path: '/admin/reports', icon: FileBarChart2 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: isSuperAdmin ? 'Privacy & Settings' : 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <DashboardShell
      portalLabel={isSuperAdmin ? 'National Super Admin' : `${user?.assignedState || 'State'} Transport Admin`}
      roleBadge={isSuperAdmin ? 'Super Administrator' : `${user?.assignedState} Admin`}
      navItems={navItems}
      rootPath="/admin"
    />
  );
};
