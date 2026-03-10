'use client'

// TODO: Replace hardcoded values with HelloFresh design tokens
// once token library is exported from Figma and added to codebase.
// Token names are documented inline above each value.

import { AlertCircle, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Ban, Info, ChevronRight, GitCompare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ForecastWeek, SignificantChange } from '@/lib/forecast-data'
import { forecastLevelUnits, type ForecastLevel } from '@/lib/forecast-data'

interface ValidationPanelProps {
  weeks: ForecastWeek[]
  onExplainChange?: (week: ForecastWeek) => void
  significantChanges?: SignificantChange[]
  comparisonLabel?: string | null
  forecastLevel?: ForecastLevel
}

type AlertSeverity = 'blocking' | 'warning' | 'info'

interface ValidationIssue {
  weekId: string
  weekLabel: string
  severity: AlertSeverity
  type: 'error' | 'warning' | 'info'
  message: string
  detail: string
  impact?: number
  week: ForecastWeek
  phaseLabel?: string // "Live Week Validation" or "Non-live Planning Alert"
}

function getValidationIssues(weeks: ForecastWeek[], forecastLevel: ForecastLevel = 'box'): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const phaseLabel = (week: ForecastWeek) =>
    week.weekPhase === 'live' ? 'Live Week Validation' : 'Non-live Planning Alert'

  weeks.forEach(week => {
    const pLabel = phaseLabel(week)

    // Blocking: Validation errors
    if (week.validationStatus === 'error') {
      issues.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        severity: 'blocking',
        type: 'error',
        message: 'Validation check failed',
        detail: 'Automated validation detected blocking issues that must be resolved',
        impact: week.forecastBoxcount,
        week,
        phaseLabel: pLabel,
      })
    }

    // Blocking: Large negative delta (> 5%)
    if (week.deltaPercent < -5) {
      issues.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        severity: 'blocking',
        type: 'error',
        message: `Significant decrease detected in ${week.weekLabel}`,
        detail: `Impact: -${Math.abs(week.deltaAbsolute).toLocaleString()} boxes vs previous run. Severity: High.`,
        impact: Math.abs(week.deltaAbsolute),
        week,
        phaseLabel: pLabel,
      })
    }

    // Warning: Moderate negative delta (> 3%)
    if (week.deltaPercent < -3 && week.deltaPercent >= -5) {
      issues.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        severity: 'warning',
        type: 'warning',
        message: `Decrease detected in ${week.weekLabel}`,
        detail: `${week.deltaPercent.toFixed(1)}% drop from previous run`,
        impact: Math.abs(week.deltaAbsolute),
        week,
        phaseLabel: pLabel,
      })
    }

    // Warning: Low confidence
    if (week.confidence < 70) {
      issues.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        severity: week.confidence < 60 ? 'blocking' : 'warning',
        type: week.confidence < 60 ? 'error' : 'warning',
        message: 'Low model confidence',
        detail: `Confidence at ${week.confidence}% - review recommended`,
        impact: Math.round(week.forecastBoxcount * (1 - week.confidence / 100)),
        week,
        phaseLabel: pLabel,
      })
    }

    // Warning: Pending validation
    if (week.validationStatus === 'pending') {
      issues.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        severity: 'warning',
        type: 'warning',
        message: 'Validation pending',
        detail: 'Automated validation is still processing',
        week,
        phaseLabel: pLabel,
      })
    }

    // Info: High-impact valid change
    if (week.validationStatus === 'valid' && Math.abs(week.deltaPercent) > 2 && week.deltaPercent > 0) {
      issues.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        severity: 'info',
        type: 'info',
        message: 'Notable increase',
        detail: `+${week.deltaPercent.toFixed(1)}% increase from previous - validated`,
        impact: week.deltaAbsolute,
        week,
        phaseLabel: pLabel,
      })
    }
  })

  // Dimension-specific mock alerts
  if (forecastLevel === 'recipe') {
    issues.push({
      weekId: 'w2026-04',
      weekLabel: 'HFW04',
      severity: 'warning',
      type: 'warning',
      message: 'Split bias threshold exceeded',
      detail: 'Recipe split bias at 2.4% exceeds 2% threshold',
      impact: 12500,
      week: weeks[1] || weeks[0],
      phaseLabel: 'Live Week Validation',
    })
  }

  if (forecastLevel === 'sku') {
    issues.push({
      weekId: 'w2026-06',
      weekLabel: 'HFW06',
      severity: 'warning',
      type: 'warning',
      message: 'SKU forecast exceeds constraint',
      detail: 'SKU volume exceeds supplier capacity constraint',
      impact: 34500,
      week: weeks[3] || weeks[0],
      phaseLabel: 'Non-live Planning Alert',
    })
  }

  if (forecastLevel === 'addons') {
    issues.push({
      weekId: 'w2026-05',
      weekLabel: 'HFW05',
      severity: 'warning',
      type: 'warning',
      message: 'Free-for-X mismatch vs plan',
      detail: 'F4X allocation deviates from planned volume by 8%',
      impact: 6900,
      week: weeks[2] || weeks[0],
      phaseLabel: 'Non-live Planning Alert',
    })
  }

  // Sort by severity (blocking first) then by impact
  return issues.sort((a, b) => {
    const severityOrder = { blocking: 0, warning: 1, info: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return (b.impact || 0) - (a.impact || 0)
  })
}

function getAccuracyMetrics(weeks: ForecastWeek[]) {
  const weeksWithActuals = weeks.filter(w => w.actualBoxcount !== null)
  
  if (weeksWithActuals.length === 0) {
    return null
  }

  const mape = weeksWithActuals.reduce((sum, week) => {
    const error = Math.abs((week.forecastBoxcount - (week.actualBoxcount || 0)) / (week.actualBoxcount || 1))
    return sum + error
  }, 0) / weeksWithActuals.length * 100

  const bias = weeksWithActuals.reduce((sum, week) => {
    return sum + (week.forecastBoxcount - (week.actualBoxcount || 0))
  }, 0) / weeksWithActuals.length

  return {
    mape: mape.toFixed(1),
    bias: bias.toFixed(0),
    weeksCount: weeksWithActuals.length
  }
}

export function ValidationPanel({ weeks, onExplainChange, significantChanges, comparisonLabel, forecastLevel = 'box' }: ValidationPanelProps) {
  const issues = getValidationIssues(weeks, forecastLevel)
  const accuracy = getAccuracyMetrics(weeks)
  const blockingCount = issues.filter(i => i.severity === 'blocking').length
  const warningCount = issues.filter(i => i.severity === 'warning').length
  const infoCount = issues.filter(i => i.severity === 'info').length
  const hasSignificantChanges = significantChanges && significantChanges.length > 0
  const unit = forecastLevelUnits[forecastLevel]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            style={{
              fontFamily: 'var(--hf-font-body)',
              /* token: font-size-body-medium */
              fontSize: 'var(--hf-body-medium-size)',
              lineHeight: 'var(--hf-body-medium-line)',
              /* token: font-weight-bold */
              fontWeight: 'var(--hf-font-weight-bold)',
              /* token: color-text-default */
              color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
            }}
          >
            Alert Center
          </CardTitle>
          <div className="flex items-center gap-2">
            {blockingCount > 0 && (
              <Badge
                className="gap-1 font-semibold"
                style={{
                  /* token: color-status-error-background */
                  backgroundColor: '#7C0000',
                  /* token: color-text-on-brand */
                  color: '#FFFFFF',
                  /* token: font-size-label-sm */
                  fontSize: '12px',
                  /* token: border-radius-sm */
                  borderRadius: '4px',
                  padding: '2px 8px',
                  border: 'none',
                }}
              >
                <Ban className="h-3 w-3" />
                {blockingCount} Blocking
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge
                variant="outline"
                className="font-semibold"
                style={{
                  /* token: background/warning/warning-light */
                  backgroundColor: '#ffecd3',
                  /* token: stroke/warning/warning-mid */
                  color: '#ef670a',
                  borderColor: '#ef670a',
                  fontSize: '12px',
                  borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                {warningCount} Warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {hasSignificantChanges && (
              <Badge
                variant="outline"
                className="gap-1 font-semibold"
                style={{
                  /* token: background/information/information-light */
                  backgroundColor: '#e9faff',
                  /* token: stroke/information/information-dark */
                  color: '#001db2',
                  borderColor: '#001db2',
                  fontSize: '12px',
                  borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                <GitCompare className="h-3 w-3" />
                {significantChanges.length} Version Delta{significantChanges.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {issues.length === 0 && !hasSignificantChanges && (
              <Badge
                variant="outline"
                className="font-semibold"
                style={{
                  backgroundColor: 'var(--hf-background-light-positive-positive-mid)',
                  color: 'var(--hf-foreground-positive-positive-dark)',
                  borderColor: 'var(--hf-stroke-positive-positive-lighter)',
                  fontSize: '12px',
                  borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                All Clear
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {/* Accuracy Metrics */}
        {accuracy && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">MAPE</span>
              </div>
              <div className={cn(
                'text-xl font-semibold',
                Number(accuracy.mape) <= 5 && 'text-primary',
                Number(accuracy.mape) > 5 && Number(accuracy.mape) <= 10 && 'text-amber-600',
                Number(accuracy.mape) > 10 && 'text-destructive'
              )}>
                {accuracy.mape}%
              </div>
              <div className="text-xs text-muted-foreground">Based on {accuracy.weeksCount} week(s)</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Bias</span>
              </div>
              <div className="flex items-center gap-2">
                {Number(accuracy.bias) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  'text-xl font-semibold',
                  Number(accuracy.bias) > 0 ? 'text-primary' : 'text-destructive'
                )}>
                  {Number(accuracy.bias) > 0 ? '+' : ''}{accuracy.bias}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Number(accuracy.bias) > 0 ? 'Over' : 'Under'}-forecasting
              </div>
            </div>
          </div>
        )}

        {/* Significant Forecast Changes (version comparison) */}
        {hasSignificantChanges && (
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 font-semibold uppercase"
              style={{
                /* token: stroke/information/information-dark */
                color: '#001db2',
                /* token: font-size-label-sm */
                fontSize: '12px',
                letterSpacing: '0.05em',
              }}
            >
              <GitCompare className="h-4 w-4" />
              <span>Significant Forecast Change</span>
            </div>
            <div className="space-y-2">
              {significantChanges.map((change) => (
                <div
                  key={change.weekId}
                  className="flex items-start gap-3 rounded-lg border"
                  style={{
                    /* token: spacing-3 */
                    padding: '12px',
                    /* token: background/information/information-light */
                    backgroundColor: '#e9faff',
                    /* token: stroke/information/information-dark */
                    borderColor: '#001db2',
                    /* token: border-radius-md */
                    borderRadius: '6px',
                  }}
                >
                  <GitCompare
                    className="shrink-0"
                    style={{
                      width: '16px',
                      height: '16px',
                      marginTop: '2px',
                      /* token: stroke/information/information-dark */
                      color: '#001db2',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold"
                        style={{
                          /* token: font-size-body-md */
                          fontSize: '14px',
                          /* token: stroke/information/information-dark */
                          color: '#001db2',
                        }}
                      >
                        Significant Forecast Change
                      </span>
                      <Badge
                        variant="outline"
                        className="font-medium"
                        style={{
                          fontSize: '12px',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E7EB',
                          color: '#374151',
                        }}
                      >
                        {change.weekLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-semibold"
                        style={{
                          fontSize: '12px',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          /* token: background/information/information-light */
                          backgroundColor: '#e9faff',
                          /* token: stroke/information/information-dark */
                          borderColor: '#001db2',
                          color: '#001db2',
                        }}
                      >
                        {change.deltaPercent >= 0 ? '+' : ''}{change.deltaPercent.toFixed(1)}% vs {comparisonLabel || 'comparison'}
                      </Badge>
                    </div>
                    <p
                      className="mt-1"
                      style={{
                        /* token: font-size-body-sm */
                        fontSize: '13px',
                        /* token: color-text-subtle */
                        color: '#6B7280',
                      }}
                    >
                      {change.weekLabel}: {change.deltaPercent >= 0 ? '+' : ''}{change.deltaPercent.toFixed(0)}% vs {comparisonLabel || 'Previous Run'} ({change.deltaAbsolute >= 0 ? '+' : ''}{change.deltaAbsolute.toLocaleString()} {unit} impact)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues List - Prioritized */}
        {issues.length > 0 ? (
          <div className="space-y-3">
            {/* Blocking Issues */}
            {blockingCount > 0 && (
              <div className="space-y-3">
                <div
                  className="flex items-center gap-2 font-semibold uppercase"
                  style={{
                    /* token: color-status-error-text */
                    color: '#B30000',
                    /* token: font-size-label-sm */
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Ban className="h-4 w-4" />
                  <span>Blocking ({blockingCount})</span>
                </div>
                <div className="space-y-2">
                  {issues.filter(i => i.severity === 'blocking').map((issue, index) => (
                    <div
                      key={`${issue.weekId}-blocking-${index}`}
                      className="flex items-start gap-3 rounded-lg border"
                      style={{
                        /* token: spacing-3 */
                        padding: '12px',
                        /* token: background/light-negative/negative-light */
                        backgroundColor: '#ffeae9',
                        /* token: stroke/negative/negative-mid */
                        borderColor: '#b30000',
                        /* token: border-radius-md */
                        borderRadius: '6px',
                      }}
                    >
                      <AlertCircle
                        className="shrink-0"
                        style={{
                          width: '16px',
                          height: '16px',
                          marginTop: '2px',
                          /* token: stroke/negative/negative-mid */
                          color: '#b30000',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-semibold"
                            style={{
                              /* token: font-size-body-md */
                              fontSize: '14px',
                              /* token: color-status-error-text */
                              color: '#B30000',
                            }}
                          >
                            {issue.message}
                          </span>
                          <Badge
                            variant="outline"
                            className="font-medium"
                            style={{
                              fontSize: '12px',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E5E7EB',
                              color: '#374151',
                            }}
                          >
                            {issue.weekLabel}
                          </Badge>
                          {issue.impact && (
                            <Badge
                              variant="outline"
                              className="font-semibold"
                              style={{
                                fontSize: '12px',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                /* token: background/light-negative/negative-light */
                                backgroundColor: '#ffeae9',
                                /* token: stroke/negative/negative-mid */
                                borderColor: '#b30000',
                                color: '#b30000',
                              }}
                            >
                              {issue.impact.toLocaleString()} boxes at risk
                            </Badge>
                          )}
                          {issue.phaseLabel && (
                            <Badge
                              variant="outline"
                              className="font-medium"
                              style={{
                                fontSize: '11px',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                backgroundColor: '#F3F4F6',
                                borderColor: '#D1D5DB',
                                color: '#6B7280',
                              }}
                            >
                              {issue.phaseLabel}
                            </Badge>
                          )}
                        </div>
                        <p
                          className="mt-1"
                          style={{
                            /* token: font-size-body-sm */
                            fontSize: '13px',
                            /* token: color-text-subtle */
                            color: '#6B7280',
                          }}
                        >
                          {issue.detail}
                        </p>
                        {onExplainChange && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 font-semibold"
                            style={{
                              /* token: font-size-body-sm */
                              fontSize: '13px',
                              /* token: color-status-error-text */
                              color: '#B30000',
                            }}
                            onClick={() => onExplainChange(issue.week)}
                          >
                            Investigate <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warningCount > 0 && (
              <div className="space-y-3">
                <div
                  className="flex items-center gap-2 font-semibold uppercase"
                  style={{
                    /* token: stroke/warning/warning-mid */
                    color: '#ef670a',
                    /* token: font-size-label-sm */
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                  }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Warnings ({warningCount})</span>
                </div>
                <div className="space-y-2">
                  {issues.filter(i => i.severity === 'warning').map((issue, index) => (
                    <div
                      key={`${issue.weekId}-warning-${index}`}
                      className="flex items-start gap-3 rounded-lg border"
                      style={{
                        /* token: spacing-3 */
                        padding: '12px',
                        /* token: background/warning/warning-light */
                        backgroundColor: '#ffecd3',
                        /* token: stroke/warning/warning-mid */
                        borderColor: '#ef670a',
                        /* token: border-radius-md */
                        borderRadius: '6px',
                      }}
                    >
                      <AlertTriangle
                        className="shrink-0"
                        style={{
                          width: '16px',
                          height: '16px',
                          marginTop: '2px',
                          /* token: stroke/warning/warning-mid */
                          color: '#ef670a',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-semibold"
                            style={{
                              /* token: font-size-body-md */
                              fontSize: '14px',
                              /* token: stroke/warning/warning-mid */
                              color: '#ef670a',
                            }}
                          >
                            {issue.message}
                          </span>
                          <Badge
                            variant="outline"
                            className="font-medium"
                            style={{
                              fontSize: '12px',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E5E7EB',
                              color: '#374151',
                            }}
                          >
                            {issue.weekLabel}
                          </Badge>
                          {issue.impact && (
                            <Badge
                              variant="outline"
                              className="font-semibold"
                              style={{
                                fontSize: '12px',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                /* token: background/warning/warning-light */
                                backgroundColor: '#ffecd3',
                                /* token: stroke/warning/warning-mid */
                                borderColor: '#ef670a',
                                color: '#ef670a',
                              }}
                            >
                              {issue.impact.toLocaleString()} boxes
                            </Badge>
                          )}
                          {issue.phaseLabel && (
                            <Badge
                              variant="outline"
                              className="font-medium"
                              style={{
                                fontSize: '11px',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                backgroundColor: '#F3F4F6',
                                borderColor: '#D1D5DB',
                                color: '#6B7280',
                              }}
                            >
                              {issue.phaseLabel}
                            </Badge>
                          )}
                        </div>
                        <p
                          className="mt-1"
                          style={{
                            /* token: font-size-body-sm */
                            fontSize: '13px',
                            /* token: color-text-subtle */
                            color: '#6B7280',
                          }}
                        >
                          {issue.detail}
                        </p>
                        {onExplainChange && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 font-semibold"
                            style={{
                              /* token: font-size-body-sm */
                              fontSize: '13px',
                              /* token: stroke/warning/warning-mid */
                              color: '#ef670a',
                            }}
                            onClick={() => onExplainChange(issue.week)}
                          >
                            View drivers <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Items */}
            {infoCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase">
                  <Info className="h-3 w-3" />
                  <span>Notable Changes ({infoCount})</span>
                </div>
                <div className="space-y-2">
                  {issues.filter(i => i.severity === 'info').map((issue, index) => (
                    <div 
                      key={`${issue.weekId}-info-${index}`}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-primary/5 border-primary/10"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {issue.message}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {issue.weekLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{issue.detail}</p>
                        {onExplainChange && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 mt-1 text-xs"
                            onClick={() => onExplainChange(issue.week)}
                          >
                            View drivers <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-lg border"
            style={{
              padding: '16px',
              backgroundColor: 'var(--hf-background-light-positive-positive-mid)',
              borderColor: 'var(--hf-stroke-positive-positive-lighter)',
              borderRadius: '6px',
            }}
          >
            <CheckCircle2
              className="shrink-0"
              style={{
                width: '20px',
                height: '20px',
                color: 'var(--hf-foreground-positive-positive-dark)',
              }}
            />
            <div>
              <div
                className="font-semibold"
                style={{
                  fontSize: '14px',
                  color: '#111827',
                }}
              >
                All validation checks passed
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                }}
              >
                No issues detected in the current forecast
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
