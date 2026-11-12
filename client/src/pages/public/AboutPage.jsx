import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Breadcrumb, Button } from '../../components/ui/index.js';
import { ShieldCheck, Bus, Users, Clock, ArrowRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      <div className="space-y-3">
        <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
          About MyJourney
        </span>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
          Public Transport Booking & Fleet Operations Portal
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#D1E7D8] leading-relaxed max-w-3xl">
          MyJourney is a full-stack intercity bus reservation and operations management platform engineered to deliver clear passenger booking workflows, ACID-compliant seat allocation, and transparent fleet administration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
              Unified Route Network
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#A7C4B0] leading-relaxed">
              Supports multi-stop route corridors with segment-level boarding and dropping fare calculations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
              Transactional Integrity
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#A7C4B0] leading-relaxed">
              Backed by MongoDB replica-set transactions to eliminate double-bookings and preserve accurate seat counts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
              Role-Based Governance
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#A7C4B0] leading-relaxed">
              Dedicated portals for Customers, Fleet Operators, and Transport Administrators with audited action logs.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#F0FDF4] dark:bg-[#10231B]">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
              <span>Academic Demonstration Notice</span>
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#D1E7D8]">
              MyJourney is developed for full-stack engineering evaluation at ALGIONS AI LABS PRIVATE LIMITED and is not an official government website.
            </p>
          </div>
          <Link to="/search" className="shrink-0">
            <Button variant="primary" size="sm">
              <span>Search Buses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

