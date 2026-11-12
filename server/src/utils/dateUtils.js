/**
 * Date and Time utilities for MyJourney
 * Primary display timezone: Asia/Kolkata (+05:30)
 */

/**
 * Returns UTC Date range (start and end) for a given YYYY-MM-DD date in Asia/Kolkata timezone.
 * India Standard Time is UTC+5:30 (no DST).
 * 00:00:00 IST on YYYY-MM-DD corresponds to (YYYY-MM-DD 00:00:00 minus 5h30m) = prev day 18:30:00 UTC.
 * 23:59:59.999 IST corresponds to (YYYY-MM-DD 18:29:59.999 UTC)
 */
export const getDayRangeInAsiaKolkata = (dateStr) => {
  // dateStr format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  // IST offset is +5.5 hours (+330 minutes)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;

  // Start of day in IST (00:00:00.000)
  const startOfDayUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - istOffsetMs;
  const startOfDay = new Date(startOfDayUtcMs);

  // End of day in IST (23:59:59.999)
  const endOfDayUtcMs = Date.UTC(year, month - 1, day, 23, 59, 59, 999) - istOffsetMs;
  const endOfDay = new Date(endOfDayUtcMs);

  return { startOfDay, endOfDay };
};

/**
 * Calculates human-readable duration between departure and arrival
 */
export const calculateDuration = (departureAt, arrivalAt) => {
  const diffMs = new Date(arrivalAt).getTime() - new Date(departureAt).getTime();
  if (diffMs <= 0) return '0h 0m';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

