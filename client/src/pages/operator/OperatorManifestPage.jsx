import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Users,
  Printer,
  Bus,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
  FileCheck2,
  Download
} from 'lucide-react';

export const OperatorManifestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || '';

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(tripIdParam);
  const [manifestData, setManifestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch available trips for dropdown
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/operator/trips');
        const loadedTrips = res?.data?.trips || [];
        setTrips(loadedTrips);

        if (!selectedTripId && loadedTrips.length > 0) {
          setSelectedTripId(loadedTrips[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assigned trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // 2. Fetch manifest whenever selectedTripId changes
  useEffect(() => {
    if (!selectedTripId) return;

    const fetchManifest = async () => {
      setManifestLoading(true);
      setError('');
      try {
        const res = await api.get(`/operator/trips/${selectedTripId}/manifest`);
        setManifestData(res?.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load manifest for selected trip.');
        setManifestData(null);
      } finally {
        setManifestLoading(false);
      }
    };

    fetchManifest();
  }, [selectedTripId]);

  const handleTripChange = (e) => {
    const newId = e.target.value;
    setSelectedTripId(newId);
    setSearchParams({ tripId: newId });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Conductor & Driver Dispatch
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Official Passenger Manifest
          </h1>
          <p className="text-xs text-slate-500">
            Verified boarding manifest containing confirmed passengers and assigned seat numbers.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Trip Selector Dropdown */}
          <select
            value={selectedTripId}
            onChange={handleTripChange}
            disabled={loading}
            className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none flex-1 sm:flex-initial"
          >
            {trips.map((t) => (
              <option key={t._id} value={t._id}>
                {t.routeId?.routeName} ({t.busId?.registrationNumber})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Manifest</span>
          </button>
        </div>
      </div>

      {manifestLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Generating passenger manifest...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : manifestData ? (
        <div className="space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm print:border-black">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Assigned Corridor</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {manifestData.trip?.routeName}
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Vehicle & Class</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {manifestData.trip?.busRegistration}
                </p>
                <p className="text-[11px] text-slate-500">{manifestData.trip?.busType}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Departure Schedule</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatIST(manifestData.trip?.departureAt)}
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Confirmed Occupancy</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {manifestData.stats?.confirmedCount} / {manifestData.stats?.totalSeats} Seats ({manifestData.stats?.occupancyPercentage}%)
                </p>
              </div>
            </div>
          </div>

          {/* Manifest Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm print:border-black">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Confirmed Passengers List ({manifestData.manifest?.length || 0})
              </span>
              <span className="text-[11px] text-slate-400 italic">
                * Note: Cancelled bookings have been strictly excluded from this manifest.
              </span>
            </div>

            {manifestData.manifest?.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No confirmed passengers booked on this scheduled trip yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Seat #</th>
                      <th className="py-3 px-4">Passenger Name</th>
                      <th className="py-3 px-4">Age / Gender</th>
                      <th className="py-3 px-4">PNR</th>
                      <th className="py-3 px-4">Boarding Stop</th>
                      <th className="py-3 px-4">Dropping Stop</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {manifestData.manifest.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-black">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {p.seatNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {p.passengerName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {p.age} / {p.gender}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {p.pnr}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{p.boardingStop}</td>
                        <td className="py-3.5 px-4 font-medium">{p.droppingStop}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{p.phone}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 inline-block"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

