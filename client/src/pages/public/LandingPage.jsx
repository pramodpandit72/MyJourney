import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BusSearchForm } from '../../components/forms/BusSearchForm.jsx';
import {
  ShieldCheck,
  Zap,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const featuredRoutes = [
    {
      from: 'Delhi ISBT',
      to: 'Jaipur Sindhi Camp',
      duration: '5h 30m',
      startingFare: '₹750',
      type: 'Volvo AC Multi-Axle'
    },
    {
      from: 'Chandigarh Sec 43',
      to: 'Delhi ISBT',
      duration: '4h 45m',
      startingFare: '₹550',
      type: 'Deluxe Express'
    },
    {
      from: 'Amritsar ISBT',
      to: 'Ludhiana Central',
      duration: '2h 45m',
      startingFare: '₹320',
      type: 'AC Seater'
    },
    {
      from: 'Delhi Sarai Kale Khan',
      to: 'Agra Idgah',
      duration: '3h 30m',
      startingFare: '₹450',
      type: 'Deluxe AC'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5eead4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Official Public Transport Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Your Journey, <span className="text-teal-400">Made Simple.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Book verified intercity buses across state transport corporations and authorized operators with real-time seat locks and instant digital tickets.
            </p>
          </div>

          {/* Search Card Container */}
          <div className="max-w-5xl mx-auto">
            <BusSearchForm />
          </div>

          {/* Trust stats beneath search */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center border-t border-emerald-900/40 pt-8">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">ACID Seat Integrity</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">0%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Double Bookings</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">24/7</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Digital PNR Access</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">Instant</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Simulated Refunds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Corridors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              High-Frequency Routes
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Intercity Corridors
            </h2>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center space-x-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-teal-600 hover:underline"
          >
            <span>View All Schedules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredRoutes.map((route, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {route.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {route.from}
                </h3>
                <div className="flex items-center space-x-2 my-2 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {route.to}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration: {route.duration}</span>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Fares From</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{route.startingFare}</span>
                </div>
                <button
                  onClick={() => navigate('/search')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white text-xs font-bold transition-all"
                >
                  Book Seat
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Effortless Booking
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              How YatraSetu Works in 4 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Search Route',
                desc: 'Select your origin and destination stops along with your travel date to view all verified buses.'
              },
              {
                step: '02',
                title: 'Select Seat',
                desc: 'Pick your preferred window or aisle seat using our visual layout with live availability check.'
              },
              {
                step: '03',
                title: 'Enter Passengers',
                desc: 'Fill in the passenger name and contact details with automated age and seat allocation validation.'
              },
              {
                step: '04',
                title: 'Receive Ticket',
                desc: 'Instant booking confirmation with unique PNR, printable ticket view, and anytime cancellation.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative"
              >
                <div className="text-3xl font-black text-emerald-600/30 dark:text-emerald-400/20 mb-3 font-mono">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose YatraSetu */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Institutional Reliability
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 mb-6">
              Why Commuters & Operators Trust YatraSetu
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Strict Concurrency & Seat Locking',
                  desc: 'MongoDB ACID transactions prevent race conditions. Two customers can never double-book the same seat.'
                },
                {
                  title: 'Transparent Distance-Based Fares',
                  desc: 'Fares are computed accurately according to intermediate boarding and dropping stop segments.'
                },
                {
                  title: 'Configurable Refund Thresholds',
                  desc: 'Transparent cancellation policies with real-time simulated refund calculation based on departure proximity.'
                },
                {
                  title: 'Full Operator Manifests & Audit Logs',
                  desc: 'Role-based access controls let bus operators view assigned manifests while admins monitor full system health.'
                }
              ].map((feat, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-8 text-white shadow-xl border border-emerald-800/50">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Full-Stack Security & Compliance</h3>
                  <p className="text-xs text-teal-200">Role-based controls & HttpOnly JWT tokens</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Designed to institutional standards with Helmet security headers, express rate-limiting on sensitive endpoints, and strict validation via Zod on both client and server.
              </p>

              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs space-y-2">
                <div className="flex justify-between text-slate-300 font-mono">
                  <span>Audit Event Tracking</span>
                  <span className="text-teal-400">ENABLED</span>
                </div>
                <div className="flex justify-between text-slate-300 font-mono">
                  <span>Replica-Set Transactions</span>
                  <span className="text-teal-400">ACTIVE</span>
                </div>
                <div className="flex justify-between text-slate-300 font-mono">
                  <span>Timezone Normalization</span>
                  <span className="text-teal-400">ASIA/KOLKATA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
