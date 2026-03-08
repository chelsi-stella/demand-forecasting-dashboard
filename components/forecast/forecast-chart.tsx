'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine } from 'recharts'
import type { ForecastLevel, ChartViewBy, ForecastVersionDay } from '@/lib/forecast-data'
import { forecastLevelLabels, forecastLevelUnits, chartViewByLabels, versionDayLabels } from '@/lib/forecast-data'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ChartDataPoint {
  week: string
  unconstrained: number | null
  constrained: number | null
  previous: number | null
  mondayRun: number | null
  actual: number | null
  hasOverride: boolean
  isHistory: boolean
  isTodayWeek: boolean
  isAlertWeek: boolean
}

interface ForecastChartProps {
  data: ChartDataPoint[]
  forecastLevel: ForecastLevel
  comparisonLabel?: string | null
  selectedVersionDay?: ForecastVersionDay
  comparisonVersionDay?: ForecastVersionDay | null
  onComparisonVersionDayChange?: (day: ForecastVersionDay | null) => void
}

const chartConfig = {
  actual: {
    label: 'Actuals (last 6 weeks)',
    color: '#00A846',
  },
  constrained: {
    label: 'Current Run Forecast',
    color: '#067A46',
  },
  mondayRun: {
    label: 'Comparator Run',
    color: '#6366f1',
  },
  unconstrained: {
    label: 'Model Output (Unconstrained)',
    color: '#d97706',
  },
  previous: {
    label: 'Previous Run',
    color: '#94a3b8',
  },
}

export function ForecastChart({ data, forecastLevel, comparisonLabel, selectedVersionDay = 'wednesday', comparisonVersionDay, onComparisonVersionDayChange }: ForecastChartProps) {
  const [viewBy, setViewBy] = useState<ChartViewBy>('target_week')

  const forecastPoints = data.filter(d => !d.isHistory)
  const avgForecast = forecastPoints.length > 0
    ? Math.round(forecastPoints.reduce((sum, d) => sum + (d.constrained || 0), 0) / forecastPoints.length)
    : 0
  const hasOverrides = forecastPoints.some(d => d.hasOverride)
  const hasComparison = data.some(d => d.mondayRun !== null)
  const unit = forecastLevelUnits[forecastLevel]

  // Find the "today" boundary
  const todayWeek = data.find(d => d.isTodayWeek)?.week || null

  // Dynamic chart config with comparison label
  const activeChartConfig = {
    ...chartConfig,
    mondayRun: {
      ...chartConfig.mondayRun,
      label: comparisonLabel ? `${comparisonLabel} (Comparator)` : 'Comparator Run',
    },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-medium">
              Weekly Forecast Trend
              {forecastLevel !== 'box' && (
                <span className="text-muted-foreground font-normal text-sm ml-2">({forecastLevelLabels[forecastLevel]})</span>
              )}
            </CardTitle>
            {comparisonLabel && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                Comparing vs {comparisonLabel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Comparison Selector */}
            {onComparisonVersionDayChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Comparison:</span>
                <Select
                  value={comparisonVersionDay || 'none'}
                  onValueChange={(v) => {
                    if (v === 'none') {
                      onComparisonVersionDayChange(null)
                    } else if (v === 'previous') {
                      const dayOrder: ForecastVersionDay[] = ['monday', 'wednesday', 'friday']
                      const currentIdx = dayOrder.indexOf(selectedVersionDay)
                      const prevDay = currentIdx > 0 ? dayOrder[currentIdx - 1] : dayOrder[dayOrder.length - 1]
                      onComparisonVersionDayChange(prevDay)
                    } else {
                      onComparisonVersionDayChange(v as ForecastVersionDay)
                    }
                  }}
                >
                  <SelectTrigger className="w-40 h-7 text-xs">
                    <SelectValue placeholder="Select comparison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Comparison</SelectItem>
                    <SelectItem value="previous">Previous Run</SelectItem>
                    {Object.entries(versionDayLabels)
                      .filter(([value]) => value !== selectedVersionDay)
                      .map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* View By toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">View By:</span>
              <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
                {(Object.entries(chartViewByLabels) as [ChartViewBy, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setViewBy(key)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-sm transition-colors',
                      viewBy === key
                        ? 'bg-card text-foreground shadow-xs font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {hasOverrides && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                Overrides Applied
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={activeChartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#067A46" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#067A46" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mondayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="unconstrainedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              dy={6}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              width={50}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  hideLabel={false}
                  nameKey="dataKey"
                  formatter={(value) => (
                    <span className="font-mono">
                      {Number(value).toLocaleString()} {unit}
                    </span>
                  )}
                />
              } 
            />

            {/* "Today" vertical marker */}
            {todayWeek && (
              <ReferenceLine
                x={todayWeek}
                stroke="#1e293b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{
                  value: 'Today',
                  position: 'top',
                  fill: '#1e293b',
                  fontSize: 11,
                  fontWeight: 600,
                  offset: 8,
                }}
              />
            )}

            {/* Average reference line */}
            <ReferenceLine 
              y={avgForecast} 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              label={{ value: 'Avg', position: 'right', fill: '#6b7280', fontSize: 11 }}
            />

            {/* HFW12 alert marker */}
            <ReferenceLine
              x="HFW12"
              stroke="#B30000"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{
                value: 'Alert',
                position: 'top',
                fill: '#B30000',
                fontSize: 10,
                fontWeight: 600,
                offset: 8,
              }}
            />

            {/* Monday Run line (comparison) */}
            <Area
              type="monotone"
              dataKey="mondayRun"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#mondayGradient)"
              dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
              connectNulls={false}
            />

            {/* Previous run baseline */}
            <Area
              type="monotone"
              dataKey="previous"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="transparent"
              dot={false}
              connectNulls={false}
            />

            {/* Unconstrained model output (only visible when overrides exist) */}
            {hasOverrides && (
              <Area
                type="monotone"
                dataKey="unconstrained"
                stroke="#d97706"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="url(#unconstrainedGradient)"
                dot={false}
                connectNulls={false}
              />
            )}

            {/* Final forecast (constrained) */}
            <Area
              type="monotone"
              dataKey="constrained"
              stroke="#067A46"
              strokeWidth={2}
              fill="url(#forecastGradient)"
              dot={{ fill: '#067A46', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#067A46', strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />

            {/* Actuals (solid green) */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#00A846"
              strokeWidth={2.5}
              fill="transparent"
              dot={{ fill: '#00A846', strokeWidth: 2, stroke: '#fff', r: 4 }}
              connectNulls={false}
            />

            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => {
                const config = activeChartConfig[value as keyof typeof activeChartConfig]
                return (
                  <span className="text-xs text-muted-foreground">{config?.label ?? value}</span>
                )
              }}
            />
          </AreaChart>
        </ChartContainer>

        {/* Footer annotations */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[11px] text-muted-foreground">
            &larr; Actuals history (last 6 weeks)
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            Today
          </span>
          <span className="text-[11px] text-muted-foreground">
            Forecast horizon (next N target weeks) &rarr;
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
