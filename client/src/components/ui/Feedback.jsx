import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button.jsx';

export const LoadingSkeleton = ({ rows = 4, className = '' }) => (
  <div className={`space-y-3 animate-pulse ${className}`} role="status" aria-label="Loading content">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-14 rounded-lg bg-[#EFF6F1] dark:bg-[#1C382C] border border-[#DCE7DF] dark:border-[#294A38]"
      />
    ))}
  </div>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are no items matching your current selection.',
  actionLabel,
  onAction,
  className = ''
}) => (
  <div
    className={`bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl p-10 text-center space-y-3 ${className}`}
  >
    <div className="w-12 h-12 rounded-lg bg-[#F0FDF4] dark:bg-[#234B35] border border-[#DCE7DF] dark:border-[#294A38] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center mx-auto">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4]">{title}</h3>
    <p className="text-xs text-[#475569] dark:text-[#A7C4B0] max-w-md mx-auto leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <div className="pt-2">
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while retrieving data from the server.',
  onRetry,
  className = ''
}) => (
  <div
    role="alert"
    className={`bg-[#FEE2E2]/60 dark:bg-[#3B1517] border border-[#B91C1C]/30 dark:border-[#F87171]/30 rounded-xl p-6 text-center space-y-3 ${className}`}
  >
    <AlertCircle className="w-7 h-7 text-[#B91C1C] dark:text-[#F87171] mx-auto" />
    <h3 className="text-sm font-bold text-[#991B1B] dark:text-[#FEE2E2]">{title}</h3>
    <p className="text-xs text-[#B91C1C] dark:text-[#FCA5A5] max-w-md mx-auto">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </div>
);

