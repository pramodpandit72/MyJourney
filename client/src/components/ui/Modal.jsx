import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  footer
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1712]/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl w-full ${maxWidth} shadow-xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-150`}
      >
        <div className="px-5 py-4 border-b border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#10231B] flex items-start justify-between gap-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172B24] dark:text-[#A7C4B0] dark:hover:text-[#F0FDF4] hover:bg-[#EFF6F1] dark:hover:bg-[#1C382C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-5 py-3.5 border-t border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#10231B] flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  children
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] text-[#B91C1C] dark:text-[#F87171] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#475569] dark:text-[#D1E7D8] leading-relaxed pt-0.5">
            {description}
          </p>
        </div>
        {children}
      </div>
    </Modal>
  );
};

