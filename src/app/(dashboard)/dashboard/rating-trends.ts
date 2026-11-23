/**
 * Pure aggregation utilities for 6-month company-wide performance rating trends.
 * Uses deterministic UTC month bucketing so server rendering and client hydration
 * always agree regardless of server or browser timezone/locale.
 */

export interface RatingTrendEvaluationInput {
  overallRating: number | null
  updatedAt: Date | string
  createdAt?: Date | string | null
}

export interface RatingTrendPoint {
  monthKey: string // YYYY-MM (UTC)
  labelEn: string
  labelAr: string
  averageRating: number | null
  completedCount: number
}

export interface RatingTrendSummary {
  overallAverage: number | null
  latestAverage: number | null
  latestMonthKey: string | null
  deltaFromPrevious: number | null
  direction: 'up' | 'down' | 'flat' | 'none'
  totalEvaluations: number
  monthsWithData: number
}

const MONTH_LABELS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

const MONTH_LABELS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
] as const

/**
 * Returns the UTC start timestamp of the 6-month window ending in referenceDate's month.
 * Example: for Nov 22, 2026 -> returns 2026-06-01T00:00:00.000Z (covering Jun..Nov 2026).
 */
export function getSixMonthWindowStart(referenceDate: Date = new Date()): Date {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 5, 1, 0, 0, 0, 0)
  )
}

function toMonthKey(year: number, monthIndexZeroBased: number): string {
  return `${year}-${String(monthIndexZeroBased + 1).padStart(2, '0')}`
}

/**
 * Aggregates rated evaluations into 6 consecutive UTC monthly buckets
 * ending at `referenceDate`'s month (oldest -> newest).
 */
export function buildSixMonthRatingTrends(
  evaluations: RatingTrendEvaluationInput[],
  referenceDate: Date = new Date()
): RatingTrendPoint[] {
  const buckets = new Map<
    string,
    { labelEn: string; labelAr: string; sum: number; count: number }
  >()

  const orderedKeys: string[] = []
  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(
      Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - offset, 1)
    )
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const key = toMonthKey(year, month)
    orderedKeys.push(key)
    buckets.set(key, {
      labelEn: `${MONTH_LABELS_EN[month]} ${year}`,
      labelAr: `${MONTH_LABELS_AR[month]} ${year}`,
      sum: 0,
      count: 0
    })
  }

  for (const evaluation of evaluations) {
    const rating = evaluation.overallRating
    if (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      continue
    }

    const rawDate = evaluation.updatedAt ?? evaluation.createdAt
    if (!rawDate) continue

    const parsed = rawDate instanceof Date ? rawDate : new Date(rawDate)
    if (Number.isNaN(parsed.getTime())) continue

    const key = toMonthKey(parsed.getUTCFullYear(), parsed.getUTCMonth())
    const bucket = buckets.get(key)
    if (!bucket) continue

    bucket.sum += rating
    bucket.count += 1
  }

  return orderedKeys.map((monthKey) => {
    const bucket = buckets.get(monthKey)!
    return {
      monthKey,
      labelEn: bucket.labelEn,
      labelAr: bucket.labelAr,
      averageRating:
        bucket.count > 0 ? Math.round((bucket.sum / bucket.count) * 100) / 100 : null,
      completedCount: bucket.count
    }
  })
}

/**
 * Summarizes the 6-month trend points for KPI readout (weighted average,
 * latest rated month, and delta vs the previous rated month).
 */
export function summarizeRatingTrend(points: RatingTrendPoint[]): RatingTrendSummary {
  let weightedSum = 0
  let totalEvaluations = 0
  const ratedMonths: RatingTrendPoint[] = []

  for (const point of points) {
    if (point.averageRating !== null && point.completedCount > 0) {
      weightedSum += point.averageRating * point.completedCount
      totalEvaluations += point.completedCount
      ratedMonths.push(point)
    }
  }

  const overallAverage =
    totalEvaluations > 0 ? Math.round((weightedSum / totalEvaluations) * 100) / 100 : null

  if (ratedMonths.length === 0) {
    return {
      overallAverage: null,
      latestAverage: null,
      latestMonthKey: null,
      deltaFromPrevious: null,
      direction: 'none',
      totalEvaluations: 0,
      monthsWithData: 0
    }
  }

  const latest = ratedMonths[ratedMonths.length - 1]
  const previous = ratedMonths.length >= 2 ? ratedMonths[ratedMonths.length - 2] : null

  const deltaFromPrevious =
    previous && latest.averageRating !== null && previous.averageRating !== null
      ? Math.round((latest.averageRating - previous.averageRating) * 100) / 100
      : null

  let direction: 'up' | 'down' | 'flat' | 'none' = 'none'
  if (deltaFromPrevious !== null) {
    if (deltaFromPrevious > 0) direction = 'up'
    else if (deltaFromPrevious < 0) direction = 'down'
    else direction = 'flat'
  }

  return {
    overallAverage,
    latestAverage: latest.averageRating,
    latestMonthKey: latest.monthKey,
    deltaFromPrevious,
    direction,
    totalEvaluations,
    monthsWithData: ratedMonths.length
  }
}
