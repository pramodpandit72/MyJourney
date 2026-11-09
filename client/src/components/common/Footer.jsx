import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, ShieldCheck, PhoneCall, Mail, MapPin, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Yatra<span className="text-blue-400">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified public-service transport booking and fleet operations portal. Providing seamless intercity bus ticket reservation, real-time seat inventory, and transparent operations management.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 256-Bit Encrypted Bookings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-blue-400 transition-colors">Search Bus Routes</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-blue-400 transition-colors">Download Ticket / Check PNR</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Staff & Operator Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Major Routes */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Popular Corridors</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Delhi ⇄ Jaipur Express</li>
              <li>Chandigarh ⇄ Delhi ISBT</li>
              <li>Amritsar ⇄ Ludhiana Central</li>
              <li>Delhi ⇄ Agra Taj Expressway</li>
              <li>Jalandhar ⇄ Chandigarh Shuttle</li>
            </ul>
          </div>

          {/* Contact / Academic Demo Info */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Demo Support & Info</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>ALGIONS AI LABS, New Delhi, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Toll-Free Helpline: 1800-11-2048</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>support@yatrasetu.demo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Academic Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} YatraSetu. All rights reserved.</p>
          <div className="p-2 rounded bg-slate-800/80 text-amber-300 font-medium text-[11px] text-center border border-slate-700/60">
            ⚠️ Independent academic demonstration project for ALGIONS AI LABS PRIVATE LIMITED placement evaluation. Not an official government website.
          </div>
        </div>
      </div>
    </footer>
  );
};

