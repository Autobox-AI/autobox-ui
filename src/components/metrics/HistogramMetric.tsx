'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Metric } from '@/lib/services/metrics'
import { BarChart } from 'lucide-react'

interface HistogramMetricProps {
  metric: Metric
}

export function HistogramMetric({ metric }: HistogramMetricProps) {
  const buckets = metric.buckets || []
  const maxCount = Math.max(...buckets.map(b => b.count))

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.name.replace(/_/g, ' ').toUpperCase()}</CardTitle>
        <BarChart className="h-4 w-4 text-purple-500" />
      </CardHeader>
      <CardContent>
        <div className="h-[100px] flex items-end gap-2">
          {buckets.map((bucket, index) => {
            const height = (bucket.count / maxCount) * 100
            return (
              <div key={bucket.le} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-purple-500/20 rounded-sm"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground rotate-45 origin-left translate-y-6">
                  ≤{bucket.le}s
                </span>
              </div>
            )
          })}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-8">
          {metric.help}
        </CardDescription>
      </CardContent>
    </Card>
  )
}