'use client'

import { useState } from 'react'
import { X, Edit2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ForecastWeek, ForecastLevel } from '@/lib/forecast-data'
import { forecastLevelUnits } from '@/lib/forecast-data'

interface ForecastDetailPanelProps {
  week: ForecastWeek | null
  forecastLevel: ForecastLevel
  onClose: () => void
  onEdit: () => void
  onAccept: () => void
  onExplainChange: () => void
}

export function ForecastDetailPanel({
  week,
  forecastLevel,
  onClose,
  onEdit,
  onAccept,
  onExplainChange,
}: ForecastDetailPanelProps) {
  if (!week) {
    return (
      <div className="w-[340px] border-l bg-muted/30 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a row to view details
        </p>
      </div>
    )
  }

  const currentForecast = week.overwriteForecast || week.forecastBoxcount
  const isLocked = week.approvalStatus === 'locked'
  const isApproved = week.approvalStatus === 'approved'
  const isAutoLocked = week.weekout <= 2

  return (
    <div className="w-[340px] border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">{week.weekLabel}</h3>
          <p className="text-xs text-muted-foreground">
            {week.startDate} to {week.endDate}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Badge */}
        <div>
          {isAutoLocked ? (
            <Badge variant="secondary" className="text-xs bg-muted/80 font-semibold">
              Locked (Auto)
            </Badge>
          ) : isLocked ? (
            <Badge variant="secondary" className="text-xs bg-muted/80 font-semibold">
              Locked
            </Badge>
          ) : isApproved ? (
            <Badge
              variant="outline"
              className="text-xs font-semibold"
              style={{
                backgroundColor: 'var(--hf-background-light-positive-positive-mid)',
                color: 'var(--hf-foreground-positive-positive-dark)',
                borderColor: 'var(--hf-stroke-positive-positive-mid)',
              }}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          ) : week.validationStatus === 'warning' ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Review
            </Badge>
          ) : week.validationStatus === 'error' ? (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs font-semibold">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs font-semibold">
              Draft
            </Badge>
          )}
        </div>

        {/* Forecast Values */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Forecast Values</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded p-3">
              <div className="text-xs text-muted-foreground mb-1">Baseline (Model)</div>
              <div className="text-lg font-mono font-semibold">{week.forecastBoxcount.toLocaleString()}</div>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <div className="text-xs text-muted-foreground mb-1">Previous Run</div>
              <div className="text-lg font-mono font-semibold">{week.previousForecast.toLocaleString()}</div>
            </div>
          </div>
          {week.overwriteForecast && (
            <div
              className="rounded p-3"
              style={{
                backgroundColor: 'var(--hf-background-warning-warning-light)',
                border: '1px solid var(--hf-stroke-warning-warning-mid)',
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--hf-foreground-warning-warning-mid)' }}>
                Current Operational
              </div>
              <div className="text-lg font-mono font-semibold" style={{ color: 'var(--hf-foreground-warning-warning-mid)' }}>
                {week.overwriteForecast.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Delta */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Change vs Previous</h4>
          <div className="bg-muted/50 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Delta</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">
                  {week.deltaAbsolute >= 0 ? '+' : ''}{week.deltaAbsolute.toLocaleString()}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: week.deltaPercent >= 0
                      ? 'var(--hf-foreground-positive-positive-dark)'
                      : 'var(--hf-foreground-negative-negative-dark)',
                  }}
                >
                  ({week.deltaPercent >= 0 ? '+' : ''}{week.deltaPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Confidence</h4>
          <div className="bg-muted/50 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Model Confidence</span>
              <span className="text-sm font-semibold">{week.confidence}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${week.confidence}%`,
                  backgroundColor:
                    week.weekout <= 2
                      ? 'var(--hf-foreground-positive-positive-dark)'
                      : week.weekout <= 5
                      ? 'var(--hf-foreground-warning-warning-mid)'
                      : week.weekout <= 12
                      ? 'var(--hf-stroke-neutral-neutral-mid)'
                      : 'var(--hf-foreground-negative-negative-dark)',
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {week.weekout <= 2
                ? 'High confidence — live week data'
                : week.weekout <= 5
                ? 'Medium — subscription data'
                : week.weekout <= 12
                ? 'Lower — seasonality model'
                : 'Accuracy degrades beyond 12 weeks'}
            </p>
          </div>
        </div>

        {/* Change Drivers */}
        {week.changeDrivers && week.changeDrivers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Change Drivers</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onExplainChange}>
                <TrendingUp className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
            <div className="space-y-1">
              {week.changeDrivers.slice(0, 3).map((driver, idx) => (
                <div key={idx} className="bg-muted/50 rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{driver.factor}</span>
                    <span
                      className="font-semibold"
                      style={{
                        color: driver.direction === 'increase'
                          ? 'var(--hf-foreground-positive-positive-dark)'
                          : 'var(--hf-foreground-negative-negative-dark)',
                      }}
                    >
                      {driver.direction === 'increase' ? '+' : ''}{driver.impact}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planner Comment */}
        {week.plannerComment && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Planner Comment</h4>
            <div className="bg-muted/50 rounded p-3 text-xs">{week.plannerComment}</div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="shrink-0 border-t p-4 space-y-2">
        {!isLocked && !isAutoLocked && !isApproved && (
          <>
            <Button
              size="sm"
              className="w-full"
              onClick={onAccept}
              style={{
                backgroundColor: 'var(--hf-background-light-positive-positive-mid)',
                color: 'var(--hf-foreground-positive-positive-dark)',
                border: '1px solid var(--hf-stroke-positive-positive-mid)',
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Accept Forecast
            </Button>
            {(forecastLevel === 'box' || forecastLevel === 'recipe') && (
              <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Edit Operational Forecast
              </Button>
            )}
          </>
        )}
        {isApproved && (
          <div className="text-xs text-center text-muted-foreground py-2">
            Forecast accepted by {week.lastModifiedBy || 'Maria Schmidt'}
          </div>
        )}
      </div>
    </div>
  )
}
