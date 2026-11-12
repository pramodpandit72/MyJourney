import React from 'react';
import { DashboardShell } from './DashboardShell.jsx';
import { BarChart3, Calendar, Users, ClipboardList } from 'lucide-react';

export const OperatorLayout = () => {
  const navItems = [
    { label: 'Overview', path: '/operator', icon: BarChart3 },
    { label: 'Assigned Trips & Schedules', path: '/operator/schedules', icon: Calendar },
    { label: 'Passenger Manifests', path: '/operator/manifests', icon: Users },
    { label: 'Occupancy Reports', path: '/operator/occupancy', icon: ClipboardList }
  ];

  return (
    <DashboardShell
      portalLabel="Operator Portal"
      roleBadge="Fleet Staff"
      navItems={navItems}
      rootPath="/operator"
    />
  );
};
