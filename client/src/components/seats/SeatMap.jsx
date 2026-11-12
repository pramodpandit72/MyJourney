import React from 'react';
import { Armchair, Check, Disc } from 'lucide-react';
import { StatusBadge } from '../ui/index.js';

export const SeatMap = ({
  layoutType = '2+2',
  seats = [],
  selectedSeats = [],
  onSeatToggle,
  maxPassengers = 6,
  farePerSeat = 0
}) => {
  const rowMap = new Map();
  seats.forEach((seat) => {
    const r = seat.row || 1;
    if (!rowMap.has(r)) rowMap.set(r, []);
    rowMap.get(r).push(seat);
  });

  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);

  const renderSeatButton = (seat) => {
    const isBooked = seat.status === 'BOOKED' || seat.isBooked;
    const isUnavailable = seat.status === 'UNAVAILABLE' || seat.status === 'BLOCKED';
    const isDisabled = isBooked || isUnavailable;
    const isSelected = selectedSeats.includes(seat.seatNumber);

    let seatClass =
      'bg-white dark:bg-[#162B22] text-[#172B24] dark:text-[#F0FDF4] border-2 border-[#15803D]/55 dark:border-[#4ADE80]/50 hover:border-[#166534] dark:hover:border-[#4ADE80] hover:bg-[#F0FDF4] dark:hover:bg-[#1C382C] cursor-pointer';

    if (isUnavailable) {
      seatClass =
        'bg-[#EFF6F1] dark:bg-[#0B1712] text-[#64748B] dark:text-[#64748B] border border-dashed border-[#B8CEBF] dark:border-[#294A38] cursor-not-allowed opacity-70';
    } else if (isBooked) {
      seatClass =
        'bg-[#DCE7DF] dark:bg-[#10231B] text-[#64748B] dark:text-[#64748B] border border-[#B8CEBF] dark:border-[#294A38] cursor-not-allowed';
    } else if (isSelected) {
      seatClass =
        'bg-[#166534] dark:bg-[#15803D] text-white border-2 border-[#14532D] dark:border-[#4ADE80] shadow-xs cursor-pointer';
    }

    const statusLabel = isUnavailable
      ? 'Unavailable'
      : isBooked
      ? 'Booked'
      : isSelected
      ? 'Selected'
      : 'Available';

    return (
      <button
        key={seat.seatNumber}
        type="button"
        disabled={isDisabled}
        onClick={() => onSeatToggle(seat.seatNumber)}
        aria-label={`Seat ${seat.seatNumber} (${statusLabel})`}
        title={`Seat ${seat.seatNumber} — ${statusLabel}`}
        className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-semibold text-xs transition-colors relative ${seatClass}`}
      >
        <Armchair className="w-3.5 h-3.5 mb-0.5" />
        <span className="text-[10px] font-bold leading-none">{seat.seatNumber}</span>
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-[#162B22] rounded-xl border border-[#DCE7DF] dark:border-[#294A38] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-[#DCE7DF] dark:border-[#294A38]">
        <div>
          <h3 className="font-bold text-[#14532D] dark:text-[#F0FDF4] text-base">
            Select Your Preferred Seat(s)
          </h3>
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
            Coach Layout: {layoutType} • Up to {maxPassengers} seats per booking
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0FDF4] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-[#14532D] dark:text-[#D1E7D8] text-xs font-semibold">
          <Disc className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
          <span>Driver / Front</span>
        </div>
      </div>

      {/* Clear 4-State Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2.5 px-4 rounded-lg bg-[#F7FAF8] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded border-2 border-[#15803D] dark:border-[#4ADE80] bg-white dark:bg-[#162B22] inline-block" />
          <span className="text-[#172B24] dark:text-[#D1E7D8] font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-[#166534] dark:bg-[#15803D] text-white flex items-center justify-center">
            <Check className="w-3 h-3" />
          </span>
          <span className="text-[#172B24] dark:text-[#D1E7D8] font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-[#DCE7DF] dark:bg-[#10231B] border border-[#B8CEBF] dark:border-[#294A38] inline-block" />
          <span className="text-[#475569] dark:text-[#A7C4B0] font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded border border-dashed border-[#B8CEBF] dark:border-[#294A38] bg-[#EFF6F1] dark:bg-[#0B1712] inline-block" />
          <span className="text-[#64748B] dark:text-[#A7C4B0] font-medium">Unavailable</span>
        </div>
      </div>

      {/* Bus Coach Frame */}
      <div className="max-w-sm mx-auto p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#10231B] border-2 border-[#DCE7DF] dark:border-[#294A38]">
        {/* Front Windshield Bar */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#DCE7DF] dark:border-[#294A38] text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0]">
          <span>Entry</span>
          <span className="px-2 py-0.5 rounded bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4]">
            Front Deck
          </span>
          <span>Driver</span>
        </div>

        <div className="space-y-2.5">
          {sortedRows.map((rowNum) => {
            const rowSeats = [...(rowMap.get(rowNum) || [])].sort(
              (a, b) => (a.col || 0) - (b.col || 0)
            );
            const isLayout2x2 = layoutType === '2+2' || rowSeats.length >= 4;
            const leftSeats = isLayout2x2 ? rowSeats.slice(0, 2) : rowSeats.slice(0, 1);
            const rightSeats = isLayout2x2 ? rowSeats.slice(2) : rowSeats.slice(1);

            return (
              <div key={rowNum} className="flex justify-between items-center gap-2">
                <div className="flex gap-2">{leftSeats.map(renderSeatButton)}</div>
                <div className="w-7 text-center text-[10px] font-mono text-[#64748B] dark:text-[#A7C4B0]">
                  R{rowNum}
                </div>
                <div className="flex gap-2">{rightSeats.map(renderSeatButton)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fare & Seat Summary Bar */}
      <div className="pt-4 border-t border-[#DCE7DF] dark:border-[#294A38] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs font-semibold text-[#475569] dark:text-[#A7C4B0]">
            Selected Seats ({selectedSeats.length}):
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {selectedSeats.length > 0 ? (
              selectedSeats.map((s) => (
                <StatusBadge key={s} variant="success">
                  {s}
                </StatusBadge>
              ))
            ) : (
              <span className="text-xs text-[#64748B] dark:text-[#A7C4B0] italic">
                Tap any available seat above to select
              </span>
            )}
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
            Base Fare ({selectedSeats.length} × ₹{farePerSeat})
          </p>
          <p className="text-xl font-bold text-[#166534] dark:text-[#4ADE80] font-mono">
            ₹{selectedSeats.length * farePerSeat}
          </p>
        </div>
      </div>
    </div>
  );
};
