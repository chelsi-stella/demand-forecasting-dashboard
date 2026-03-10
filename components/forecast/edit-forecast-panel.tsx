'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ForecastWeek, OverrideReason } from '@/lib/forecast-data'
import { overrideReasonLabels } from '@/lib/forecast-data'

interface EditForecastPanelProps {
  week: ForecastWeek | null
  open: boolean
  onClose: () => void
  onSave: (weekId: string, overwriteValue: number, comment: string, reason: OverrideReason) => void
}

export function EditForecastPanel({ week, open, onClose, onSave }: EditForecastPanelProps) {
  const [overwriteValue, setOverwriteValue] = useState('')
  const [comment, setComment] = useState('')
  const [overrideReason, setOverrideReason] = useState<OverrideReason | ''>('')
  const [error, setError] = useState('')

  // Reset form when week changes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
    }
  }

  // Initialize form when panel opens with new week
  useEffect(() => {
    if (week && open) {
      setOverwriteValue(week.overwriteForecast?.toString() || '')
      setComment(week.plannerComment || '')
      setOverrideReason(week.overrideReason || '')
      setError('')
    }
  }, [week, open])

  if (!week) return null

  const currentForecast = week.overwriteForecast || week.forecastBoxcount
  const newValue = Number(overwriteValue) || 0
  const deltaFromCurrent = newValue - currentForecast
  const deltaFromModel = newValue - week.forecastBoxcount
  const deltaPercent = currentForecast > 0 ? ((deltaFromCurrent / currentForecast) * 100).toFixed(2) : '0'
  const deltaFromModelPercent = week.forecastBoxcount > 0 ? ((deltaFromModel / week.forecastBoxcount) * 100).toFixed(2) : '0'
  const isSignificantChange = Math.abs(Number(deltaPercent)) > 5

  const handleSave = () => {
    if (!overwriteValue) {
      setError('Override value is required')
      return
    }
    if (!overrideReason) {
      setError('Override reason is required for tracking')
      return
    }
    if (!comment.trim()) {
      setError('Detailed justification is required for audit trail')
      return
    }
    if (Number(overwriteValue) <= 0) {
      setError('Override value must be greater than 0')
      return
    }
    
    onSave(week.id, Number(overwriteValue), comment.trim(), overrideReason as OverrideReason)
    onClose()
  }

  const handleClearOverride = () => {
    setOverwriteValue('')
    setComment('')
    setOverrideReason('')
    setError('')
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col h-full overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle>Edit Forecast - {week.weekLabel}</SheetTitle>
          <SheetDescription>
            {week.startDate} to {week.endDate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 min-h-0">
          {/* Current Values - Baseline / Operational terminology */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Values</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-muted-foreground font-medium">Baseline (Global)</div>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-lg font-mono font-semibold">
                  {week.forecastBoxcount.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">System model output</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-medium">Comparator Run</div>
                <div className="text-lg font-mono font-semibold">
                  {week.previousForecast.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Previous run value</div>
              </div>
            </div>
            {week.overwriteForecast && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-amber-700 font-medium">Current Operational (Local)</div>
                    <div className="text-lg font-mono font-semibold text-amber-700">
                      {week.overwriteForecast.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                    Manual Override
                  </Badge>
                </div>
              </div>
            )}

            {/* Delta vs comparator */}
            <div className="bg-muted/30 rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground font-medium mb-1">Delta vs Comparator</div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold">
                  {week.deltaAbsolute >= 0 ? '+' : ''}{week.deltaAbsolute.toLocaleString()} boxes
                </span>
                <span className={`text-xs font-medium ${week.deltaPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ({week.deltaPercent >= 0 ? '+' : ''}{week.deltaPercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="text-xs text-muted-foreground font-medium">Confidence</div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${week.confidence >= 80 ? 'bg-primary' : week.confidence >= 60 ? 'bg-amber-500' : 'bg-destructive'}`}
                    style={{ width: `${week.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-semibold">{week.confidence}%</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              Baseline (global) = system model output. Operational (local) = your adjusted forecast.
            </p>
          </div>

          {/* Override Input - Operational Forecast */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Operational Forecast (Local)</h4>
            <div>
              <label htmlFor="override-value" className="text-sm font-medium mb-1.5 block">
                Operational Forecast Value <span className="text-destructive">*</span>
              </label>
              <Input
                id="override-value"
                type="number"
                placeholder="Enter new forecast value"
                value={overwriteValue}
                onChange={(e) => {
                  setOverwriteValue(e.target.value)
                  setError('')
                }}
                className="font-mono"
              />
            </div>

            {overwriteValue && Number(overwriteValue) > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Change from current</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{currentForecast.toLocaleString()}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-semibold">{newValue.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`text-right ${isSignificantChange ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  <div className="font-mono font-semibold">
                    {Number(deltaPercent) >= 0 ? '+' : ''}{deltaPercent}%
                  </div>
                  <div className="text-xs">
                    {deltaFromCurrent >= 0 ? '+' : ''}{deltaFromCurrent.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {isSignificantChange && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <strong>Significant change detected.</strong> Changes greater than 5% will be flagged for additional review.
                </div>
              </div>
            )}
          </div>

          {/* Override Reason & Audit Trail */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Override Justification</h4>
            
            {/* Reason Selector */}
            <div>
              <Label htmlFor="override-reason" className="text-sm font-medium mb-1.5 block">
                Override Reason <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={overrideReason} 
                onValueChange={(value: OverrideReason) => {
                  setOverrideReason(value)
                  setError('')
                }}
              >
                <SelectTrigger id="override-reason">
                  <SelectValue placeholder="Select a reason for override" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(overrideReasonLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Categorize this adjustment for reporting and analysis.
              </p>
            </div>

            {/* Detailed Justification */}
            <div>
              <Label htmlFor="comment" className="text-sm font-medium mb-1.5 block">
                Detailed Justification <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="comment"
                placeholder="Provide specific details explaining this override (e.g., 'Super Bowl campaign expected to drive 3% uplift based on 2025 performance')"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  setError('')
                }}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                This justification will be recorded in the audit log and visible to reviewers.
              </p>
            </div>

            {/* Impact Summary */}
            {overwriteValue && Number(overwriteValue) > 0 && (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Override Impact:</strong> This adjustment will change the 
                  final forecast from {week.forecastBoxcount.toLocaleString()} (model) to {newValue.toLocaleString()} (constrained), 
                  a {Number(deltaFromModelPercent) >= 0 ? '+' : ''}{deltaFromModelPercent}% deviation from the unconstrained model output.
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <SheetFooter className="shrink-0 flex-row gap-2 border-t pt-4">
          {(overwriteValue || comment) && (
            <Button variant="ghost" onClick={handleClearOverride} className="mr-auto">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Override
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
