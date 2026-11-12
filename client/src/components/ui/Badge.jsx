import React from 'react';

export const StatusBadge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    success:
      'bg-[#DCFCE7] text-[#14532D] border-[#15803D]/25 dark:bg-[#143323] dark:text-[#4ADE80] dark:border-[#4ADE80]/30',
    warning:
      'bg-[#FEF3C7] text-[#92400E] border-[#B45309]/25 dark:bg-[#3B290E] dark:text-[#FBBF24] dark:border-[#FBBF24]/30',
    error:
      'bg-[#FEE2E2] text-[#991B1B] border-[#B91C1C]/25 dark:bg-[#3B1517] dark:text-[#F87171] dark:border-[#F87171]/30',
    info:
      'bg-[#E0F2FE] text-[#075985] border-[#0369A1]/25 dark:bg-[#0E2F44] dark:text-[#38BDF8] dark:border-[#38BDF8]/30',
    aqua:
      'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/25 dark:bg-[#134E4A] dark:text-[#5EEAD4] dark:border-[#5EEAD4]/30',
    neutral:
      'bg-[#EFF6F1] text-[#475569] border-[#DCE7DF] dark:bg-[#1C382C] dark:text-[#D1E7D8] dark:border-[#294A38]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border uppercase tracking-wide ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};

