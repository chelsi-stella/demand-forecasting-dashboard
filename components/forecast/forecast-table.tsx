'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  Radio,
  ShoppingCart,
  Search,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ForecastWeek, ValidationStatus, ApprovalStatus, WeekPhase, ForecastLevel, ComparisonVersion, OverrideReason, RecipeData, SkuData, SkuForecastRow } from '@/lib/forecast-data'
import { overrideReasonLabels, forecastLevelUnits, mockRecipeData, mockSkuData, mockSkuForecastRows } from '@/lib/forecast-data'
import { RecipeOverrideSheet } from './recipe-override-sheet'
import { SkuOverrideSheet } from './sku-override-sheet'

type SortOption = 'action_required' | 'target_week'

// Sort priority for status: Needs Review > Blocking > Pending > Draft > Valid
function getStatusPriority(week: ForecastWeek): number {
  const isAutoLocked = week.weekout <= 2
  const isLocked = week.approvalStatus === 'locked'
  
  if (isAutoLocked || isLocked) return 5 // Locked - lowest priority
  if (Math.abs(week.deltaPercent) > 5 && !week.isManualOverride) return 1 // Needs Review
  if (week.validationStatus === 'error') return 2 // Blocking
  if (week.approvalStatus === 'pending_review') return 3 // Pending
  if (week.approvalStatus === 'draft' && !week.isManualOverride) return 4 // Draft
  return 5 // Valid/Resolved
}

interface ForecastTableProps {
  weeks: ForecastWeek[]
  onEditWeek: (week: ForecastWeek) => void
  onSaveOverride: (weekId: string, overwriteValue: number, comment: string, reason: OverrideReason) => void
  onLockWeek: (weekId: string) => void
  onExplainChange?: (week: ForecastWeek) => void
  forecastLevel: ForecastLevel
  comparisonVersion?: ComparisonVersion | null
  comparisonLabel?: string | null
  highlightedWeekId?: string | null
  selectedWeekId?: string | null
  onSelectWeek?: (weekId: string | null) => void
}

function ValidationStatusIcon({ status }: { status: ValidationStatus }) {
  switch (status) {
    case 'valid':
      return <CheckCircle2 className="h-4 w-4 text-primary" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case 'pending':
      return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
    default:
      return null
  }
}

function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  switch (status) {
    case 'draft':
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground text-xs font-semibold">
          <Clock className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      )
    case 'pending_review':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case 'locked':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs cursor-help bg-muted/80 font-semibold">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Locked - no further edits. Future approval workflow pending.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    default:
      return null
  }
}

function WeekPhaseBadge({ phase }: { phase: WeekPhase }) {
  if (phase === 'live') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs cursor-help font-semibold">
              <Radio className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-52">
            <p className="text-xs">Demand steering &amp; caps may apply. Menu is live.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs cursor-help font-semibold">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Non-live
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-52">
          <p className="text-xs">Procurement planning phase. Menu not yet live.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function DeltaDisplay({ percent, absolute }: { percent: number; absolute: number }) {
  const isPositive = percent >= 0
  const isSignificant = Math.abs(percent) > 2

  return (
    <div className={cn(
      'text-right',
      isSignificant && isPositive && 'text-primary font-medium',
      isSignificant && !isPositive && 'text-destructive font-medium',
      !isSignificant && 'text-muted-foreground'
    )}>
      <div>{isPositive ? '+' : ''}{percent.toFixed(2)}%</div>
      <div className="text-xs opacity-70">
        {isPositive ? '+' : ''}{absolute.toLocaleString()}
      </div>
    </div>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all',
            value >= 80 && 'bg-primary',
            value >= 60 && value < 80 && 'bg-amber-500',
            value < 60 && 'bg-destructive'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8">{value}%</span>
    </div>
  )
}

export function ForecastTable({ weeks, onEditWeek, onSaveOverride, onLockWeek, onExplainChange, forecastLevel, comparisonVersion, comparisonLabel, highlightedWeekId, selectedWeekId, onSelectWeek }: ForecastTableProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('action_required')
  const [editValue, setEditValue] = useState('')
  const [editReason, setEditReason] = useState<OverrideReason | ''>('')
  const [editComment, setEditComment] = useState('')
  const [editError, setEditError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [validationFilter, setValidationFilter] = useState<ValidationStatus[]>([])
  const [recipeSheetOpen, setRecipeSheetOpen] = useState(false)
  const [skuSheetOpen, setSkuSheetOpen] = useState(false)
  const [selectedSheetWeek, setSelectedSheetWeek] = useState<ForecastWeek | null>(null)
  const unit = forecastLevelUnits[forecastLevel]

  // Calculate counts for each validation status
  const validCount = weeks.filter(w => w.validationStatus === 'valid').length
  const warningCount = weeks.filter(w => w.validationStatus === 'warning').length
  const errorCount = weeks.filter(w => w.validationStatus === 'error').length

  // Toggle pill filter
  const toggleValidationFilter = (status: ValidationStatus) => {
    setValidationFilter(prev => {
      if (prev.includes(status)) {
        // Remove status
        return prev.filter(s => s !== status)
      } else {
        // Add status
        return [...prev, status]
      }
    })
  }

  const isFilterActive = (status: ValidationStatus) => validationFilter.includes(status)
  const isAllActive = validationFilter.length === 0

  const startInlineEdit = (week: ForecastWeek) => {
    setEditingWeekId(week.id)
    setEditValue(week.overwriteForecast?.toString() || (week.forecastBoxcount).toString())
    setEditReason(week.overrideReason || '')
    setEditComment(week.plannerComment || '')
    setEditError('')
    // Auto-expand the row
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      next.add(week.id)
      return next
    })
  }

  const cancelInlineEdit = () => {
    setEditingWeekId(null)
    setEditValue('')
    setEditReason('')
    setEditComment('')
    setEditError('')
  }

  const saveInlineEdit = (weekId: string) => {
    if (!editValue || Number(editValue) <= 0) {
      setEditError('Value must be greater than 0')
      return
    }
    if (!editReason) {
      setEditError('Override reason is required')
      return
    }
    if (!editComment.trim()) {
      setEditError('Justification is required for audit trail')
      return
    }
    onSaveOverride(weekId, Number(editValue), editComment.trim(), editReason as OverrideReason)
    cancelInlineEdit()
  }

  const openRecipeSheet = (week: ForecastWeek) => {
    setSelectedSheetWeek(week)
    setRecipeSheetOpen(true)
  }

  const openSkuSheet = (week: ForecastWeek) => {
    setSelectedSheetWeek(week)
    setSkuSheetOpen(true)
  }

  const handleRecipeSave = (recipeId: string, swapped: number, nonSwapped: number, swappedReason: string, nonSwappedReason: string, totalReason: string) => {
    if (!selectedSheetWeek) return
    // TODO: In production, this should save recipe-level overrides
    // For now, we'll update the week's aggregate forecast with the calculated total
    const total = swapped + nonSwapped
    const comment = `Recipe Override - ${recipeId}\nSwapped: ${swappedReason}\nNon-Swapped: ${nonSwappedReason}\nTotal: ${totalReason}`
    onSaveOverride(selectedSheetWeek.id, total, comment, 'demand_adjustment')
    setRecipeSheetOpen(false)
    setSelectedSheetWeek(null)
  }

  const handleSkuSave = (skuId: string, forecast: number, reason: string) => {
    if (!selectedSheetWeek) return
    // TODO: In production, this should save SKU-level overrides
    // For now, we'll update the week's aggregate forecast
    const comment = `SKU Override - ${skuId}: ${reason}`
    onSaveOverride(selectedSheetWeek.id, forecast, comment, 'demand_adjustment')
    setSkuSheetOpen(false)
    setSelectedSheetWeek(null)
  }

  const isAutoLocked = (week: ForecastWeek) => week.weekout <= 2

  // Sort weeks based on selected sort option
  const sortedWeeks = [...weeks].sort((a, b) => {
    if (sortBy === 'action_required') {
      const priorityA = getStatusPriority(a)
      const priorityB = getStatusPriority(b)
      if (priorityA !== priorityB) return priorityA - priorityB
      // Secondary sort by target week
      return a.weekout - b.weekout
    }
    // Default: sort by target week (chronological)
    return a.weekout - b.weekout
  })

  const toggleExpand = (weekId: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekId)) {
        next.delete(weekId)
      } else {
        next.add(weekId)
      }
      return next
    })
  }

  const filteredWeeks = sortedWeeks.filter(week => {
    // Search filter
    const matchesSearch = week.weekLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          week.startDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          week.endDate.toLowerCase().includes(searchQuery.toLowerCase())

    // Validation status filter - if no filters active, show all
    const matchesValidation = validationFilter.length === 0 || validationFilter.includes(week.validationStatus)

    return matchesSearch && matchesValidation
  })

  return (
    <Card data-forecast-table>
      {/* HelloFresh Table Toolbar */}
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                fontFamily: 'var(--hf-font-body)',
                fontSize: 'var(--hf-body-small-size)',
                lineHeight: 'var(--hf-body-small-line)',
                fontWeight: 'var(--hf-font-weight-semibold)',
                color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
              }}
            >
              All ({filteredWeeks.length})
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Quick search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div
          className="flex items-center gap-2"
          style={{
            /* token: spacing-3 */
            paddingTop: '12px',
            paddingBottom: '12px',
          }}
        >
          {/* All */}
          <button
            onClick={() => setValidationFilter([])}
            className="inline-flex items-center gap-2 font-medium transition-all"
            style={{
              /* token: spacing-1 spacing-3 */
              padding: '4px 12px',
              /* token: border-radius-pill */
              borderRadius: '16px',
              /* token: font-size-body-sm */
              fontSize: '13px',
              border: '1px solid',
              ...(isAllActive
                ? {
                    /* Active: All */
                    /* token: color-interactive-primary */
                    borderColor: '#067a46',
                    /* token: color-surface-primary-subtle */
                    backgroundColor: '#e4fabf',
                    /* token: color-interactive-primary */
                    color: '#067a46',
                  }
                : {
                    /* Inactive */
                    /* token: color-border-default */
                    borderColor: '#E5E7EB',
                    /* token: color-surface-default */
                    backgroundColor: '#FFFFFF',
                    /* token: color-text-default */
                    color: '#111827',
                  }),
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: isAllActive ? '#067a46' : '#9CA3AF',
              }}
            />
            All
            <span
              className="inline-flex items-center justify-center font-semibold"
              style={{
                /* token: spacing-1 */
                padding: '2px 6px',
                /* token: border-radius-sm */
                borderRadius: '4px',
                /* token: font-size-label-xs */
                fontSize: '11px',
                ...(isAllActive
                  ? {
                      /* token: color-interactive-primary */
                      backgroundColor: '#067a46',
                      color: '#FFFFFF',
                    }
                  : {
                      /* token: color-surface-subtle */
                      backgroundColor: '#F3F4F6',
                      /* token: color-text-secondary */
                      color: '#6B7280',
                    }),
              }}
            >
              {weeks.length}
            </span>
          </button>

          {/* Valid */}
          <button
            onClick={() => toggleValidationFilter('valid')}
            className="inline-flex items-center gap-2 font-medium transition-all"
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              border: '1px solid',
              ...(isFilterActive('valid')
                ? {
                    /* Active: Valid */
                    /* token: color-feedback-success-border */
                    borderColor: '#10B981',
                    /* token: color-feedback-success-subtle */
                    backgroundColor: '#D1FAE5',
                    /* token: color-feedback-success */
                    color: '#065F46',
                  }
                : {
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                  }),
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: isFilterActive('valid') ? '#10B981' : '#9CA3AF',
              }}
            />
            Valid
            <span
              className="inline-flex items-center justify-center font-semibold"
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                ...(isFilterActive('valid')
                  ? {
                      /* token: color-feedback-success-border */
                      backgroundColor: '#10B981',
                      /* token: color-feedback-success */
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                    }),
              }}
            >
              {validCount}
            </span>
          </button>

          {/* Warning */}
          <button
            onClick={() => toggleValidationFilter('warning')}
            className="inline-flex items-center gap-2 font-medium transition-all"
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              border: '1px solid',
              ...(isFilterActive('warning')
                ? {
                    /* Active: Warning */
                    /* token: color-feedback-warning-border */
                    borderColor: '#F59E0B',
                    /* token: color-feedback-warning-subtle */
                    backgroundColor: '#FEF3C7',
                    /* token: color-feedback-warning */
                    color: '#92400E',
                  }
                : {
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                  }),
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: isFilterActive('warning') ? '#F59E0B' : '#9CA3AF',
              }}
            />
            Warning
            <span
              className="inline-flex items-center justify-center font-semibold"
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                ...(isFilterActive('warning')
                  ? {
                      /* token: color-feedback-warning-border */
                      backgroundColor: '#F59E0B',
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                    }),
              }}
            >
              {warningCount}
            </span>
          </button>

          {/* Error */}
          <button
            onClick={() => toggleValidationFilter('error')}
            className="inline-flex items-center gap-2 font-medium transition-all"
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              border: '1px solid',
              ...(isFilterActive('error')
                ? {
                    /* Active: Error */
                    /* token: color-feedback-error-border */
                    borderColor: '#DC2626',
                    /* token: color-feedback-error-subtle */
                    backgroundColor: '#FEE2E2',
                    /* token: color-feedback-error */
                    color: '#B30000',
                  }
                : {
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                  }),
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: isFilterActive('error') ? '#DC2626' : '#9CA3AF',
              }}
            />
            Error
            <span
              className="inline-flex items-center justify-center font-semibold"
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                ...(isFilterActive('error')
                  ? {
                      /* token: color-feedback-error-border */
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                    }),
              }}
            >
              {errorCount}
            </span>
          </button>
        </div>

        {/* Secondary toolbar - Sort */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="action_required">Action Required</SelectItem>
                <SelectItem value="target_week">Target Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Valid
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Warning
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              Error
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-background hover:bg-background">
              {forecastLevel === 'sku' ? (
                <>
                  {/* SKU-specific headers */}
                  <TableHead className="font-semibold text-foreground">Market</TableHead>
                  <TableHead className="font-semibold text-foreground">Target Week</TableHead>
                  <TableHead className="font-semibold text-foreground">SKU ID</TableHead>
                  <TableHead className="font-semibold text-foreground">SKU Name</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Forecast</TableHead>
                  <TableHead className="font-semibold text-foreground">Reason for Override</TableHead>
                  <TableHead className="font-semibold text-foreground">Last Modified</TableHead>
                  <TableHead className="w-28" />
                </>
              ) : (
                <>
                  {/* Week-based headers for Box/Recipe levels */}
                  <TableHead className="w-10" />
                  <TableHead className="font-semibold text-foreground">Target Week</TableHead>
                  <TableHead className="font-semibold text-foreground">Week Phase</TableHead>
                  {forecastLevel === 'recipe' ? (
                    <>
                      <TableHead className="text-right font-semibold text-foreground">Recipes</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Swapped Forecast</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Non-Swapped Forecast</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Total Forecast</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Delta</TableHead>
                      <TableHead className="font-semibold text-foreground">Overrides</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-right font-semibold text-foreground">Baseline (Model)</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Operational (Local)</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Previous Run</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Delta</TableHead>
                      <TableHead className="font-semibold text-foreground">Confidence</TableHead>
                    </>
                  )}
                  <TableHead className="font-semibold text-foreground">Validation</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="w-28" />
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecastLevel === 'sku' ? (
              /* SKU-specific table body - show individual SKUs as rows */
              mockSkuForecastRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-8 w-8 text-muted-foreground/50" />
                      <p className="font-medium text-sm text-muted-foreground">
                        No SKU forecasts available
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                mockSkuForecastRows.map((skuRow) => (
                  <TableRow
                    key={skuRow.id}
                    className={cn(
                      'group transition-colors duration-200 cursor-pointer border-b',
                      skuRow.isManualOverride && 'bg-amber-50/30'
                    )}
                  >
                    {/* Market */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {skuRow.market}
                      </Badge>
                    </TableCell>
                    {/* Target Week */}
                    <TableCell>
                      <div>
                        <span className="font-medium">{skuRow.weekLabel}</span>
                        <div className="text-xs text-muted-foreground">
                          {skuRow.startDate} - {skuRow.endDate}
                        </div>
                      </div>
                    </TableCell>
                    {/* SKU ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">{skuRow.skuId}</span>
                    </TableCell>
                    {/* SKU Name */}
                    <TableCell>
                      <span className="font-medium">{skuRow.skuName}</span>
                    </TableCell>
                    {/* Forecast */}
                    <TableCell className="text-right font-mono">
                      <span className={cn(
                        'font-semibold',
                        skuRow.isManualOverride && 'text-amber-600'
                      )}>
                        {skuRow.forecast.toLocaleString()}
                      </span>
                      {skuRow.isManualOverride && (
                        <div className="text-[10px] text-amber-600">Override</div>
                      )}
                    </TableCell>
                    {/* Reason for Override */}
                    <TableCell>
                      {skuRow.overrideReason && skuRow.reasonLabel ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                          {skuRow.reasonLabel}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No override</span>
                      )}
                    </TableCell>
                    {/* Last Modified */}
                    <TableCell>
                      {skuRow.lastModifiedBy ? (
                        <div className="text-sm">
                          <div className="font-medium">{skuRow.lastModifiedBy}</div>
                          <div className="text-xs text-muted-foreground">
                            {skuRow.lastModifiedAt ? new Date(skuRow.lastModifiedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            }) : '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          // TODO: Open SKU override sheet for editing
                          console.log('Edit SKU:', skuRow.skuId)
                        }}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : filteredWeeks.length === 0 ? (
              /* Week-based empty state */
              <TableRow>
                <TableCell colSpan={forecastLevel === 'recipe' ? 12 : 11} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="h-8 w-8 text-muted-foreground/50" />
                    <p
                      className="font-medium"
                      style={{
                        /* token: font-size-body-md */
                        fontSize: '14px',
                        /* token: color-text-subtle */
                        color: '#6B7280',
                      }}
                    >
                      No rows match the current filter
                    </p>
                    <p
                      style={{
                        /* token: font-size-body-sm */
                        fontSize: '13px',
                        /* token: color-text-tertiary */
                        color: '#9CA3AF',
                      }}
                    >
                      Try adjusting your validation status filters or search query
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* Week-based table body for Box/Recipe levels */
              filteredWeeks.map((week) => {
              const isExpanded = expandedWeeks.has(week.id)
              const isLocked = week.approvalStatus === 'locked'
              const finalForecast = week.overwriteForecast || week.forecastBoxcount

              // Compute comparison delta if available
              const compValue = comparisonVersion?.data[week.id]
              const showCompDelta = comparisonVersion && compValue
              const compDeltaAbs = showCompDelta ? finalForecast - compValue : 0
              const compDeltaPct = showCompDelta && compValue ? (compDeltaAbs / compValue) * 100 : 0

              return (
                <>
                  <TableRow
                    key={week.id}
                    id={`forecast-row-${week.id}`}
                    onClick={() => onSelectWeek?.(selectedWeekId === week.id ? null : week.id)}
                    className={cn(
                      'group transition-colors duration-200 cursor-pointer border-b',
                      week.isManualOverride && 'bg-amber-50/30',
                      isLocked && 'opacity-75',
                      highlightedWeekId === week.id && 'bg-blue-50 ring-2 ring-blue-300 ring-inset',
                      selectedWeekId === week.id && 'bg-primary/5 ring-1 ring-primary/20 ring-inset'
                    )}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleExpand(week.id)}
                        className="h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div>
                          <span className="font-medium">{week.weekLabel}</span>
                          <div className="text-xs text-muted-foreground">
                            {week.startDate} - {week.endDate}
                          </div>
                        </div>
                        {isAutoLocked(week) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Forecast locked within 2 weeks of delivery</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <WeekPhaseBadge phase={week.weekPhase} />
                        {week.weekPhase === 'live' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-[10px] cursor-help font-semibold">
                                  Caps applied
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-52">
                                <p className="text-xs">Recipe-level caps are applied for live steering weeks. SKU-level caps coming soon.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    {forecastLevel === 'recipe' ? (
                      <>
                        {/* Recipes Column */}
                        <TableCell className="text-right font-mono">
                          <span className="font-semibold">
                            {week.recipeCount?.toLocaleString() || '—'}
                          </span>
                        </TableCell>
                        {/* Swapped Forecast Column */}
                        <TableCell className="text-right font-mono">
                          <span className="text-muted-foreground">
                            {week.swappedForecast?.toLocaleString() || '—'}
                          </span>
                        </TableCell>
                        {/* Non-Swapped Forecast Column */}
                        <TableCell className="text-right font-mono">
                          <span className="text-muted-foreground">
                            {week.nonSwappedForecast?.toLocaleString() || '—'}
                          </span>
                        </TableCell>
                        {/* Total Forecast Column */}
                        <TableCell className="text-right font-mono">
                          <span className={cn(
                            'font-semibold',
                            week.isManualOverride && 'text-amber-600'
                          )}>
                            {finalForecast.toLocaleString()}
                          </span>
                          {week.isManualOverride && (
                            <div className="text-[10px] text-amber-600">Override</div>
                          )}
                        </TableCell>
                        {/* Delta Column */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {showCompDelta ? (
                              <DeltaDisplay percent={compDeltaPct} absolute={compDeltaAbs} />
                            ) : (
                              <DeltaDisplay percent={week.deltaPercent} absolute={week.deltaAbsolute} />
                            )}
                            {onExplainChange && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => onExplainChange(week)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">View change drivers</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        {/* Overrides Column */}
                        <TableCell>
                          {week.recipeOverridesCount ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                              {week.recipeOverridesCount} override{week.recipeOverridesCount !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No overrides</span>
                          )}
                        </TableCell>
                      </>
                    ) : forecastLevel === 'sku' ? (
                      <>
                        {/* SKUs Column */}
                        <TableCell className="text-right font-mono">
                          <span className="font-semibold">
                            {week.skuCount?.toLocaleString() || '—'}
                          </span>
                        </TableCell>
                        {/* Total Forecast Column */}
                        <TableCell className="text-right font-mono">
                          <span className={cn(
                            'font-semibold',
                            week.isManualOverride && 'text-amber-600'
                          )}>
                            {finalForecast.toLocaleString()}
                          </span>
                          {week.isManualOverride && (
                            <div className="text-[10px] text-amber-600">Override</div>
                          )}
                        </TableCell>
                        {/* Previous Run Column */}
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {compValue ? compValue.toLocaleString() : week.previousForecast.toLocaleString()}
                        </TableCell>
                        {/* Delta Column */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {showCompDelta ? (
                              <DeltaDisplay percent={compDeltaPct} absolute={compDeltaAbs} />
                            ) : (
                              <DeltaDisplay percent={week.deltaPercent} absolute={week.deltaAbsolute} />
                            )}
                            {onExplainChange && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => onExplainChange(week)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">View change drivers</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        {/* Overrides Column */}
                        <TableCell>
                          {week.skuOverridesCount ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                              {week.skuOverridesCount} override{week.skuOverridesCount !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No overrides</span>
                          )}
                        </TableCell>
                        {/* Confidence Column */}
                        <TableCell>
                          <ConfidenceBar value={week.confidence} />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        {/* Standard columns for box/addons levels */}
                        <TableCell className="text-right font-mono">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help text-muted-foreground">
                                  {week.forecastBoxcount.toLocaleString()}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Baseline (global) - Unconstrained model output</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={cn(
                            'font-semibold',
                            week.isManualOverride && 'text-amber-600'
                          )}>
                            {finalForecast.toLocaleString()}
                          </span>
                          {week.isManualOverride && (
                            <div className="text-[10px] text-amber-600">Override</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {compValue ? compValue.toLocaleString() : week.previousForecast.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {showCompDelta ? (
                              <DeltaDisplay percent={compDeltaPct} absolute={compDeltaAbs} />
                            ) : (
                              <DeltaDisplay percent={week.deltaPercent} absolute={week.deltaAbsolute} />
                            )}
                            {onExplainChange && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => onExplainChange(week)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">View change drivers</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ConfidenceBar value={week.confidence} />
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <ValidationStatusIcon status={week.validationStatus} />
                        <span className="text-xs capitalize">
                          {Math.abs(week.deltaPercent) > 5 ? 'Significant delta' : week.validationStatus}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAutoLocked(week) ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="text-xs cursor-help bg-muted/80 font-semibold">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Forecast locked within 2 weeks of delivery</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : isLocked ? (
                        <Badge variant="secondary" className="text-xs bg-muted/80 font-semibold">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      ) : week.approvalStatus === 'approved' ? (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : Math.abs(week.deltaPercent) > 5 && !week.isManualOverride ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs Review
                        </Badge>
                      ) : week.isManualOverride ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-xs font-semibold">
                          <Clock className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!isLocked && !isAutoLocked(week) && week.approvalStatus !== 'approved' && forecastLevel === 'box' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => startInlineEdit(week)}
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Edit operational forecast</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isAutoLocked(week) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Forecast locked within 2 weeks of delivery</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${week.id}-details`} className="bg-muted/20 border-b">
                      <TableCell colSpan={forecastLevel === 'recipe' || forecastLevel === 'sku' ? 12 : 11} className="py-4">
                        {editingWeekId === week.id && forecastLevel === 'box' ? (
                          /* Inline Edit Form - Only for Box Level */
                          <div className="px-8 space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div className="bg-background rounded-lg p-3 border">
                                <div className="text-xs text-muted-foreground font-medium mb-1">Baseline (Model)</div>
                                <div className="font-mono text-base font-semibold">{week.forecastBoxcount.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">Read-only</div>
                              </div>
                              <div className="bg-background rounded-lg p-3 border-2 border-primary/30">
                                <div className="text-xs font-medium mb-1">Current Operational (Local)</div>
                                <Input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => { setEditValue(e.target.value); setEditError('') }}
                                  className="font-mono h-8 text-base font-semibold"
                                  autoFocus
                                />
                              </div>
                              <div className="bg-background rounded-lg p-3 border">
                                <div className="text-xs text-muted-foreground font-medium mb-1">Delta vs Previous Run</div>
                                {editValue && Number(editValue) > 0 ? (
                                  <>
                                    <div className={cn(
                                      'font-mono text-base font-semibold',
                                      Number(editValue) - week.previousForecast >= 0 ? 'text-primary' : 'text-destructive'
                                    )}>
                                      {Number(editValue) - week.previousForecast >= 0 ? '+' : ''}
                                      {(Number(editValue) - week.previousForecast).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      {((Number(editValue) - week.previousForecast) / week.previousForecast * 100).toFixed(1)}%
                                    </div>
                                  </>
                                ) : (
                                  <div className="font-mono text-muted-foreground">--</div>
                                )}
                              </div>
                              <div className="bg-background rounded-lg p-3 border">
                                <div className="text-xs text-muted-foreground font-medium mb-1">Confidence</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
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
                                  <span className="text-sm font-semibold">{week.confidence}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium mb-1 block">
                                  Reason for override <span className="text-destructive">*</span>
                                </label>
                                <Select value={editReason} onValueChange={(v: OverrideReason) => { setEditReason(v); setEditError('') }}>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select reason..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(overrideReasonLabels).map(([value, label]) => (
                                      <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block">
                                  Justification <span className="text-destructive">*</span>
                                </label>
                                <Textarea
                                  value={editComment}
                                  onChange={(e) => { setEditComment(e.target.value); setEditError('') }}
                                  placeholder="Provide justification for this override..."
                                  rows={1}
                                  className="text-sm resize-none min-h-8"
                                />
                              </div>
                            </div>

                            {editError && (
                              <div className="flex items-center gap-2 text-destructive text-xs">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {editError}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <Button size="sm" onClick={() => saveInlineEdit(week.id)}>
                                Save Override
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelInlineEdit}>
                                Cancel
                              </Button>
                              {editValue && Number(editValue) > 0 && Math.abs(((Number(editValue) - week.forecastBoxcount) / week.forecastBoxcount) * 100) > 5 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs ml-2 font-semibold">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {'>'} 5% change - will be flagged for review
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Read-only Expanded Details */
                          <>
                            {forecastLevel === 'recipe' ? (
                              /* Recipe-specific expanded details */
                              <div className="grid grid-cols-5 gap-6 px-8">
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Recipe Count</div>
                                  <div className="font-mono font-semibold">
                                    {week.recipeCount?.toLocaleString() || '—'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Swapped Forecast</div>
                                  <div className="font-mono">
                                    {week.swappedForecast?.toLocaleString() || '—'}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {week.swappedForecast && finalForecast ? `${((week.swappedForecast / finalForecast) * 100).toFixed(0)}% of total` : ''}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Non-Swapped Forecast</div>
                                  <div className="font-mono">
                                    {week.nonSwappedForecast?.toLocaleString() || '—'}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {week.nonSwappedForecast && finalForecast ? `${((week.nonSwappedForecast / finalForecast) * 100).toFixed(0)}% of total` : ''}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Recipe Overrides</div>
                                  <div className="text-sm">
                                    {week.recipeOverridesCount ? (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                                        {week.recipeOverridesCount} override{week.recipeOverridesCount !== 1 ? 's' : ''}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">No overrides</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Last Modified</div>
                                  <div className="text-sm">
                                    {week.lastModifiedBy ? (
                                      <>
                                        <div>{week.lastModifiedBy}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {week.lastModifiedAt ? new Date(week.lastModifiedAt).toLocaleString() : '-'}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">No modifications</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : forecastLevel === 'sku' ? (
                              /* SKU-specific expanded details */
                              <div className="grid grid-cols-5 gap-6 px-8">
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">SKU Count</div>
                                  <div className="font-mono font-semibold">
                                    {week.skuCount?.toLocaleString() || '—'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Total Forecast</div>
                                  <div className="font-mono font-semibold">
                                    {finalForecast.toLocaleString()} {unit}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">SKU Overrides</div>
                                  <div className="text-sm">
                                    {week.skuOverridesCount ? (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                                        {week.skuOverridesCount} override{week.skuOverridesCount !== 1 ? 's' : ''}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">No overrides</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Confidence</div>
                                  <div className="flex items-center gap-2">
                                    <ConfidenceBar value={week.confidence} />
                                    <span className="text-sm font-semibold">{week.confidence}%</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Last Modified</div>
                                  <div className="text-sm">
                                    {week.lastModifiedBy ? (
                                      <>
                                        <div>{week.lastModifiedBy}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {week.lastModifiedAt ? new Date(week.lastModifiedAt).toLocaleString() : '-'}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">No modifications</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Box/Addons-specific expanded details */
                              <div className="grid grid-cols-5 gap-6 px-8">
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">
                                    {comparisonLabel ? `${comparisonLabel} (Comparator)` : 'Previous Run (Comparator)'}
                                  </div>
                                  <div className="font-mono">
                                    {compValue ? `${compValue.toLocaleString()} ${unit}` : `${week.previousForecast.toLocaleString()} ${unit}`}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Actuals</div>
                                  <div className="font-mono">
                                    {week.actualBoxcount ? `${week.actualBoxcount.toLocaleString()} ${unit}` : 'Not available'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Last Modified</div>
                                  <div className="text-sm">
                                    {week.lastModifiedBy ? (
                                      <>
                                        <div>{week.lastModifiedBy}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {week.lastModifiedAt ? new Date(week.lastModifiedAt).toLocaleString() : '-'}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">No modifications</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Override Reason</div>
                                  <div className="text-sm">
                                    {week.overrideReason ? (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-semibold">
                                        {overrideReasonLabels[week.overrideReason]}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">No override</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Planner Comment</div>
                                  <div className="text-sm">
                                    {week.plannerComment || <span className="text-muted-foreground">No comment</span>}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="px-8 mt-4 pt-3 border-t flex items-center gap-2">
                              {onExplainChange && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onExplainChange(week)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                  View Change Drivers
                                </Button>
                              )}
                              {!isLocked && !isAutoLocked(week) && week.approvalStatus !== 'approved' && forecastLevel === 'box' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startInlineEdit(week)}
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                                  Edit Operational Forecast
                                </Button>
                              )}
                              {!isLocked && !isAutoLocked(week) && week.approvalStatus !== 'approved' && forecastLevel === 'recipe' && (
                                <Button
                                  size="sm"
                                  onClick={() => openRecipeSheet(week)}
                                  style={{
                                    backgroundColor: 'var(--hf-foreground-positive-positive-dark)',
                                    color: 'var(--hf-foreground-light-neutral-neutral-light)',
                                    fontWeight: 600,
                                  }}
                                  className="hover:opacity-90"
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                                  {week.isManualOverride ? 'Edit Recipe Override' : 'Edit Recipe Forecast'}
                                </Button>
                              )}
                              {!isLocked && !isAutoLocked(week) && week.approvalStatus !== 'approved' && forecastLevel === 'sku' && (
                                <Button
                                  size="sm"
                                  onClick={() => openSkuSheet(week)}
                                  style={{
                                    backgroundColor: 'var(--hf-foreground-positive-positive-dark)',
                                    color: 'var(--hf-foreground-light-neutral-neutral-light)',
                                    fontWeight: 600,
                                  }}
                                  className="hover:opacity-90"
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                                  {week.isManualOverride ? 'Edit SKU Override' : 'Edit SKU Forecast'}
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })
            )}
          </TableBody>
        </Table>

        {/* Filter summary footer */}
        {validationFilter.length > 0 && (
          <div
            className="px-6 py-3 border-t"
            style={{
              /* token: color-border-default */
              borderColor: '#E5E7EB',
            }}
          >
            <p
              style={{
                /* token: font-size-xs */
                fontSize: '12px',
                /* token: color-text-tertiary */
                color: '#9CA3AF',
              }}
            >
              Showing {filteredWeeks.length} of {weeks.length} rows · filtered by:{' '}
              {validationFilter
                .map((status) => {
                  if (status === 'valid') return 'Valid'
                  if (status === 'warning') return 'Warning'
                  if (status === 'error') return 'Error'
                  return status
                })
                .join(', ')}
            </p>
          </div>
        )}
      </CardContent>

      {/* Recipe Override Sheet - Portal rendered */}
      {selectedSheetWeek && (
        <RecipeOverrideSheet
          open={recipeSheetOpen}
          onClose={() => {
            setRecipeSheetOpen(false)
            setSelectedSheetWeek(null)
          }}
          weekLabel={selectedSheetWeek.weekLabel}
          dateRange={`${selectedSheetWeek.startDate} – ${selectedSheetWeek.endDate}`}
          market="US"
          recipes={mockRecipeData}
          onSave={handleRecipeSave}
        />
      )}

      {/* SKU Override Sheet - Portal rendered */}
      {selectedSheetWeek && (
        <SkuOverrideSheet
          open={skuSheetOpen}
          onClose={() => {
            setSkuSheetOpen(false)
            setSelectedSheetWeek(null)
          }}
          weekLabel={selectedSheetWeek.weekLabel}
          dateRange={`${selectedSheetWeek.startDate} – ${selectedSheetWeek.endDate}`}
          market="US"
          skus={mockSkuData}
          onSave={handleSkuSave}
        />
      )}
    </Card>
  )
}
