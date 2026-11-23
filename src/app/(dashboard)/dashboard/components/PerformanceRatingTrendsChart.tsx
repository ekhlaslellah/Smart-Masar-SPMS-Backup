'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { summarizeRatingTrend, type RatingTrendPoint } from '../rating-trends'

interface PerformanceRatingTrendsChartProps {
  data: RatingTrendPoint[]
}

type ChartMetricView = 'rating' | 'volume'

interface CustomTooltipPayloadItem {
  value: number | null
  payload: RatingTrendPoint & { displayLabel: string }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: CustomTooltipPayloadItem[]
  isRTL: boolean
}

function RatingTrendTooltip({ active, payload, isRTL }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const point = payload[0].payload
  const hasRating = point.averageRating !== null && point.completedCount > 0

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-xs text-slate-800 min-w-[170px]"
    >
      <div className="font-semibold text-slate-900 mb-1.5">
        {point.displayLabel}
      </div>
      {hasRating ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">
              {isRTL ? 'متوسط التقييم' : 'Avg. Rating'}
            </span>
            <span className="font-bold text-teal-700 tabular-nums">
              {point.averageRating?.toFixed(2)} / 5.0
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">
              {isRTL ? 'التقييمات المقيمة' : 'Rated Evaluations'}
            </span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {point.completedCount}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-slate-500">
          {isRTL ? 'لا توجد تقييمات في هذا الشهر' : 'No rated evaluations this month'}
        </div>
      )}
    </div>
  )
}

export function PerformanceRatingTrendsChart({ data }: PerformanceRatingTrendsChartProps) {
  const { isRTL } = useLanguage()
  const [metricView, setMetricView] = useState<ChartMetricView>('rating')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        displayLabel: isRTL ? point.labelAr : point.labelEn
      })),
    [data, isRTL]
  )

  const summary = useMemo(() => summarizeRatingTrend(data), [data])
  const hasAnyData = summary.totalEvaluations > 0

  const maxVolume = useMemo(() => {
    const highest = chartData.reduce((max, p) => Math.max(max, p.completedCount), 0)
    return Math.max(4, Math.ceil(highest * 1.25))
  }, [chartData])

  const deltaFormatted =
    summary.deltaFromPrevious !== null
      ? `${summary.deltaFromPrevious > 0 ? '+' : ''}${summary.deltaFromPrevious.toFixed(2)}`
      : null

  return (
    <section
      aria-label={isRTL ? 'اتجاه تقييمات الأداء خلال آخر 6 أشهر' : 'Company-Wide Performance Rating Trends (Last 6 Months)'}
      data-testid="performance-rating-trends-chart"
      className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-8 shadow-sm mb-6 lg:mb-8"
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="min-w-0">
          <h2 className="text-base lg:text-lg font-bold text-slate-900">
            {isRTL
              ? 'اتجاه تقييمات الأداء على مستوى المؤسسة'
              : 'Company-Wide Performance Rating Trends'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isRTL
              ? 'تطور متوسط تقييمات الأداء الشهرية خلال آخر 6 أشهر'
              : 'Monthly average performance ratings across the organization over the last 6 months'}
          </p>
        </div>

        {/* Interactive Metric View Switcher */}
        <div
          role="group"
          aria-label={isRTL ? 'عرض المخطط' : 'Chart metric view'}
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start shrink-0"
        >
          <button
            type="button"
            onClick={() => setMetricView('rating')}
            aria-pressed={metricView === 'rating'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
              metricView === 'rating'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRTL ? 'متوسط التقييم (1–5)' : 'Average Rating (1–5)'}
          </button>
          <button
            type="button"
            onClick={() => setMetricView('volume')}
            aria-pressed={metricView === 'volume'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
              metricView === 'volume'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRTL ? 'حجم التقييمات' : 'Evaluation Volume'}
          </button>
        </div>
      </div>

      {/* Inline Summary Strip (Zero-Pill Tabular Readout) */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 py-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div>
            <span className="text-xs text-slate-500 block">
              {isRTL ? 'المتوسط العام (6 أشهر)' : '6-Month Average'}
            </span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {summary.overallAverage !== null ? summary.overallAverage.toFixed(2) : '—'}
            </span>
            {summary.overallAverage !== null && (
              <span className="text-xs text-slate-500 ms-1 tabular-nums">/ 5.0</span>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

          <div>
            <span className="text-xs text-slate-500 block">
              {isRTL ? 'آخر شهر مُقيّم' : 'Latest Rated Month'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-teal-700 tabular-nums">
                {summary.latestAverage !== null ? summary.latestAverage.toFixed(2) : '—'}
              </span>
              {deltaFormatted && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
                    summary.direction === 'up'
                      ? 'text-emerald-700'
                      : summary.direction === 'down'
                        ? 'text-red-600'
                        : 'text-slate-500'
                  }`}
                >
                  {summary.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />}
                  {summary.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />}
                  {summary.direction === 'flat' && <Minus className="w-3.5 h-3.5" aria-hidden="true" />}
                  {deltaFormatted}
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              {isRTL ? 'إجمالي التقييمات:' : 'Total rated:'}{' '}
              <strong className="text-slate-900 font-semibold tabular-nums">
                {summary.totalEvaluations}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {isRTL ? 'الأشهر النشطة:' : 'Active months:'}{' '}
              <strong className="text-slate-900 font-semibold tabular-nums">
                {summary.monthsWithData} / 6
              </strong>
            </span>
          </div>
        </div>

        <Link
          href="/dashboard/ratings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
        >
          <span>{isRTL ? 'تفاصيل تقييمات الأقسام' : 'Department Ratings'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Chart Area */}
      {!hasAnyData ? (
        <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-12 px-6 text-center">
          <p className="text-sm font-semibold text-slate-800">
            {isRTL
              ? 'لا توجد تقييمات أداء مكتملة خلال آخر 6 أشهر بعد'
              : 'No rated performance evaluations recorded in the last 6 months yet'}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            {isRTL
              ? 'سيظهر خط اتجاه الأداء تلقائياً بمجرد اعتماد أو إرسال تقييمات الموظفين.'
              : 'The 6-month trend line will populate automatically as employee evaluations are rated and submitted.'}
          </p>
          <Link
            href="/evaluations"
            className="inline-flex items-center justify-center mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors"
          >
            {isRTL ? 'بدء تقييمات الفريق' : 'Go to Team Evaluations'}
          </Link>
        </div>
      ) : (
        <div dir="ltr" className="w-full h-[290px] mt-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 16, right: 20, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="displayLabel"
                  tick={{ fill: '#475569', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dy={8}
                />
                {metricView === 'rating' ? (
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                ) : (
                  <YAxis
                    domain={[0, maxVolume]}
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                )}
                <Tooltip
                  content={<RatingTrendTooltip isRTL={isRTL} />}
                  cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
                />
                {metricView === 'rating' && (
                  <ReferenceLine
                    y={3}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{
                      value: isRTL ? 'المعيار (3.0)' : 'Target (3.0)',
                      position: 'insideTopRight',
                      fill: '#64748b',
                      fontSize: 11
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={metricView === 'rating' ? 'averageRating' : 'completedCount'}
                  name={
                    metricView === 'rating'
                      ? (isRTL ? 'متوسط التقييم' : 'Average Rating')
                      : (isRTL ? 'عدد التقييمات' : 'Evaluations Count')
                  }
                  stroke={metricView === 'rating' ? '#0f766e' : '#0284c7'}
                  strokeWidth={2.75}
                  connectNulls={metricView === 'rating'}
                  dot={{
                    r: 5,
                    fill: '#ffffff',
                    stroke: metricView === 'rating' ? '#0f766e' : '#0284c7',
                    strokeWidth: 2.5
                  }}
                  activeDot={{
                    r: 7,
                    fill: metricView === 'rating' ? '#0f766e' : '#0284c7',
                    stroke: '#ffffff',
                    strokeWidth: 2
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="w-full h-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse"
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </section>
  )
}
