import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatDateDeterministic,
  formatDateTimeDeterministic,
  formatTimeDeterministic,
  toDateSafe,
  toISOStringSafe,
} from './date'
import { calculateDeadlineInfo } from '../deadline-utils'

test('formatDateDeterministic outputs stable UTC YYYY-MM-DD', () => {
  assert.equal(formatDateDeterministic('2026-11-23T01:30:00.000Z'), '2026-11-23')
  assert.equal(formatDateDeterministic(new Date('2026-01-05T23:59:59.000Z')), '2026-01-05')
  assert.equal(formatDateDeterministic(null, 'N/A'), 'N/A')
  assert.equal(formatDateDeterministic('not-a-date', 'N/A'), 'N/A')
})

test('formatDateTimeDeterministic outputs stable UTC YYYY-MM-DD HH:mm', () => {
  assert.equal(formatDateTimeDeterministic('2026-11-23T09:05:42.000Z'), '2026-11-23 09:05')
  assert.equal(formatDateTimeDeterministic(undefined, '-'), '-')
})

test('formatTimeDeterministic outputs stable UTC HH:mm:ss', () => {
  assert.equal(formatTimeDeterministic('2026-11-23T09:05:07.000Z'), '09:05:07')
  assert.equal(formatTimeDeterministic(null), '')
})

test('toDateSafe and toISOStringSafe reject invalid dates safely', () => {
  assert.equal(toDateSafe('invalid-date'), null)
  assert.equal(toISOStringSafe(new Date('invalid')), null)
  assert.equal(toISOStringSafe('2026-11-23T00:00:00.000Z'), '2026-11-23T00:00:00.000Z')
})

test('calculateDeadlineInfo uses deterministic UTC day boundaries', () => {
  const ref = new Date('2026-11-23T23:50:00.000Z')
  const infoDueToday = calculateDeadlineInfo('2026-11-23T00:10:00.000Z', ref)
  assert.ok(infoDueToday)
  assert.equal(infoDueToday.isToday, true)
  assert.equal(infoDueToday.isOverdue, false)
  assert.equal(infoDueToday.urgencyLevel, 'high')
  assert.equal(infoDueToday.formattedDate, '2026-11-23')

  const infoOverdue = calculateDeadlineInfo('2026-11-20T00:00:00.000Z', ref)
  assert.ok(infoOverdue)
  assert.equal(infoOverdue.isOverdue, true)
  assert.equal(infoOverdue.daysRemaining, 3)
  assert.equal(infoOverdue.urgencyLevel, 'overdue')

  const infoLow = calculateDeadlineInfo('2026-12-10T00:00:00.000Z', ref)
  assert.ok(infoLow)
  assert.equal(infoLow.isOverdue, false)
  assert.equal(infoLow.daysRemaining, 17)
  assert.equal(infoLow.urgencyLevel, 'low')
})
