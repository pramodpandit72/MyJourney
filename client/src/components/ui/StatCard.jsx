import React from 'react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'green', // 'green' | 'aqua' | 'success' | 'warning' | 'error' | 'neutral'
  className = ''
}) => {
  const toneStyles = {
    green: 'bg-[#DCFCE7] text-[#166534] dark:bg-[#234B35] dark:text-[#4ADE80]',
    aqua: 'bg-[#CCFBF1] text-[#0F766E] dark:bg-[#134E4A] dark:text-[#5EEAD4]',
    success: 'bg-[#DCFCE7] text-[#15803D] dark:bg-[#143323] dark:text-[#4ADE80]',
    warning: 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#3B290E] dark:text-[#FBBF24]',
    error: 'bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#3B1517] dark:text-[#F87171]',
    neutral: 'bg-[#EFF6F1] text-[#475569] dark:bg-[#1C382C] dark:text-[#D1E7D8]'
  };

  return (
    <div
      className={`bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl p-4 shadow-xs flex flex-col justify-between gap-2 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#475569] dark:text-[#A7C4B0] uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              toneStyles[tone] || toneStyles.green
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0] mt-0.5">{subtext}</p>
        )}
      </div>
    </div>
  );
};

export const ChartCard = ({ title, subtitle, action, children, className = '' }) => (
  <div
    className={`bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl p-5 shadow-xs space-y-4 ${className}`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE7DF]/70 dark:border-[#294A38]/70">
      <div>
        <h3 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
    <div>{children}</div>
  </div>
);

