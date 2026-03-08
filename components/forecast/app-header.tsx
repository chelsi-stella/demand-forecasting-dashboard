'use client'

import { Bell, HelpCircle, User, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type RunStatus = 'complete' | 'running' | 'failed'

interface AppHeaderProps {
  runStatus?: RunStatus
  lastRunTime?: string
}

export function AppHeader({ runStatus = 'complete', lastRunTime = 'Mon 08 Mar · 08:00' }: AppHeaderProps) {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">HF</span>
          </div>
          <span className="font-semibold text-foreground">Demand Forecasting</span>
        </div>
        <span className="text-muted-foreground text-sm">|</span>
        <span className="text-muted-foreground text-sm">Enterprise Planning Tools</span>
      </div>

      {/* Run Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Last run:</span>
        <span className="font-medium">{lastRunTime}</span>
        <span className="text-muted-foreground">·</span>
        {runStatus === 'complete' && (
          <div className="flex items-center gap-1" style={{ color: 'var(--hf-foreground-positive-positive-dark)' }}>
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Complete</span>
          </div>
        )}
        {runStatus === 'running' && (
          <div className="flex items-center gap-1" style={{ color: 'var(--hf-foreground-warning-warning-mid)' }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">Running...</span>
          </div>
        )}
        {runStatus === 'failed' && (
          <div className="flex items-center gap-1" style={{ color: 'var(--hf-foreground-negative-negative-dark)' }}>
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Run failed — see details</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span>Maria Schmidt</span>
        </Button>
      </div>
    </header>
  )
}
