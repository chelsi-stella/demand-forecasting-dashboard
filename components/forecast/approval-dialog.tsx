'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ShieldCheck,
  FileCheck,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ForecastWeek, ForecastLevel } from '@/lib/forecast-data'
import { forecastLevelLabels } from '@/lib/forecast-data'

interface ApprovalDialogProps {
  open: boolean
  onClose: () => void
  weeks: ForecastWeek[]
  forecastRunLabel: string
  forecastLevel: ForecastLevel
  selectedMarket: string
  onApprove: (comment: string, weekIds?: string[]) => void
}

type WeekStatus = 'ready' | 'needs_review' | 'blocking' | 'locked' | 'approved'

function getWeekStatus(week: ForecastWeek): WeekStatus {
  if (week.weekout <= 2) return 'locked'
  if (week.approvalStatus === 'locked') return 'locked'
  if (week.approvalStatus === 'approved') return 'approved'
  if (week.validationStatus === 'error') return 'blocking'
  if (Math.abs(week.deltaPercent) > 5 && !week.isManualOverride) return 'needs_review'
  return 'ready'
}

export function ApprovalDialog({
  open,
  onClose,
  weeks,
  forecastRunLabel,
  forecastLevel,
  selectedMarket,
  onApprove,
}: ApprovalDialogProps) {
  const [comment, setComment] = useState('')
  const [selectedWeekIds, setSelectedWeekIds] = useState<Set<string>>(new Set())

  // Categorize weeks by status
  const weeksByStatus = useMemo(() => {
    const result = {
      ready: [] as ForecastWeek[],
      needs_review: [] as ForecastWeek[],
      blocking: [] as ForecastWeek[],
      locked: [] as ForecastWeek[],
      approved: [] as ForecastWeek[],
    }
    weeks.forEach(w => {
      const status = getWeekStatus(w)
      result[status].push(w)
    })
    return result
  }, [weeks])

  // Approvable weeks (ready + needs_review that have been resolved)
  const approvableWeeks = useMemo(() => {
    return weeks.filter(w => {
      const status = getWeekStatus(w)
      return status === 'ready' || (status === 'needs_review' && w.isManualOverride)
    })
  }, [weeks])

  // Initialize selection with all approvable weeks when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedWeekIds(new Set(approvableWeeks.map(w => w.id)))
    }
  }, [open, approvableWeeks])

  const toggleWeek = (weekId: string) => {
    setSelectedWeekIds(prev => {
      const next = new Set(prev)
      if (next.has(weekId)) {
        next.delete(weekId)
      } else {
        next.add(weekId)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedWeekIds.size === approvableWeeks.length) {
      setSelectedWeekIds(new Set())
    } else {
      setSelectedWeekIds(new Set(approvableWeeks.map(w => w.id)))
    }
  }

  const handleApprove = () => {
    if (selectedWeekIds.size === 0) return
    onApprove(comment, Array.from(selectedWeekIds))
    setComment('')
    setSelectedWeekIds(new Set())
  }

  const handleClose = () => {
    setComment('')
    setSelectedWeekIds(new Set())
    onClose()
  }

  const hasBlockingIssues = weeksByStatus.blocking.length > 0
  const hasNeedsReview = weeksByStatus.needs_review.filter(w => !w.isManualOverride).length > 0

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[540px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Review & Approve Forecast
          </SheetTitle>
          <SheetDescription>
            {forecastRunLabel} Run | {forecastLevelLabels[forecastLevel]} | {selectedMarket.toUpperCase()}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-2xl font-semibold text-primary">{weeksByStatus.ready.length}</div>
              <div className="text-xs text-muted-foreground">Ready</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-2xl font-semibold text-amber-600">{weeksByStatus.needs_review.length}</div>
              <div className="text-xs text-muted-foreground">Needs Review</div>
            </div>
            <div className="text-center p-3 bg-destructive/5 rounded-lg border border-destructive/10">
              <div className="text-2xl font-semibold text-destructive">{weeksByStatus.blocking.length}</div>
              <div className="text-xs text-muted-foreground">Blocking</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-2xl font-semibold text-muted-foreground">{weeksByStatus.locked.length + weeksByStatus.approved.length}</div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
          </div>

          {/* Blocking Issues Warning */}
          {hasBlockingIssues && (
            <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-destructive">Blocking Issues</div>
                <p className="text-xs text-destructive/80 mt-0.5">
                  {weeksByStatus.blocking.map(w => w.weekLabel).join(', ')} have validation errors that must be resolved.
                </p>
              </div>
            </div>
          )}

          {/* Needs Review Warning */}
          {hasNeedsReview && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-700">Weeks Requiring Review</div>
                <p className="text-xs text-amber-600 mt-0.5">
                  {weeksByStatus.needs_review.filter(w => !w.isManualOverride).map(w => w.weekLabel).join(', ')} have {'>'}5% delta. Apply an override to approve.
                </p>
              </div>
            </div>
          )}

          {/* Week Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Select weeks to approve</label>
              {approvableWeeks.length > 0 && (
                <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs h-7">
                  {selectedWeekIds.size === approvableWeeks.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto border rounded-lg p-2">
              {weeks.map(week => {
                const status = getWeekStatus(week)
                const isSelectable = status === 'ready' || (status === 'needs_review' && week.isManualOverride)
                const isSelected = selectedWeekIds.has(week.id)

                return (
                  <div
                    key={week.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-md transition-colors',
                      isSelectable && 'hover:bg-muted/50 cursor-pointer',
                      isSelected && 'bg-primary/5',
                      !isSelectable && 'opacity-50'
                    )}
                    onClick={() => isSelectable && toggleWeek(week.id)}
                  >
                    <Checkbox 
                      checked={isSelected} 
                      disabled={!isSelectable}
                      onCheckedChange={() => isSelectable && toggleWeek(week.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{week.weekLabel}</span>
                        <span className="text-xs text-muted-foreground">Weekout {week.weekout}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(week.overwriteForecast || week.forecastBoxcount).toLocaleString()} boxes
                        {week.isManualOverride && (
                          <span className="ml-1 text-primary">(Override applied)</span>
                        )}
                      </div>
                    </div>
                    {status === 'ready' && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                    {status === 'needs_review' && !week.isManualOverride && (
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review
                      </Badge>
                    )}
                    {status === 'needs_review' && week.isManualOverride && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                    {status === 'blocking' && (
                      <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 shrink-0">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Blocking
                      </Badge>
                    )}
                    {status === 'locked' && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                    {status === 'approved' && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Approval comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any notes for the audit trail..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              onClick={handleApprove} 
              disabled={selectedWeekIds.size === 0}
              className="flex-1 gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Approve {selectedWeekIds.size} Week{selectedWeekIds.size !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={handleClose} className="bg-transparent">
              Cancel
            </Button>
          </div>

          {selectedWeekIds.size > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              This will mark selected weeks as approved and log the action.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
