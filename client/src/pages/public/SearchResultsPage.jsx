import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { BusSearchForm } from '../../components/forms/BusSearchForm.jsx';
import { SeatMap } from '../../components/seats/SeatMap.jsx';
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  StatusBadge,
  Modal,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
  Select
} from '../../components/ui/index.js';
import {
  Bus,
  Filter,
  AlertCircle,
  Loader2,
  Armchair,
  CreditCard,
  UserCheck,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const originStopId = searchParams.get('originStopId') || '';
  const destinationStopId = searchParams.get('destinationStopId') || '';
  const travelDate = searchParams.get('travelDate') || '';
  const passengerCountParam = Number(searchParams.get('passengers')) || 1;

  // Search results state
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedBusType, setSelectedBusType] = useState('ALL');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('ALL');
  const [maxFare, setMaxFare] = useState(2500);
  const [sortBy, setSortBy] = useState('departureAt');
  const [sortOrder, setSortOrder] = useState('asc');

  // Booking Modal State
  const [activeTrip, setActiveTrip] = useState(null);
  const [seatLayoutData, setSeatLayoutData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (travelDate) params.append('travelDate', travelDate);
      if (originStopId) params.append('originStopId', originStopId);
      if (destinationStopId) params.append('destinationStopId', destinationStopId);

      const res = await api.get(`/trips?${params.toString()}`);
      setTrips(res?.data?.trips || []);
    } catch (err) {
      setError(err.message || 'Failed to search available buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [originStopId, destinationStopId, travelDate]);

  const handleOpenSeatSelection = async (trip) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to select seats and confirm your booking.');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    setActiveTrip(trip);
    setSelectedSeats([]);
    setPassengers([]);
    setBookingError('');
    setLoadingSeats(true);

    try {
      const res = await api.get(`/trips/${trip._id}/seats`);
      setSeatLayoutData(res?.data || null);
    } catch (err) {
      setBookingError('Could not load current seat inventory: ' + (err.message || ''));
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatToggle = (seatNumber) => {
    setBookingError('');
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
      setPassengers((prev) => prev.filter((p) => p.seatNumber !== seatNumber));
    } else {
      if (selectedSeats.length >= 6) {
        setBookingError('Maximum 6 seats per booking transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
      setPassengers((prev) => [
        ...prev,
        {
          name: prev.length === 0 ? user?.name || '' : '',
          age: '',
          gender: 'MALE',
          seatNumber,
          phone: prev.length === 0 ? user?.phone || '' : '',
          email: prev.length === 0 ? user?.email || '' : ''
        }
      ]);
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (selectedSeats.length === 0) {
      setBookingError('Please select at least one seat.');
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.name.trim().length < 2) {
        setBookingError(`Please enter a valid name for passenger assigned to Seat ${p.seatNumber}.`);
        return;
      }
      if (!p.age || isNaN(p.age) || Number(p.age) < 1 || Number(p.age) > 120) {
        setBookingError(`Please enter a valid age (1–120) for passenger on Seat ${p.seatNumber}.`);
        return;
      }
    }

    setBookingLoading(true);
    try {
      const payload = {
        tripId: activeTrip._id,
        boardingStopId: activeTrip.boardingStop?.stopId?._id || activeTrip.boardingStop?.stopId || originStopId,
        droppingStopId: activeTrip.droppingStop?.stopId?._id || activeTrip.droppingStop?.stopId || destinationStopId,
        passengers: passengers.map((p) => ({
          ...p,
          age: Number(p.age)
        })),
        seatNumbers: selectedSeats
      };

      const res = await api.post('/bookings', payload);
      if (res?.data?.booking?.pnr) {
        toast.success(`Booking confirmed! PNR: ${res.data.booking.pnr}`);
        navigate(`/ticket/${res.data.booking.pnr}?confirmed=true`);
      }
    } catch (err) {
      if (err.code === 'SEAT_UNAVAILABLE' || err.statusCode === 409) {
        setBookingError('One or more selected seats were just booked by another passenger. Seat map refreshed.');
        try {
          const seatRes = await api.get(`/trips/${activeTrip._id}/seats`);
          setSeatLayoutData(seatRes?.data || null);
          setSelectedSeats([]);
          setPassengers([]);
        } catch (e) {}
      } else {
        setBookingError(err.message || 'Booking confirmation failed. Please check your details.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredTrips = trips
    .filter((trip) => {
      if (selectedBusType !== 'ALL' && trip.bus?.busType !== selectedBusType) return false;
      if (trip.farePerPassenger > maxFare) return false;

      if (selectedTimeOfDay !== 'ALL') {
        const depHour = new Date(trip.departureAt).getHours();
        if (selectedTimeOfDay === 'MORNING' && (depHour < 6 || depHour >= 12)) return false;
        if (selectedTimeOfDay === 'AFTERNOON' && (depHour < 12 || depHour >= 18)) return false;
        if (selectedTimeOfDay === 'EVENING' && (depHour < 18 || depHour >= 23)) return false;
        if (selectedTimeOfDay === 'NIGHT' && depHour >= 6 && depHour < 23) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'departureAt') {
        const tA = new Date(a.departureAt).getTime();
        const tB = new Date(b.departureAt).getTime();
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      }
      if (sortBy === 'fare') {
        return sortOrder === 'asc'
          ? a.farePerPassenger - b.farePerPassenger
          : b.farePerPassenger - a.farePerPassenger;
      }
      if (sortBy === 'availableSeats') {
        return sortOrder === 'asc'
          ? a.availableSeatsCount - b.availableSeatsCount
          : b.availableSeatsCount - a.availableSeatsCount;
      }
      return 0;
    });

  const formatTimeIST = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

  const formatDateIST = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const resetFilters = () => {
    setSelectedBusType('ALL');
    setSelectedTimeOfDay('ALL');
    setMaxFare(2500);
    setSortBy('departureAt');
    setSortOrder('asc');
  };

  const baseSelectedTotal = activeTrip ? selectedSeats.length * activeTrip.farePerPassenger : 0;
  const gstAmount = Math.round(baseSelectedTotal * 0.05);
  const serviceFee = selectedSeats.length > 0 ? 20 : 0;
  const grandTotal = baseSelectedTotal + gstAmount + serviceFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Search Buses' }]} />

      {/* Top Search Edit Bar */}
      <BusSearchForm
        initialValues={{
          originStopId,
          destinationStopId,
          travelDate,
          passengers: passengerCountParam
        }}
      />

      {/* Mobile Collapsible Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setMobileFiltersOpen((o) => !o)}
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#166534] dark:text-[#4ADE80]" />
            <span>Filters & Sorting</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar */}
        <aside className={`lg:col-span-3 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-[#DCE7DF] dark:border-[#294A38]">
                <h2 className="font-bold text-[#14532D] dark:text-[#F0FDF4] text-sm flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
                  <span>Filters & Sort</span>
                </h2>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#166534] dark:text-[#4ADE80] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <Select
                id="sort-trips"
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="departureAt">Departure Time (Earliest)</option>
                <option value="fare">Fare (Lowest First)</option>
                <option value="availableSeats">Available Seats</option>
              </Select>

              {/* Departure Window */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider">
                  Departure Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ALL', label: 'All Times' },
                    { id: 'MORNING', label: 'Morning (6–12)' },
                    { id: 'AFTERNOON', label: 'Afternoon (12–18)' },
                    { id: 'EVENING', label: 'Evening (18–23)' },
                    { id: 'NIGHT', label: 'Night (23–6)' }
                  ].map((item) => {
                    const active = selectedTimeOfDay === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedTimeOfDay(item.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#166534] dark:bg-[#15803D] text-white border-[#14532D] dark:border-[#4ADE80]/40'
                            : 'bg-[#F7FAF8] dark:bg-[#10231B] text-[#172B24] dark:text-[#D1E7D8] border-[#DCE7DF] dark:border-[#294A38] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Select
                id="bus-category"
                label="Bus Category"
                value={selectedBusType}
                onChange={(e) => setSelectedBusType(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="Volvo Multi-Axle AC (2+2)">Volvo Multi-Axle AC</option>
                <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                <option value="AC Seater (2+2)">AC Seater (2+2)</option>
                <option value="Deluxe Express (2+2)">Deluxe Express</option>
              </Select>

              {/* Max Fare */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-[#172B24] dark:text-[#D1E7D8]">
                  <span>Max Fare</span>
                  <span className="text-[#166534] dark:text-[#4ADE80] font-bold">₹{maxFare}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={maxFare}
                  onChange={(e) => setMaxFare(Number(e.target.value))}
                  className="w-full accent-[#166534] dark:accent-[#4ADE80] cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Results Feed */}
        <main className="lg:col-span-9 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <div>
              <h1 className="text-xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
                Available Bus Services ({filteredTrips.length})
              </h1>
              <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
                {travelDate ? `Travel Date: ${travelDate}` : 'Showing upcoming scheduled departures'} (IST)
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchTrips} />
          ) : filteredTrips.length === 0 ? (
            <EmptyState
              icon={Bus}
              title="No Matching Bus Services Found"
              description="No scheduled trips match your current route, date, or filter settings. Try resetting filters or searching another date."
              actionLabel="Reset Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="space-y-4">
              {filteredTrips.map((trip) => {
                const isSeatsLow = trip.availableSeatsCount > 0 && trip.availableSeatsCount <= 5;
                const isSoldOut = trip.availableSeatsCount === 0;
                const boardingName =
                  trip.boardingStop?.stopId?.name ||
                  trip.route?.routeName?.split('to')[0]?.trim() ||
                  'Origin Stop';
                const droppingName =
                  trip.droppingStop?.stopId?.name ||
                  trip.route?.routeName?.split('to')[1]?.trim() ||
                  'Destination Stop';

                return (
                  <Card key={trip._id} hoverable>
                    <CardContent className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3.5 border-b border-[#DCE7DF] dark:border-[#294A38]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-[#14532D] dark:text-[#F0FDF4]">
                              {trip.operator?.name}
                            </h3>
                            <StatusBadge variant="aqua">{trip.operator?.operatorCode}</StatusBadge>
                          </div>
                          <p className="text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5">
                            {trip.bus?.busType} • Reg: <span className="font-mono">{trip.bus?.registrationNumber}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0] block font-semibold">
                              Fare / Seat
                            </span>
                            <span className="text-xl font-bold text-[#166534] dark:text-[#4ADE80]">
                              ₹{trip.farePerPassenger}
                            </span>
                          </div>
                          <Button
                            variant={isSoldOut ? 'outline' : 'primary'}
                            size="md"
                            disabled={isSoldOut}
                            onClick={() => handleOpenSeatSelection(trip)}
                          >
                            {isSoldOut ? 'Sold Out' : 'View Seats'}
                          </Button>
                        </div>
                      </div>

                      {/* Timings & Boarding/Dropping Stops */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                        <div>
                          <p className="text-lg font-bold text-[#172B24] dark:text-[#F0FDF4]">
                            {formatTimeIST(trip.departureAt)}
                          </p>
                          <p className="text-xs font-semibold text-[#14532D] dark:text-[#D1E7D8] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80] shrink-0" />
                            <span>Boarding: {boardingName}</span>
                          </p>
                          <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                            {formatDateIST(trip.departureAt)}
                          </p>
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-semibold text-[#475569] dark:text-[#D1E7D8] block mb-1.5">
                            {trip.duration}
                          </span>
                          <div className="flex items-center gap-2 text-[#DCE7DF] dark:text-[#294A38]">
                            <span className="w-2 h-2 rounded-full bg-[#166534] dark:bg-[#4ADE80]" />
                            <span className="h-0.5 flex-1 bg-current" />
                            <Bus className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
                            <span className="h-0.5 flex-1 bg-current" />
                            <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#5EEAD4]" />
                          </div>
                          <span className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] mt-1 block">
                            {trip.route?.totalDistance} km Corridor
                          </span>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-lg font-bold text-[#172B24] dark:text-[#F0FDF4]">
                            {formatTimeIST(trip.arrivalAt)}
                          </p>
                          <p className="text-xs font-semibold text-[#14532D] dark:text-[#D1E7D8] inline-flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4] shrink-0" />
                            <span>Dropping: {droppingName}</span>
                          </p>
                          <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                            {formatDateIST(trip.arrivalAt)}
                          </p>
                        </div>
                      </div>

                      {/* Amenities & Seat Status Footer */}
                      <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-[#DCE7DF]/70 dark:border-[#294A38]/70 text-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {(trip.bus?.amenities || []).map((amenity, i) => (
                            <StatusBadge key={i} variant="neutral">
                              {amenity}
                            </StatusBadge>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 font-semibold">
                          <Armchair className="w-4 h-4 text-[#64748B] dark:text-[#A7C4B0]" />
                          <span
                            className={
                              isSoldOut
                                ? 'text-[#B91C1C] dark:text-[#F87171]'
                                : isSeatsLow
                                ? 'text-[#B45309] dark:text-[#FBBF24]'
                                : 'text-[#15803D] dark:text-[#4ADE80]'
                            }
                          >
                            {trip.availableSeatsCount} seats available
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Seat Selection & Booking Modal */}
      <Modal
        open={!!activeTrip}
        onClose={() => setActiveTrip(null)}
        maxWidth="max-w-4xl"
        title="Select Seats & Passenger Details"
        subtitle={
          activeTrip
            ? `${activeTrip.operator?.name} • ${activeTrip.bus?.busType} (${activeTrip.bus?.registrationNumber})`
            : ''
        }
      >
        {activeTrip && (
          <div className="space-y-6">
            {bookingError && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 dark:border-[#F87171]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {loadingSeats ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#166534] dark:text-[#4ADE80]" />
                <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
                  Loading real-time seat inventory...
                </p>
              </div>
            ) : seatLayoutData ? (
              <SeatMap
                layoutType={seatLayoutData.layoutType}
                seats={seatLayoutData.seats}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                farePerSeat={activeTrip.farePerPassenger}
              />
            ) : null}

            {/* Passenger Details Form */}
            {selectedSeats.length > 0 && (
              <form
                onSubmit={handleConfirmBooking}
                className="space-y-5 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]"
              >
                <div>
                  <h4 className="font-bold text-[#14532D] dark:text-[#F0FDF4] text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
                    <span>Passenger Information ({selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''})</span>
                  </h4>
                  <p className="text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5">
                    Enter passenger details matching a valid government photo ID for boarding verification.
                  </p>
                </div>

                <div className="space-y-3">
                  {passengers.map((p, idx) => (
                    <div
                      key={p.seatNumber}
                      className="p-4 rounded-lg bg-[#F7FAF8] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge variant="success">Seat {p.seatNumber}</StatusBadge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={p.name}
                            onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                            className="w-full h-10 px-3 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-xs font-medium text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase mb-1">
                            Age *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="120"
                            placeholder="Age"
                            value={p.age}
                            onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                            className="w-full h-10 px-3 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-xs font-medium text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase mb-1">
                            Gender
                          </label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                            className="w-full h-10 px-2.5 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-xs font-medium text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Academic Checkout Notice */}
                <div className="p-3.5 rounded-lg bg-[#CCFBF1]/60 dark:bg-[#134E4A]/70 border border-[#0F766E]/25 dark:border-[#5EEAD4]/25 text-[#0F766E] dark:text-[#D1E7D8] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Simulated Academic Booking Confirmation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    MyJourney is an independent academic project. Confirming reserves your selected seats in MongoDB using ACID transactions and issues a verifiable digital PNR without processing real payment charges.
                  </p>
                </div>

                {/* Fare & Submit Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38]">
                  <div>
                    <span className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] uppercase font-semibold block">
                      Total Payable Amount
                    </span>
                    <span className="text-2xl font-bold text-[#166534] dark:text-[#4ADE80] font-mono">
                      ₹{grandTotal}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] block">
                      Base ₹{baseSelectedTotal} + 5% GST (₹{gstAmount}) + ₹{serviceFee} portal fee
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTrip(null)}
                      className="flex-1 sm:flex-initial"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={bookingLoading}
                      className="flex-1 sm:flex-initial"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Confirm & Book Ticket</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
