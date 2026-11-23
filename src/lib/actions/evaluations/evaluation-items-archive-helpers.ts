/**
 * Pure helper functions for evaluation item archive operations and counting.
 * Kept free of database/Next.js dependencies so they can be unit tested directly.
 */

export interface ArchivedTypeCountRow {
  type: string
  _count: {
    _all: number
  }
}

/**
 * Aggregates Prisma groupBy results into OKR and Competency counts.
 */
export function countArchivedItemsByType(
  rows: ArchivedTypeCountRow[]
): { okrs: number; competencies: number } {
  let okrs = 0
  let competencies = 0

  for (const row of rows) {
    const count = Number(row._count._all) || 0
    if (row.type === 'okr') {
      okrs += count
    } else if (row.type === 'competency') {
      competencies += count
    }
  }

  return { okrs, competencies }
}

/**
 * Safely checks whether a serialized `evaluationItemsData` JSON payload
 * references a specific evaluation item ID.
 */
export function evaluationDataReferencesItem(
  evaluationItemsData: string | null | undefined,
  itemId: string
): boolean {
  if (!evaluationItemsData || !itemId) {
    return false
  }

  try {
    const parsed: unknown = JSON.parse(evaluationItemsData)
    if (Array.isArray(parsed)) {
      return parsed.some(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'id' in entry &&
          (entry as { id?: unknown }).id === itemId
      )
    }

    if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed as Record<string, unknown>).some(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'id' in entry &&
          (entry as { id?: unknown }).id === itemId
      )
    }

    return false
  } catch {
    return false
  }
}
