// Forecast data types and mock data for MVP

export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'locked'
export type LockStatus = 'draft' | 'needs_review' | 'locked'
export type ValidationStatus = 'valid' | 'warning' | 'error' | 'pending'
export type OverrideReason = 
  | 'demand_adjustment'
  | 'market_insight'
  | 'external_event'
  | 'supply_constraint'
  | 'marketing_event'
  | 'seasonal_adjustment'
  | 'customer_insight'
  | 'operational_constraint'
  | 'model_correction'
  | 'other'

export type ForecastLevel = 'box' | 'recipe' | 'sku' | 'addons'
export type ForecastVersionDay = 'monday' | 'wednesday' | 'friday'
export type WeekPhase = 'live' | 'non-live'
export type Brand = 'hellofresh' | 'everyplate' | 'greenchef'
export type ChartViewBy = 'target_week' | 'weekout' | 'forecast_run_day'

export const chartViewByLabels: Record<ChartViewBy, string> = {
  target_week: 'Target Week',
  weekout: 'Weekout',
  forecast_run_day: 'Forecast Run Day',
}

export const forecastLevelLabels: Record<ForecastLevel, string> = {
  box: 'Box Forecast',
  recipe: 'Recipe Forecast',
  sku: 'SKU Forecast',
  addons: 'Add-ons Forecast',
}

export const forecastLevelUnits: Record<ForecastLevel, string> = {
  box: 'boxes',
  recipe: 'recipes',
  sku: 'units',
  addons: 'add-ons',
}

export const versionDayLabels: Record<ForecastVersionDay, string> = {
  monday: 'Monday Run',
  wednesday: 'Wednesday Run',
  friday: 'Friday Run',
}

export const brandLabels: Record<Brand, string> = {
  hellofresh: 'HelloFresh',
  everyplate: 'EveryPlate',
  greenchef: 'GreenChef',
}

export const overrideReasonLabels: Record<OverrideReason, string> = {
  demand_adjustment: 'Demand Adjustment',
  market_insight: 'Market Insight',
  external_event: 'External Event',
  supply_constraint: 'Supply Constraint',
  marketing_event: 'Marketing Event / Promotion',
  seasonal_adjustment: 'Seasonal Adjustment',
  customer_insight: 'Customer Insight / Feedback',
  operational_constraint: 'Operational Constraint',
  model_correction: 'Model Correction',
  other: 'Other',
}

export interface ChangeDriver {
  factor: string
  impact: number // percentage contribution to change
  direction: 'increase' | 'decrease'
  region?: string
  product?: string
}

export interface ForecastWeek {
  id: string
  weekNumber: number
  weekLabel: string
  startDate: string
  endDate: string
  forecastBoxcount: number // Unconstrained (model output)
  actualBoxcount: number | null
  previousForecast: number
  overwriteForecast: number | null // Constrained (after overrides)
  deltaPercent: number
  deltaAbsolute: number
  validationStatus: ValidationStatus
  approvalStatus: ApprovalStatus
  confidence: number
  plannerComment: string | null
  overrideReason: OverrideReason | null
  lastModifiedBy: string | null
  lastModifiedAt: string | null
  isManualOverride: boolean
  changeDrivers: ChangeDriver[]
  weekPhase: WeekPhase
  weekout: number // 1-20, weeks out from today
  forecastRunDay: ForecastVersionDay // which run produced this row
  // Recipe-specific fields (populated when forecastLevel === 'recipe')
  recipeCount?: number
  swappedForecast?: number
  nonSwappedForecast?: number
  recipeOverridesCount?: number
  // SKU-specific fields (populated when forecastLevel === 'sku')
  skuCount?: number
  skuOverridesCount?: number
}

export interface ForecastVersion {
  id: string
  versionNumber: number
  createdAt: string
  createdBy: string
  status: ApprovalStatus
  comment: string | null
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  user: string
  action: string
  field: string
  oldValue: string | null
  newValue: string
  weekId: string
}

// Mock data - Maria's HFW12 scenario (19 Feb 2026, DE HelloFresh, Box Forecast)
export const forecastVersions: ForecastVersion[] = [
  { id: 'v1', versionNumber: 1, createdAt: '2026-02-16T09:00:00Z', createdBy: 'System', status: 'locked', comment: 'Monday Run HFW08 baseline' },
  { id: 'v2', versionNumber: 2, createdAt: '2026-02-18T08:00:00Z', createdBy: 'System', status: 'locked', comment: 'Wednesday Run HFW08 automated' },
  { id: 'v3', versionNumber: 3, createdAt: '2026-02-19T08:30:00Z', createdBy: 'System', status: 'draft', comment: null },
]

export const forecastWeeks: ForecastWeek[] = [
  {
    id: 'w2026-09',
    weekNumber: 9,
    weekLabel: 'HFW09',
    startDate: '2026-02-23',
    endDate: '2026-03-01',
    forecastBoxcount: 19800,
    actualBoxcount: null,
    previousForecast: 19600,
    overwriteForecast: null,
    deltaPercent: 1.02,
    deltaAbsolute: 200,
    validationStatus: 'valid',
    approvalStatus: 'draft',
    confidence: 88,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Seasonal uplift', impact: 55, direction: 'increase', region: 'DACH' },
      { factor: 'Retention improvement', impact: 30, direction: 'increase' },
      { factor: 'Churn normalization', impact: 15, direction: 'decrease' },
    ],
    weekPhase: 'non-live',
    weekout: 1,
    forecastRunDay: 'wednesday',
    // Recipe-specific mock data
    recipeCount: 42,
    swappedForecast: 11880,  // 60% of boxcount
    nonSwappedForecast: 7920,  // 40% of boxcount
    recipeOverridesCount: 0,
    // SKU-specific mock data
    skuCount: 245,
    skuOverridesCount: 0,
  },
  {
    id: 'w2026-10',
    weekNumber: 10,
    weekLabel: 'HFW10',
    startDate: '2026-03-02',
    endDate: '2026-03-08',
    forecastBoxcount: 19500,
    actualBoxcount: null,
    previousForecast: 19400,
    overwriteForecast: null,
    deltaPercent: 0.52,
    deltaAbsolute: 100,
    validationStatus: 'valid',
    approvalStatus: 'draft',
    confidence: 86,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Stable demand pattern', impact: 60, direction: 'increase' },
      { factor: 'Spring campaign ramp-up', impact: 25, direction: 'increase', product: 'Classic Box' },
      { factor: 'Minor churn uptick', impact: 15, direction: 'decrease' },
    ],
    weekPhase: 'non-live',
    weekout: 2,
    forecastRunDay: 'wednesday',
  },
  {
    id: 'w2026-11',
    weekNumber: 11,
    weekLabel: 'HFW11',
    startDate: '2026-03-09',
    endDate: '2026-03-15',
    forecastBoxcount: 19300,
    actualBoxcount: null,
    previousForecast: 19200,
    overwriteForecast: null,
    deltaPercent: 0.52,
    deltaAbsolute: 100,
    validationStatus: 'valid',
    approvalStatus: 'draft',
    confidence: 84,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Pre-spring normalization', impact: 45, direction: 'decrease' },
      { factor: 'Recipe rotation boost', impact: 35, direction: 'increase', product: 'Veggie Box' },
      { factor: 'Weather outlook', impact: 20, direction: 'increase', region: 'DACH' },
    ],
    weekPhase: 'non-live',
    weekout: 3,
    forecastRunDay: 'wednesday',

    // Recipe-specific mock data
    recipeCount: 41,
    swappedForecast: 11700,  // ~60% of boxcount
    nonSwappedForecast: 7800,  // ~40% of boxcount
    recipeOverridesCount: 0,
    // SKU-specific mock data
    skuCount: 238,
    skuOverridesCount: 0,
  },
  {
    id: 'w2026-12',
    weekNumber: 12,
    weekLabel: 'HFW12',
    startDate: '2026-03-16',
    endDate: '2026-03-22',
    forecastBoxcount: 18200,
    actualBoxcount: null,
    previousForecast: 20000,
    overwriteForecast: null,
    deltaPercent: -9.0,
    deltaAbsolute: -1800,
    validationStatus: 'warning',
    approvalStatus: 'draft',
    confidence: 72,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Post-promotion retention drop', impact: 50, direction: 'decrease', region: 'DACH' },
      { factor: 'Seasonal normalization', impact: 30, direction: 'decrease' },
      { factor: 'Competitor spring launch', impact: 20, direction: 'decrease', product: 'Classic Box' },
    ],
    weekPhase: 'non-live',
    weekout: 4,
    forecastRunDay: 'wednesday',

    // Recipe-specific mock data
    recipeCount: 43,
    swappedForecast: 11340,  // ~60% of boxcount
    nonSwappedForecast: 7560,  // ~40% of boxcount
    recipeOverridesCount: 3,
    // SKU-specific mock data
    skuCount: 252,
    skuOverridesCount: 2,
  },
  {
    id: 'w2026-13',
    weekNumber: 13,
    weekLabel: 'HFW13',
    startDate: '2026-03-23',
    endDate: '2026-03-29',
    forecastBoxcount: 18800,
    actualBoxcount: null,
    previousForecast: 19000,
    overwriteForecast: null,
    deltaPercent: -1.05,
    deltaAbsolute: -200,
    validationStatus: 'valid',
    approvalStatus: 'draft',
    confidence: 80,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Gradual recovery', impact: 50, direction: 'increase' },
      { factor: 'New menu cycle', impact: 30, direction: 'increase', product: 'Premium Box' },
      { factor: 'Seasonal drag', impact: 20, direction: 'decrease' },
    ],
    weekPhase: 'non-live',
    weekout: 5,
    forecastRunDay: 'wednesday',

    // Recipe-specific mock data
    recipeCount: 44,
    swappedForecast: 11520,  // ~60% of boxcount
    nonSwappedForecast: 7680,  // ~40% of boxcount
    recipeOverridesCount: 0,
    // SKU-specific mock data
    skuCount: 241,
    skuOverridesCount: 0,
  },
  {
    id: 'w2026-14',
    weekNumber: 14,
    weekLabel: 'HFW14',
    startDate: '2026-03-30',
    endDate: '2026-04-05',
    forecastBoxcount: 19100,
    actualBoxcount: null,
    previousForecast: 19200,
    overwriteForecast: null,
    deltaPercent: -0.52,
    deltaAbsolute: -100,
    validationStatus: 'valid',
    approvalStatus: 'draft',
    confidence: 82,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Easter prep uplift', impact: 45, direction: 'increase', region: 'DACH' },
      { factor: 'Spring campaign effect', impact: 35, direction: 'increase' },
      { factor: 'End-of-quarter normalization', impact: 20, direction: 'decrease' },
    ],
    weekPhase: 'non-live',
    weekout: 6,
    forecastRunDay: 'wednesday',

    // Recipe-specific mock data
    recipeCount: 46,
    swappedForecast: 12060,  // ~60% of boxcount
    nonSwappedForecast: 8040,  // ~40% of boxcount
    recipeOverridesCount: 1,
    // SKU-specific mock data
    skuCount: 267,
    skuOverridesCount: 1,
  },
  {
    id: 'w2026-15',
    weekNumber: 15,
    weekLabel: 'HFW15',
    startDate: '2026-04-06',
    endDate: '2026-04-12',
    forecastBoxcount: 19400,
    actualBoxcount: null,
    previousForecast: 19500,
    overwriteForecast: null,
    deltaPercent: -0.51,
    deltaAbsolute: -100,
    validationStatus: 'valid',
    approvalStatus: 'draft',
    confidence: 78,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Easter holiday boost', impact: 50, direction: 'increase', region: 'DACH' },
      { factor: 'New subscriber acquisition', impact: 30, direction: 'increase' },
      { factor: 'Limited data horizon', impact: 20, direction: 'decrease' },
    ],
    weekPhase: 'non-live',
    weekout: 7,
    forecastRunDay: 'wednesday',

    // Recipe-specific mock data
    recipeCount: 45,
    swappedForecast: 12300,  // ~60% of boxcount
    nonSwappedForecast: 8200,  // ~40% of boxcount
    recipeOverridesCount: 0,
    // SKU-specific mock data
    skuCount: 259,
    skuOverridesCount: 0,
  },
  {
    id: 'w2026-16',
    weekNumber: 16,
    weekLabel: 'HFW16',
    startDate: '2026-04-13',
    endDate: '2026-04-19',
    forecastBoxcount: 19600,
    actualBoxcount: null,
    previousForecast: 19700,
    overwriteForecast: null,
    deltaPercent: -0.51,
    deltaAbsolute: -100,
    validationStatus: 'pending',
    approvalStatus: 'draft',
    confidence: 74,
    plannerComment: null,
    overrideReason: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    isManualOverride: false,
    changeDrivers: [
      { factor: 'Post-Easter normalization', impact: 40, direction: 'decrease' },
      { factor: 'Spring demand recovery', impact: 40, direction: 'increase' },
      { factor: 'Far-horizon uncertainty', impact: 20, direction: 'decrease' },
    ],
    weekPhase: 'non-live',
    weekout: 8,
    forecastRunDay: 'wednesday',

    // Recipe-specific mock data
    recipeCount: 47,
    swappedForecast: 12600,  // ~60% of boxcount
    nonSwappedForecast: 8400,  // ~40% of boxcount
    recipeOverridesCount: 2,
    // SKU-specific mock data
    skuCount: 271,
    skuOverridesCount: 3,
  },
]

export const auditLog: AuditLogEntry[] = [
  {
    id: 'log1',
    timestamp: '2026-02-19T09:15:00Z',
    user: 'System',
    action: 'Status Change',
    field: 'forecast_run',
    oldValue: 'Monday Run',
    newValue: 'Wednesday Run',
    weekId: 'all',
  },
  {
    id: 'log2',
    timestamp: '2026-02-18T08:00:00Z',
    user: 'System',
    action: 'Override',
    field: 'model_refresh',
    oldValue: null,
    newValue: 'Wednesday model run completed for HFW09-HFW16',
    weekId: 'all',
  },
  {
    id: 'log3',
    timestamp: '2026-02-17T16:00:00Z',
    user: 'Maria Schmidt',
    action: 'Comment',
    field: 'planner_comment',
    oldValue: null,
    newValue: 'Reviewing Monday baseline for HFW09-HFW16 before Wednesday run',
    weekId: 'all',
  },
]

// KPI calculations
export function calculateKPIs(weeks: ForecastWeek[]) {
  const totalUnconstrainedForecast = weeks.reduce((sum, w) => sum + w.forecastBoxcount, 0)
  const totalConstrainedForecast = weeks.reduce((sum, w) => sum + (w.overwriteForecast || w.forecastBoxcount), 0)
  const totalPrevious = weeks.reduce((sum, w) => sum + w.previousForecast, 0)
  const avgConfidence = Math.round(weeks.reduce((sum, w) => sum + w.confidence, 0) / weeks.length)
  const validationIssues = weeks.filter(w => w.validationStatus === 'error' || w.validationStatus === 'warning').length
  const pendingApprovals = weeks.filter(w => w.approvalStatus === 'draft' || w.approvalStatus === 'pending_review').length
  const overridesApplied = weeks.filter(w => w.isManualOverride).length
  const overrideImpact = totalConstrainedForecast - totalUnconstrainedForecast
  
  return {
    totalUnconstrainedForecast,
    totalConstrainedForecast,
    totalPrevious,
    totalDeltaPercent: ((totalConstrainedForecast - totalPrevious) / totalPrevious * 100).toFixed(2),
    totalDeltaAbsolute: totalConstrainedForecast - totalPrevious,
    avgConfidence,
    validationIssues,
    pendingApprovals,
    weeksCount: weeks.length,
    overridesApplied,
    overrideImpact,
    unconstrainedVsConstrainedDelta: ((totalConstrainedForecast - totalUnconstrainedForecast) / totalUnconstrainedForecast * 100).toFixed(2),
  }
}

// Dimension-specific KPI data (mock metrics per dimension)
export interface DimensionKPIs {
  // Box
  boxWAPE?: number
  boxBias?: number
  // Recipe
  recipeWAPE?: number
  recipeSplitBias?: number
  swapRatioBias?: number
  swappersUptakeError?: number
  nonswappersUptakeError?: number
  // SKU
  skuWAPE?: number
  skuBias?: number
  volumeAtRisk?: number
  // Add-ons
  paidAddonsForecast?: number
  freeForXForecast?: number
  combinedAddonsWAPE?: number
  paidAddonsWAPE?: number
  freeAddonsWAPE?: number
  regulatedVolume?: number
  nonRegulatedVolume?: number
}

// Mock dimension-specific metrics (would come from backend per week selection)
export function getDimensionKPIs(level: ForecastLevel, market: string): DimensionKPIs {
  switch (level) {
    case 'box':
      return { boxWAPE: 5.2, boxBias: -1.8 }
    case 'recipe':
      return {
        recipeWAPE: 6.8,
        recipeSplitBias: 2.4,
        swapRatioBias: -1.2,
        swappersUptakeError: 3.5,
        nonswappersUptakeError: 2.1,
      }
    case 'sku':
      return { skuWAPE: 8.3, skuBias: -2.7, volumeAtRisk: 34500 }
    case 'addons':
      return {
        paidAddonsForecast: 125000,
        freeForXForecast: 87000,
        paidAddonsWAPE: 8.2,
        freeAddonsWAPE: 10.5,
        ...(market === 'us' ? { regulatedVolume: 42000, nonRegulatedVolume: 83000 } : {}),
      }
    default:
      return {}
  }
}

// Risk assessment
export interface RiskItem {
  id: string
  severity: 'high' | 'medium' | 'low'
  type: 'delta' | 'confidence' | 'capacity' | 'validation' | 'split_bias' | 'constraint' | 'mismatch'
  title: string
  description: string
  weekId: string
  weekLabel: string
  impact: number // absolute volume impact
  phaseLabel?: string
}

export function calculateRisks(weeks: ForecastWeek[]): RiskItem[] {
  const risks: RiskItem[] = []

  weeks.forEach(week => {
    const pLabel = week.weekPhase === 'live' ? 'Live Week Validation' : 'Non-live Planning Alert'

    // Large negative deltas (> 3%)
    if (week.deltaPercent < -3) {
      risks.push({
        id: `risk-delta-${week.id}`,
        severity: 'high',
        type: 'delta',
        title: `Significant decrease detected in ${week.weekLabel}`,
        description: `Impact: ${Math.abs(week.deltaAbsolute).toLocaleString()} boxes vs previous run`,
        weekId: week.id,
        weekLabel: week.weekLabel,
        impact: Math.abs(week.deltaAbsolute),
        phaseLabel: pLabel,
      })
    }

    // Low confidence weeks
    if (week.confidence < 70) {
      risks.push({
        id: `risk-confidence-${week.id}`,
        severity: week.confidence < 60 ? 'high' : 'medium',
        type: 'confidence',
        title: 'Low model confidence',
        description: `Model confidence at ${week.confidence}%`,
        weekId: week.id,
        weekLabel: week.weekLabel,
        impact: Math.round(week.forecastBoxcount * (1 - week.confidence / 100)),
        phaseLabel: pLabel,
      })
    }

    // Validation errors
    if (week.validationStatus === 'error') {
      risks.push({
        id: `risk-validation-${week.id}`,
        severity: 'high',
        type: 'validation',
        title: 'Validation failure',
        description: 'Automated validation detected issues',
        weekId: week.id,
        weekLabel: week.weekLabel,
        impact: week.forecastBoxcount,
        phaseLabel: pLabel,
      })
    }
  })

  // Sort by severity and impact
  return risks.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.impact - a.impact
  })
}

// Comparison version mock data (Mon/Wed/Fri forecast snapshots)
export interface ComparisonVersion {
  day: ForecastVersionDay
  label: string
  data: Record<string, number> // weekId -> forecast value
}

export const comparisonVersions: ComparisonVersion[] = [
  {
    day: 'monday',
    label: 'Monday Run',
    data: {
      'w2026-09': 19700,
      'w2026-10': 19500,
      'w2026-11': 19400,
      'w2026-12': 20000,
      'w2026-13': 19100,
      'w2026-14': 19200,
      'w2026-15': 19500,
      'w2026-16': 19700,
    },
  },
  {
    day: 'wednesday',
    label: 'Wednesday Run',
    data: {
      'w2026-09': 19800,
      'w2026-10': 19500,
      'w2026-11': 19300,
      'w2026-12': 18200,
      'w2026-13': 18800,
      'w2026-14': 19100,
      'w2026-15': 19400,
      'w2026-16': 19600,
    },
  },
  {
    day: 'friday',
    label: 'Friday Run',
    data: {
      'w2026-09': 19800,
      'w2026-10': 19500,
      'w2026-11': 19300,
      'w2026-12': 18200,
      'w2026-13': 18800,
      'w2026-14': 19100,
      'w2026-15': 19400,
      'w2026-16': 19600,
    },
  },
]

// Significant change detection for version comparison
export interface SignificantChange {
  weekId: string
  weekLabel: string
  currentForecast: number
  comparisonForecast: number
  deltaPercent: number
  deltaAbsolute: number
}

export function detectSignificantChanges(
  weeks: ForecastWeek[],
  comparisonVersion: ComparisonVersion,
  threshold: number = 3
): SignificantChange[] {
  const changes: SignificantChange[] = []

  weeks.forEach(week => {
    const currentForecast = week.overwriteForecast || week.forecastBoxcount
    const compForecast = comparisonVersion.data[week.id]
    if (!compForecast) return

    const deltaAbsolute = currentForecast - compForecast
    const deltaPercent = (deltaAbsolute / compForecast) * 100

    if (Math.abs(deltaPercent) >= threshold) {
      changes.push({
        weekId: week.id,
        weekLabel: week.weekLabel,
        currentForecast,
        comparisonForecast: compForecast,
        deltaPercent,
        deltaAbsolute,
      })
    }
  })

  return changes.sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
}

// Trailing actuals for chart context (HFW02-HFW07 completed weeks, plus HFW08 current)
export const trailingActuals = [
  { week: 'HFW02', actual: 19200 },
  { week: 'HFW03', actual: 19400 },
  { week: 'HFW04', actual: 19650 },
  { week: 'HFW05', actual: 19500 },
  { week: 'HFW06', actual: 19300 },
  { week: 'HFW07', actual: 19100 },
]

// Chart data transformation - includes trailing actuals for past-to-future context
export function getChartData(weeks: ForecastWeek[], includeHistory = true, comparisonVersion?: ComparisonVersion | null) {
  // Add "Today" marker at CW08 boundary
  const historyPoints = includeHistory
    ? [
        ...trailingActuals.map(h => ({
          week: h.week,
          unconstrained: null as number | null,
          constrained: null as number | null,
          previous: null as number | null,
          mondayRun: null as number | null,
          actual: h.actual,
          hasOverride: false,
          isHistory: true,
          isTodayWeek: false,
          isAlertWeek: false,
        })),
        // HFW08 = Today marker
        {
          week: 'HFW08',
          unconstrained: null as number | null,
          constrained: null as number | null,
          previous: null as number | null,
          mondayRun: null as number | null,
          actual: null as number | null,
          hasOverride: false,
          isHistory: true,
          isTodayWeek: true,
          isAlertWeek: false,
        },
      ]
    : []

  const forecastPoints = weeks.map((week) => ({
    week: week.weekLabel,
    unconstrained: week.forecastBoxcount as number | null,
    constrained: (week.overwriteForecast || week.forecastBoxcount) as number | null,
    previous: week.previousForecast as number | null,
    mondayRun: (comparisonVersion?.data[week.id] ?? null) as number | null,
    actual: week.actualBoxcount as number | null,
    hasOverride: week.isManualOverride,
    isHistory: false,
    isTodayWeek: false,
    isAlertWeek: week.weekLabel === 'HFW12',
  }))

  return [...historyPoints, ...forecastPoints]
}

// Mock Recipe and SKU data for override sheets
// TODO: Replace with real API call when backend is ready
export interface RecipeData {
  id: string
  name: string
  swapped: number
  nonSwapped: number
  total: number
}

export interface SkuData {
  id: string
  name: string
  forecast: number
}

// Mock recipe data - represents recipes in a given week
export const mockRecipeData: RecipeData[] = [
  { id: 'RCP-001', name: 'Garlic Butter Chicken', swapped: 12500, nonSwapped: 8200, total: 20700 },
  { id: 'RCP-002', name: 'Beef Tacos with Pico', swapped: 15200, nonSwapped: 9800, total: 25000 },
  { id: 'RCP-003', name: 'Salmon with Asparagus', swapped: 8900, nonSwapped: 5600, total: 14500 },
  { id: 'RCP-004', name: 'Veggie Stir Fry Bowl', swapped: 6700, nonSwapped: 4200, total: 10900 },
  { id: 'RCP-005', name: 'BBQ Pork Chops', swapped: 11200, nonSwapped: 7300, total: 18500 },
  { id: 'RCP-006', name: 'Mediterranean Pasta', swapped: 9400, nonSwapped: 6100, total: 15500 },
  { id: 'RCP-007', name: 'Thai Coconut Curry', swapped: 7800, nonSwapped: 4900, total: 12700 },
  { id: 'RCP-008', name: 'Lemon Herb Shrimp', swapped: 10300, nonSwapped: 6700, total: 17000 },
  { id: 'RCP-009', name: 'Turkey Meatballs', swapped: 8600, nonSwapped: 5500, total: 14100 },
  { id: 'RCP-010', name: 'Southwest Chicken Wrap', swapped: 13400, nonSwapped: 8700, total: 22100 },
]

// Mock SKU data - represents SKUs in a given week
export const mockSkuData: SkuData[] = [
  { id: 'SKU-1001', name: 'Chicken Breast 400g', forecast: 45200 },
  { id: 'SKU-1002', name: 'Ground Beef 500g', forecast: 38900 },
  { id: 'SKU-1003', name: 'Salmon Fillet 300g', forecast: 21500 },
  { id: 'SKU-1004', name: 'Bell Peppers Mix 3pk', forecast: 52100 },
  { id: 'SKU-1005', name: 'Cherry Tomatoes 250g', forecast: 48700 },
  { id: 'SKU-1006', name: 'Asparagus Bundle', forecast: 18900 },
  { id: 'SKU-1007', name: 'Basmati Rice 1kg', forecast: 34200 },
  { id: 'SKU-1008', name: 'Garlic Cloves 100g', forecast: 61300 },
  { id: 'SKU-1009', name: 'Fresh Basil 25g', forecast: 29400 },
  { id: 'SKU-1010', name: 'Coconut Milk 400ml', forecast: 22800 },
  { id: 'SKU-1011', name: 'Shrimp 300g', forecast: 19600 },
  { id: 'SKU-1012', name: 'Turkey Ground 500g', forecast: 16700 },
  { id: 'SKU-1013', name: 'Tortilla Wraps 6pk', forecast: 41200 },
  { id: 'SKU-1014', name: 'Pork Chops 2pk', forecast: 24500 },
  { id: 'SKU-1015', name: 'Pasta Penne 500g', forecast: 36800 },
]
