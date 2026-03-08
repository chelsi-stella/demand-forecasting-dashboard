'use client'

import { AlertCircle, AlertTriangle, TrendingDown, Activity, ChevronRight, Shield, GitCompare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RiskItem, ForecastWeek, SignificantChange } from '@/lib/forecast-data'

interface RiskSummaryProps {
  risks: RiskItem[]
  weeks: ForecastWeek[]
  onNavigateToWeek?: (weekId: string) => void
  significantChanges?: SignificantChange[]
  comparisonLabel?: string | null
}

function getRiskIcon(type: RiskItem['type']) {
  switch (type) {
    case 'delta':
      return TrendingDown
    case 'confidence':
      return Activity
    case 'validation':
      return AlertCircle
    case 'capacity':
      return AlertTriangle
    default:
      return AlertTriangle
  }
}

function getRiskTypeLabel(type: RiskItem['type']) {
  switch (type) {
    case 'delta':
      return 'Forecast Delta'
    case 'confidence':
      return 'Model Confidence'
    case 'validation':
      return 'Validation'
    case 'capacity':
      return 'Capacity'
    case 'split_bias':
      return 'Split Bias'
    case 'constraint':
      return 'Constraint'
    case 'mismatch':
      return 'Mismatch'
    default:
      return type
  }
}

export function RiskSummary({ risks, weeks, onNavigateToWeek, significantChanges, comparisonLabel }: RiskSummaryProps) {
  const highRisks = risks.filter(r => r.severity === 'high')
  const mediumRisks = risks.filter(r => r.severity === 'medium')
  const totalAtRiskVolume = risks.reduce((sum, r) => sum + r.impact, 0)
  const blockingCount = weeks.filter(w => w.validationStatus === 'error').length
  const warningCount = weeks.filter(w => w.validationStatus === 'warning').length
  const versionDeltaCount = significantChanges?.length || 0

  // Handle scroll to table
  const handleBannerClick = () => {
    const tableEl = document.querySelector('[data-forecast-table]')
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (risks.length === 0 && blockingCount === 0 && warningCount === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Plan Risk Summary</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Low Risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div 
            className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={handleBannerClick}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">Plan is stable &middot; No significant risks identified</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Build summary parts
  const summaryParts: string[] = []
  if (highRisks.length > 0) summaryParts.push(`${highRisks.length} High-risk item${highRisks.length > 1 ? 's' : ''}`)
  if (mediumRisks.length > 0) summaryParts.push(`${mediumRisks.length} Medium-risk item${mediumRisks.length > 1 ? 's' : ''}`)
  if (totalAtRiskVolume > 0) summaryParts.push(`${totalAtRiskVolume.toLocaleString()} boxes at risk`)
  if (blockingCount > 0) summaryParts.push(`${blockingCount} Blocking`)
  if (warningCount > 0) summaryParts.push(`${warningCount} Warning${warningCount > 1 ? 's' : ''}`)
  if (versionDeltaCount > 0) summaryParts.push(`${versionDeltaCount} Version Delta${versionDeltaCount > 1 ? 's' : ''}`)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Plan Risk Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={handleBannerClick}
        >
          {/* Left: Summary sentence */}
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">{summaryParts.join(' · ')}</span>
          </div>
          
          {/* Right: Total at risk + severity pills */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Total at risk:</span>
              <span className="font-semibold font-mono text-foreground">{totalAtRiskVolume.toLocaleString()} boxes</span>
            </div>
            {highRisks.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {highRisks.length} High
              </Badge>
            )}
            {mediumRisks.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                {mediumRisks.length} Medium
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
