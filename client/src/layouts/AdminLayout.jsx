import React from 'react';
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
  Settings
} from 'lucide-react';

export const AdminLayout = () => {
  const navItems = [
    { label: 'Overview', path: '/admin', icon: BarChart3 },
    { label: 'Operators', path: '/admin/operators', icon: Building2 },
    { label: 'Buses', path: '/admin/buses', icon: Bus },
    { label: 'Stops', path: '/admin/stops', icon: MapPin },
    { label: 'Routes', path: '/admin/routes', icon: GitFork },
    { label: 'Trips & Schedules', path: '/admin/trips', icon: Calendar },
    { label: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Cancellation Policy', path: '/admin/policy', icon: Scale },
    { label: 'Reports', path: '/admin/reports', icon: FileBarChart2 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <DashboardShell
      portalLabel="Admin Portal"
      roleBadge="Administrator"
      navItems={navItems}
      rootPath="/admin"
    />
  );
};
