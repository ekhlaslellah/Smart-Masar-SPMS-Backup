/**
 * Date utility functions for handling Date objects and string dates
 * Includes deterministic UTC formatters safe for Next.js SSR hydration.
 */

/**
 * Safely converts a date to ISO string, handling both Date objects and strings
 * @param date - Date object, string, or null/undefined
 * @returns ISO string or null
 */
export function toISOStringSafe(date: Date | string | null | undefined): string | null {
  if (!date) return null

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  if (typeof date === 'string') {
    // If it's already a string, assume it's an ISO string or valid date string
    return date
  }

  return null
}

/**
 * Safely converts a date to Date object, handling both Date objects and strings
 * @param date - Date object, string, or null/undefined
 * @returns Date object or null
 */
export function toDateSafe(date: Date | string | null | undefined): Date | null {
  if (!date) return null

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof date === 'string') {
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Formats a date deterministically as YYYY-MM-DD in UTC so SSR and client
 * hydration always match regardless of server/browser locale or timezone.
 */
export function formatDateDeterministic(
  date: Date | string | null | undefined,
  fallback = ''
): string {
  const d = toDateSafe(date)
  if (!d) return fallback
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

/**
 * Formats a timestamp deterministically as YYYY-MM-DD HH:mm UTC so SSR and
 * client hydration always match regardless of server/browser locale or timezone.
 */
export function formatDateTimeDeterministic(
  date: Date | string | null | undefined,
  fallback = ''
): string {
  const d = toDateSafe(date)
  if (!d) return fallback
  return `${formatDateDeterministic(d)} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`
}

/**
 * Formats a time deterministically as HH:mm:ss UTC so SSR and client hydration
 * always match regardless of server/browser locale or timezone.
 */
export function formatTimeDeterministic(
  date: Date | string | null | undefined,
  fallback = ''
): string {
  const d = toDateSafe(date)
  if (!d) return fallback
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`
}