'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Metric } from '@/lib/services/metrics'
import { format } from 'date-fns'
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react'
import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

interface GaugeMetricProps {
  metric: Metric
}

interface GaugeMetricDataPoint {
  time: number
  value: number
  timestamp: string
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

interface RunGaugeMetricProps {
  metric: {
    name: string
    description: string
    unit?: string
    tag_definitions: Array<{
      description: string
      tag: string
    }>
    data: Array<{
      time: string
      value: number
      tags: Record<string, string>
    }>
    type: string
  }
}

export function RunGaugeMetric({ metric }: RunGaugeMetricProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!metric.data?.length) return []

    return metric.data
      .map((point) => ({
        time: new Date(point.time).getTime(),
        value: point.value,
        timestamp: format(new Date(point.time), 'HH:mm:ss'),
      }))
      .sort((a, b) => a.time - b.time)
  }, [metric.data])

  // Get the latest value for the gauge display
  const latestValue = useMemo(() => {
    if (!metric.data?.length) return 0
    const sortedData = [...metric.data].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    )
    return sortedData[0]?.value || 0
  }, [metric.data])

  // Calculate gauge percentage (assuming 0-100 range, adjust as needed)
  const gaugePercentage = Math.min(Math.max(latestValue, 0), 100)
  const gaugeColor = gaugePercentage > 80 ? '#ef4444' : gaugePercentage > 60 ? '#f59e0b' : '#10b981'

  if (!metric.data?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-muted-foreground">No data available for {metric.name}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{metric.name}</CardTitle>
            <CardDescription className="text-sm">{metric.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="text-xs">
              {metric.data.length} points
            </Badge>
            {metric.unit && (
              <Badge variant="outline" className="text-xs">
                {metric.unit}
              </Badge>
            )}
          </div>
        </div>
        {metric.tag_definitions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {metric.tag_definitions.map((tag, tagIndex) => (
              <TooltipProvider key={tagIndex}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs cursor-help">
                      {tag.tag}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tag.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauge Number Display */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {/* Circular Gauge */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle cx="60" cy="60" r="50" fill="none" stroke="#374151" strokeWidth="8" />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(gaugePercentage / 100) * 314} 314`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              {/* Center value */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: gaugeColor }}>
                    {latestValue.toFixed(1)}
                  </div>
                  {metric.unit && (
                    <div className="text-xs text-muted-foreground">{metric.unit}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{metric.name}</div>
              <div className="text-xs text-muted-foreground">{gaugePercentage.toFixed(1)}%</div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--foreground))"
                  label={
                    metric.unit
                      ? {
                          value: metric.unit,
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: 'hsl(var(--foreground))' },
                        }
                      : undefined
                  }
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                  formatter={(value: any) => [value, metric.name]}
                  labelFormatter={(label: string) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={gaugeColor}
                  strokeWidth={2}
                  dot={{ r: 4, fill: gaugeColor }}
                  activeDot={{
                    r: 6,
                    stroke: gaugeColor,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
