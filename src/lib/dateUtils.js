/**
 * Date Utilities for KpInterns
 * Safe for both Client Components and Server-side Node.js environments.
 */

/**
 * Calculates end date based on start date and duration string.
 * Adheres strictly to month calendar boundaries:
 * - 4 Weeks / 1 Month: 1 full month (e.g. 1st to last day of month: 30 or 31 or 28/29 days)
 * - 8 Weeks / 2 Months: 2 full months
 * - 12 Weeks / 3 Months: 3 full months
 * - 16 Weeks / 4 Months: 4 full months
 * - 24 Weeks / 6 Months: 6 full months
 * - 2 Weeks: 14 days (inclusive)
 * - 6 Weeks: 42 days (inclusive)
 */
export function calculateEndDate(startDate, durationStr) {
  if (!startDate) return new Date();
  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    return new Date();
  }

  const raw = String(durationStr || "").trim().toLowerCase();

  // Helper to add N full calendar months (inclusive)
  const addMonthsInclusive = (baseDate, months) => {
    const d = new Date(baseDate);
    const day = d.getDate();
    // If starting on 1st of month, end on last day of target month (e.g. 30th for 30-day month, 31st for 31-day month)
    if (day === 1) {
      return new Date(d.getFullYear(), d.getMonth() + months, 0, 23, 59, 59, 999);
    }
    // Mid-month start: move forward N months and subtract 1 day to make the range inclusive
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const lastDayOfTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDayOfTargetMonth));
    d.setDate(d.getDate() - 1);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // 1-week
  if (raw === "1-week" || raw === "1 week") {
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    return d;
  }

  // 2-weeks
  if (raw === "2-weeks" || raw === "2 weeks" || raw === "2-week") {
    const d = new Date(start);
    d.setDate(d.getDate() + 13);
    return d;
  }

  // 4-weeks / 1-month
  if (
    raw === "4-weeks" || raw === "4 weeks" || raw === "4-week" ||
    raw === "1-month" || raw === "1 month" || raw === "1-months"
  ) {
    return addMonthsInclusive(start, 1);
  }

  // 6-weeks
  if (raw === "6-weeks" || raw === "6 weeks" || raw === "6-week") {
    const d = new Date(start);
    d.setDate(d.getDate() + 41);
    return d;
  }

  // 8-weeks / 2-months
  if (
    raw === "8-weeks" || raw === "8 weeks" || raw === "8-week" ||
    raw === "2-months" || raw === "2 months" || raw === "2-month"
  ) {
    return addMonthsInclusive(start, 2);
  }

  // 12-weeks / 3-months
  if (
    raw === "12-weeks" || raw === "12 weeks" || raw === "12-week" ||
    raw === "3-months" || raw === "3 months" || raw === "3-month"
  ) {
    return addMonthsInclusive(start, 3);
  }

  // 16-weeks / 4-months
  if (
    raw === "16-weeks" || raw === "16 weeks" || raw === "16-week" ||
    raw === "4-months" || raw === "4 months" || raw === "4-month"
  ) {
    return addMonthsInclusive(start, 4);
  }

  // 24-weeks / 6-months
  if (
    raw === "24-weeks" || raw === "24 weeks" || raw === "24-week" ||
    raw === "6-months" || raw === "6 months" || raw === "6-month"
  ) {
    return addMonthsInclusive(start, 6);
  }

  // 1-year / 12-months
  if (
    raw === "1-year" || raw === "1 year" ||
    raw === "12-months" || raw === "12 months"
  ) {
    return addMonthsInclusive(start, 12);
  }

  // Fallback: 14 days
  const d = new Date(start);
  d.setDate(d.getDate() + 13);
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
