'use client'

import { AlertTriangle, Shield, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RiskItem, ForecastWeek, SignificantChange } from '@/lib/forecast-data'

interface AlertBannerProps {
  risks: RiskItem[]
  weeks: ForecastWeek[]
  onNavigateToWeek: (weekId: string) => void
  significantChanges?: SignificantChange[]
  comparisonLabel?: string | null
}

export function AlertBanner({
  risks,
  weeks,
  onNavigateToWeek,
  significantChanges = [],
  comparisonLabel,
}: AlertBannerProps) {
  const blockingWeeks = weeks.filter(w => w.validationStatus === 'error')
  const needsReviewWeeks = weeks.filter(
    w => w.validationStatus === 'warning' ||
         (Math.abs(w.deltaPercent) > 5 && !w.isManualOverride && w.validationStatus !== 'error')
  )
  const highRisks = risks.filter(r => r.severity === 'high')
  const totalIssues = blockingWeeks.length + needsReviewWeeks.length

  // All clear state
  if (totalIssues === 0 && highRisks.length === 0) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded mb-6"
        style={{
          background: 'var(--hf-background-success-success-light)',
          border: '1px solid var(--hf-border-success-success-mid)',
        }}
      >
        <Shield
          className="h-4 w-4 shrink-0"
          style={{ color: 'var(--hf-foreground-success-success-dark)' }}
        />
        <span
          style={{
            fontFamily: 'var(--hf-font-body)',
            fontSize: 'var(--hf-body-small-size)',
            fontWeight: 'var(--hf-font-weight-semibold)',
            color: 'var(--hf-foreground-success-success-dark)',
          }}
        >
          All weeks look good — no blocking issues or significant delta changes detected. Ready to approve.
        </span>
      </div>
    )
  }

  // Severity: any blocking = error-level; otherwise warning
  const isError = blockingWeeks.length > 0 || highRisks.length > 0

  const bannerBg = isError
    ? 'var(--hf-background-error-error-light)'
    : 'var(--hf-background-warning-warning-light)'
  const bannerBorder = isError
    ? 'var(--hf-border-error-error-mid)'
    : 'var(--hf-border-warning-warning-mid)'
  const bannerIconColor = isError
    ? 'var(--hf-foreground-error-error-dark)'
    : 'var(--hf-foreground-warning-warning-dark)'
  const bannerTextColor = isError
    ? 'var(--hf-foreground-error-error-dark)'
    : 'var(--hf-foreground-warning-warning-dark)'
  const bannerSubColor = isError
    ? 'var(--hf-foreground-error-error-mid)'
    : 'var(--hf-foreground-warning-warning-mid)'

  // Build the summary headline
  const parts: string[] = []
  if (blockingWeeks.length > 0)
    parts.push(`${blockingWeeks.length} blocking issue${blockingWeeks.length > 1 ? 's' : ''}`)
  if (needsReviewWeeks.length > 0)
    parts.push(`${needsReviewWeeks.length} week${needsReviewWeeks.length > 1 ? 's' : ''} need${needsReviewWeeks.length === 1 ? 's' : ''} review`)
  if (highRisks.length > 0 && blockingWeeks.length === 0)
    parts.push(`${highRisks.length} high-risk flag${highRisks.length > 1 ? 's' : ''}`)

  const headline =
    totalIssues > 0
      ? `${parts.join(' and ')} before you can approve`
      : `${parts.join(' and ')}`

  // Up to 3 quick-jump targets (blocking first, then needs-review)
  const jumpTargets = [
    ...blockingWeeks.slice(0, 2),
    ...needsReviewWeeks.filter(w => !blockingWeeks.find(b => b.id === w.id)).slice(0, 1),
  ].slice(0, 3)

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded mb-6"
      style={{
        background: bannerBg,
        border: `1px solid ${bannerBorder}`,
      }}
    >
      <AlertTriangle
        className="h-4 w-4 shrink-0 mt-0.5"
        style={{ color: bannerIconColor }}
      />

      <div className="flex-1 min-w-0">
        <span
          style={{
            fontFamily: 'var(--hf-font-body)',
            fontSize: 'var(--hf-body-small-size)',
            fontWeight: 'var(--hf-font-weight-semibold)',
            color: bannerTextColor,
          }}
        >
          {headline.charAt(0).toUpperCase() + headline.slice(1)}
        </span>

        {/* Sub-detail: first blocking/review week descriptions */}
        {blockingWeeks.length > 0 && (
          <p
            className="mt-0.5 truncate"
            style={{
              fontFamily: 'var(--hf-font-body)',
              fontSize: 'var(--hf-body-extra-small-size)',
              fontWeight: 'var(--hf-font-weight-regular)',
              color: bannerSubColor,
            }}
          >
            {blockingWeeks.map(w => `${w.weekLabel}: validation error — check model output`).join(' · ')}
          </p>
        )}
      </div>

      {/* Quick-jump buttons */}
      {jumpTargets.length > 0 && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {jumpTargets.map(week => (
            <button
              key={week.id}
              onClick={() => onNavigateToWeek(week.id)}
              className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{
                fontFamily: 'var(--hf-font-body)',
                fontSize: 'var(--hf-body-extra-small-size)',
                fontWeight: 'var(--hf-font-weight-semibold)',
                color: bannerTextColor,
                background: 'rgba(255,255,255,0.55)',
                border: `1px solid ${bannerBorder}`,
                borderRadius: '4px',
                padding: '3px 10px',
                cursor: 'pointer',
              }}
            >
              {week.weekLabel}
              <ChevronRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
