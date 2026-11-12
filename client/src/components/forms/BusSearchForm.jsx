import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, MapPin, Users, Search } from 'lucide-react';
import api from '../../services/api.js';
import { Button } from '../ui/index.js';

const formatStopLabel = (stop) => `${stop.city} — ${stop.name}`;

const findMatchingStops = (text, stops) => {
  const cleaned = text.trim().toLowerCase();
  if (!cleaned) return [];

  const exact = stops.filter(
    (s) =>
      formatStopLabel(s).toLowerCase() === cleaned ||
      s.city.toLowerCase() === cleaned ||
      s.name.toLowerCase() === cleaned ||
      s.stopCode.toLowerCase() === cleaned
  );
  if (exact.length > 0) return exact;

  return stops.filter((s) => {
    const target = `${s.city} ${s.name} ${s.stopCode} ${s.state || ''}`.toLowerCase();
    return target.includes(cleaned);
  });
};

export const BusSearchForm = ({ initialValues = {}, className = '' }) => {
  const navigate = useNavigate();
  const [stops, setStops] = useState([]);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [fromText, setFromText] = useState(initialValues.originQuery || '');
  const [toText, setToText] = useState(initialValues.destinationQuery || '');
  const [travelDate, setTravelDate] = useState(initialValues.travelDate || getTodayString());
  const [passengers, setPassengers] = useState(Number(initialValues.passengers) || 1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await api.get('/stops');
        if (res?.data?.stops) {
          const list = res.data.stops;
          setStops(list);

          if (initialValues.originStopId && !initialValues.originQuery) {
            const matchedOrigin = list.find((s) => s._id === initialValues.originStopId);
            if (matchedOrigin) {
              setFromText((prev) => prev || formatStopLabel(matchedOrigin));
            }
          }
          if (initialValues.destinationStopId && !initialValues.destinationQuery) {
            const matchedDest = list.find((s) => s._id === initialValues.destinationStopId);
            if (matchedDest) {
              setToText((prev) => prev || formatStopLabel(matchedDest));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load stops', err);
      }
    };
    fetchStops();
  }, [initialValues.originStopId, initialValues.destinationStopId, initialValues.originQuery, initialValues.destinationQuery]);

  const handleSwap = () => {
    setFromText(toText);
    setToText(fromText);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    const originInput = fromText.trim();
    const destinationInput = toText.trim();

    if (!originInput || !destinationInput) {
      setError('Please enter both departure and destination stops.');
      return;
    }
    if (originInput.toLowerCase() === destinationInput.toLowerCase()) {
      setError('Departure and destination stops cannot be the same.');
      return;
    }
    if (!travelDate) {
      setError('Please select a valid travel date.');
      return;
    }

    const originMatches = findMatchingStops(originInput, stops);
    const destMatches = findMatchingStops(destinationInput, stops);

    const queryParams = new URLSearchParams({
      originQuery: originInput,
      destinationQuery: destinationInput,
      travelDate,
      passengers: passengers.toString()
    });

    if (originMatches.length === 1 && destMatches.length === 1) {
      if (originMatches[0]._id === destMatches[0]._id) {
        setError('Departure and destination stops cannot be the same.');
        return;
      }
      queryParams.set('originStopId', originMatches[0]._id);
      queryParams.set('destinationStopId', destMatches[0]._id);
    }

    navigate(`/search?${queryParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white dark:bg-[#162B22] rounded-xl border border-[#DCE7DF] dark:border-[#294A38] shadow-sm p-5 sm:p-6 text-[#172B24] dark:text-[#F0FDF4] ${className}`}
    >
      {error && (
        <div
          role="alert"
          className="mb-4 px-3.5 py-2.5 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 dark:border-[#F87171]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-medium"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
        {/* Leaving From - Direct Text Input */}
        <div className="lg:col-span-3 space-y-1.5">
          <label
            htmlFor="bus-search-from"
            className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
            <span>From</span>
          </label>
          <input
            id="bus-search-from"
            type="text"
            autoComplete="off"
            value={fromText}
            onChange={(e) => setFromText(e.target.value)}
            placeholder="Enter origin city or stop"
            className="w-full h-11 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] hover:border-[#166534]/50 dark:hover:border-[#4ADE80]/50 rounded-lg text-sm font-medium text-[#172B24] dark:text-[#F0FDF4] placeholder:text-[#64748B] dark:placeholder:text-[#A7C4B0] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 dark:focus:ring-[#4ADE80]/20 focus:border-[#166534] dark:focus:border-[#4ADE80] transition-colors"
          />
        </div>

        {/* Swap Button */}
        <div className="lg:col-span-1 flex justify-center lg:pb-0.5">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            title="Swap locations"
            className="w-10 h-10 rounded-lg bg-[#F0FDF4] dark:bg-[#1C382C] hover:bg-[#DCFCE7] dark:hover:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] border border-[#DCE7DF] dark:border-[#294A38] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Going To - Direct Text Input */}
        <div className="lg:col-span-3 space-y-1.5">
          <label
            htmlFor="bus-search-to"
            className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
            <span>To</span>
          </label>
          <input
            id="bus-search-to"
            type="text"
            autoComplete="off"
            value={toText}
            onChange={(e) => setToText(e.target.value)}
            placeholder="Enter destination city or stop"
            className="w-full h-11 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] hover:border-[#166534]/50 dark:hover:border-[#4ADE80]/50 rounded-lg text-sm font-medium text-[#172B24] dark:text-[#F0FDF4] placeholder:text-[#64748B] dark:placeholder:text-[#A7C4B0] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 dark:focus:ring-[#4ADE80]/20 focus:border-[#166534] dark:focus:border-[#4ADE80] transition-colors"
          />
        </div>

        {/* Travel Date */}
        <div className="lg:col-span-2 space-y-1.5">
          <label
            htmlFor="bus-search-date"
            className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
            <span>Travel Date</span>
          </label>
          <input
            id="bus-search-date"
            type="date"
            value={travelDate}
            min={getTodayString()}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full h-11 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-sm font-medium text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
          />
        </div>

        {/* Passengers */}
        <div className="lg:col-span-1 space-y-1.5">
          <label
            htmlFor="bus-search-passengers"
            className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
            <span>Seats</span>
          </label>
          <select
            id="bus-search-passengers"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="w-full h-11 px-2.5 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-sm font-medium text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="lg:col-span-2">
          <Button type="submit" variant="primary" size="lg" className="w-full h-11">
            <Search className="w-4 h-4" />
            <span>Search Buses</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
