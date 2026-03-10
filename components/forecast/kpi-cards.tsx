'use client'

import React from "react"

import { ArrowDown, ArrowUp, AlertTriangle, CheckCircle2, Clock, Edit2, ArrowRightLeft, Activity, BarChart3, Target, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ForecastLevel, DimensionKPIs } from '@/lib/forecast-data'

interface KPI {
  label: string
  value: string | number
  subValue?: string
  secondaryValue?: string  // For explicit previous run reference
  trend?: 'up' | 'down' | 'neutral'
  status?: 'success' | 'warning' | 'error' | 'neutral'
  icon?: React.ElementType
  tooltip?: string
  badge?: string
}

interface KPICardsProps {
  kpis: {
    totalUnconstrainedForecast: number
    totalConstrainedForecast: number
    totalPrevious: number
    totalDeltaPercent: string
    totalDeltaAbsolute: number
    avgConfidence: number
    validationIssues: number
    pendingApprovals: number
    weeksCount: number
    overridesApplied: number
    overrideImpact: number
    unconstrainedVsConstrainedDelta: string
  }
  comparisonDelta?: { percent: string; absolute: number; label: string } | null
  forecastLevel?: ForecastLevel
  dimensionKPIs?: DimensionKPIs | null
  selectedMarket?: string
}

function getBoxKPIs(kpis: KPICardsProps['kpis'], comparisonDelta: KPICardsProps['comparisonDelta'], dimensionKPIs: DimensionKPIs): KPI[] {
  const hasOverrides = kpis.overridesApplied > 0
  const deltaPercent = Number(kpis.totalDeltaPercent)
  const deltaAbs = kpis.totalDeltaAbsolute
  return [
    {
      label: 'Current Forecast (Friday Run)',
      value: kpis.totalConstrainedForecast.toLocaleString(),
      secondaryValue: `Previous Run: ${kpis.totalPrevious.toLocaleString()}`,
      subValue: `Delta vs Previous Run: ${deltaPercent >= 0 ? '+' : ''}${kpis.totalDeltaPercent}% (${deltaAbs >= 0 ? '+' : ''}${deltaAbs.toLocaleString()} boxes)`,
      trend: deltaPercent >= 0 ? 'up' : 'down',
      status: 'neutral',
      tooltip: hasOverrides ? `Constrained forecast after ${kpis.overridesApplied} override(s)` : 'Current run model output',
      badge: hasOverrides ? 'Overrides' : undefined,
    },
    {
      label: 'Box WAPE',
      value: `${dimensionKPIs.boxWAPE ?? '-'}%`,
      status: (dimensionKPIs.boxWAPE ?? 0) <= 5 ? 'success' : (dimensionKPIs.boxWAPE ?? 0) <= 10 ? 'warning' : 'error',
      icon: BarChart3,
      tooltip: 'Weighted Absolute Percentage Error for box-level forecast',
    },
    {
      label: 'Box Bias',
      value: `${(dimensionKPIs.boxBias ?? 0) >= 0 ? '+' : ''}${dimensionKPIs.boxBias ?? '-'}%`,
      trend: (dimensionKPIs.boxBias ?? 0) >= 0 ? 'up' : 'down',
      status: Math.abs(dimensionKPIs.boxBias ?? 0) <= 3 ? 'success' : 'warning',
      icon: Target,
      tooltip: 'Systematic over/under-forecasting bias',
    },
    {
      label: 'Confidence',
      value: 'Medium',
      subValue: `Avg ${kpis.avgConfidence}% across ${kpis.weeksCount} weeks`,
      status: 'warning',
      icon: AlertTriangle,
      tooltip: 'HFW12 model confidence is Medium due to post-promotion uncertainty',
    },
  ]
}

function getRecipeKPIs(kpis: KPICardsProps['kpis'], dimensionKPIs: DimensionKPIs): KPI[] {
  return [
    {
      label: 'Recipe WAPE',
      value: `${dimensionKPIs.recipeWAPE ?? '-'}%`,
      status: (dimensionKPIs.recipeWAPE ?? 0) <= 7 ? 'success' : (dimensionKPIs.recipeWAPE ?? 0) <= 12 ? 'warning' : 'error',
      icon: BarChart3,
      tooltip: 'Weighted Absolute Percentage Error at recipe level',
    },
    {
      label: 'Split Bias',
      value: `${(dimensionKPIs.recipeSplitBias ?? 0) >= 0 ? '+' : ''}${dimensionKPIs.recipeSplitBias ?? '-'}%`,
      status: Math.abs(dimensionKPIs.recipeSplitBias ?? 0) <= 3 ? 'success' : 'warning',
      icon: Target,
      tooltip: 'Recipe split allocation bias',
    },
    {
      label: 'Swap Ratio Bias',
      value: `${(dimensionKPIs.swapRatioBias ?? 0) >= 0 ? '+' : ''}${dimensionKPIs.swapRatioBias ?? '-'}%`,
      trend: (dimensionKPIs.swapRatioBias ?? 0) >= 0 ? 'up' : 'down',
      status: Math.abs(dimensionKPIs.swapRatioBias ?? 0) <= 2 ? 'success' : 'warning',
      icon: ArrowRightLeft,
      tooltip: 'Bias in swap ratio prediction',
    },
    {
      label: 'Swappers Uptake Err',
      value: `${dimensionKPIs.swappersUptakeError ?? '-'}%`,
      status: (dimensionKPIs.swappersUptakeError ?? 0) <= 4 ? 'success' : 'warning',
      icon: Activity,
      tooltip: 'Uptake prediction error for swapping customers',
    },
    {
      label: 'Non-swap Uptake Err',
      value: `${dimensionKPIs.nonswappersUptakeError ?? '-'}%`,
      status: (dimensionKPIs.nonswappersUptakeError ?? 0) <= 4 ? 'success' : 'warning',
      icon: Activity,
      tooltip: 'Uptake prediction error for non-swapping customers',
    },
    {
      label: 'Avg Confidence',
      value: `${kpis.avgConfidence}%`,
      status: kpis.avgConfidence >= 80 ? 'success' : kpis.avgConfidence >= 60 ? 'warning' : 'error',
      icon: kpis.avgConfidence >= 80 ? CheckCircle2 : AlertTriangle,
    },
  ]
}

function getSKUKPIs(kpis: KPICardsProps['kpis'], dimensionKPIs: DimensionKPIs): KPI[] {
  return [
    {
      label: 'SKU WAPE',
      value: `${dimensionKPIs.skuWAPE ?? '-'}%`,
      status: (dimensionKPIs.skuWAPE ?? 0) <= 8 ? 'success' : (dimensionKPIs.skuWAPE ?? 0) <= 15 ? 'warning' : 'error',
      icon: BarChart3,
      tooltip: 'Weighted Absolute Percentage Error at SKU level',
    },
    {
      label: 'SKU Bias',
      value: `${(dimensionKPIs.skuBias ?? 0) >= 0 ? '+' : ''}${dimensionKPIs.skuBias ?? '-'}%`,
      trend: (dimensionKPIs.skuBias ?? 0) >= 0 ? 'up' : 'down',
      status: Math.abs(dimensionKPIs.skuBias ?? 0) <= 5 ? 'success' : 'warning',
      icon: Target,
      tooltip: 'Systematic bias in SKU-level forecasting',
    },
    {
      label: 'Volume at Risk',
      value: (dimensionKPIs.volumeAtRisk ?? 0).toLocaleString(),
      subValue: 'units',
      status: (dimensionKPIs.volumeAtRisk ?? 0) > 50000 ? 'error' : (dimensionKPIs.volumeAtRisk ?? 0) > 20000 ? 'warning' : 'success',
      icon: AlertTriangle,
      tooltip: 'Total SKU volume flagged as at-risk due to constraint or accuracy issues',
    },
    {
      label: 'Avg Confidence',
      value: `${kpis.avgConfidence}%`,
      status: kpis.avgConfidence >= 80 ? 'success' : kpis.avgConfidence >= 60 ? 'warning' : 'error',
      icon: kpis.avgConfidence >= 80 ? CheckCircle2 : AlertTriangle,
    },
  ]
}

function getAddonsKPIs(kpis: KPICardsProps['kpis'], dimensionKPIs: DimensionKPIs, market: string): KPI[] {
  // Calculate separate WAPE values (mock values based on combined)
  const paidWAPE = dimensionKPIs.paidAddonsWAPE ?? (dimensionKPIs.combinedAddonsWAPE ? Math.round((dimensionKPIs.combinedAddonsWAPE ?? 0) * 0.9) : null)
  const freeWAPE = dimensionKPIs.freeAddonsWAPE ?? (dimensionKPIs.combinedAddonsWAPE ? Math.round((dimensionKPIs.combinedAddonsWAPE ?? 0) * 1.15) : null)

  const cards: KPI[] = [
    {
      label: 'Paid Add-ons',
      value: (dimensionKPIs.paidAddonsForecast ?? 0).toLocaleString(),
      subValue: 'forecast units (HFM)',
      status: 'neutral',
      icon: Package,
      tooltip: 'Paid (HFM) add-ons forecast volume',
    },
    {
      label: 'Free Add-ons',
      value: (dimensionKPIs.freeForXForecast ?? 0).toLocaleString(),
      subValue: 'Free-for-X / Free-for-Life',
      status: 'neutral',
      icon: Package,
      tooltip: 'Free add-ons forecast volume (Free-for-X and Free-for-Life)',
    },
    {
      label: 'Paid WAPE (HFM)',
      value: `${paidWAPE ?? '-'}%`,
      status: (paidWAPE ?? 0) <= 8 ? 'success' : (paidWAPE ?? 0) <= 12 ? 'warning' : 'error',
      icon: BarChart3,
      tooltip: 'Weighted Absolute Percentage Error for Paid Add-ons (HFM)',
    },
    {
      label: 'Free WAPE',
      value: `${freeWAPE ?? '-'}%`,
      status: (freeWAPE ?? 0) <= 10 ? 'success' : (freeWAPE ?? 0) <= 15 ? 'warning' : 'error',
      icon: BarChart3,
      tooltip: 'Weighted Absolute Percentage Error for Free Add-ons (Free-for-X / Free-for-Life)',
    },
  ]

  if (market === 'us' && dimensionKPIs.regulatedVolume !== undefined) {
    cards.push(
      {
        label: 'Regulated Vol',
        value: dimensionKPIs.regulatedVolume.toLocaleString(),
        subValue: 'units (US)',
        status: 'neutral',
        icon: Target,
        tooltip: 'Regulated add-ons volume (US market only)',
      },
      {
        label: 'Non-regulated Vol',
        value: (dimensionKPIs.nonRegulatedVolume ?? 0).toLocaleString(),
        subValue: 'units (US)',
        status: 'neutral',
        icon: Target,
        tooltip: 'Non-regulated add-ons volume (US market only)',
      },
    )
  }

  return cards
}

export function KPICards({ kpis, comparisonDelta, forecastLevel = 'box', dimensionKPIs, selectedMarket = 'de' }: KPICardsProps) {
  const dimKPIs = dimensionKPIs || {}

  let kpiList: KPI[]
  switch (forecastLevel) {
    case 'recipe':
      kpiList = getRecipeKPIs(kpis, dimKPIs)
      break
    case 'sku':
      kpiList = getSKUKPIs(kpis, dimKPIs)
      break
    case 'addons':
      kpiList = getAddonsKPIs(kpis, dimKPIs, selectedMarket)
      break
    default:
      kpiList = getBoxKPIs(kpis, comparisonDelta, dimKPIs)
  }

  const gridCols = kpiList.length <= 4 ? 'grid-cols-4' : kpiList.length <= 5 ? 'grid-cols-5' : kpiList.length <= 6 ? 'grid-cols-6' : 'grid-cols-7'

  return (
    <TooltipProvider>
      <div className={cn('grid gap-4', gridCols)}>
        {kpiList.map((kpi) => (
          <Tooltip key={kpi.label}>
            <TooltipTrigger asChild>
              <Card className="py-4 cursor-default hover:shadow-lg transition-shadow">
                <CardContent className="p-0 px-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="truncate uppercase"
                          style={{
                            fontFamily: 'var(--hf-font-body)',
                            fontSize: 'var(--hf-body-extra-small-size)',
                            lineHeight: 'var(--hf-body-extra-small-line)',
                            fontWeight: 'var(--hf-font-weight-semibold)',
                            color: '#6B7280',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {kpi.label}
                        </p>
                        {kpi.badge && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] py-0 px-1.5 shrink-0 font-semibold",
                              kpi.badge === 'Constrained' && 'bg-amber-50 text-amber-700 border-amber-300',
                              kpi.badge === 'Unconstrained' && 'bg-primary/10 text-primary border-primary/30',
                              kpi.badge === 'Overrides' && 'bg-primary/10 text-primary border-primary/30'
                            )}
                          >
                            {kpi.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          style={{
                            fontFamily: 'var(--hf-font-body)',
                            fontSize: 'var(--hf-headline-desktop-h3-size)',
                            lineHeight: 'var(--hf-headline-desktop-h3-line)',
                            fontWeight: 'var(--hf-font-weight-bold)',
                            color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {kpi.value}
                        </span>
                        {kpi.trend && (
                          <span className={cn(
                            'flex items-center',
                            kpi.trend === 'up' ? 'text-primary' : 'text-destructive'
                          )}>
                            {kpi.trend === 'up' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                          </span>
                        )}
                      </div>
                      {kpi.secondaryValue && (
                        <p
                          style={{
                            fontFamily: 'var(--hf-font-body)',
                            fontSize: 'var(--hf-body-extra-small-size)',
                            lineHeight: 'var(--hf-body-extra-small-line)',
                            fontWeight: 'var(--hf-font-weight-regular)',
                            color: '#6B7280',
                            marginTop: '4px',
                          }}
                        >
                          {kpi.secondaryValue}
                        </p>
                      )}
                      {kpi.subValue && (
                        <p
                          className="truncate"
                          style={{
                            fontFamily: 'var(--hf-font-body)',
                            fontSize: 'var(--hf-body-extra-small-size)',
                            lineHeight: 'var(--hf-body-extra-small-line)',
                            fontWeight: 'var(--hf-font-weight-regular)',
                            color: '#6B7280',
                            marginTop: '2px',
                          }}
                        >
                          {kpi.subValue}
                        </p>
                      )}
                    </div>
                    {kpi.icon && (
                      <div className={cn(
                        'p-2 rounded-lg shrink-0',
                        kpi.status === 'success' && 'bg-primary/15 text-primary',
                        kpi.status === 'warning' && 'bg-amber-500/15 text-amber-600',
                        kpi.status === 'error' && 'bg-destructive/15 text-destructive',
                        kpi.status === 'neutral' && 'bg-muted text-muted-foreground'
                      )}>
                        <kpi.icon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            {kpi.tooltip && (
              <TooltipContent>
                <p className="text-xs">{kpi.tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
