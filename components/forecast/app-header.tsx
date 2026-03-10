'use client'

import { Bell, HelpCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppHeader() {
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
