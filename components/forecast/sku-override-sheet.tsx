'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Search, X, ChevronRight } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// TODO: Replace mock SKU data with real API call
// Mock data shape: { id: string, name: string, forecast: number }[]
export interface SkuData {
  id: string
  name: string
  forecast: number
}

interface SkuOverrideSheetProps {
  open: boolean
  onClose: () => void
  weekLabel: string
  dateRange: string
  market: string
  skus: SkuData[]
  onSave: (skuId: string, forecast: number, reason: string) => void
}

type Step = 'search' | 'form'

const overrideReasons = [
  'Customer Insight / Feedback',
  'Marketing Campaign',
  'Demand Adjustment',
  'Supply Constraint',
  'Competitor Activity',
  'Pricing Change',
  'Other',
]

export function SkuOverrideSheet({
  open,
  onClose,
  weekLabel,
  dateRange,
  market,
  skus,
  onSave,
}: SkuOverrideSheetProps) {
  const [step, setStep] = useState<Step>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSku, setSelectedSku] = useState<SkuData | null>(null)

  // Form state
  const [forecastValue, setForecastValue] = useState('')
  const [reason, setReason] = useState('')

  // Filter SKUs based on search query
  const filteredSkus = useMemo(() => {
    if (!searchQuery.trim()) return skus
    const query = searchQuery.toLowerCase()
    return skus.filter(
      (s) =>
        s.id.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
    )
  }, [skus, searchQuery])

  const canSave = reason && forecastValue

  const handleSelectSku = (sku: SkuData) => {
    setSelectedSku(sku)
    setForecastValue(sku.forecast.toString())
    setStep('form')
  }

  const handleBack = () => {
    setStep('search')
    setSelectedSku(null)
    setForecastValue('')
    setReason('')
  }

  const handleSave = () => {
    if (!selectedSku || !canSave) return
    onSave(selectedSku.id, Number(forecastValue), reason)
    onClose()
    handleBack()
    setSearchQuery('')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      setStep('search')
      setSelectedSku(null)
      setSearchQuery('')
      setForecastValue('')
      setReason('')
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-[420px] sm:max-w-[420px] p-0 flex flex-col"
        side="right"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="space-y-1">
            <p
              style={{
                fontFamily: 'var(--hf-font-body)',
                fontSize: 'var(--hf-body-extra-small-size)',
                lineHeight: 'var(--hf-body-extra-small-line)',
                fontWeight: 'var(--hf-font-weight-semibold)',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              SKU Forecast Override
            </p>
            <SheetTitle
              style={{
                fontFamily: 'var(--hf-font-body)',
                fontSize: 'var(--hf-body-extra-large-size)',
                lineHeight: 'var(--hf-body-extra-large-line)',
                fontWeight: 'var(--hf-font-weight-bold)',
                color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
              }}
            >
              {weekLabel}
            </SheetTitle>
            <p
              style={{
                fontFamily: 'var(--hf-font-body)',
                fontSize: 'var(--hf-body-small-size)',
                lineHeight: 'var(--hf-body-small-line)',
                fontWeight: 'var(--hf-font-weight-regular)',
                color: '#6B7280',
              }}
            >
              {dateRange}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="outline"
              className="text-xs font-semibold"
              style={{
                borderColor: 'var(--hf-stroke-neutral-neutral-mid)',
              }}
            >
              Market: {market}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-semibold"
              style={{
                borderColor: 'var(--hf-stroke-neutral-neutral-mid)',
              }}
            >
              Target Week: {weekLabel}
            </Badge>
          </div>
        </SheetHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {step === 'search' ? (
            /* Step 1: Search Screen */
            <div className="px-6 py-4 space-y-4">
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--hf-font-body)',
                    fontSize: 'var(--hf-body-small-size)',
                    lineHeight: 'var(--hf-body-small-line)',
                    fontWeight: 'var(--hf-font-weight-semibold)',
                    color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                  }}
                >
                  Select a SKU to override
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SKU ID or name..."
                    className="pl-9 pr-9"
                    style={{
                      borderColor: '#E5E7EB',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--hf-font-body)',
                    fontSize: 'var(--hf-body-extra-small-size)',
                    lineHeight: 'var(--hf-body-extra-small-line)',
                    fontWeight: 'var(--hf-font-weight-regular)',
                    color: '#6B7280',
                  }}
                >
                  This week has {skus.length} SKUs — search by ID or name
                </p>
              </div>

              {/* SKU List */}
              <div className="space-y-2">
                {filteredSkus.map((sku) => (
                  <button
                    key={sku.id}
                    onClick={() => handleSelectSku(sku)}
                    className="w-full text-left p-3 rounded-lg border transition-all hover:border-[var(--hf-stroke-positive-positive-mid)] hover:bg-[var(--hf-background-light-positive-positive-mid)]"
                    style={{
                      borderColor: '#E5E7EB',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-mono"
                            style={{
                              fontFamily: 'var(--hf-font-body)',
                              fontSize: 'var(--hf-body-extra-small-size)',
                              lineHeight: 'var(--hf-body-extra-small-line)',
                              fontWeight: 'var(--hf-font-weight-regular)',
                              color: '#6B7280',
                            }}
                          >
                            {sku.id}
                          </span>
                        </div>
                        <div
                          className="mb-1"
                          style={{
                            fontFamily: 'var(--hf-font-body)',
                            fontSize: 'var(--hf-body-small-size)',
                            lineHeight: 'var(--hf-body-small-line)',
                            fontWeight: 'var(--hf-font-weight-semibold)',
                            color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                          }}
                        >
                          {sku.name}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--hf-font-body)',
                            fontSize: 'var(--hf-body-extra-small-size)',
                            lineHeight: 'var(--hf-body-extra-small-line)',
                            fontWeight: 'var(--hf-font-weight-regular)',
                            color: '#6B7280',
                          }}
                        >
                          Forecast: {sku.forecast.toLocaleString()}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
                {filteredSkus.length === 0 && (
                  <div
                    className="text-center py-8"
                    style={{
                      fontFamily: 'var(--hf-font-body)',
                      fontSize: 'var(--hf-body-small-size)',
                      lineHeight: 'var(--hf-body-small-line)',
                      fontWeight: 'var(--hf-font-weight-regular)',
                      color: '#6B7280',
                    }}
                  >
                    No SKUs found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Override Form */
            <div className="px-6 py-4 space-y-4">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{
                  color: 'var(--hf-foreground-positive-positive-dark)',
                  fontFamily: 'var(--hf-font-body)',
                  fontSize: 'var(--hf-body-small-size)',
                  lineHeight: 'var(--hf-body-small-line)',
                  fontWeight: 'var(--hf-font-weight-semibold)',
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to search
              </button>

              {/* Selected SKU */}
              {selectedSku && (
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: 'var(--hf-stroke-positive-positive-mid)',
                    backgroundColor: 'var(--hf-background-light-positive-positive-mid)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono"
                      style={{
                        fontFamily: 'var(--hf-font-body)',
                        fontSize: 'var(--hf-body-small-size)',
                        lineHeight: 'var(--hf-body-small-line)',
                        fontWeight: 'var(--hf-font-weight-semibold)',
                        color: 'var(--hf-foreground-positive-positive-dark)',
                      }}
                    >
                      {selectedSku.id}
                    </span>
                    <span
                      style={{
                        color: 'var(--hf-foreground-positive-positive-dark)',
                      }}
                    >
                      ·
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--hf-font-body)',
                        fontSize: 'var(--hf-body-small-size)',
                        lineHeight: 'var(--hf-body-small-line)',
                        fontWeight: 'var(--hf-font-weight-semibold)',
                        color: 'var(--hf-foreground-positive-positive-dark)',
                      }}
                    >
                      {selectedSku.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Current Forecast Value */}
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--hf-font-body)',
                    fontSize: 'var(--hf-body-extra-small-size)',
                    lineHeight: 'var(--hf-body-extra-small-line)',
                    fontWeight: 'var(--hf-font-weight-semibold)',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Current Forecast Value
                </label>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: '#F8F8F8',
                  }}
                >
                  <div
                    className="mb-1"
                    style={{
                      fontFamily: 'var(--hf-font-body)',
                      fontSize: 'var(--hf-body-extra-small-size)',
                      lineHeight: 'var(--hf-body-extra-small-line)',
                      fontWeight: 'var(--hf-font-weight-regular)',
                      color: '#6B7280',
                    }}
                  >
                    Forecast
                  </div>
                  <div
                    className="font-mono font-semibold"
                    style={{
                      fontFamily: 'var(--hf-font-body)',
                      fontSize: 'var(--hf-body-medium-size)',
                      lineHeight: 'var(--hf-body-medium-line)',
                      fontWeight: 'var(--hf-font-weight-semibold)',
                      color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                    }}
                  >
                    {selectedSku?.forecast.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Forecast */}
                <div>
                  <label
                    className="block mb-1"
                    style={{
                      fontFamily: 'var(--hf-font-body)',
                      fontSize: 'var(--hf-body-small-size)',
                      lineHeight: 'var(--hf-body-small-line)',
                      fontWeight: 'var(--hf-font-weight-semibold)',
                      color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                    }}
                  >
                    Forecast <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={forecastValue}
                    onChange={(e) => setForecastValue(e.target.value)}
                    className={cn(
                      'font-mono',
                      forecastValue && 'focus:border-[var(--hf-stroke-positive-positive-mid)]'
                    )}
                  />
                </div>

                {/* Reason for Override */}
                <div>
                  <label
                    className="block mb-1"
                    style={{
                      fontFamily: 'var(--hf-font-body)',
                      fontSize: 'var(--hf-body-small-size)',
                      lineHeight: 'var(--hf-body-small-line)',
                      fontWeight: 'var(--hf-font-weight-semibold)',
                      color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                    }}
                  >
                    Reason for Override <span className="text-destructive">*</span>
                  </label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {overrideReasons.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        {step === 'form' && (
          <div className="px-6 py-4 border-t shrink-0 space-y-2">
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full h-10"
              style={{
                backgroundColor: canSave
                  ? 'var(--hf-foreground-positive-positive-dark)'
                  : undefined,
                opacity: canSave ? 1 : 0.5,
                fontWeight: 600,
              }}
            >
              Save Override
            </Button>
            <Button onClick={handleBack} variant="outline" className="w-full h-10">
              Cancel
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
