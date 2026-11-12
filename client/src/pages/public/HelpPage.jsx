import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Breadcrumb, Button } from '../../components/ui/index.js';
import { HelpCircle, Ticket, Scale, ShieldCheck, PhoneCall } from 'lucide-react';

export const HelpPage = () => {
  const faqs = [
    {
      q: 'How do I book a bus seat on MyJourney?',
      a: 'Use the Search panel on the Home or Search Buses page to choose your origin stop, destination stop, travel date, and passenger count. Select a trip, pick available green seats from the coach layout, enter passenger details, and confirm to receive an instant PNR ticket.'
    },
    {
      q: 'Where can I view or print my confirmed ticket?',
      a: 'Sign in and visit "My Bookings" from the top navigation bar. Click "View Ticket" next to any PNR to open the printable official travel document.'
    },
    {
      q: 'How does cancellation and simulated refund calculation work?',
      a: 'You can cancel a confirmed booking before the scheduled departure time from My Bookings or the Ticket page. The server computes the refund percentage deterministically based on active time-before-departure policy tiers.'
    },
    {
      q: 'What identification is required when boarding?',
      a: 'Passengers should carry a valid photo ID (Aadhaar, PAN, Driving Licence, or Passport) along with their MyJourney PNR ticket and arrive at the boarding terminal 15 minutes prior to departure.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Help & Support' }]} />

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
          Passenger Support Center
        </span>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
          Help, Booking & Cancellation Guidelines
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#D1E7D8]">
          Answers to common questions about reservations, seat locking, digital PNRs, and cancellations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="space-y-2">
            <Ticket className="w-5 h-5 text-[#166534] dark:text-[#4ADE80]" />
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">PNR & E-Tickets</h3>
            <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
              Every booking generates a unique alphanumeric PNR accessible anytime under My Bookings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <Scale className="w-5 h-5 text-[#0F766E] dark:text-[#5EEAD4]" />
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">Transparent Refunds</h3>
            <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
              Simulated refunds follow active administrative cancellation tiers computed in real time.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#166534] dark:text-[#4ADE80]" />
            <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">Seat Safety</h3>
            <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
              Atomic seat inventory locks guarantee that confirmed seats belong exclusively to your booking.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#14532D] dark:text-[#F0FDF4] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0F766E] dark:text-[#5EEAD4]" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">{item.q}</h3>
                <p className="text-xs text-[#475569] dark:text-[#D1E7D8] leading-relaxed">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-[#F0FDF4] dark:bg-[#10231B]">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
                Need Additional Assistance?
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
                Contact our support desk at 1800-11-2048 or send an inquiry online.
              </p>
            </div>
          </div>
          <Link to="/contact">
            <Button variant="primary" size="sm">Contact Support</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

