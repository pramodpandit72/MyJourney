import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, MapPin, Users, Search } from 'lucide-react';
import api from '../../services/api.js';
import { Button, SearchableDropdown } from '../ui/index.js';

export const BusSearchForm = ({ initialValues = {}, className = '' }) => {
  const navigate = useNavigate();
  const [stops, setStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [fromStop, setFromStop] = useState(initialValues.originStopId || '');
  const [toStop, setToStop] = useState(initialValues.destinationStopId || '');
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
          if (!initialValues.originStopId && list.length >= 2) {
            setFromStop(list[0]._id);
            const diffStop = list.find((s) => s.city !== list[0].city);
            setToStop(diffStop ? diffStop._id : list[1]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load stops', err);
      } finally {
        setLoadingStops(false);
      }
    };
    fetchStops();
  }, []);

  const stopOptions = useMemo(
    () =>
      stops.map((s) => ({
        value: s._id,
        label: `${s.city} — ${s.name}`,
        sublabel: `${s.stopCode}${s.state ? `, ${s.state}` : ''}`,
        searchText: `${s.city} ${s.name} ${s.stopCode} ${s.state || ''}`
      })),
    [stops]
  );

  const handleSwap = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    if (!fromStop || !toStop) {
      setError('Please select both departure and destination stops.');
      return;
    }
    if (fromStop === toStop) {
      setError('Departure and destination stops cannot be the same.');
      return;
    }
    if (!travelDate) {
      setError('Please select a valid travel date.');
      return;
    }

    const queryParams = new URLSearchParams({
      originStopId: fromStop,
      destinationStopId: toStop,
      travelDate,
      passengers: passengers.toString()
    });

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
        {/* Leaving From */}
        <div className="lg:col-span-3">
          <SearchableDropdown
            label="From"
            icon={MapPin}
            options={stopOptions}
            value={fromStop}
            onChange={setFromStop}
            loading={loadingStops}
            placeholder="Select origin stop"
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

        {/* Going To */}
        <div className="lg:col-span-3">
          <SearchableDropdown
            label="To"
            icon={MapPin}
            options={stopOptions}
            value={toStop}
            onChange={setToStop}
            loading={loadingStops}
            placeholder="Select destination stop"
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
