import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  StatusBadge,
  LoadingSkeleton,
  ErrorState,
  EmptyState
} from '../../components/ui/index.js';
import { Calendar, FileText } from 'lucide-react';

export const OperatorSchedulesPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/operator/trips');
      setTrips(res?.data?.trips || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const filtered = trips.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Timetable Management
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Assigned Bus Schedules
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Trips assigned to your authorized operator fleet.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-white dark:bg-[#162B22] p-1 rounded-lg border border-[#DCE7DF] dark:border-[#294A38] text-xs">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#166534] dark:bg-[#4ADE80] text-white dark:text-[#0B1712]'
                  : 'text-[#475569] dark:text-[#D1E7D8] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTrips} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Assigned Schedules"
          description="No trips match the selected schedule status filter."
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Route & Corridor</Th>
                <Th>Bus & Type</Th>
                <Th>Departure (IST)</Th>
                <Th>Occupancy</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((trip) => (
                <Tr key={trip._id}>
                  <Td>
                    <p className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                      {trip.routeId?.routeName || 'N/A'}
                    </p>
                    <p className="text-[11px] font-mono text-[#0F766E] dark:text-[#5EEAD4]">
                      {trip.routeId?.routeCode}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-bold text-[#172B24] dark:text-[#F0FDF4]">
                      {trip.busId?.registrationNumber}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                      {trip.busId?.busType}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
                      {formatIST(trip.departureAt)}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                      Arr: {formatIST(trip.arrivalAt)}
                    </p>
                  </Td>
                  <Td>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>
                          {trip.bookedSeats} / {trip.totalSeats}
                        </span>
                        <span className="text-[#15803D] dark:text-[#4ADE80]">
                          {trip.occupancyPercentage}%
                        </span>
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-[#DCE7DF] dark:bg-[#294A38] overflow-hidden">
                        <div
                          className="h-full bg-[#166534] dark:bg-[#4ADE80] rounded-full"
                          style={{ width: `${trip.occupancyPercentage}%` }}
                        />
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={trip.status} />
                  </Td>
                  <Td className="text-right">
                    <Link to={`/operator/manifests?tripId=${trip._id}`}>
                      <Button variant="secondary" size="sm" icon={FileText}>
                        Manifest
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
