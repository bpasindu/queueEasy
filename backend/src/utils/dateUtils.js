/**
 * QueueEase V2 — Date Helpers
 *
 * Appointments are booked for a specific *day* + `timeSlot.start` (HH:mm).
 * Storing/querying the raw `Date` object (which includes a time-of-day and
 * timezone) made the double-booking check timezone-dependent — a client
 * sending a local-time ISO string could collide with, or fail to collide
 * with, an existing appointment depending on the server's timezone.
 *
 * Fix: always normalize the appointment `date` to UTC midnight before
 * storing or querying. The actual time-of-day lives entirely in
 * `timeSlot.start` / `timeSlot.end`.
 */

/**
 * Normalize a date (Date, ISO string, etc.) to UTC midnight of that
 * calendar day.
 */
function toUTCDateOnly(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

module.exports = { toUTCDateOnly };
