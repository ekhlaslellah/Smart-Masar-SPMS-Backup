import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma-client'
import { isAIEnabled } from '@/lib/ai-features'
import { countArchivedItemsByType } from '@/lib/actions/evaluations/evaluation-items-archive-helpers'
import CompanyItemsClient from './CompanyItemsClient'

interface CompanyEvaluationItem {
  id: string
  title: string
  description: string
  type: 'okr' | 'competency'
  level: 'company'
  createdBy: string
  creatorRole: string
  evaluationDeadline?: string | null
  deadlineSetBy?: string | null
  active: boolean
  createdAt: string
}

async function getCompanyItems(companyId: string): Promise<CompanyEvaluationItem[]> {
  const items = await prisma.evaluationItem.findMany({
    where: {
      companyId,
      level: 'company',
      archivedAt: null
    },
    include: {
      creator: {
        select: {
          name: true,
          role: true
        }
      },
      deadlineSetByUser: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      { active: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type as 'okr' | 'competency',
    level: 'company' as const,
    createdBy: item.creator?.name || 'Unknown',
    creatorRole: item.creator?.role || 'unknown',
    evaluationDeadline: item.evaluationDeadline?.toISOString() || null,
    deadlineSetBy: item.deadlineSetByUser?.name || null,
    active: item.active,
    createdAt: item.createdAt.toISOString()
  }))
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

export default async function CompanyItemsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Only HR can access this page
  if (session.user.role !== 'hr') {
    redirect('/dashboard')
  }

  const companyId = session.user.companyId
  if (!companyId) {
    redirect('/login')
  }

  // Fetch company items directly from database
  const companyItems = await getCompanyItems(companyId)
  
  // Get archived items count
  const archivedCount = await getArchivedItemsCount(companyId)

  // Check if AI features are enabled for this company
  const aiEnabled = await isAIEnabled(companyId)

  return (
    <CompanyItemsClient 
      initialItems={companyItems} 
      aiEnabled={aiEnabled}
      userDepartment={session.user.department}
      archivedCount={archivedCount}
    />
  )
}