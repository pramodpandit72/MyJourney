import React from 'react';

export const BrandLogo = ({
  size = 'md',
  variant = 'default', // 'default' | 'light' (for dark/deep-green backgrounds like Footer)
  showSubtitle = true,
  subtitle = 'Public Transport Booking Portal'
}) => {
  const iconBoxSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const titleClass =
    size === 'sm'
      ? 'text-lg font-bold'
      : size === 'lg'
      ? 'text-2xl font-extrabold'
      : 'text-xl font-bold';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Custom Geometric MyJourney Emblem */}
      <div
        className={`${iconBoxSize} rounded-lg flex items-center justify-center shrink-0 border ${
          variant === 'light'
            ? 'bg-[#234B35] border-[#4ADE80]/30 text-[#F0FDF4]'
            : 'bg-[#166534] dark:bg-[#15803D] border-[#14532D] dark:border-[#4ADE80]/30 text-white'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 17h14v-6a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v6z" />
          <path d="M5 12h14" />
          <path d="M9 7v5" />
          <path d="M15 7v5" />
          <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
          <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
          <path d="M3 14h2" />
          <path d="M19 14h2" />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleClass} tracking-tight ${
              variant === 'light'
                ? 'text-[#F0FDF4]'
                : 'text-[#14532D] dark:text-[#F0FDF4]'
            }`}
          >
            My<span className={variant === 'light' ? 'text-[#5EEAD4]' : 'text-[#0F766E] dark:text-[#5EEAD4]'}>Journey</span>
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-[11px] font-medium tracking-wide ${
              variant === 'light'
                ? 'text-[#D1E7D8]'
                : 'text-[#475569] dark:text-[#A7C4B0]'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

