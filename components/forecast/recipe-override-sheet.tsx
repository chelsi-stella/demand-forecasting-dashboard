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

// TODO: Replace mock recipe data with real API call to fetch recipes for the selected week
// The API endpoint and data shape should be confirmed with the data engineering team
// Mock data shape: { id: string, name: string, swapped: number, nonSwapped: number, total: number }[]
export interface RecipeData {
  id: string
  name: string
  swapped: number
  nonSwapped: number
  total: number
}

interface RecipeOverrideSheetProps {
  open: boolean
  onClose: () => void
  weekLabel: string
  dateRange: string
  market: string
  recipes: RecipeData[]
  onSave: (recipeId: string, swapped: number, nonSwapped: number, swappedReason: string, nonSwappedReason: string, totalReason: string) => void
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

export function RecipeOverrideSheet({
  open,
  onClose,
  weekLabel,
  dateRange,
  market,
  recipes,
  onSave,
}: RecipeOverrideSheetProps) {
  const [step, setStep] = useState<Step>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null)

  // Form state
  const [swappedValue, setSwappedValue] = useState('')
  const [nonSwappedValue, setNonSwappedValue] = useState('')
  const [swappedReason, setSwappedReason] = useState('')
  const [nonSwappedReason, setNonSwappedReason] = useState('')
  const [totalReason, setTotalReason] = useState('')

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes
    const query = searchQuery.toLowerCase()
    return recipes.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.name.toLowerCase().includes(query)
    )
  }, [recipes, searchQuery])

  // Calculate total forecast
  const totalForecast = useMemo(() => {
    const swapped = Number(swappedValue) || 0
    const nonSwapped = Number(nonSwappedValue) || 0
    return swapped + nonSwapped
  }, [swappedValue, nonSwappedValue])

  const canSave = swappedReason && nonSwappedReason && totalReason && swappedValue && nonSwappedValue

  const handleSelectRecipe = (recipe: RecipeData) => {
    setSelectedRecipe(recipe)
    setSwappedValue(recipe.swapped.toString())
    setNonSwappedValue(recipe.nonSwapped.toString())
    setStep('form')
  }

  const handleBack = () => {
    setStep('search')
    setSelectedRecipe(null)
    // Reset form
    setSwappedValue('')
    setNonSwappedValue('')
    setSwappedReason('')
    setNonSwappedReason('')
    setTotalReason('')
  }

  const handleSave = () => {
    if (!selectedRecipe || !canSave) return
    onSave(
      selectedRecipe.id,
      Number(swappedValue),
      Number(nonSwappedValue),
      swappedReason,
      nonSwappedReason,
      totalReason
    )
    onClose()
    // Reset state
    handleBack()
    setSearchQuery('')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      // Reset state when closing
      setStep('search')
      setSelectedRecipe(null)
      setSearchQuery('')
      setSwappedValue('')
      setNonSwappedValue('')
      setSwappedReason('')
      setNonSwappedReason('')
      setTotalReason('')
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
              Recipe Forecast Override
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
                  Select a recipe to override
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipe ID or name..."
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
                  This week has {recipes.length} recipes — search by ID or name
                </p>
              </div>

              {/* Recipe List */}
              <div className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
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
                            {recipe.id}
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
                          {recipe.name}
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
                          Swapped: {recipe.swapped.toLocaleString()} · Non-swapped: {recipe.nonSwapped.toLocaleString()} · Total: {recipe.total.toLocaleString()}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
                {filteredRecipes.length === 0 && (
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
                    No recipes found matching "{searchQuery}"
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

              {/* Selected Recipe */}
              {selectedRecipe && (
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
                      {selectedRecipe.id}
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
                      {selectedRecipe.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Current Values */}
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
                  Current Values
                </label>
                <div className="grid grid-cols-3 gap-2">
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
                      Swapped
                    </div>
                    <div
                      className="font-mono font-semibold"
                      style={{
                        fontFamily: 'var(--hf-font-body)',
                        fontSize: 'var(--hf-body-small-size)',
                        lineHeight: 'var(--hf-body-small-line)',
                        fontWeight: 'var(--hf-font-weight-semibold)',
                        color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                      }}
                    >
                      {selectedRecipe?.swapped.toLocaleString()}
                    </div>
                  </div>
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
                      Non-Swapped
                    </div>
                    <div
                      className="font-mono font-semibold"
                      style={{
                        fontFamily: 'var(--hf-font-body)',
                        fontSize: 'var(--hf-body-small-size)',
                        lineHeight: 'var(--hf-body-small-line)',
                        fontWeight: 'var(--hf-font-weight-semibold)',
                        color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                      }}
                    >
                      {selectedRecipe?.nonSwapped.toLocaleString()}
                    </div>
                  </div>
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
                      Total
                    </div>
                    <div
                      className="font-mono font-semibold"
                      style={{
                        fontFamily: 'var(--hf-font-body)',
                        fontSize: 'var(--hf-body-small-size)',
                        lineHeight: 'var(--hf-body-small-line)',
                        fontWeight: 'var(--hf-font-weight-semibold)',
                        color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
                      }}
                    >
                      {selectedRecipe?.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Swapped Forecast */}
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
                    Swapped Forecast <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={swappedValue}
                    onChange={(e) => setSwappedValue(e.target.value)}
                    className={cn(
                      'font-mono',
                      swappedValue && 'focus:border-[var(--hf-stroke-positive-positive-mid)]'
                    )}
                  />
                </div>

                {/* Reason for Override - Swapped */}
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
                    Reason for Override — Swapped <span className="text-destructive">*</span>
                  </label>
                  <Select value={swappedReason} onValueChange={setSwappedReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {overrideReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed" style={{ borderColor: '#E5E7EB' }} />

                {/* Non-Swapped Forecast */}
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
                    Non-Swapped Forecast <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={nonSwappedValue}
                    onChange={(e) => setNonSwappedValue(e.target.value)}
                    className={cn(
                      'font-mono',
                      nonSwappedValue && 'focus:border-[var(--hf-stroke-positive-positive-mid)]'
                    )}
                  />
                </div>

                {/* Reason for Override - Non-Swapped */}
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
                    Reason for Override — Non-Swapped <span className="text-destructive">*</span>
                  </label>
                  <Select value={nonSwappedReason} onValueChange={setNonSwappedReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {overrideReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed" style={{ borderColor: '#E5E7EB' }} />

                {/* Total Forecast (auto-calculated) */}
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
                    Total Forecast
                  </label>
                  <Input
                    type="text"
                    value={totalForecast.toLocaleString()}
                    disabled
                    className="font-mono bg-muted"
                  />
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: 'var(--hf-font-body)',
                      fontSize: 'var(--hf-body-extra-small-size)',
                      lineHeight: 'var(--hf-body-extra-small-line)',
                      fontWeight: 'var(--hf-font-weight-regular)',
                      color: '#6B7280',
                    }}
                  >
                    (auto-calculated)
                  </p>
                </div>

                {/* Reason for Override - Total */}
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
                    Reason for Override — Total <span className="text-destructive">*</span>
                  </label>
                  <Select value={totalReason} onValueChange={setTotalReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {overrideReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
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
