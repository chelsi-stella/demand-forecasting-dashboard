'use client'

import { ArrowDown, ArrowUp, X, MapPin, Package, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ForecastWeek, ChangeDriver } from '@/lib/forecast-data'

interface ExplainChangeDialogProps {
  open: boolean
  onClose: () => void
  week: ForecastWeek | null
}

function DriverBar({ driver, maxImpact }: { driver: ChangeDriver; maxImpact: number }) {
  const width = (driver.impact / maxImpact) * 100
  
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{driver.factor}</span>
          {driver.region && (
            <Badge variant="outline" className="text-xs gap-1">
              <MapPin className="h-3 w-3" />
              {driver.region}
            </Badge>
          )}
          {driver.product && (
            <Badge variant="outline" className="text-xs gap-1">
              <Package className="h-3 w-3" />
              {driver.product}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                driver.direction === 'increase' ? 'bg-primary' : 'bg-amber-500'
              )}
              style={{ width: `${width}%` }}
            />
          </div>
          <div className="flex items-center gap-1 w-16 justify-end">
            {driver.direction === 'increase' ? (
              <ArrowUp className="h-3 w-3 text-primary" />
            ) : (
              <ArrowDown className="h-3 w-3 text-amber-500" />
            )}
            <span className={cn(
              'text-sm font-mono font-medium',
              driver.direction === 'increase' ? 'text-primary' : 'text-amber-600'
            )}>
              {driver.impact}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExplainChangeDialog({ open, onClose, week }: ExplainChangeDialogProps) {
  if (!week) return null

  const finalForecast = week.overwriteForecast || week.forecastBoxcount
  const maxImpact = Math.max(...week.changeDrivers.map(d => d.impact))
  const increaseDrivers = week.changeDrivers.filter(d => d.direction === 'increase')
  const decreaseDrivers = week.changeDrivers.filter(d => d.direction === 'decrease')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span>Change Drivers - {week.weekLabel}</span>
            <Badge variant="outline" className="text-xs font-normal">
              {week.startDate} to {week.endDate}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Previous</div>
              <div className="text-lg font-mono font-semibold">
                {week.previousForecast.toLocaleString()}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Unconstrained</div>
              <div className="text-lg font-mono font-semibold">
                {week.forecastBoxcount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Model output</div>
            </div>
            <div className={cn(
              'rounded-lg p-3',
              week.isManualOverride ? 'bg-amber-50 border border-amber-200' : 'bg-primary/5 border border-primary/10'
            )}>
              <div className="text-xs text-muted-foreground font-medium uppercase mb-1">
                {week.isManualOverride ? 'Constrained' : 'Final'}
              </div>
              <div className={cn(
                'text-lg font-mono font-semibold',
                week.isManualOverride ? 'text-amber-700' : 'text-primary'
              )}>
                {finalForecast.toLocaleString()}
              </div>
              {week.isManualOverride && (
                <div className="text-xs text-amber-600">Manual override</div>
              )}
            </div>
          </div>

          {/* Net Change */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div>
              <div className="text-sm text-muted-foreground">Net Change vs Previous</div>
              <div className="text-xl font-semibold flex items-center gap-2 mt-1">
                {week.deltaPercent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className={week.deltaPercent >= 0 ? 'text-primary' : 'text-destructive'}>
                  {week.deltaPercent >= 0 ? '+' : ''}{week.deltaPercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Volume Impact</div>
              <div className="text-xl font-mono font-semibold mt-1">
                {week.deltaAbsolute >= 0 ? '+' : ''}{week.deltaAbsolute.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Drivers */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Primary Change Drivers
            </div>

            {increaseDrivers.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>Factors increasing forecast</span>
                </div>
                <div className="border rounded-lg p-3 divide-y">
                  {increaseDrivers.map((driver, index) => (
                    <DriverBar key={index} driver={driver} maxImpact={maxImpact} />
                  ))}
                </div>
              </div>
            )}

            {decreaseDrivers.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                  <span>Factors decreasing forecast</span>
                </div>
                <div className="border rounded-lg p-3 divide-y">
                  {decreaseDrivers.map((driver, index) => (
                    <DriverBar key={index} driver={driver} maxImpact={maxImpact} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Override Info */}
          {week.isManualOverride && week.plannerComment && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Planner Override
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm text-amber-800">
                  <strong>{week.lastModifiedBy}</strong> applied a manual adjustment:
                </div>
                <p className="text-sm text-amber-700 mt-1">{week.plannerComment}</p>
                {week.lastModifiedAt && (
                  <div className="text-xs text-amber-600 mt-2">
                    {new Date(week.lastModifiedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Confidence */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="text-sm">Model Confidence</div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    week.confidence >= 80 && 'bg-primary',
                    week.confidence >= 60 && week.confidence < 80 && 'bg-amber-500',
                    week.confidence < 60 && 'bg-destructive'
                  )}
                  style={{ width: `${week.confidence}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">{week.confidence}%</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
