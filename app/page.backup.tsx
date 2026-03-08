'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { Check, FileText, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/forecast/app-header'
import { ForecastContextBar } from '@/components/forecast/forecast-context-bar'
import { KPICards } from '@/components/forecast/kpi-cards'
import { ForecastChart } from '@/components/forecast/forecast-chart'
import { ForecastTable } from '@/components/forecast/forecast-table'
import { EditForecastPanel } from '@/components/forecast/edit-forecast-panel'
import { ValidationPanel } from '@/components/forecast/validation-panel'
import { ApprovalDialog } from '@/components/forecast/approval-dialog'
import { AuditLog } from '@/components/forecast/audit-log'
import { RiskSummary } from '@/components/forecast/risk-summary'
import { ExplainChangeDialog } from '@/components/forecast/explain-change-dialog'
import { 
  forecastVersions, 
  forecastWeeks as initialWeeks, 
  auditLog,
  comparisonVersions,
  calculateKPIs, 
  calculateRisks,
  getChartData,
  detectSignificantChanges,
  getDimensionKPIs,
  forecastLevelLabels,
  forecastLevelUnits,
  versionDayLabels,
  type ForecastWeek,
  type OverrideReason,
  type ForecastLevel,
  type ForecastVersionDay,
  type Brand,
  type WeekPhase,
} from '@/lib/forecast-data'

export default function DemandForecastingDashboard() {
  // Core state
  const [selectedVersion, setSelectedVersion] = useState(forecastVersions[forecastVersions.length - 1].id)
  const [weeks, setWeeks] = useState<ForecastWeek[]>(initialWeeks)
  const [editingWeek, setEditingWeek] = useState<ForecastWeek | null>(null)
  const [explainWeek, setExplainWeek] = useState<ForecastWeek | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [auditEntries, setAuditEntries] = useState(auditLog)

  // Global context state - pre-selected for Maria's DE HelloFresh HFW12 scenario
  const [forecastLevel, setForecastLevel] = useState<ForecastLevel>('box')
  const [selectedVersionDay, setSelectedVersionDay] = useState<ForecastVersionDay>('wednesday')
  const [comparisonVersionDay, setComparisonVersionDay] = useState<ForecastVersionDay | null>('monday')
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>(['hellofresh'])
  const [selectedMarket, setSelectedMarket] = useState('de')

  const [weekoutFilter, setWeekoutFilter] = useState(8)
  const [selectedKPI, setSelectedKPI] = useState('box_wape')
  const [highlightedWeekId, setHighlightedWeekId] = useState<string | null>(null)
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Navigate to a specific week row in the table (investigate flow)
  const handleInvestigateWeek = useCallback((weekId: string) => {
    setHighlightedWeekId(weekId)
    // Scroll to the table section
    setTimeout(() => {
      const rowEl = document.getElementById(`forecast-row-${weekId}`)
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedWeekId(null), 3000)
    }, 100)
  }, [])

  // Reset KPI selection when forecast level changes
  const handleForecastLevelChange = (level: ForecastLevel) => {
    setForecastLevel(level)
    const defaultKPIs: Record<ForecastLevel, string> = {
      box: 'box_wape',
      recipe: 'recipe_wape',
      sku: 'sku_wape',
      addons: 'addons_wape',
    }
    setSelectedKPI(defaultKPIs[level])
  }

  // Comparison version
  const activeComparisonVersion = useMemo(() => {
    if (!comparisonVersionDay) return null
    return comparisonVersions.find(v => v.day === comparisonVersionDay) || null
  }, [comparisonVersionDay])

  const comparisonLabel = activeComparisonVersion?.label || null

  // Significant changes detection
  const significantChanges = useMemo(() => {
    if (!activeComparisonVersion) return []
    return detectSignificantChanges(weeks, activeComparisonVersion)
  }, [weeks, activeComparisonVersion])

  // Filter weeks by weekout only (week phase filter removed)
  const filteredWeeks = useMemo(() => {
    return weeks.filter(w => w.weekout <= weekoutFilter)
  }, [weeks, weekoutFilter])

  // Computed values
  const currentVersion = forecastVersions.find(v => v.id === selectedVersion)
  const kpis = useMemo(() => calculateKPIs(filteredWeeks), [filteredWeeks])
  const chartData = useMemo(() => getChartData(filteredWeeks, true, activeComparisonVersion), [filteredWeeks, activeComparisonVersion])
  const risks = useMemo(() => calculateRisks(filteredWeeks), [filteredWeeks])

  // Dimension-specific KPIs
  const dimensionKPIs = useMemo(() => getDimensionKPIs(forecastLevel, selectedMarket), [forecastLevel, selectedMarket])

  // Comparison delta for KPI cards
  const comparisonDelta = useMemo(() => {
    if (!activeComparisonVersion) return null
    const totalCurrent = filteredWeeks.reduce((sum, w) => sum + (w.overwriteForecast || w.forecastBoxcount), 0)
    const totalComparison = filteredWeeks.reduce((sum, w) => sum + (activeComparisonVersion.data[w.id] || 0), 0)
    if (totalComparison === 0) return null
    const abs = totalCurrent - totalComparison
    const pct = ((abs / totalComparison) * 100).toFixed(2)
    return { percent: pct, absolute: abs, label: activeComparisonVersion.label }
  }, [filteredWeeks, activeComparisonVersion])

  // Handlers
  const handleEditWeek = (week: ForecastWeek) => {
    setEditingWeek(week)
  }

  const handleExplainChange = (week: ForecastWeek) => {
    setExplainWeek(week)
  }

  const handleSaveOverride = (weekId: string, overwriteValue: number, comment: string, reason: OverrideReason) => {
    const now = new Date().toISOString()
    
    setWeeks(prev => prev.map(week => {
      if (week.id === weekId) {
        const newDeltaAbsolute = overwriteValue - week.previousForecast
        const newDeltaPercent = (newDeltaAbsolute / week.previousForecast) * 100
        
        return {
          ...week,
          overwriteForecast: overwriteValue,
          plannerComment: comment,
          overrideReason: reason,
          deltaAbsolute: newDeltaAbsolute,
          deltaPercent: newDeltaPercent,
          isManualOverride: true,
          validationStatus: 'valid' as const,
          lastModifiedBy: 'Maria Schmidt',
          lastModifiedAt: now,
        }
      }
      return week
    }))

    const week = weeks.find(w => w.id === weekId)
    if (week) {
      const oldForecast = week.overwriteForecast || week.forecastBoxcount
      setAuditEntries(prev => [{
        id: `log-${Date.now()}`,
        timestamp: now,
        user: 'Maria Schmidt',
        action: 'Override',
        field: `Box Operational Forecast (${week.weekLabel})`,
        oldValue: oldForecast.toLocaleString(),
        newValue: `Maria Schmidt overrode ${week.weekLabel} from ${oldForecast.toLocaleString()} to ${overwriteValue.toLocaleString()} (Reason: ${reason.replace(/_/g, ' ')})`,
        weekId,
      }, ...prev])
    }

    setEditingWeek(null)
  }

  const handleLockWeek = (weekId: string) => {
    const now = new Date().toISOString()
    const week = weeks.find(w => w.id === weekId)
    if (!week) return

    setWeeks(prev => prev.map(w => {
      if (w.id === weekId) {
        return { ...w, approvalStatus: 'locked' as const }
      }
      return w
    }))

    setAuditEntries(prev => [{
      id: `log-${Date.now()}`,
      timestamp: now,
      user: 'Maria Schmidt',
      action: 'Lock',
      field: 'lock_status',
      oldValue: week.approvalStatus,
      newValue: `${week.weekLabel} marked as Good to Go (Locked)`,
      weekId,
    }, ...prev])

    setSelectedWeekId(null)
  }

  const handleApprove = (comment: string, weekIds?: string[]) => {
    const now = new Date().toISOString()
    const idsToApprove = weekIds || filteredWeeks
      .filter(w => w.approvalStatus !== 'locked' && w.approvalStatus !== 'approved' && w.weekout > 2 && w.validationStatus !== 'error')
      .map(w => w.id)
    
    if (idsToApprove.length === 0) return

    setWeeks(prev => prev.map(w => {
      if (idsToApprove.includes(w.id)) {
        return { ...w, approvalStatus: 'approved' as const }
      }
      return w
    }))

    const approvedWeekLabels = filteredWeeks
      .filter(w => idsToApprove.includes(w.id))
      .map(w => w.weekLabel)
      .join(', ')

    setAuditEntries(prev => [{
      id: `log-${Date.now()}`,
      timestamp: now,
      user: 'Maria Schmidt',
      action: 'Bulk Approve',
      field: 'approval_status',
      oldValue: 'draft/pending_review',
      newValue: `Maria Schmidt approved ${versionDayLabels[selectedVersionDay]} forecast for ${approvedWeekLabels}`,
      weekId: 'bulk',
    }, ...prev])
    
    setShowApprovalDialog(false)
  }

  const handleSubmitForReview = (comment: string) => {
    const now = new Date().toISOString()
    
    setWeeks(prev => prev.map(week => {
      if (week.approvalStatus === 'draft') {
        return { ...week, approvalStatus: 'pending_review' as const }
      }
      return week
    }))

    setAuditEntries(prev => [{
      id: `log-${Date.now()}`,
      timestamp: now,
      user: 'Maria Schmidt',
      action: 'Status Change',
      field: 'approval_status',
      oldValue: 'draft',
      newValue: 'pending_review',
      weekId: 'all',
    }, ...prev])
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 p-6 overflow-auto">
        {/* Context Bar */}
        <ForecastContextBar
          currentStatus={currentVersion?.status || 'draft'}
          lastUpdated="Feb 19, 2026 at 8:30 AM"
          forecastLevel={forecastLevel}
          onForecastLevelChange={handleForecastLevelChange}
          selectedVersionDay={selectedVersionDay}
          onVersionDayChange={setSelectedVersionDay}
          selectedBrands={selectedBrands}
          onBrandsChange={setSelectedBrands}
          selectedMarket={selectedMarket}
          onMarketChange={setSelectedMarket}
          weekoutFilter={weekoutFilter}
          onWeekoutFilterChange={setWeekoutFilter}
          selectedKPI={selectedKPI}
          onKPIChange={setSelectedKPI}
          currentWeekLabel={`HFW${9 + weekoutFilter - 1}`}
        />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Demand Forecast
              {forecastLevel !== 'box' && (
                <span className="text-muted-foreground text-lg font-normal ml-2">
                  - {forecastLevelLabels[forecastLevel]}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Current HelloFresh Week: HFW08 &middot; Today: Feb 19, 2026 &middot; Selected Scope: HFW09–HFW{8 + weekoutFilter} (Weekout 1–{weekoutFilter})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
            {selectedWeekId && (() => {
              const sw = weeks.find(w => w.id === selectedWeekId)
              return sw && sw.approvalStatus !== 'locked' && sw.weekout > 2
            })() && (
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => handleLockWeek(selectedWeekId!)}
              >
                <ShieldCheck className="h-4 w-4" />
                Mark {weeks.find(w => w.id === selectedWeekId)?.weekLabel} as Good to Go
              </Button>
            )}
            <Button onClick={() => setShowApprovalDialog(true)} className="gap-2">
              <Check className="h-4 w-4" />
              Review & Approve
            </Button>
          </div>
        </div>

        {/* US Add-ons Regionalization Note */}
        {forecastLevel === 'addons' && selectedMarket === 'us' && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div>
              <div className="text-sm font-medium text-blue-700">US Market: Regional Segmentation</div>
              <p className="text-xs text-blue-600 mt-0.5">
                Add-ons forecast for the US market can be segmented by regulated and non-regulated regions. 
                Use the Regulation filter above to toggle between All, Regulated, and Non-regulated volumes.
                <span className="ml-1 text-blue-500">(Placeholder - full regional logic coming soon)</span>
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <section className="mb-6">
          <KPICards
            kpis={kpis}
            comparisonDelta={comparisonDelta}
            forecastLevel={forecastLevel}
            dimensionKPIs={dimensionKPIs}
            selectedMarket={selectedMarket}
          />
        </section>

        {/* Target Week Forecast Details - Primary Action Section */}
        <section className="mb-6" ref={tableRef}>
          <ForecastTable 
            weeks={filteredWeeks} 
            onEditWeek={handleEditWeek}
            onSaveOverride={handleSaveOverride}
            onLockWeek={handleLockWeek}
            onExplainChange={handleExplainChange}
            forecastLevel={forecastLevel}
            comparisonVersion={activeComparisonVersion}
            comparisonLabel={comparisonLabel}
            highlightedWeekId={highlightedWeekId}
            selectedWeekId={selectedWeekId}
            onSelectWeek={setSelectedWeekId}
          />
        </section>

        {/* Weekly Forecast Trend */}
        <section className="mb-6">
          <ForecastChart
            data={chartData}
            forecastLevel={forecastLevel}
            comparisonLabel={comparisonLabel}
            selectedVersionDay={selectedVersionDay}
            comparisonVersionDay={comparisonVersionDay}
            onComparisonVersionDayChange={setComparisonVersionDay}
          />
        </section>

        {/* Plan Risk Summary */}
        <section className="mb-6">
          <RiskSummary 
            risks={risks} 
            weeks={filteredWeeks}
            onNavigateToWeek={(weekId) => {
              handleInvestigateWeek(weekId)
            }}
            significantChanges={significantChanges}
            comparisonLabel={comparisonLabel}
          />
        </section>

        {/* Alert Center */}
        <section className="mb-6">
          <ValidationPanel 
            weeks={filteredWeeks} 
            onExplainChange={(week) => {
              handleInvestigateWeek(week.id)
              handleExplainChange(week)
            }}
            significantChanges={significantChanges}
            comparisonLabel={comparisonLabel}
            forecastLevel={forecastLevel}
          />
        </section>

        {/* Recent Activity */}
        <section>
          <AuditLog entries={auditEntries} />
        </section>
      </main>

      <EditForecastPanel
        week={editingWeek}
        open={editingWeek !== null}
        forecastLevel={forecastLevel}
        onClose={() => setEditingWeek(null)}
        onSave={handleSaveOverride}
      />

      <ExplainChangeDialog
        open={explainWeek !== null}
        onClose={() => setExplainWeek(null)}
        week={explainWeek}
      />

      <ApprovalDialog
        open={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        weeks={filteredWeeks}
        forecastRunLabel={versionDayLabels[selectedVersionDay]}
        forecastLevel={forecastLevel}
        selectedMarket={selectedMarket}
        onApprove={handleApprove}
      />
    </div>
  )
}
