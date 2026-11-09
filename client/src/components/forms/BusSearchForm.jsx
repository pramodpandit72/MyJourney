import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, MapPin, Users, Search, Loader2 } from 'lucide-react';
import api from '../../services/api.js';

export const BusSearchForm = ({ initialValues = {}, className = '' }) => {
  const navigate = useNavigate();
  const [stops, setStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);

  // Form states
  const [fromStop, setFromStop] = useState(initialValues.originStopId || '');
  const [toStop, setToStop] = useState(initialValues.destinationStopId || '');
  
  // Format today's date YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [travelDate, setTravelDate] = useState(initialValues.travelDate || getTodayString());
  const [passengers, setPassengers] = useState(initialValues.passengers || 1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await api.get('/stops');
        if (res?.data?.stops) {
          setStops(res.data.stops);
          // Set defaults if not provided
          if (!initialValues.originStopId && res.data.stops.length >= 2) {
            setFromStop(res.data.stops[0]._id);
            // Look for a different city for toStop
            const diffStop = res.data.stops.find(s => s.city !== res.data.stops[0].city);
            setToStop(diffStop ? diffStop._id : res.data.stops[1]._id);
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
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 text-slate-900 dark:text-slate-100 ${className}`}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* From Stop */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Leaving From</span>
          </label>
          <select
            value={fromStop}
            onChange={(e) => setFromStop(e.target.value)}
            disabled={loadingStops}
            className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {loadingStops ? (
              <option>Loading stops...</option>
            ) : (
              stops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.city} — {s.name} ({s.stopCode})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center py-1">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Stop */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Going To</span>
          </label>
          <select
            value={toStop}
            onChange={(e) => setToStop(e.target.value)}
            disabled={loadingStops}
            className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {loadingStops ? (
              <option>Loading stops...</option>
            ) : (
              stops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.city} — {s.name} ({s.stopCode})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Travel Date */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Travel Date</span>
          </label>
          <input
            type="date"
            value={travelDate}
            min={getTodayString()}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Passengers */}
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Seats</span>
          </label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="w-full h-11 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Search Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loadingStops}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loadingStops ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Buses</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

