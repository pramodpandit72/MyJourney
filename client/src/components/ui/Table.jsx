import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const TableContainer = ({ children, className = '' }) => (
  <div
    className={`bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl overflow-hidden shadow-xs ${className}`}
  >
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export const Table = ({ children, className = '' }) => (
  <table className={`w-full text-left text-xs border-collapse ${className}`}>{children}</table>
);

export const Thead = ({ children }) => (
  <thead className="bg-[#F0FDF4] dark:bg-[#10231B] text-[#14532D] dark:text-[#D1E7D8] font-bold uppercase tracking-wider border-b border-[#DCE7DF] dark:border-[#294A38]">
    {children}
  </thead>
);

export const Tbody = ({ children }) => (
  <tbody className="divide-y divide-[#DCE7DF]/70 dark:divide-[#294A38]/70 text-[#172B24] dark:text-[#F0FDF4]">
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', ...props }) => (
  <tr
    className={`hover:bg-[#F7FAF8] dark:hover:bg-[#1C382C]/60 transition-colors ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const Th = ({ children, className = '' }) => (
  <th className={`py-3 px-4 text-[11px] font-bold whitespace-nowrap ${className}`}>{children}</th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`py-3.5 px-4 ${className}`}>{children}</td>
);

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 border-t border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#10231B] flex items-center justify-between text-xs text-[#475569] dark:text-[#A7C4B0]">
      <span>
        Page <strong className="text-[#172B24] dark:text-[#F0FDF4]">{page}</strong> of{' '}
        <strong className="text-[#172B24] dark:text-[#F0FDF4]">{totalPages}</strong>
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

