'use client'

import React from "react"

import { 
  BarChart3, 
  CheckCircle2, 
  ClipboardList, 
  History, 
  LayoutDashboard,
  Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavView = 'overview' | 'trends' | 'validation' | 'approvals' | 'audit' | 'settings'

interface NavItem {
  icon: React.ElementType
  label: string
  view: NavView
  badge?: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Forecast Overview', view: 'overview' },
  { icon: BarChart3, label: 'Trend Analysis', view: 'trends' },
  { icon: ClipboardList, label: 'Validation', view: 'validation', badge: '2' },
  { icon: CheckCircle2, label: 'Approvals', view: 'approvals', badge: '4' },
  { icon: History, label: 'Audit Trail', view: 'audit' },
]

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: 'Settings', view: 'settings' },
]

interface AppSidebarProps {
  activeView: NavView
  onViewChange: (view: NavView) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  return (
    <aside className="w-56 border-r bg-card flex flex-col">
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                activeView === item.view
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
      
      <div className="border-t p-3">
        {bottomNavItems.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => onViewChange(item.view)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
              activeView === item.view
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-left">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
