import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { BusSearchForm } from '../../components/forms/BusSearchForm.jsx';
import { Button, Card, CardContent, StatusBadge, LoadingSkeleton } from '../../components/ui/index.js';
import {
  Clock,
  ArrowRight,
  Ticket,
  IndianRupee,
  Armchair,
  FileCheck2,
  ShieldCheck,
  Info,
  Bus,
  CheckCircle2,
  MapPin
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get('/trips');
        const trips = res?.data?.trips || [];

        // Deduplicate by route corridor to showcase unique popular routes from real backend data
        const routeMap = new Map();
        trips.forEach((trip) => {
          const rId = trip.route?._id;
          if (!rId) return;
          const existing = routeMap.get(rId);
          if (!existing || trip.farePerPassenger < existing.startingFare) {
            const nameParts = (trip.route.routeName || '').split(' to ');
            const originLabel =
              trip.boardingStop?.stopId?.city ||
              trip.boardingStop?.stopId?.name ||
              nameParts[0] ||
              'Origin';
            const destLabel =
              trip.droppingStop?.stopId?.city ||
              trip.droppingStop?.stopId?.name ||
              nameParts[1] ||
              'Destination';

            routeMap.set(rId, {
              routeId: rId,
              routeName: trip.route.routeName,
              routeCode: trip.route.routeCode,
              origin: originLabel,
              destination: destLabel,
              originStopId: trip.boardingStop?.stopId?._id || trip.boardingStop?.stopId,
              destinationStopId: trip.droppingStop?.stopId?._id || trip.droppingStop?.stopId,
              duration: trip.duration,
              startingFare: trip.farePerPassenger,
              busType: trip.bus?.busType,
              travelDate: trip.departureAt ? new Date(trip.departureAt).toISOString().split('T')[0] : ''
            });
          }
        });

        setPopularRoutes(Array.from(routeMap.values()).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch popular routes:', err);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleRouteSearch = (route) => {
    const params = new URLSearchParams();
    if (route.originStopId) params.set('originStopId', route.originStopId);
    if (route.destinationStopId) params.set('destinationStopId', route.destinationStopId);
    if (route.travelDate) params.set('travelDate', route.travelDate);
    navigate(`/search?${params.toString()}`);
  };

  const benefits = [
    {
      icon: Ticket,
      title: 'Easy Online Booking',
      desc: 'Search routes, check real-time bus availability, and reserve seats in a streamlined four-step workflow.',
      tone: 'bg-[#DCFCE7] text-[#166534] dark:bg-[#234B35] dark:text-[#4ADE80]'
    },
    {
      icon: IndianRupee,
      title: 'Transparent Pricing',
      desc: 'Segment-based fares calculated cleanly by boarding and dropping stops with itemized GST and service breakdown.',
      tone: 'bg-[#CCFBF1] text-[#0F766E] dark:bg-[#134E4A] dark:text-[#5EEAD4]'
    },
    {
      icon: Armchair,
      title: 'Convenient Seat Selection',
      desc: 'Interactive seat map backed by ACID transaction locks so selected seats are never double-booked.',
      tone: 'bg-[#DCFCE7] text-[#166534] dark:bg-[#234B35] dark:text-[#4ADE80]'
    },
    {
      icon: FileCheck2,
      title: 'Digital Ticket Management',
      desc: 'Receive an instant unique PNR, print official travel documents, or cancel tickets with transparent refund rules.',
      tone: 'bg-[#CCFBF1] text-[#0F766E] dark:bg-[#134E4A] dark:text-[#5EEAD4]'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Search Your Journey',
      desc: 'Choose your origin, destination terminal, and travel date from verified public bus corridors.'
    },
    {
      step: '02',
      title: 'Choose Your Bus',
      desc: 'Compare departure times, vehicle categories, boarding points, and segment fares side by side.'
    },
    {
      step: '03',
      title: 'Select Your Seat',
      desc: 'Pick available window or aisle seats directly on the live coach layout and enter passenger details.'
    },
    {
      step: '04',
      title: 'Confirm Your Booking',
      desc: 'Complete your reservation to receive an instant digital ticket with a verifiable PNR.'
    }
  ];

  const travelInfo = [
    {
      title: 'Boarding & Photo Identification',
      desc: 'Passengers must report at the designated boarding stop at least 15 minutes prior to scheduled departure and carry a valid government photo ID alongside their digital or printed MyJourney ticket.'
    },
    {
      title: 'Structured Cancellation & Refunds',
      desc: 'Cancellations are governed by deterministic time-window tiers configured by operations administration. Refund eligibility is automatically computed upon cancellation before departure.'
    },
    {
      title: 'Authorized Fleets & Timetables',
      desc: 'All trips, stops, and fare tables displayed on MyJourney are synchronized directly with registered transport operators and state corridor schedules in Asia/Kolkata (IST) standard time.'
    },
    {
      title: 'Passenger Assistance & Accessibility',
      desc: 'Need itinerary help or cancellation support? Reach our passenger helpdesk at 1800-11-2048 or browse our Help & Support guidelines before you travel.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* SECTION 1 & 2: HERO + PROMINENT BUS SEARCH PANEL */}
      <section className="bg-[#F0FDF4] dark:bg-[#10231B] border-b border-[#DCE7DF] dark:border-[#294A38] pt-10 pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#CCFBF1] dark:bg-[#134E4A] border border-[#0F766E]/25 dark:border-[#5EEAD4]/25 text-[#0F766E] dark:text-[#5EEAD4] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Your Journey. Your Comfort. Your Destination.</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14532D] dark:text-[#F0FDF4] leading-tight">
                Travel Smarter.{' '}
                <span className="text-[#0F766E] dark:text-[#5EEAD4]">Travel Better.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#475569] dark:text-[#D1E7D8] max-w-2xl leading-relaxed">
                Discover routes, compare bus services, select your preferred seats, and book your journey with MyJourney.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#172B24] dark:text-[#D1E7D8] font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                  Verified Intercity Operators
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                  Live Seat Inventory
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                  Instant Digital PNR
                </span>
              </div>
            </div>

            {/* Clean Restrained Public Transport SVG Graphic */}
            <div className="lg:col-span-5 hidden sm:flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl p-5 shadow-xs">
                <svg
                  viewBox="0 0 360 175"
                  className="w-full h-auto"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="MyJourney Intercity Transit Corridor Illustration"
                >
                  {/* Soft backdrop */}
                  <rect width="360" height="175" rx="8" className="fill-[#F0FDF4] dark:fill-[#10231B]" />
                  {/* Route Line */}
                  <path
                    d="M36 138 H324"
                    stroke="#0F766E"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    strokeOpacity="0.45"
                  />
                  {/* Origin & Destination Pins */}
                  <circle cx="48" cy="138" r="6" fill="#166534" />
                  <circle cx="48" cy="138" r="2.5" fill="#FFFFFF" />
                  <circle cx="312" cy="138" r="6" fill="#0F766E" />
                  <circle cx="312" cy="138" r="2.5" fill="#FFFFFF" />

                  {/* Clean Intercity Coach Silhouette */}
                  <rect x="86" y="48" width="188" height="72" rx="10" fill="#166534" />
                  <rect x="94" y="56" width="172" height="32" rx="4" fill="#DCFCE7" />
                  {/* Coach Windows */}
                  <line x1="132" y1="56" x2="132" y2="88" stroke="#166534" strokeWidth="2.5" />
                  <line x1="170" y1="56" x2="170" y2="88" stroke="#166534" strokeWidth="2.5" />
                  <line x1="208" y1="56" x2="208" y2="88" stroke="#166534" strokeWidth="2.5" />
                  <line x1="242" y1="56" x2="242" y2="88" stroke="#166534" strokeWidth="2.5" />
                  {/* Aqua Accent Stripe */}
                  <rect x="86" y="96" width="188" height="6" fill="#0F766E" />
                  <rect x="86" y="102" width="188" height="3" fill="#5EEAD4" />
                  {/* Wheels */}
                  <circle cx="126" cy="122" r="13" fill="#172B24" />
                  <circle cx="126" cy="122" r="5" fill="#DCE7DF" />
                  <circle cx="234" cy="122" r="13" fill="#172B24" />
                  <circle cx="234" cy="122" r="5" fill="#DCE7DF" />
                  {/* Labels */}
                  <text x="34" y="158" fontSize="10" fontWeight="600" className="fill-[#14532D] dark:fill-[#D1E7D8]">
                    ORIGIN
                  </text>
                  <text x="278" y="158" fontSize="10" fontWeight="600" className="fill-[#0F766E] dark:fill-[#5EEAD4]">
                    DESTINATION
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Panel */}
          <BusSearchForm />
        </div>
      </section>

      {/* SECTION 3: POPULAR ROUTES (REAL BACKEND DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
          <div>
            <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
              Active Corridors
            </span>
            <h2 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-1">
              Popular Bus Routes
            </h2>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] dark:text-[#4ADE80] hover:underline"
          >
            <span>Browse All Scheduled Trips</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingRoutes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <LoadingSkeleton key={n} rows={2} />
            ))}
          </div>
        ) : popularRoutes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-xs text-[#475569] dark:text-[#A7C4B0]">
              No scheduled corridors are currently active. Use the search form above to check upcoming dates.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularRoutes.map((route) => (
              <Card key={route.routeId} hoverable className="flex flex-col justify-between">
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <StatusBadge variant="aqua">{route.routeCode}</StatusBadge>
                      <span className="text-[11px] font-medium text-[#64748B] dark:text-[#A7C4B0] truncate">
                        {route.busType || 'Intercity Express'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
                        <MapPin className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80] shrink-0" />
                        <span className="truncate">{route.origin}</span>
                      </div>
                      <div className="pl-1.5 border-l-2 border-dashed border-[#DCE7DF] dark:border-[#294A38] ml-1.5 py-1 text-[11px] text-[#64748B] dark:text-[#A7C4B0] flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Approx. {route.duration || 'Scheduled Run'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
                        <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4] shrink-0" />
                        <span className="truncate">{route.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-[#DCE7DF] dark:border-[#294A38] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0] block">
                        Starting Fare
                      </span>
                      <span className="text-lg font-bold text-[#166534] dark:text-[#4ADE80]">
                        ₹{route.startingFare}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleRouteSearch(route)}>
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: WHY MYJOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Portal Standards
          </span>
          <h2 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-1">
            Why MyJourney?
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0] mt-1">
            Built for dependable public transit reservations with clear pricing and verified seat allocations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Card key={i}>
                <CardContent className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${b.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">{b.title}</h3>
                  <p className="text-xs text-[#475569] dark:text-[#A7C4B0] leading-relaxed">
                    {b.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="bg-[#F0FDF4] dark:bg-[#10231B] border-y border-[#DCE7DF] dark:border-[#294A38] py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
              Booking Workflow
            </span>
            <h2 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-1">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl p-5 flex md:flex-col items-start gap-4 md:gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-[#166534] dark:bg-[#234B35] text-white dark:text-[#4ADE80] font-bold text-sm flex items-center justify-center shrink-0 font-mono">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4] mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#A7C4B0] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: TRAVEL INFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-5 h-5 text-[#0F766E] dark:text-[#5EEAD4]" />
          <h2 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
            Important Travel Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {travelInfo.map((info, i) => (
            <Card key={i}>
              <CardContent className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">
                  {info.title}
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#A7C4B0] leading-relaxed">
                  {info.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 7: CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#14532D] dark:bg-[#162B22] border border-[#166534] dark:border-[#294A38] rounded-xl p-7 sm:p-10 text-[#F0FDF4] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#5EEAD4]">
              <Bus className="w-4 h-4" />
              <span>Ready for Your Next Trip?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Plan Your Intercity Journey with Confidence
            </h2>
            <p className="text-xs sm:text-sm text-[#D1E7D8]">
              Search active routes, check live coach layouts, and get instant PNR confirmations across verified public transport operators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="aqua"
              size="lg"
              onClick={() => navigate('/search')}
              className="font-semibold"
            >
              <span>Search Buses</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/my-bookings">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-[#4ADE80]/40 text-[#F0FDF4] hover:bg-[#1C382C]"
              >
                Manage Bookings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
