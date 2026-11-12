import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Card,
  CardContent,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  LoadingSkeleton,
  ErrorState,
  EmptyState
} from '../../components/ui/index.js';
import { Users, Printer } from 'lucide-react';

export const OperatorManifestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || '';

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(tripIdParam);
  const [manifestData, setManifestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [error, setError] = useState('');

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Conductor & Driver Dispatch
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            Official Passenger Manifest
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Verified boarding manifest containing confirmed passengers and assigned seat numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex-1 sm:w-80">
            <Select value={selectedTripId} onChange={handleTripChange} disabled={loading}>
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.routeId?.routeName} ({t.busId?.registrationNumber})
                </option>
              ))}
            </Select>
          </div>

          <Button variant="primary" icon={Printer} onClick={() => window.print()}>
            Print Manifest
          </Button>
        </div>
      </div>

      {manifestLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} />
      ) : manifestData ? (
        <div className="space-y-6">
          {/* Print Header */}
          <div className="hidden print:block border-b-2 border-[#14532D] pb-3 mb-4">
            <h2 className="text-lg font-bold text-[#14532D]">MyJourney — Official Conductor Passenger Manifest</h2>
            <p className="text-xs text-[#475569]">Generated at {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>

          {/* Trip Summary Card */}
          <Card className="print:bg-white print:text-[#172B24] print:border-[#DCE7DF]">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] dark:text-[#A7C4B0] uppercase font-bold text-[10px] block">
                    Assigned Corridor
                  </span>
                  <p className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
                    {manifestData.trip?.routeName}
                  </p>
                </div>

                <div>
                  <span className="text-[#64748B] dark:text-[#A7C4B0] uppercase font-bold text-[10px] block">
                    Vehicle & Class
                  </span>
                  <p className="font-bold text-[#172B24] dark:text-[#F0FDF4] mt-0.5">
                    {manifestData.trip?.busRegistration}
                  </p>
                  <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0]">
                    {manifestData.trip?.busType}
                  </p>
                </div>

                <div>
                  <span className="text-[#64748B] dark:text-[#A7C4B0] uppercase font-bold text-[10px] block">
                    Departure Schedule
                  </span>
                  <p className="font-bold text-[#172B24] dark:text-[#F0FDF4] mt-0.5">
                    {formatIST(manifestData.trip?.departureAt)}
                  </p>
                </div>

                <div>
                  <span className="text-[#64748B] dark:text-[#A7C4B0] uppercase font-bold text-[10px] block">
                    Confirmed Occupancy
                  </span>
                  <p className="text-base font-bold text-[#15803D] dark:text-[#4ADE80] mt-0.5">
                    {manifestData.stats?.confirmedCount} / {manifestData.stats?.totalSeats} Seats ({manifestData.stats?.occupancyPercentage}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manifest Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#14532D] dark:text-[#D1E7D8]">
                Confirmed Passengers List ({manifestData.manifest?.length || 0})
              </h2>
              <span className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] italic">
                * Cancelled bookings are strictly excluded from this manifest.
              </span>
            </div>

            {manifestData.manifest?.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Confirmed Passengers"
                description="No confirmed seat reservations exist for this scheduled departure yet."
              />
            ) : (
              <TableContainer className="print:border-[#DCE7DF]">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Seat #</Th>
                      <Th>Passenger Name</Th>
                      <Th>Age / Gender</Th>
                      <Th>PNR</Th>
                      <Th>Boarding Stop</Th>
                      <Th>Dropping Stop</Th>
                      <Th>Contact Phone</Th>
                      <Th className="text-right">Boarded</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {manifestData.manifest.map((p, i) => (
                      <Tr key={i}>
                        <Td>
                          <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-[#DCFCE7] dark:bg-[#234B35] text-[#14532D] dark:text-[#4ADE80]">
                            {p.seatNumber}
                          </span>
                        </Td>
                        <Td className="font-bold text-[#14532D] dark:text-[#F0FDF4]">
                          {p.passengerName}
                        </Td>
                        <Td className="text-[#475569] dark:text-[#D1E7D8]">
                          {p.age} / {p.gender}
                        </Td>
                        <Td className="font-mono font-bold text-[#0F766E] dark:text-[#5EEAD4]">
                          {p.pnr}
                        </Td>
                        <Td className="font-medium">{p.boardingStop}</Td>
                        <Td className="font-medium">{p.droppingStop}</Td>
                        <Td className="font-mono text-[#475569] dark:text-[#A7C4B0]">{p.phone}</Td>
                        <Td className="text-right">
                          <div className="w-5 h-5 rounded border-2 border-[#DCE7DF] dark:border-[#294A38] inline-block" />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
