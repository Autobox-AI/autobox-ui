'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Metric } from '@/lib/services/metrics'
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react'

interface GaugeMetricProps {
  metric: Metric
}

export function GaugeMetric({ metric }: GaugeMetricProps) {
  const value = metric.values[0]?.value || 0
  const trend = value > 50 ? 'up' : value < 50 ? 'down' : 'neutral'
  const trendColor =
    trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-yellow-500'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {metric.name.replace(/_/g, ' ').toUpperCase()}
        </CardTitle>
        <div className={`${trendColor}`}>
          {trend === 'up' && <ArrowUpIcon className="h-4 w-4" />}
          {trend === 'down' && <ArrowDownIcon className="h-4 w-4" />}
          {trend === 'neutral' && <MinusIcon className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}%</div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {metric.help}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
