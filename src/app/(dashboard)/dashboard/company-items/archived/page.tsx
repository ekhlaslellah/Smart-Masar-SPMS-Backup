import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma-client'
import { countArchivedItemsByType } from '@/lib/actions/evaluations/evaluation-items-archive-helpers'
import ArchivedItemsClient from './ArchivedItemsClient'

interface ArchivedCompanyEvaluationItem {
  id: string
  title: string
  description: string
  type: 'okr' | 'competency'
  level: 'company'
  createdBy: string
  creatorRole: string
  active: boolean
  createdAt: string
  archivedAt: string | null
  archivedBy: string
  archivedReason: string
}

async function getArchivedCompanyItems(companyId: string): Promise<ArchivedCompanyEvaluationItem[]> {
  try {
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

    return archivedItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type as 'okr' | 'competency',
      level: 'company' as const,
      createdBy: item.creator?.name || 'Unknown',
      creatorRole: item.creator?.role || 'unknown',
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      archivedAt: item.archivedAt?.toISOString() || null,
      archivedBy: item.archivedByUser?.name || 'Unknown',
      archivedReason: item.archivedReason || 'No reason provided'
    }))
  } catch (error) {
    console.error('Error fetching archived company items:', error)
    return []
  }
}

async function getArchivedItemsCount(companyId: string): Promise<{ okrs: number; competencies: number }> {
  try {
    const results = await prisma.evaluationItem.groupBy({
      by: ['type'],
      where: {
        companyId,
        level: 'company',
        archivedAt: { not: null }
      },
      _count: {
        _all: true
      }
    })

    return countArchivedItemsByType(results)
  } catch (error) {
    console.error('Error fetching archived items count:', error)
    return { okrs: 0, competencies: 0 }
  }
}

export default async function ArchivedCompanyItemsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'hr') {
    redirect('/login')
  }

  const companyId = session.user.companyId
  
  if (!companyId) {
    redirect('/login')
  }

  // Fetch archived company items
  const archivedItems = await getArchivedCompanyItems(companyId)
  
  // Get archived items count for breadcrumb info
  const archivedCount = await getArchivedItemsCount(companyId)

  return (
    <ArchivedItemsClient 
      archivedItems={archivedItems}
      archivedCount={archivedCount}
    />
  )
}