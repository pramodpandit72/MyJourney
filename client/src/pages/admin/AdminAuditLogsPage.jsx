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
  Pagination,
  Select,
  LoadingSkeleton,
  ErrorState,
  EmptyState
} from '../../components/ui/index.js';
import { History } from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (actionFilter) params.append('action', actionFilter);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res?.data?.logs || []);
      setPagination(res?.data?.pagination || { total: 0, pages: 1, page });
    } catch (err) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const formatIST = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
            Security & Compliance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
            System Operational Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
            Immutable log of state-changing transactions, booking locks, cancellations, and administrative actions.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Operational Actions</option>
            <option value="BOOKING_CONFIRMED">BOOKING_CONFIRMED</option>
            <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
            <option value="OPERATOR_CREATED">OPERATOR_CREATED</option>
            <option value="BUS_CREATED">BUS_CREATED</option>
            <option value="TRIP_CREATED">TRIP_CREATED</option>
            <option value="CANCELLATION_POLICY_UPDATED">CANCELLATION_POLICY_UPDATED</option>
            <option value="USER_LOGGED_IN">USER_LOGGED_IN</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Audit Events Found"
          description="No operational audit events match the selected action filter."
        />
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Timestamp (IST)</Th>
                <Th>Actor & Role</Th>
                <Th>Action Event</Th>
                <Th>Target Entity</Th>
                <Th>Event Summary</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr key={log._id}>
                  <Td className="whitespace-nowrap text-[#475569] dark:text-[#A7C4B0]">
                    {formatIST(log.timestamp)}
                  </Td>
                  <Td>
                    <span className="font-bold text-[#14532D] dark:text-[#F0FDF4] block">
                      {log.actorId?.name || 'System / Guest'}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] font-mono">
                      ROLE: {log.actorRole}
                    </span>
                  </Td>
                  <Td>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20 dark:border-[#5EEAD4]/25">
                      {log.action}
                    </span>
                  </Td>
                  <Td className="text-[#475569] dark:text-[#D1E7D8] font-mono">
                    {log.entityType} ({log.entityId?.slice?.(-6) || log.entityId})
                  </Td>
                  <Td className="text-[#172B24] dark:text-[#D1E7D8] max-w-md truncate">
                    {log.summary}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Pagination
            page={pagination.page || page}
            totalPages={pagination.pages}
            onPageChange={(next) => setPage(next)}
          />
        </TableContainer>
      )}
    </div>
  );
};
