import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  LoadingSkeleton,
  ErrorState,
  EmptyState
} from '../../components/ui/index.js';
import { Percent } from 'lucide-react';

export const OperatorOccupancyPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOccupancy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/operator/reports/occupancy');
      setReports(res?.data?.reports || []);
    } catch (err) {
      setError(err.message || 'Failed to load occupancy reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
  }, []);

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
      <div>
        <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
          Fleet Capacity Utilization
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
          Seat Occupancy Reconciliation
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
          Reconciles scheduled bus trips directly with confirmed seat inventory records in MongoDB.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOccupancy} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No Occupancy Data"
          description="No assigned trips were found to generate seat occupancy reconciliation reports."
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Corridor Route</Th>
                <Th>Bus Number</Th>
                <Th>Scheduled Departure</Th>
                <Th className="text-center">Capacity</Th>
                <Th className="text-center">Confirmed</Th>
                <Th className="text-center">Available</Th>
                <Th className="text-right">Occupancy %</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reports.map((r, i) => (
                <Tr key={i}>
                  <Td className="font-bold text-[#14532D] dark:text-[#F0FDF4]">{r.route}</Td>
                  <Td>
                    <p className="font-bold font-mono text-[#172B24] dark:text-[#F0FDF4]">
                      {r.busNumber}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">{r.busType}</p>
                  </Td>
                  <Td className="font-medium text-[#475569] dark:text-[#D1E7D8]">
                    {formatIST(r.departureAt)}
                  </Td>
                  <Td className="text-center font-bold text-[#475569] dark:text-[#A7C4B0]">
                    {r.totalSeats}
                  </Td>
                  <Td className="text-center font-bold text-[#15803D] dark:text-[#4ADE80]">
                    {r.confirmedSeats}
                  </Td>
                  <Td className="text-center font-bold text-[#0F766E] dark:text-[#5EEAD4]">
                    {r.availableSeats}
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <span className="font-bold text-sm text-[#14532D] dark:text-[#F0FDF4]">
                        {r.occupancyPercentage}%
                      </span>
                      <div className="w-16 h-2 rounded-full bg-[#DCE7DF] dark:bg-[#294A38] overflow-hidden">
                        <div
                          className="h-full bg-[#166534] dark:bg-[#4ADE80] rounded-full"
                          style={{ width: `${r.occupancyPercentage}%` }}
                        />
                      </div>
                    </div>
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
