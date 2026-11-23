/**
 * Evaluation Items - Archive Operations
 * 
 * This file contains all archive-related operations for evaluation items including:
 * - Archiving active items (moving them to archived state)
 * - Retrieving archived items with filtering and search
 * - Unarchiving items (restoring them to active state)
 * - Permanently deleting archived items with data integrity checks
 * 
 * All operations include proper permission checks, audit logging, and data validation.
 */

'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma-client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { toISOStringSafe } from '@/lib/utils/date'
import { createItemAuditLog, transformArchivedItem } from './evaluation-items-utils'
import { evaluationDataReferencesItem } from './evaluation-items-archive-helpers'
import type { EvaluationItemResult, FormattedArchivedItem } from './evaluation-items-types'

/**
 * Server action to archive an evaluation item
 */
export async function archiveEvaluationItem(itemId: string, reason?: string): Promise<EvaluationItemResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id
    const userRole = session.user.role
    const companyId = session.user.companyId

    // Only HR can archive company-level items
    if (userRole !== 'hr') {
      return { success: false, error: 'Only HR can archive company-wide items' }
    }

    // Check if item exists and is not already archived
    const existingItem = await prisma.evaluationItem.findFirst({
      where: {
        id: itemId,
        companyId,
        active: false // Only allow archiving of inactive items
      }
    })

    if (!existingItem) {
      return { success: false, error: 'Item not found or is still active. Please deactivate the item first.' }
    }

    // Archive the item
    await prisma.evaluationItem.update({
      where: { id: itemId },
      data: {
        archivedAt: new Date(),
        archivedBy: userId,
        archivedReason: reason || 'Archived by HR'
      }
    })

    // Audit log for archiving
    await createItemAuditLog(
      userId,
      userRole,
      companyId,
      'archive',
      itemId,
      {
        title: existingItem.title,
        active: existingItem.active,
        archived: false
      },
      {
        title: existingItem.title,
        active: existingItem.active,
        archived: true,
        archivedReason: reason || 'Archived by HR'
      }
    )

    revalidatePath('/dashboard/company-items')
    revalidatePath('/dashboard/company-items/archived')
    revalidateTag('company-items') // Invalidate cached company items

    return { success: true }

  } catch (error) {
    console.error('Error archiving evaluation item:', error)
    return { success: false, error: 'Failed to archive item' }
  }
}

/**
 * Server action to get archived evaluation items
 */
export async function getArchivedEvaluationItems(): Promise<EvaluationItemResult & { items?: FormattedArchivedItem[] }> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userRole = session.user.role
    const companyId = session.user.companyId

    // Only HR can view archived items
    if (userRole !== 'hr') {
      return { success: false, error: 'Only HR can view archived items' }
    }

    // Get archived company-wide items
    const archivedItems = await prisma.evaluationItem.findMany({
      where: {
        companyId,
        level: 'company',
        archivedAt: { not: null }
      },
      include: {
        creator: {
          select: {
            name: true,
            role: true
          }
        },
        archivedByUser: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: [
        { archivedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform to match expected format
    const formattedItems = await Promise.all(
      archivedItems.map((item) =>
        transformArchivedItem({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          level: item.level,
          active: item.active,
          createdAt: item.createdAt,
          archivedAt: item.archivedAt,
          archivedReason: item.archivedReason,
          creatorName: item.creator?.name ?? null,
          creatorRole: item.creator?.role ?? null,
          archivedByName: item.archivedByUser?.name ?? null,
          archivedByRole: item.archivedByUser?.role ?? null
        })
      )
    )

    return { success: true, items: formattedItems }

  } catch (error) {
    console.error('Error fetching archived evaluation items:', error)
    return { success: false, error: 'Failed to fetch archived items' }
  }
}

/**
 * Server action to unarchive an evaluation item
 */
export async function unarchiveEvaluationItem(itemId: string): Promise<EvaluationItemResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id
    const userRole = session.user.role
    const companyId = session.user.companyId

    // Only HR can unarchive company-level items
    if (userRole !== 'hr') {
      return { success: false, error: 'Only HR can unarchive company-wide items' }
    }

    // Check if item exists and is archived
    const existingItem = await prisma.evaluationItem.findFirst({
      where: {
        id: itemId,
        companyId,
        archivedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        level: true,
        active: true,
        createdAt: true,
        archivedAt: true,
        archivedReason: true
      }
    })

    if (!existingItem) {
      return { success: false, error: 'Archived item not found' }
    }

    // Unarchive the item by clearing archive fields but keeping it inactive
    await prisma.evaluationItem.update({
      where: { id: itemId },
      data: {
        archivedAt: null,
        archivedBy: null,
        archivedReason: null,
        active: false
      }
    })

    // Audit log for unarchiving
    await createItemAuditLog(
      userId,
      userRole,
      companyId,
      'unarchive',
      itemId,
      {
        title: existingItem.title,
        archived: true,
        archivedAt: toISOStringSafe(existingItem.archivedAt),
        archivedReason: existingItem.archivedReason
      },
      {
        title: existingItem.title,
        archived: false,
        active: false
      }
    )

    revalidatePath('/dashboard/company-items')
    revalidatePath('/dashboard/company-items/archived')
    revalidateTag('company-items') // Invalidate cached company items

    return { success: true }

  } catch (error) {
    console.error('Error unarchiving evaluation item:', error)
    return { success: false, error: 'Failed to unarchive item' }
  }
}

/**
 * Server action to permanently delete an archived evaluation item
 */
export async function deleteArchivedEvaluationItem(itemId: string): Promise<EvaluationItemResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id
    const userRole = session.user.role
    const companyId = session.user.companyId

    // Only HR can delete company-level items
    if (userRole !== 'hr') {
      return { success: false, error: 'Only HR can delete company-wide items' }
    }

    // Check if item exists and is archived
    const existingItem = await prisma.evaluationItem.findFirst({
      where: {
        id: itemId,
        companyId,
        archivedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        level: true,
        active: true,
        createdAt: true,
        archivedAt: true,
        archivedReason: true
      }
    })

    if (!existingItem) {
      return { success: false, error: 'Archived item not found' }
    }

    // Check if item has associated evaluations or assessments
    const candidateEvaluations = await prisma.evaluation.findMany({
      where: {
        companyId,
        evaluationItemsData: {
          contains: itemId
        }
      },
      select: {
        evaluationItemsData: true
      }
    })

    const hasEvaluations = candidateEvaluations.some((evaluation) =>
      evaluationDataReferencesItem(evaluation.evaluationItemsData, itemId)
    )

    const assessmentCount = await prisma.partialAssessment.count({
      where: {
        companyId,
        evaluationItemId: itemId
      }
    })

    const hasAssessments = assessmentCount > 0

    if (hasEvaluations || hasAssessments) {
      return { 
        success: false, 
        error: 'Cannot delete item that has associated evaluations or assessments. Data integrity must be preserved.' 
      }
    }

    // Delete individual assignments first (if any)
    await prisma.evaluationItemAssignment.deleteMany({
      where: {
        evaluationItemId: itemId
      }
    })

    // Audit log before deletion
    await createItemAuditLog(
      userId,
      userRole,
      companyId,
      'delete',
      itemId,
      {
        title: existingItem.title,
        description: existingItem.description,
        type: existingItem.type,
        archived: true,
        archivedAt: toISOStringSafe(existingItem.archivedAt),
        archivedReason: existingItem.archivedReason
      },
      null // No new data for deletion
    )

    // Permanently delete the item
    await prisma.evaluationItem.delete({
      where: { id: itemId }
    })

    revalidatePath('/dashboard/company-items/archived')

    return { success: true }

  } catch (error) {
    console.error('Error deleting archived evaluation item:', error)
    return { success: false, error: 'Failed to delete item' }
  }
}