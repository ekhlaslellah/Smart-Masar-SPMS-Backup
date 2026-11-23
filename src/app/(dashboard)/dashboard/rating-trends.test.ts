import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSixMonthRatingTrends,
  getSixMonthWindowStart,
  summarizeRatingTrend
} from './rating-trends'

test('getSixMonthWindowStart computes exact UTC start of 6-month window across year boundary', () => {
  const refNov = new Date('2026-11-22T18:30:00.000Z')
  assert.equal(getSixMonthWindowStart(refNov).toISOString(), '2026-06-01T00:00:00.000Z')

  const refFeb = new Date('2026-02-15T10:00:00.000Z')
  assert.equal(getSixMonthWindowStart(refFeb).toISOString(), '2025-09-01T00:00:00.000Z')
})

test('buildSixMonthRatingTrends produces 6 ordered months and averages valid ratings', () => {
  const ref = new Date('2026-11-22T12:00:00.000Z')
  const points = buildSixMonthRatingTrends(
    [
      // Outside window (May 2026) -> ignored
      { overallRating: 5, updatedAt: '2026-05-31T23:59:59.000Z' },
      // June 2026: (3 + 4) / 2 = 3.5
      { overallRating: 3, updatedAt: '2026-06-05T10:00:00.000Z' },
      { overallRating: 4, updatedAt: '2026-06-20T10:00:00.000Z' },
      // Null / out-of-range ratings -> ignored
      { overallRating: null, updatedAt: '2026-07-10T10:00:00.000Z' },
      { overallRating: 6, updatedAt: '2026-07-11T10:00:00.000Z' },
      // October 2026: (4 + 4 + 5) / 3 = 4.33
      { overallRating: 4, updatedAt: '2026-10-01T00:00:00.000Z' },
      { overallRating: 4, updatedAt: '2026-10-12T00:00:00.000Z' },
      { overallRating: 5, updatedAt: '2026-10-28T00:00:00.000Z' },
      // November 2026: 5
      { overallRating: 5, updatedAt: '2026-11-15T08:00:00.000Z' }
    ],
    ref
  )

  assert.equal(points.length, 6)
  assert.deepEqual(
    points.map((p) => p.monthKey),
    ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']
  )
  assert.equal(points[0].averageRating, 3.5)
  assert.equal(points[0].completedCount, 2)
  assert.equal(points[1].averageRating, null)
  assert.equal(points[1].completedCount, 0)
  assert.equal(points[4].averageRating, 4.33)
  assert.equal(points[4].completedCount, 3)
  assert.equal(points[5].averageRating, 5)
  assert.equal(points[5].completedCount, 1)
})

test('summarizeRatingTrend calculates weighted average and delta from previous rated month', () => {
  const ref = new Date('2026-11-22T12:00:00.000Z')
  const points = buildSixMonthRatingTrends(
    [
      { overallRating: 3, updatedAt: '2026-09-10T00:00:00.000Z' },
      { overallRating: 4, updatedAt: '2026-11-10T00:00:00.000Z' },
      { overallRating: 5, updatedAt: '2026-11-12T00:00:00.000Z' }
    ],
    ref
  )

  const summary = summarizeRatingTrend(points)
  assert.equal(summary.totalEvaluations, 3)
  assert.equal(summary.monthsWithData, 2)
  assert.equal(summary.overallAverage, 4) // (3 + 4 + 5) / 3
  assert.equal(summary.latestAverage, 4.5)
  assert.equal(summary.latestMonthKey, '2026-11')
  assert.equal(summary.deltaFromPrevious, 1.5)
  assert.equal(summary.direction, 'up')
})

test('summarizeRatingTrend handles empty dataset gracefully', () => {
  const points = buildSixMonthRatingTrends([], new Date('2026-11-22T12:00:00.000Z'))
  const summary = summarizeRatingTrend(points)
  assert.equal(summary.totalEvaluations, 0)
  assert.equal(summary.overallAverage, null)
  assert.equal(summary.latestAverage, null)
  assert.equal(summary.deltaFromPrevious, null)
  assert.equal(summary.direction, 'none')
})
