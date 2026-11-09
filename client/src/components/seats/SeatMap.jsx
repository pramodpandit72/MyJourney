import React from 'react';
import { Armchair, Check, UserCheck, Shield } from 'lucide-react';

export const SeatMap = ({
  layoutType = '2+2',
  seats = [],
  selectedSeats = [],
  onSeatToggle,
  maxPassengers = 6,
  farePerSeat = 0
}) => {
  // Group seats by row
  const rowMap = new Map();
  seats.forEach((seat) => {
    const r = seat.row || 1;
    if (!rowMap.has(r)) {
      rowMap.set(r, []);
    }
    rowMap.get(r).push(seat);
  });

  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Bus Top Header / Steering Indicator */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Your Seat(s)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Layout: {layoutType} • Max {maxPassengers} seats per transaction
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>Front / Driver</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-4 mb-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded border-2 border-blue-600 bg-white dark:bg-slate-900"></div>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center cursor-not-allowed">
            <span className="text-[10px] font-bold">✕</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-medium">Booked</span>
        </div>
      </div>

      {/* Seat Grid - Bus Container */}
      <div className="max-w-md mx-auto p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-950/60 border-2 border-slate-300 dark:border-slate-800 relative">
        {/* Bus Front Windshield Arc */}
        <div className="w-28 h-2 mx-auto mb-5 rounded-full bg-slate-300 dark:bg-slate-700"></div>

        <div className="space-y-3">
          {sortedRows.map((rowNum) => {
            const rowSeats = rowMap.get(rowNum) || [];
            rowSeats.sort((a, b) => (a.col || 0) - (b.col || 0));

            const isLayout2x2 = layoutType === '2+2' || rowSeats.length >= 4;
            const leftSeats = isLayout2x2 ? rowSeats.slice(0, 2) : rowSeats.slice(0, 1);
            const rightSeats = isLayout2x2 ? rowSeats.slice(2) : rowSeats.slice(1);

            return (
              <div key={rowNum} className="flex justify-between items-center px-3">
                {/* Left Side */}
                <div className="flex space-x-2">
                  {leftSeats.map((seat) => {
                    const isBooked = seat.status === 'BOOKED' || seat.isBooked;
                    const isSelected = selectedSeats.includes(seat.seatNumber);

                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        disabled={isBooked}
                        onClick={() => onSeatToggle(seat.seatNumber)}
                        aria-label={`Seat ${seat.seatNumber} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                        className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                          isBooked
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-2 border-blue-500/40 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        }`}
                      >
                        <Armchair className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                        <span className="text-[10px] leading-none">{seat.seatNumber}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-8 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  {rowNum}
                </div>

                {/* Right Side */}
                <div className="flex space-x-2">
                  {rightSeats.map((seat) => {
                    const isBooked = seat.status === 'BOOKED' || seat.isBooked;
                    const isSelected = selectedSeats.includes(seat.seatNumber);

                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        disabled={isBooked}
                        onClick={() => onSeatToggle(seat.seatNumber)}
                        aria-label={`Seat ${seat.seatNumber} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                        className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                          isBooked
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-2 border-blue-500/40 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        }`}
                      >
                        <Armchair className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                        <span className="text-[10px] leading-none">{seat.seatNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Seats Bottom Summary */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-center sm:text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400">Selected Seats ({selectedSeats.length}):</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {selectedSeats.length > 0 ? (
              selectedSeats.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No seats selected yet</span>
            )}
          </div>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Fare:</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            ₹{selectedSeats.length * farePerSeat}
          </p>
        </div>
      </div>
    </div>
  );
};

