import test from 'node:test'
import assert from 'node:assert/strict'
import {
  countArchivedItemsByType,
  evaluationDataReferencesItem,
} from './evaluation-items-archive-helpers'

test('countArchivedItemsByType aggregates okr and competency counts', () => {
  const result = countArchivedItemsByType([
    { type: 'okr', _count: { _all: 3 } },
    { type: 'competency', _count: { _all: 5 } },
    { type: 'unknown', _count: { _all: 2 } },
  ])

  assert.deepEqual(result, { okrs: 3, competencies: 5 })
})

test('countArchivedItemsByType returns zeroes for empty input', () => {
  assert.deepEqual(countArchivedItemsByType([]), { okrs: 0, competencies: 0 })
})

test('evaluationDataReferencesItem detects item id inside JSON array', () => {
  const json = JSON.stringify([
    { id: 'item_1', title: 'OKR 1', rating: 4 },
    { id: 'item_2', title: 'Comp 1', rating: 5 },
  ])

  assert.equal(evaluationDataReferencesItem(json, 'item_1'), true)
  assert.equal(evaluationDataReferencesItem(json, 'item_2'), true)
  assert.equal(evaluationDataReferencesItem(json, 'item_3'), false)
  // Must not false-positive on substring matches
  assert.equal(evaluationDataReferencesItem(json, 'item_'), false)
})

test('evaluationDataReferencesItem detects item id inside JSON object map', () => {
  const json = JSON.stringify({
    item_a: { id: 'item_a', rating: 3 },
  })

  assert.equal(evaluationDataReferencesItem(json, 'item_a'), true)
  assert.equal(evaluationDataReferencesItem(json, 'item_b'), false)
})

test('evaluationDataReferencesItem handles null, empty, and malformed JSON safely', () => {
  assert.equal(evaluationDataReferencesItem(null, 'item_1'), false)
  assert.equal(evaluationDataReferencesItem(undefined, 'item_1'), false)
  assert.equal(evaluationDataReferencesItem('', 'item_1'), false)
  assert.equal(evaluationDataReferencesItem('{not valid json', 'item_1'), false)
})
