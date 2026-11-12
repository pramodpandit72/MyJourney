import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../ui/BrandLogo.jsx';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#14532D] dark:bg-[#0B1712] text-[#D1E7D8] border-t border-[#166534] dark:border-[#294A38] print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <BrandLogo size="md" variant="light" subtitle="Your Journey. Your Comfort. Your Destination." />
            <p className="text-xs text-[#D1E7D8] leading-relaxed">
              A unified public transportation and intercity bus reservation portal designed for transparent scheduling, reliable seat selection, and digital ticket management.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#5EEAD4] font-medium bg-[#1C382C]/60 px-3 py-1.5 rounded-lg border border-[#294A38]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Reservations & Instant PNR</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#F0FDF4] text-xs font-bold uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-[#5EEAD4] transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#5EEAD4] transition-colors">
                  Search Bus Routes
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-[#5EEAD4] transition-colors">
                  My Bookings & PNR Status
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#5EEAD4] transition-colors">
                  About MyJourney
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <h4 className="text-[#F0FDF4] text-xs font-bold uppercase tracking-wider mb-4">
              Support & Booking Info
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/help" className="hover:text-[#5EEAD4] transition-colors">
                  Help & Travel Guidelines
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#5EEAD4] transition-colors">
                  Contact Passenger Desk
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#5EEAD4] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#5EEAD4] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-[#F0FDF4] text-xs font-bold uppercase tracking-wider mb-4">
              Contact Information
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#5EEAD4] shrink-0 mt-0.5" />
                <span>Transport Operations Hub, Connaught Place, New Delhi — 110001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#5EEAD4] shrink-0" />
                <span>Helpline: 1800-11-2048 (Toll-Free)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#5EEAD4] shrink-0" />
                <span>support@myjourney.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Mandatory Academic Disclaimer */}
        <div className="mt-10 pt-6 border-t border-[#294A38] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A7C4B0]">
          <p>© {new Date().getFullYear()} MyJourney Portal. All rights reserved.</p>
          <p className="px-3 py-1.5 rounded-lg bg-[#10231B] border border-[#294A38] text-[#D1E7D8] text-[11px] text-center">
            MyJourney is an independent academic project and is not an official government website.
          </p>
        </div>
      </div>
    </footer>
  );
};
