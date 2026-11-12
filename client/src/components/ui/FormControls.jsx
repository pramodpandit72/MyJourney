import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

const baseInputClasses =
  'w-full h-10 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-sm text-[#172B24] dark:text-[#F0FDF4] placeholder:text-[#64748B] dark:placeholder:text-[#A7C4B0] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80] focus:ring-2 focus:ring-[#166534]/20 dark:focus:ring-[#4ADE80]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors';

export const Input = React.forwardRef(
  ({ label, error, icon: Icon, hint, className = '', id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="w-4 h-4 text-[#64748B] dark:text-[#A7C4B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <input
            ref={ref}
            id={id}
            className={`${baseInputClasses} ${Icon ? 'pl-9' : ''} ${
              error ? 'border-[#B91C1C] dark:border-[#F87171]' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] font-medium text-[#B91C1C] dark:text-[#F87171]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ label, error, icon: Icon, children, className = '', id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="w-4 h-4 text-[#64748B] dark:text-[#A7C4B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <select
            ref={ref}
            id={id}
            className={`${baseInputClasses} ${Icon ? 'pl-9' : ''} ${
              error ? 'border-[#B91C1C] dark:border-[#F87171]' : ''
            } ${className}`}
            {...props}
          >
            {children}
          </select>
        </div>
        {error && (
          <p className="text-[11px] font-medium text-[#B91C1C] dark:text-[#F87171]">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const DatePicker = React.forwardRef(({ label, error, className = '', id, ...props }, ref) => (
  <Input ref={ref} id={id} type="date" label={label} error={error} className={className} {...props} />
));
DatePicker.displayName = 'DatePicker';

/**
 * Searchable Dropdown for selecting bus stops or options from the backend database
 */
export const SearchableDropdown = ({
  label,
  icon: Icon,
  options = [], // [{ value, label, sublabel, searchText }]
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search city, stop, or code...',
  disabled = false,
  loading = false
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    const target = `${opt.label} ${opt.sublabel || ''} ${opt.searchText || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={containerRef} className="space-y-1.5 w-full relative">
      {label && (
        <label className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />}
          <span>{label}</span>
        </label>
      )}

      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full h-11 px-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] hover:border-[#166534]/50 dark:hover:border-[#4ADE80]/50 rounded-lg text-left flex items-center justify-between gap-2 text-sm text-[#172B24] dark:text-[#F0FDF4] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 dark:focus:ring-[#4ADE80]/20 disabled:opacity-60 transition-colors cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          {loading ? (
            <span className="text-[#64748B] dark:text-[#A7C4B0]">Loading stops...</span>
          ) : selectedOption ? (
            <div className="truncate">
              <span className="font-semibold">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-xs text-[#64748B] dark:text-[#A7C4B0] ml-1.5">
                  ({selectedOption.sublabel})
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#64748B] dark:text-[#A7C4B0]">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#64748B] dark:text-[#A7C4B0] shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-40 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl shadow-lg overflow-hidden">
          {/* Search Input Header */}
          <div className="p-2 border-b border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#10231B]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#A7C4B0] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-7 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-md text-xs text-[#172B24] dark:text-[#F0FDF4] placeholder:text-[#64748B] dark:placeholder:text-[#A7C4B0] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172B24] dark:text-[#A7C4B0]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <ul className="max-h-60 overflow-y-auto divide-y divide-[#DCE7DF]/50 dark:divide-[#294A38]/50">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-[#64748B] dark:text-[#A7C4B0]">
                No matching stops found.
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#DCFCE7] dark:bg-[#234B35] text-[#14532D] dark:text-[#F0FDF4] font-semibold'
                          : 'text-[#172B24] dark:text-[#F0FDF4] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{opt.label}</p>
                        {opt.sublabel && (
                          <p className="text-[11px] text-[#475569] dark:text-[#A7C4B0] truncate">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#166534] dark:text-[#4ADE80] shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

