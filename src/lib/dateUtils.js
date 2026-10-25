/**
 * Date Utilities for KpInterns
 * Safe for both Client Components and Server-side Node.js environments.
 * 
 * Standard Rules for Internship Programs:
 * - Each week consists of 7 calendar days.
 * - Weekly off: 1 Sunday per week (e.g. 4 Sundays in 4 Weeks).
 * - Daily Schedule: 10:00 AM to 03:00 PM (5.0 Hours / day).
 * - Total Hours = (Total Calendar Days - Sundays) * 5.0 Hours:
 *   • 1 Week  (  7 days,  1 Sunday,   6 working days) =>  30 Hours
 *   • 2 Weeks ( 14 days,  2 Sundays, 12 working days) =>  60 Hours
 *   • 4 Weeks ( 28 days,  4 Sundays, 24 working days) => 120 Hours (1 Month)
 *   • 6 Weeks ( 42 days,  6 Sundays, 36 working days) => 180 Hours
 *   • 8 Weeks ( 56 days,  8 Sundays, 48 working days) => 240 Hours (2 Months)
 *   • 12 Weeks ( 84 days, 12 Sundays, 72 working days) => 360 Hours (3 Months)
 *   • 16 Weeks (112 days, 16 Sundays, 96 working days) => 480 Hours (4 Months)
 *   • 24 Weeks (168 days, 24 Sundays, 144 working days) => 720 Hours (6 Months)
 */

export const DAILY_LEARNING_HOURS = 5.0;
export const DEFAULT_CHECK_IN = "10:00 AM";
export const DEFAULT_CHECK_OUT = "03:00 PM";

/**
 * Returns exact number of calendar days for any given duration string.
 */
export function getDurationDays(durationStr) {
  if (!durationStr) return 28;
  const raw = String(durationStr).trim().toLowerCase();

  // Match weeks: "4 weeks", "4-week", "2 weeks", "12 weeks", etc.
  const weekMatch = raw.match(/(\d+)\s*(?:-| )?week/i);
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1], 10);
    if (!isNaN(weeks) && weeks > 0) {
      return weeks * 7;
    }
  }

  // Match months: "1 month", "2 months", "3-month", etc. (1 month = 4 weeks = 28 days)
  const monthMatch = raw.match(/(\d+)\s*(?:-| )?month/i);
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10);
    if (!isNaN(months) && months > 0) {
      return months * 4 * 7;
    }
  }

  // Match years: "1 year", "12 months" (52 weeks = 364 days)
  const yearMatch = raw.match(/(\d+)\s*(?:-| )?year/i);
  if (yearMatch) {
    const years = parseInt(yearMatch[1], 10);
    if (!isNaN(years) && years > 0) {
      return years * 52 * 7;
    }
  }

  // Known string constants fallback
  if (raw.includes("1 week")) return 7;
  if (raw.includes("2 week")) return 14;
  if (raw.includes("4 week") || raw.includes("1 month")) return 28;
  if (raw.includes("6 week")) return 42;
  if (raw.includes("8 week") || raw.includes("2 month")) return 56;
  if (raw.includes("12 week") || raw.includes("3 month")) return 84;
  if (raw.includes("16 week") || raw.includes("4 month")) return 112;
  if (raw.includes("24 week") || raw.includes("6 month")) return 168;

  return 28;
}

/**
 * Returns detailed breakdown of an internship program's schedule.
 */
export function getDurationDetails(durationStr) {
  const totalDays = getDurationDays(durationStr);
  const weeks = Math.round(totalDays / 7) || 1;
  const sundays = weeks;
  const workingDays = totalDays - sundays;
  const dailyHours = DAILY_LEARNING_HOURS;
  const totalHours = workingDays * dailyHours;

  return {
    totalDays,
    weeks,
    sundays,
    workingDays,
    dailyHours,
    totalHours,
    checkIn: DEFAULT_CHECK_IN,
    checkOut: DEFAULT_CHECK_OUT,
  };
}

/**
 * Calculates inclusive end date based on start date and duration string.
 * Example for 4 Weeks starting on 02-09-2026:
 * Total Days = 28
 * End Date = 29-09-2026 (Day 1: 02-09, ..., Day 28: 29-09)
 */
export function calculateEndDate(startDate, durationStr) {
  if (!startDate) return new Date();
  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    return new Date();
  }

  const days = getDurationDays(durationStr);
  const d = new Date(start);
  // Inclusive: day 1 is start date itself, so day N is start + (days - 1)
  d.setDate(d.getDate() + (days - 1));
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Safely formats Date objects or strings into DD-MM-YYYY format
 */
export const formatDate = (d) => {
  if (!d) return "N/A";
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  const str = String(d).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split('/');
    return `${day}-${month}-${year}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const date = new Date(d);
  if (isNaN(date.getTime())) return "N/A";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

