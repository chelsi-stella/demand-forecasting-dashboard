'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight, X, Info, Search, ChevronLeft } from 'lucide-react'
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
import type { ForecastWeek, OverrideReason, ForecastLevel, RecipeForecast, SkuForecast } from '@/lib/forecast-data'
import { overrideReasonLabels, mockRecipeForecasts, mockSkuForecasts } from '@/lib/forecast-data'

interface EditForecastPanelProps {
  week: ForecastWeek | null
  open: boolean
  forecastLevel: ForecastLevel
  onClose: () => void
  onSave: (weekId: string, overwriteValue: number, comment: string, reason: OverrideReason) => void
}

export function EditForecastPanel({ week, open, forecastLevel, onClose, onSave }: EditForecastPanelProps) {
  // Box-level override state
  const [overwriteValue, setOverwriteValue] = useState('')
  const [comment, setComment] = useState('')
  const [overrideReason, setOverrideReason] = useState<OverrideReason | ''>('')
  const [error, setError] = useState('')

  // Recipe/SKU search and selection state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeForecast | null>(null)
  const [selectedSku, setSelectedSku] = useState<SkuForecast | null>(null)
  const [recipeSwapped, setRecipeSwapped] = useState('')
  const [recipeNonSwapped, setRecipeNonSwapped] = useState('')
  const [recipeSwappedReason, setRecipeSwappedReason] = useState<OverrideReason | ''>('')
  const [recipeNonSwappedReason, setRecipeNonSwappedReason] = useState<OverrideReason | ''>('')
  const [skuForecastValue, setSkuForecastValue] = useState('')
  const [skuReason, setSkuReason] = useState<OverrideReason | ''>('')

  // Reset form when week changes or panel closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset all state
      setSearchQuery('')
      setSelectedRecipe(null)
      setSelectedSku(null)
      setRecipeSwapped('')
      setRecipeNonSwapped('')
      setRecipeSwappedReason('')
      setRecipeNonSwappedReason('')
      setSkuForecastValue('')
      setSkuReason('')
      setOverwriteValue('')
      setComment('')
      setOverrideReason('')
      setError('')
      onClose()
    }
  }

  // Initialize form when panel opens with new week
  useEffect(() => {
    if (week && open) {
      // Reset all states when panel opens
      setSearchQuery('')
      setSelectedRecipe(null)
      setSelectedSku(null)
      setRecipeSwapped('')
      setRecipeNonSwapped('')
      setRecipeSwappedReason('')
      setRecipeNonSwappedReason('')
      setSkuForecastValue('')
      setSkuReason('')
      setOverwriteValue(week.overwriteForecast?.toString() || '')
      setComment(week.plannerComment || '')
      setOverrideReason(week.overrideReason || '')
      setError('')
    }
  }, [week, open])

  // Filtered search results
  const filteredRecipes = mockRecipeForecasts.filter(recipe =>
    recipe.recipeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSkus = mockSkuForecasts.filter(sku =>
    sku.skuId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sku.skuDescription.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleSaveRecipe = () => {
    if (!selectedRecipe) {
      setError('Please select a recipe first')
      return
    }
    if (!recipeSwapped || !recipeNonSwapped) {
      setError('Both Swapped and Non-Swapped forecast values are required')
      return
    }
    if (!recipeSwappedReason || !recipeNonSwappedReason) {
      setError('Reason codes are required for both fields')
      return
    }
    if (!comment.trim()) {
      setError('Detailed justification is required for audit trail')
      return
    }

    const totalRecipeForecast = Number(recipeSwapped) + Number(recipeNonSwapped)
    onSave(week.id, totalRecipeForecast, comment.trim(), recipeSwappedReason as OverrideReason)
    onClose()
  }

  const handleSaveSku = () => {
    if (!selectedSku) {
      setError('Please select a SKU first')
      return
    }
    if (!skuForecastValue) {
      setError('Forecast value is required')
      return
    }
    if (!skuReason) {
      setError('Reason code is required')
      return
    }
    if (!comment.trim()) {
      setError('Detailed justification is required for audit trail')
      return
    }

    onSave(week.id, Number(skuForecastValue), comment.trim(), skuReason as OverrideReason)
    onClose()
  }

  const handleBackToSearch = () => {
    setSelectedRecipe(null)
    setSelectedSku(null)
    setRecipeSwapped('')
    setRecipeNonSwapped('')
    setRecipeSwappedReason('')
    setRecipeNonSwappedReason('')
    setSkuForecastValue('')
    setSkuReason('')
    setComment('')
    setError('')
  }

  // Recipe total calculation
  const recipeTotal = recipeSwapped && recipeNonSwapped
    ? Number(recipeSwapped) + Number(recipeNonSwapped)
    : 0

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col h-full overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle>
            {forecastLevel === 'recipe' && selectedRecipe && (
              <Button variant="ghost" size="sm" onClick={handleBackToSearch} className="mr-2 -ml-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {forecastLevel === 'sku' && selectedSku && (
              <Button variant="ghost" size="sm" onClick={handleBackToSearch} className="mr-2 -ml-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            Edit Forecast - {week.weekLabel}
          </SheetTitle>
          <SheetDescription>
            {week.startDate} to {week.endDate}
            {forecastLevel === 'recipe' && selectedRecipe && (
              <div className="mt-1 font-medium text-foreground">
                Recipe: {selectedRecipe.recipeId} · {selectedRecipe.recipeName}
              </div>
            )}
            {forecastLevel === 'sku' && selectedSku && (
              <div className="mt-1 font-medium text-foreground">
                SKU: {selectedSku.skuId} · {selectedSku.skuDescription} ({selectedSku.market})
              </div>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 min-h-0">
          {/* ====== RECIPE FORECAST: Search UI ====== */}
          {forecastLevel === 'recipe' && !selectedRecipe && (
            <>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Search by Recipe ID or name — this week has {mockRecipeForecasts.length} recipes
                </p>
              </div>

              <div className="space-y-2">
                {filteredRecipes.length === 0 && searchQuery && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recipes found matching &quot;{searchQuery}&quot;
                  </p>
                )}
                {filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.recipeId}
                    onClick={() => {
                      setSelectedRecipe(recipe)
                      setRecipeSwapped(recipe.swappedForecast.toString())
                      setRecipeNonSwapped(recipe.nonSwappedForecast.toString())
                    }}
                    className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {recipe.recipeId} {recipe.recipeName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Swapped: {recipe.swappedForecast.toLocaleString()} · Non-swapped: {recipe.nonSwappedForecast.toLocaleString()} · Total: {recipe.totalForecast.toLocaleString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        Select →
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ====== SKU FORECAST: Search UI ====== */}
          {forecastLevel === 'sku' && !selectedSku && (
            <>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search SKUs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Search by SKU ID or description — this week has {mockSkuForecasts.length} SKUs
                </p>
              </div>

              <div className="space-y-2">
                {filteredSkus.length === 0 && searchQuery && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No SKUs found matching &quot;{searchQuery}&quot;
                  </p>
                )}
                {filteredSkus.map((sku) => (
                  <button
                    key={sku.skuId}
                    onClick={() => {
                      setSelectedSku(sku)
                      setSkuForecastValue(sku.currentForecast.toString())
                    }}
                    className="w-full text-left p-3 border rounded-lg hover:bg-muted-foreground/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {sku.skuId} {sku.skuDescription} ({sku.market})
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Current forecast: {sku.currentForecast.toLocaleString()} units
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        Select →
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ====== RECIPE FORECAST: Edit UI ====== */}
          {forecastLevel === 'recipe' && selectedRecipe && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Values</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground font-medium">Swapped</div>
                    <div className="text-lg font-mono font-semibold">{selectedRecipe.swappedForecast.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground font-medium">Non-Swapped</div>
                    <div className="text-lg font-mono font-semibold">{selectedRecipe.nonSwappedForecast.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground font-medium">Total</div>
                    <div className="text-lg font-mono font-semibold">{selectedRecipe.totalForecast.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Override Fields</h4>

                <div>
                  <Label htmlFor="recipe-swapped" className="text-sm font-medium mb-1.5 block">
                    Swapped Forecast <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="recipe-swapped"
                    type="number"
                    value={recipeSwapped}
                    onChange={(e) => {
                      setRecipeSwapped(e.target.value)
                      setError('')
                    }}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="recipe-swapped-reason" className="text-sm font-medium mb-1.5 block">
                    Reason Code <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={recipeSwappedReason}
                    onValueChange={(value: OverrideReason) => {
                      setRecipeSwappedReason(value)
                      setError('')
                    }}
                  >
                    <SelectTrigger id="recipe-swapped-reason">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(overrideReasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipe-nonswapped" className="text-sm font-medium mb-1.5 block">
                    Non-Swapped Forecast <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="recipe-nonswapped"
                    type="number"
                    value={recipeNonSwapped}
                    onChange={(e) => {
                      setRecipeNonSwapped(e.target.value)
                      setError('')
                    }}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="recipe-nonswapped-reason" className="text-sm font-medium mb-1.5 block">
                    Reason Code <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={recipeNonSwappedReason}
                    onValueChange={(value: OverrideReason) => {
                      setRecipeNonSwappedReason(value)
                      setError('')
                    }}
                  >
                    <SelectTrigger id="recipe-nonswapped-reason">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(overrideReasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 border">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Total Forecast (calculated)</div>
                  <div className="font-mono text-lg font-semibold">
                    {recipeTotal.toLocaleString()}
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipe-comment" className="text-sm font-medium mb-1.5 block">
                    Planner Comment
                  </Label>
                  <Textarea
                    id="recipe-comment"
                    placeholder="Optional note..."
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value)
                      setError('')
                    }}
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}

          {/* ====== SKU FORECAST: Edit UI ====== */}
          {forecastLevel === 'sku' && selectedSku && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Value</h4>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground font-medium">Current Forecast</div>
                  <div className="text-lg font-mono font-semibold">{selectedSku.currentForecast.toLocaleString()} units</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Override Fields</h4>

                <div>
                  <Label htmlFor="sku-forecast" className="text-sm font-medium mb-1.5 block">
                    Forecast Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sku-forecast"
                    type="number"
                    value={skuForecastValue}
                    onChange={(e) => {
                      setSkuForecastValue(e.target.value)
                      setError('')
                    }}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="sku-reason" className="text-sm font-medium mb-1.5 block">
                    Reason Code <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={skuReason}
                    onValueChange={(value: OverrideReason) => {
                      setSkuReason(value)
                      setError('')
                    }}
                  >
                    <SelectTrigger id="sku-reason">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(overrideReasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sku-comment" className="text-sm font-medium mb-1.5 block">
                    Detailed Justification <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="sku-comment"
                    placeholder="Provide specific details explaining this override..."
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value)
                      setError('')
                    }}
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {/* ====== BOX FORECAST: Original UI ====== */}
          {forecastLevel === 'box' && (
            <>
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

            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <SheetFooter className="shrink-0 flex-row gap-2 border-t pt-4">
          {forecastLevel === 'box' && (overwriteValue || comment) && (
            <Button variant="ghost" onClick={handleClearOverride} className="mr-auto">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          {forecastLevel === 'recipe' && selectedRecipe && (
            <Button variant="ghost" onClick={handleBackToSearch} className="mr-auto">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to search
            </Button>
          )}
          {forecastLevel === 'sku' && selectedSku && (
            <Button variant="ghost" onClick={handleBackToSearch} className="mr-auto">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to search
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {forecastLevel === 'box' && (
            <Button onClick={handleSave}>
              Save Override
            </Button>
          )}
          {forecastLevel === 'recipe' && selectedRecipe && (
            <Button onClick={handleSaveRecipe}>
              Save Override
            </Button>
          )}
          {forecastLevel === 'sku' && selectedSku && (
            <Button onClick={handleSaveSku}>
              Save Override
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
