'use client'

import { useEffect, useState } from 'react'
import {
  calculateDeadlineInfo,
  getDeadlineStatusText,
  getDeadlineStyleClasses,
  type DeadlineInfo
} from '@/lib/deadline-utils'
import { formatDateDeterministic } from '@/lib/utils/date'
import { useLanguage } from '@/contexts/LanguageContext'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface DeadlineDisplayProps {
  deadline: string | null
  showIcon?: boolean
  showDate?: boolean
  className?: string
  compact?: boolean
}

export default function DeadlineDisplay({
  deadline,
  showIcon = true,
  showDate = true,
  className = '',
  compact = false
}: DeadlineDisplayProps) {
  const { t } = useLanguage()
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)

  // Compute relative urgency strictly on client mount to avoid SSR/client clock or timezone mismatch
  useEffect(() => {
    setDeadlineInfo(calculateDeadlineInfo(deadline))
  }, [deadline])

  if (!deadline) return null

  const fallbackDate = formatDateDeterministic(deadline)
  if (!fallbackDate) return null

  const statusText = deadlineInfo ? getDeadlineStatusText(deadlineInfo, t) : fallbackDate
  const styleClasses = deadlineInfo
    ? getDeadlineStyleClasses(deadlineInfo.urgencyLevel)
    : 'text-gray-600 bg-gray-50 border-gray-200'

  const IconComponent = deadlineInfo?.isOverdue
    ? AlertTriangle
    : deadlineInfo?.urgencyLevel === 'low'
      ? CheckCircle
      : Clock

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${styleClasses} ${className}`}>
      {showIcon && (
        <IconComponent
          size={compact ? 12 : 14}
          className={deadlineInfo?.isOverdue ? 'animate-pulse' : ''}
        />
      )}

      <div className="flex flex-col">
        <span className="font-semibold">
          {statusText}
        </span>

        {showDate && !compact && (
          <span className="text-xs opacity-80">
            {deadlineInfo?.formattedDate || fallbackDate}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for use in tight spaces like table cells
 */
export function CompactDeadlineDisplay({ deadline, className = '' }: { deadline: string | null; className?: string }) {
  return (
    <DeadlineDisplay
      deadline={deadline}
      showIcon={true}
      showDate={false}
      compact={true}
      className={className}
    />
  )
}

/**
 * Badge version for use in cards and headers
 */
export function DeadlineBadge({ deadline, className = '' }: { deadline: string | null; className?: string }) {
  const { t } = useLanguage()
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)

  useEffect(() => {
    setDeadlineInfo(calculateDeadlineInfo(deadline))
  }, [deadline])

  if (!deadline) return null

  const fallbackDate = formatDateDeterministic(deadline)
  if (!fallbackDate) return null

  const statusText = deadlineInfo ? getDeadlineStatusText(deadlineInfo, t) : fallbackDate
  const styleClasses = deadlineInfo
    ? getDeadlineStyleClasses(deadlineInfo.urgencyLevel)
    : 'text-gray-600 bg-gray-50 border-gray-200'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styleClasses} ${className}`}>
      <Clock size={12} />
      {statusText}
    </span>
  )
}