import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BusSearchForm } from '../../components/forms/BusSearchForm.jsx';
import { SeatMap } from '../../components/seats/SeatMap.jsx';
import {
  Bus,
  Clock,
  MapPin,
  Calendar,
  Filter,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Armchair,
  X,
  CreditCard,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const originStopId = searchParams.get('originStopId') || '';
  const destinationStopId = searchParams.get('destinationStopId') || '';
  const travelDate = searchParams.get('travelDate') || new Date().toISOString().split('T')[0];
  const passengerCountParam = Number(searchParams.get('passengers')) || 1;

  // Search results state
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [selectedBusType, setSelectedBusType] = useState('ALL');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('ALL');
  const [maxFare, setMaxFare] = useState(2000);
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

  // Load Trips
  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ travelDate });
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

    fetchTrips();
  }, [originStopId, destinationStopId, travelDate]);

  // Open Seat Selection Modal
  const handleOpenSeatSelection = async (trip) => {
    if (!isAuthenticated) {
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

  // Toggle seat selection
  const handleSeatToggle = (seatNumber) => {
    setBookingError('');
    if (selectedSeats.includes(seatNumber)) {
      // Remove
      const newSelected = selectedSeats.filter((s) => s !== seatNumber);
      setSelectedSeats(newSelected);
      setPassengers((prev) => prev.filter((p) => p.seatNumber !== seatNumber));
    } else {
      // Add
      if (selectedSeats.length >= 6) {
        setBookingError('Maximum 6 seats per booking transaction.');
        return;
      }
      const newSelected = [...selectedSeats, seatNumber];
      setSelectedSeats(newSelected);
      // Auto-populate passenger object
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

  // Passenger field update
  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // Submit Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (selectedSeats.length === 0) {
      setBookingError('Please select at least one seat.');
      return;
    }

    // Validate passenger inputs
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.name.trim().length < 2) {
        setBookingError(`Please enter a valid name for passenger assigned to Seat ${p.seatNumber}.`);
        return;
      }
      if (!p.age || isNaN(p.age) || Number(p.age) < 1 || Number(p.age) > 120) {
        setBookingError(`Please enter a valid age (1-120) for passenger on Seat ${p.seatNumber}.`);
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
        navigate(`/ticket/${res.data.booking.pnr}?confirmed=true`);
      }
    } catch (err) {
      if (err.code === 'SEAT_UNAVAILABLE' || err.statusCode === 409) {
        setBookingError(
          'Conflict: One or more selected seats were just claimed by another passenger! Please refresh the seat layout.'
        );
        // Refresh seats
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

  // Client filtering & sorting
  const filteredTrips = trips
    .filter((trip) => {
      if (selectedBusType !== 'ALL' && trip.bus?.busType !== selectedBusType) return false;
      if (trip.farePerPassenger > maxFare) return false;

      if (selectedTimeOfDay !== 'ALL') {
        const depHour = new Date(trip.departureAt).getHours();
        if (selectedTimeOfDay === 'MORNING' && (depHour < 6 || depHour >= 12)) return false;
        if (selectedTimeOfDay === 'AFTERNOON' && (depHour < 12 || depHour >= 18)) return false;
        if (selectedTimeOfDay === 'EVENING' && (depHour < 18 || depHour >= 23)) return false;
        if (selectedTimeOfDay === 'NIGHT' && (depHour >= 6 && depHour < 23)) return false;
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

  // Helper date formatter in IST
  const formatTimeIST = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Search Edit Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <BusSearchForm
          initialValues={{
            originStopId,
            destinationStopId,
            travelDate,
            passengers: passengerCountParam
          }}
        />
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filters & Sorting</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedBusType('ALL');
                  setSelectedTimeOfDay('ALL');
                  setMaxFare(2000);
                  setSortBy('departureAt');
                  setSortOrder('asc');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Sort Trips By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="departureAt">Departure Time</option>
                <option value="fare">Fare (Low to High)</option>
                <option value="availableSeats">Seat Availability</option>
              </select>
            </div>

            {/* Departure Time of Day */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Departure Time
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'ALL', label: 'All Times' },
                  { id: 'MORNING', label: 'Morning (6-12)' },
                  { id: 'AFTERNOON', label: 'Afternoon (12-18)' },
                  { id: 'EVENING', label: 'Evening (18-23)' },
                  { id: 'NIGHT', label: 'Night (23-6)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTimeOfDay(item.id)}
                    className={`py-2 px-2.5 rounded-lg font-medium text-center transition-all ${
                      selectedTimeOfDay === item.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bus Type Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Bus Category
              </label>
              <select
                value={selectedBusType}
                onChange={(e) => setSelectedBusType(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Volvo Multi-Axle AC (2+2)">Volvo Multi-Axle AC</option>
                <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                <option value="AC Seater (2+2)">AC Seater (2+2)</option>
                <option value="Deluxe Express (2+2)">Deluxe Express</option>
              </select>
            </div>

            {/* Max Fare */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span>Max Fare</span>
                <span className="text-blue-600 font-bold">₹{maxFare}</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="50"
                value={maxFare}
                onChange={(e) => setMaxFare(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Trips List Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Header count info */}
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Available Buses ({filteredTrips.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Date: <span className="font-semibold text-slate-700 dark:text-slate-200">{travelDate}</span>
            </span>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Searching real-time schedules from transport network...
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-600" />
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">{error}</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Bus className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Trips Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No scheduled buses meet your current stop or filter criteria on {travelDate}. Try selecting another travel date or adjusting the filter thresholds.
              </p>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isSeatsLow = trip.availableSeatsCount <= 5;
              const isSoldOut = trip.availableSeatsCount === 0;

              return (
                <div
                  key={trip._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {trip.operator?.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                          {trip.operator?.operatorCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {trip.bus?.busType} • Reg: {trip.bus?.registrationNumber}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Segment Fare</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          ₹{trip.farePerPassenger}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenSeatSelection(trip)}
                        disabled={isSoldOut}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSoldOut
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                        }`}
                      >
                        {isSoldOut ? 'Sold Out' : 'Select Seats'}
                      </button>
                    </div>
                  </div>

                  {/* Journey Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-1">
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatTimeIST(trip.departureAt)}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {trip.route?.routeName?.split('to')[0] || 'Origin'}
                      </p>
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        {trip.duration}
                      </span>
                      <div className="flex items-center space-x-2 text-slate-300 dark:text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <div className="h-0.5 flex-1 bg-current"></div>
                        <Bus className="w-4 h-4 text-blue-600" />
                        <div className="h-0.5 flex-1 bg-current"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {trip.route?.totalDistance} km Route
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatTimeIST(trip.arrivalAt)}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {trip.route?.routeName?.split('to')[1] || 'Destination'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Amenities & Seat status badge */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {trip.bus?.amenities?.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Armchair className="w-3.5 h-3.5 text-slate-400" />
                      <span
                        className={`font-bold ${
                          isSoldOut
                            ? 'text-rose-600'
                            : isSeatsLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {trip.availableSeatsCount} seats available
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* Booking Drawer / Modal */}
      {activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Seat Reservation & Passenger Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeTrip.operator?.name} • {activeTrip.bus?.busType} ({activeTrip.bus?.registrationNumber})
                </p>
              </div>
              <button
                onClick={() => setActiveTrip(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Seat Map Section */}
            <div>
              {loadingSeats ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs text-slate-500">Checking seat inventory availability...</p>
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
            </div>

            {/* Passenger Information Form */}
            {selectedSeats.length > 0 && (
              <form onSubmit={handleConfirmBooking} className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Passenger Information ({selectedSeats.length} Selected)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Enter the details for each reserved seat. Tickets will be issued under these names.
                  </p>
                </div>

                <div className="space-y-4">
                  {passengers.map((p, idx) => (
                    <div
                      key={p.seatNumber}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                          Seat #{p.seatNumber} Passenger
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={p.name}
                            onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
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
                            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                            Gender
                          </label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                            className="w-full h-10 px-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                {/* Simulated Payment Notice */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Simulated Academic Checkout Notice</span>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300">
                    This is an independent academic demonstration portal. No real payment gateway is integrated. Clicking Confirm simulates successful ticket payment and generates an authentic PNR.
                  </p>
                </div>

                {/* Total Fare & Submit Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase">Total Payable Amount</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ₹{selectedSeats.length * activeTrip.farePerPassenger + Math.round(selectedSeats.length * activeTrip.farePerPassenger * 0.05) + 20}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Incl. 5% GST & ₹20 service fee
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTrip(null)}
                      className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Reserving Seats...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Confirm & Book Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
