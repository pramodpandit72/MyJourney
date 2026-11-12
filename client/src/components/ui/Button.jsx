import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary', // 'primary' | 'secondary' | 'aqua' | 'outline' | 'ghost' | 'danger'
      size = 'md', // 'sm' | 'md' | 'lg'
      loading = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] dark:focus-visible:outline-[#4ADE80] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants = {
      primary:
        'bg-[#166534] hover:bg-[#14532D] text-white border border-[#14532D] dark:bg-[#15803D] dark:hover:bg-[#166534] dark:text-[#F0FDF4] dark:border-[#4ADE80]/30 shadow-xs',
      secondary:
        'bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#14532D] border border-[#166534]/20 dark:bg-[#234B35] dark:hover:bg-[#29593F] dark:text-[#F0FDF4] dark:border-[#4ADE80]/20',
      aqua:
        'bg-[#CCFBF1] hover:bg-[#99F6E4] text-[#0F766E] border border-[#0F766E]/25 dark:bg-[#134E4A] dark:hover:bg-[#115E59] dark:text-[#5EEAD4] dark:border-[#5EEAD4]/25',
      outline:
        'bg-white hover:bg-[#F0FDF4] text-[#172B24] border border-[#DCE7DF] hover:border-[#166534]/40 dark:bg-[#162B22] dark:hover:bg-[#1C382C] dark:text-[#F0FDF4] dark:border-[#294A38]',
      ghost:
        'bg-transparent hover:bg-[#EFF6F1] text-[#172B24] dark:hover:bg-[#1C382C] dark:text-[#D1E7D8]',
      danger:
        'bg-[#B91C1C] hover:bg-[#991B1B] text-white border border-[#991B1B] dark:bg-[#991B1B] dark:hover:bg-[#7F1D1D] dark:text-[#FEE2E2]'
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-5 text-sm'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

