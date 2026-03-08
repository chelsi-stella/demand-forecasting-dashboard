'use client'

import { Check, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ForecastWeek } from '@/lib/forecast-data'

interface StickyActionBarProps {
  filteredWeeks: ForecastWeek[]
  selectedWeekId: string | null
  onLockWeek: (weekId: string) => void
  onOpenApproval: () => void
  onExport: () => void
}

export function StickyActionBar({
  filteredWeeks,
  selectedWeekId,
  onLockWeek,
  onOpenApproval,
  onExport,
}: StickyActionBarProps) {
  // Count weeks eligible for approval
  const approvableWeeks = filteredWeeks.filter(
    w =>
      w.approvalStatus !== 'locked' &&
      w.approvalStatus !== 'approved' &&
      w.weekout > 2 &&
      w.validationStatus !== 'error'
  )
  const blockingCount = filteredWeeks.filter(w => w.validationStatus === 'error').length
  const canApprove = approvableWeeks.length > 0 && blockingCount === 0

  // Selected week context for the "Good to Go" action
  const selectedWeek = selectedWeekId ? filteredWeeks.find(w => w.id === selectedWeekId) : null
  const canLockSelected =
    selectedWeek &&
    selectedWeek.approvalStatus !== 'locked' &&
    selectedWeek.weekout > 2

  return (
    <div
      className="sticky bottom-0 z-30 border-t flex items-center justify-between px-6 py-3 gap-4"
      style={{
        background: 'var(--hf-foreground-dark-neutral-neutral-darkest, #242424)',
        borderTopColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Left — contextual state info */}
      <div
        className="flex items-center gap-2 min-w-0"
        style={{
          fontFamily: 'var(--hf-font-body)',
          fontSize: 'var(--hf-body-small-size)',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        {blockingCount > 0 ? (
          <>
            <span
              className="inline-flex items-center justify-center rounded-full font-bold text-xs shrink-0"
              style={{
                width: '20px',
                height: '20px',
                background: 'var(--hf-background-error-error-mid, #b30000)',
                color: 'white',
              }}
            >
              {blockingCount}
            </span>
            <span>
              blocking issue{blockingCount > 1 ? 's' : ''} must be resolved before approving
            </span>
          </>
        ) : approvableWeeks.length > 0 ? (
          <>
            <span
              className="inline-flex items-center justify-center rounded-full font-bold text-xs shrink-0"
              style={{
                width: '20px',
                height: '20px',
                background: 'var(--hf-background-success-success-mid, #00a846)',
                color: 'white',
              }}
            >
              {approvableWeeks.length}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              week{approvableWeeks.length > 1 ? 's' : ''} ready to approve
            </span>
          </>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            All approvable weeks already approved or locked
          </span>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Export */}
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            fontFamily: 'var(--hf-font-body)',
            fontSize: 'var(--hf-body-small-size)',
            fontWeight: 'var(--hf-font-weight-semibold)',
            color: 'rgba(255,255,255,0.75)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            padding: '7px 14px',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(255,255,255,0.45)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'white'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(255,255,255,0.2)'
            ;(e.currentTarget as HTMLButtonElement).style.color =
              'rgba(255,255,255,0.75)'
          }}
        >
          <FileText className="h-4 w-4" />
          Export Report
        </button>

        {/* Good to Go — only when a row is selected and lockable */}
        {canLockSelected && (
          <button
            onClick={() => onLockWeek(selectedWeekId!)}
            className="inline-flex items-center gap-2 transition-colors"
            style={{
              fontFamily: 'var(--hf-font-body)',
              fontSize: 'var(--hf-body-small-size)',
              fontWeight: 'var(--hf-font-weight-semibold)',
              color: 'var(--hf-foreground-success-success-dark, #035624)',
              background: 'var(--hf-background-success-success-light, #e4fabf)',
              border: '1px solid var(--hf-border-success-success-mid, #67cb89)',
              borderRadius: '4px',
              padding: '7px 14px',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck className="h-4 w-4" />
            Mark {selectedWeek?.weekLabel} as Good to Go
          </button>
        )}

        {/* Review & Approve */}
        <button
          onClick={canApprove ? onOpenApproval : undefined}
          disabled={!canApprove}
          className="inline-flex items-center gap-2 transition-opacity"
          style={{
            fontFamily: 'var(--hf-font-body)',
            fontSize: 'var(--hf-body-small-size)',
            fontWeight: 'var(--hf-font-weight-bold)',
            color: 'white',
            background: canApprove
              ? 'var(--hf-background-success-success-mid, #00a846)'
              : 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '4px',
            padding: '7px 16px',
            cursor: canApprove ? 'pointer' : 'not-allowed',
            opacity: canApprove ? 1 : 0.5,
          }}
        >
          <Check className="h-4 w-4" />
          Review &amp; Approve
        </button>
      </div>
    </div>
  )
}
