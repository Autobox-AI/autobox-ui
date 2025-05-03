'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Metric } from '@/lib/services/metrics'
import { Activity } from 'lucide-react'

interface CounterMetricProps {
  metric: Metric
}

export function CounterMetric({ metric }: CounterMetricProps) {
  const value = metric.values[0]?.value || 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.name.replace(/_/g, ' ').toUpperCase()}</CardTitle>
        <Activity className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {metric.help}
        </CardDescription>
      </CardContent>
    </Card>
  )
}