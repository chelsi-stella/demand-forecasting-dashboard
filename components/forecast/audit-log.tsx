'use client'

import { Clock, Edit2, CheckCircle2, Lock, MessageSquare, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuditLogEntry } from '@/lib/forecast-data'

interface AuditLogProps {
  entries: AuditLogEntry[]
}

function getActionIcon(action: string) {
  switch (action.toLowerCase()) {
    case 'override':
      return <Edit2 className="h-3.5 w-3.5" />
    case 'comment':
      return <MessageSquare className="h-3.5 w-3.5" />
    case 'approve':
      return <CheckCircle2 className="h-3.5 w-3.5" />
    case 'lock':
      return <Lock className="h-3.5 w-3.5" />
    case 'status change':
      return <ArrowRight className="h-3.5 w-3.5" />
    default:
      return <Clock className="h-3.5 w-3.5" />
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export function AuditLog({ entries }: AuditLogProps) {
  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, AuditLogEntry[]>)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {Object.entries(groupedEntries).map(([date, dayEntries]) => (
            <div key={date}>
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                {date}
              </div>
              <div className="divide-y">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-muted text-muted-foreground">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{entry.user}</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                            {entry.field}
                          </span>
                          {entry.oldValue && (
                            <>
                              <span className="mx-1">from</span>
                              <span className="text-foreground">{entry.oldValue}</span>
                            </>
                          )}
                          <span className="mx-1">to</span>
                          <span className="text-foreground font-medium">{entry.newValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            No activity recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
