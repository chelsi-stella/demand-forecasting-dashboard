'use client'

// TODO: Replace hardcoded values with HelloFresh design tokens
// once token library is exported from Figma and added to codebase.
// Token names are documented inline above each value.

import { Calendar, RefreshCw, GitCompare, Info, Filter, BarChart3 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { ForecastVersion, ApprovalStatus, ForecastLevel, ForecastVersionDay, Brand, WeekPhase } from '@/lib/forecast-data'
import { forecastLevelLabels, versionDayLabels, brandLabels } from '@/lib/forecast-data'

// KPI selection options per dimension
const kpiOptions: Record<string, { value: string; label: string }[]> = {
  box: [
    { value: 'box_wape', label: 'Box WAPE' },
    { value: 'box_bias', label: 'Box Bias' },
    { value: 'confidence', label: 'Confidence' },
  ],
  recipe: [
    { value: 'recipe_wape', label: 'Recipe WAPE' },
    { value: 'swap_ratio_bias', label: 'Swap Ratio Bias' },
    { value: 'recipe_split_bias', label: 'Recipe Split Bias' },
    { value: 'swappers_uptake', label: 'Swappers Uptake Error' },
    { value: 'nonswappers_uptake', label: 'Non-swap Uptake Error' },
  ],
  sku: [
    { value: 'sku_wape', label: 'SKU WAPE' },
    { value: 'sku_bias', label: 'SKU Bias' },
    { value: 'volume_at_risk', label: 'Volume at Risk' },
  ],
  addons: [
    { value: 'addons_wape', label: 'Combined WAPE' },
    { value: 'paid_addons', label: 'Paid Add-ons' },
    { value: 'f4x', label: 'Free-for-X' },
  ],
}

interface ForecastContextBarProps {
  currentStatus: ApprovalStatus
  lastUpdated: string
  forecastLevel: ForecastLevel
  onForecastLevelChange: (level: ForecastLevel) => void
  selectedVersionDay: ForecastVersionDay
  onVersionDayChange: (day: ForecastVersionDay) => void
  selectedBrands: Brand[]
  onBrandsChange: (brands: Brand[]) => void
  selectedMarket: string
  onMarketChange: (market: string) => void
  weekoutFilter: number
  onWeekoutFilterChange: (weekout: number) => void
  selectedKPI: string
  onKPIChange: (kpi: string) => void
  // Status context
  currentWeekLabel?: string
}

function getStatusBadge(status: ApprovalStatus) {
  switch (status) {
    case 'draft':
      return (
        <span
          className="inline-flex items-center rounded px-2 py-0.5"
          style={{
            /* token: color-status-warning-subtle */
            backgroundColor: '#FEF3C7',
            /* token: color-status-warning-text */
            color: '#92400E',
            /* token: border-radius-sm */
            borderRadius: '4px',
            /* token: font-size-label-sm */
            fontSize: '12px',
          }}
        >
          Draft
        </span>
      )
    case 'pending_review':
      return (
        <span
          className="inline-flex items-center rounded px-2 py-0.5"
          style={{
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          Pending Review
        </span>
      )
    case 'approved':
      return (
        <span
          className="inline-flex items-center rounded px-2 py-0.5"
          style={{
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          Approved
        </span>
      )
    case 'locked':
      return (
        <span
          className="inline-flex items-center rounded px-2 py-0.5"
          style={{
            backgroundColor: '#E5E7EB',
            color: '#374151',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          Locked
        </span>
      )
    default:
      return null
  }
}

export function ForecastContextBar({
  currentStatus,
  lastUpdated,
  forecastLevel,
  onForecastLevelChange,
  selectedVersionDay,
  onVersionDayChange,
  selectedBrands,
  onBrandsChange,
  selectedMarket,
  onMarketChange,
  weekoutFilter,
  onWeekoutFilterChange,
  selectedKPI,
  onKPIChange,
  currentWeekLabel,
}: ForecastContextBarProps) {
  const currentKPIOptions = kpiOptions[forecastLevel] || kpiOptions.box
  return (
    <div
      className="bg-card -mx-6 -mt-6 mb-8"
      style={{
        /* token: color-border-default */
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      {/* Row 1: Forecast Dimension, Run, Weekout | Status, Timestamp, Refresh */}
      <div
        className="flex items-center justify-between py-3"
        style={{
          /* token: spacing-6 */
          paddingLeft: '24px',
          paddingRight: '24px',
          /* token: color-border-subtle */
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Forecast Dimension */}
          <div className="flex items-center gap-2">
            <span
              style={{
                /* token: font-size-body-sm */
                fontSize: '13px',
                /* token: font-weight-medium */
                fontWeight: 500,
                /* token: color-text-subtle */
                color: '#6B7280',
              }}
            >
              Forecast Dimension:
            </span>
            <Select value={forecastLevel} onValueChange={(v) => onForecastLevelChange(v as ForecastLevel)}>
              <SelectTrigger
                className="border hover:border-[#9CA3AF]"
                style={{
                  /* token: component-input-height-sm */
                  height: '34px',
                  /* token: color-border-default */
                  borderColor: '#D1D5DB',
                  /* token: border-radius-md */
                  borderRadius: '6px',
                  /* token: color-surface-default */
                  background: '#FFFFFF',
                  minWidth: '140px',
                  padding: '8px 12px',
                  /* token: font-size-body-md */
                  fontSize: '14px',
                  /* token: font-weight-regular */
                  fontWeight: 400,
                  /* token: color-text-default */
                  color: '#111827',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(forecastLevelLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forecast Run */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              Forecast Run:
            </span>
            <Select value={selectedVersionDay} onValueChange={(v) => onVersionDayChange(v as ForecastVersionDay)}>
              <SelectTrigger
                className="border hover:border-[#9CA3AF]"
                style={{
                  height: '34px',
                  borderColor: '#D1D5DB',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  minWidth: '140px',
                  padding: '0 10px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#111827',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(versionDayLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}{value === selectedVersionDay ? ' (Current)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span
              className="inline-flex items-center whitespace-nowrap"
              style={{
                /* token: color-brand-primary */
                background: '#2DB875',
                /* token: color-text-on-brand */
                color: '#FFFFFF',
                /* token: font-size-label-sm */
                fontSize: '12px',
                /* token: font-weight-semibold */
                fontWeight: 600,
                /* token: border-radius-sm */
                borderRadius: '4px',
                /* token: spacing-1 spacing-2 */
                padding: '2px 8px',
              }}
            >
              Current Run
            </span>
          </div>

          {/* Weekout */}
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6B7280',
                  }}
                >
                  Weekout:
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-64">
                    <p className="text-xs">Weekout = number of weeks from today to selected target week.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={weekoutFilter.toString()} onValueChange={(v) => onWeekoutFilterChange(parseInt(v))}>
                <SelectTrigger
                  className="border hover:border-[#9CA3AF]"
                  style={{
                    height: '34px',
                    borderColor: '#D1D5DB',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    minWidth: '80px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#111827',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              Status:
            </span>
            {getStatusBadge(currentStatus)}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: '#6B7280' }} />
            <span
              style={{
                fontSize: '13px',
                color: '#6B7280',
              }}
            >
              Updated {lastUpdated}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:border-[#9CA3AF]"
            style={{
              height: '34px',
              borderColor: '#D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Row 2: KPI, Brand, Market */}
      <div
        className="flex items-center py-3"
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <div className="flex items-center gap-4">
          {/* KPI */}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              KPI:
            </span>
            <Select value={selectedKPI} onValueChange={onKPIChange}>
              <SelectTrigger
                className="border hover:border-[#9CA3AF]"
                style={{
                  height: '34px',
                  borderColor: '#D1D5DB',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  minWidth: '140px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#111827',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentKPIOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-[#E5E7EB] mx-4" />

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              Brand:
            </span>
            <Select
              value={selectedBrands.length === 3 ? 'all' : selectedBrands[0] || 'all'}
              onValueChange={(v) => {
                if (v === 'all') {
                  onBrandsChange(['hellofresh', 'everyplate', 'greenchef'])
                } else {
                  onBrandsChange([v as Brand])
                }
              }}
            >
              <SelectTrigger
                className="border hover:border-[#9CA3AF]"
                style={{
                  height: '34px',
                  borderColor: '#D1D5DB',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  minWidth: '140px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#111827',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {Object.entries(brandLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Market */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              Market:
            </span>
            <Select value={selectedMarket} onValueChange={onMarketChange}>
              <SelectTrigger
                className="border hover:border-[#9CA3AF]"
                style={{
                  height: '34px',
                  borderColor: '#D1D5DB',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  /* Prevent country name clipping */
                  minWidth: '180px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#111827',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Germany (DE)</SelectItem>
                <SelectItem value="us">United States (US)</SelectItem>
                <SelectItem value="uk">United Kingdom (UK)</SelectItem>
                <SelectItem value="nl">Netherlands (NL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dimension-Specific Filters (conditional) */}
      {(forecastLevel === 'recipe' || forecastLevel === 'sku' || forecastLevel === 'addons') && (
        <div
          className="flex items-center gap-4"
          style={{
            height: '40px',
            paddingLeft: '24px',
            paddingRight: '24px',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          <div className="flex items-center gap-1.5 uppercase">
            <Filter className="h-3 w-3" style={{ color: '#6B7280' }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              {forecastLevel === 'recipe' ? 'Recipe' : forecastLevel === 'sku' ? 'SKU' : 'Add-ons'} Filters:
            </span>
          </div>

          {forecastLevel === 'recipe' && (
            <>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Size:</span>
                <Select defaultValue="all">
                  <SelectTrigger
                    className="border hover:border-[#9CA3AF]"
                    style={{
                      height: '34px',
                      borderColor: '#D1D5DB',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      minWidth: '120px',
                      padding: '0 10px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#111827',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="2p">2 Person</SelectItem>
                    <SelectItem value="3p">3 Person</SelectItem>
                    <SelectItem value="4p">4 Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Recipe Index:</span>
                <Select defaultValue="all">
                  <SelectTrigger
                    className="border hover:border-[#9CA3AF]"
                    style={{
                      height: '34px',
                      borderColor: '#D1D5DB',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      minWidth: '120px',
                      padding: '0 10px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#111827',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1-5">1-5</SelectItem>
                    <SelectItem value="6-10">6-10</SelectItem>
                    <SelectItem value="11-15">11-15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Modular:</span>
                <Select defaultValue="all">
                  <SelectTrigger
                    className="border hover:border-[#9CA3AF]"
                    style={{
                      height: '34px',
                      borderColor: '#D1D5DB',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      minWidth: '120px',
                      padding: '0 10px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#111827',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Surcharge:</span>
                <Select defaultValue="all">
                  <SelectTrigger
                    className="border hover:border-[#9CA3AF]"
                    style={{
                      height: '34px',
                      borderColor: '#D1D5DB',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      minWidth: '140px',
                      padding: '0 10px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#111827',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Surcharge</SelectItem>
                    <SelectItem value="no">No Surcharge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {forecastLevel === 'sku' && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>SKU Code:</span>
              <Select defaultValue="all">
                <SelectTrigger
                  className="border hover:border-[#9CA3AF]"
                  style={{
                    height: '34px',
                    borderColor: '#D1D5DB',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    minWidth: '140px',
                    padding: '0 10px',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#111827',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SKUs</SelectItem>
                  <SelectItem value="sku-001">SKU-001</SelectItem>
                  <SelectItem value="sku-002">SKU-002</SelectItem>
                  <SelectItem value="sku-003">SKU-003</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {forecastLevel === 'addons' && (
            <>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Type:</span>
                <Select defaultValue="all">
                  <SelectTrigger
                    className="border hover:border-[#9CA3AF]"
                    style={{
                      height: '34px',
                      borderColor: '#D1D5DB',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      minWidth: '140px',
                      padding: '0 10px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#111827',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="paid">Paid (HFM)</SelectItem>
                    <SelectItem value="f4x">Free-for-X (F4X)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedMarket === 'us' && (
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Regulation:</span>
                  <Select defaultValue="all">
                    <SelectTrigger
                      className="border hover:border-[#9CA3AF]"
                      style={{
                        height: '34px',
                        borderColor: '#D1D5DB',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        minWidth: '140px',
                        padding: '0 10px',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#111827',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="regulated">Regulated</SelectItem>
                      <SelectItem value="non-regulated">Non-regulated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
