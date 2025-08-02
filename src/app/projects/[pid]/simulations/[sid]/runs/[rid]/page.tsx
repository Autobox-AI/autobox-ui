'use client'

import AgentsTab from '@/components/AgentsTab'
import { RunGaugeMetric } from '@/components/LazyMetrics'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePrefetch } from '@/hooks/usePrefetch'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { useParams } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  RechartsTooltip,
} from '@/components/LazyCharts'

interface Trace {
  from: string
  to: string
  content: string
  created_at: string
  is_system_trace: boolean
}

interface TracesResponse {
  traces: Trace[]
}

interface MetricDataPoint {
  time: string
  value: number
  tags: Record<string, string>
}

interface MetricDefinition {
  name: string
  description: string
  unit?: string
  tag_definitions: Array<{
    description: string
    tag: string
  }>
  data: MetricDataPoint[]
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

interface MetricsResponse {
  metrics: MetricDefinition[]
}

interface Run {
  id: string
  simulation_id: string
  status: string
  progress: number
  started_at: string
  finished_at?: string
  updated_at: string
  summary?: string
  observation?: string
}

// Pre-computed colors array to avoid recreation
const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

// Optimized trace item with aggressive memoization
const TraceItem = memo(({ trace, index }: { trace: Trace; index: number }) => {
  const params = useParams()

  // Memoize expensive operations with stable references
  const formattedDate = useMemo(
    () => format(new Date(trace.created_at), 'MMM dd, yyyy HH:mm:ss'),
    [trace.created_at]
  )

  const parsedContent = useMemo(() => {
    if (!trace.content.startsWith('{')) return null
    try {
      return JSON.parse(trace.content)
    } catch {
      return null
    }
  }, [trace.content])

  const isJson = parsedContent !== null

  return (
    <Card className="p-6 mb-4">
      <div className="space-y-4">
        {/* Header with FROM, TO, and DATE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">FROM:</span>
              <Badge
                variant="outline"
                className="font-semibold cursor-pointer hover:bg-accent"
                title="Click to view agent details"
              >
                {trace.from}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">TO:</span>
              <Badge
                variant="outline"
                className="font-semibold cursor-pointer hover:bg-accent"
                title="Click to view agent details"
              >
                {trace.to}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">DATE:</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {formattedDate}
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border" />

        {/* Message content */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">MESSAGE:</span>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isJson ? (
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                {JSON.stringify(parsedContent, null, 2)}
              </pre>
            ) : (
              <div className="bg-muted p-4 rounded-md">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{trace.content}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
})

TraceItem.displayName = 'TraceItem'

// Debug table for metric data using shadcn/ui Table component
const DebugMetricTable = ({ data, groupKeys }: { data: any[]; groupKeys?: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isExpanded ? 'Hide' : 'Show'} data table
          </button>
          <span className="text-xs text-muted-foreground">({data.length} points)</span>
        </div>
      </div>

      {isExpanded && (
        <div className="rounded-md border overflow-hidden bg-background relative z-10 shadow-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] min-w-[120px]">Time</TableHead>
                  {groupKeys && groupKeys.length > 0 ? (
                    groupKeys.map((key) => (
                      <TableHead key={key} className="text-center min-w-[100px]">
                        <div className="truncate" title={key}>
                          {key}
                        </div>
                      </TableHead>
                    ))
                  ) : (
                    <TableHead className="text-center min-w-[100px]">Value</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{row.timestamp}</TableCell>
                    {groupKeys && groupKeys.length > 0 ? (
                      groupKeys.map((key) => (
                        <TableCell key={key} className="text-center font-mono text-xs">
                          {row[key] !== null && row[key] !== undefined ? row[key] : '-'}
                        </TableCell>
                      ))
                    ) : (
                      <TableCell className="text-center font-mono text-xs">{row.value}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.length > 10 && (
            <div className="text-xs text-muted-foreground p-3 text-center border-t bg-background">
              Showing first 10 of {data.length} data points
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Optimized chart component with lazy loading and performance improvements
const MetricChart = memo(
  ({ metric, metricType }: { metric: MetricDefinition; metricType: string }) => {
    // Pivot data: each tag group is a separate line, X axis is union of all timestamps
    const { _chartData, mergedData, groupKeys } = useMemo(() => {
      if (!metric.data?.length) return { _chartData: [], mergedData: [], groupKeys: [] }

      if (metric.tag_definitions.length > 0) {
        // Group by tagKey - optimized with Map for better performance
        const groupedData: Record<string, any[]> = {}
        const allTimestamps = new Map<string, number>() // Use Map for faster lookups
        metric.data.forEach((point) => {
          const tagKey = metric.tag_definitions.map((tag) => point.tags[tag.tag]).join('_')
          if (!groupedData[tagKey]) groupedData[tagKey] = []
          const timeMs = new Date(point.time).getTime()
          groupedData[tagKey].push({
            time: timeMs,
            value: point.value,
            name: tagKey,
            timestamp: format(timeMs, 'HH:mm:ss'), // Use timeMs directly instead of parsing again
          })
          allTimestamps.set(point.time, timeMs)
        })
        // Build mergedData: one row per timestamp, each group as a key
        const timestamps = Array.from(allTimestamps.entries())
          .sort(([, a], [, b]) => a - b)
          .map(([timeStr]) => timeStr)
        const mergedData = timestamps.map((time) => {
          const timeMs = allTimestamps.get(time)!
          const row: any = {
            time: timeMs,
            timestamp: format(timeMs, 'HH:mm:ss'),
          }
          Object.entries(groupedData).forEach(([tagKey, arr]) => {
            const found = arr.find((d) => d.time === timeMs)
            row[tagKey] = found ? found.value : null
          })
          return row
        })
        return { _chartData: groupedData, mergedData, groupKeys: Object.keys(groupedData) }
      }
      // No tags: single line - optimize date parsing
      const mergedData = metric.data.map((point) => {
        const timeMs = new Date(point.time).getTime()
        return {
          time: timeMs,
          value: point.value,
          timestamp: format(timeMs, 'HH:mm:ss'),
        }
      })
      return { _chartData: null, mergedData, groupKeys: [] }
    }, [metric.data, metric.tag_definitions])

    const allZero =
      mergedData.length > 0 &&
      mergedData.every((d: any) => {
        if (groupKeys.length > 0) {
          return groupKeys.every((key) => d[key] === 0 || d[key] == null)
        }
        return d.value === 0
      })

    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!containerRef.current) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect() // Only load once
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      )

      observer.observe(containerRef.current)

      // Resize observer for chart responsiveness
      const ro = new ResizeObserver(() => {
        if (isVisible) {
          window.dispatchEvent(new Event('resize'))
        }
      })
      ro.observe(containerRef.current)

      return () => {
        observer.disconnect()
        ro.disconnect()
      }
    }, [isVisible])

    if (!metric.data?.length || !mergedData.length) {
      return (
        <div className="border-dashed border-2 border-muted rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No data available for {metric.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Data points: {metric.data?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (allZero) {
      return (
        <div className="border-dashed border-2 border-yellow-500/30 rounded-lg p-6 bg-yellow-500/5">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                All values are zero for {metric.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Data points: {mergedData.length}</p>
            </div>
            <DebugMetricTable data={mergedData} groupKeys={groupKeys} />
          </div>
        </div>
      )
    }

    // Unique key for chart and container
    const chartKey = `${metric.name}-${mergedData.length}`

    return (
      <div
        ref={containerRef}
        className="w-full border rounded-lg p-4 bg-card/50"
        style={{ height: 320 }}
      >
        {!isVisible ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width={'100%'} height={300} key={chartKey}>
            {metricType === 'gauge' ? (
              <BarChart
                data={mergedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                key={chartKey}
              >
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
                  formatter={(value: any, name: string) => {
                    if (groupKeys.length > 0) {
                      // For tagged data, show the tag values in the name
                      const tagValues = metric.tag_definitions
                        .map(
                          (tag) =>
                            `${tag.tag}=${name.split('_')[metric.tag_definitions.indexOf(tag)] || 'N/A'}`
                        )
                        .join(', ')
                      return [value, `${metric.name} (${tagValues})`]
                    }
                    return [value, metric.name]
                  }}
                  labelFormatter={(label: string) => `Time: ${label}`}
                />
                {/* Show all groups for bar chart with different colors */}
                {groupKeys.length > 0 ? (
                  groupKeys.map((key, index) => (
                    <Bar key={key} dataKey={key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))
                ) : (
                  <Bar dataKey="value" fill={CHART_COLORS[0]} />
                )}
              </BarChart>
            ) : (
              <LineChart
                data={mergedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                key={chartKey}
              >
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
                  formatter={(value: any, name: string) => {
                    if (groupKeys.length > 0) {
                      // For tagged data, show the tag values in the name
                      const tagValues = metric.tag_definitions
                        .map(
                          (tag) =>
                            `${tag.tag}=${name.split('_')[metric.tag_definitions.indexOf(tag)] || 'N/A'}`
                        )
                        .join(', ')
                      return [value, `${metric.name} (${tagValues})`]
                    }
                    return [value, metric.name]
                  }}
                  labelFormatter={(label: string) => `Time: ${label}`}
                />
                {groupKeys.length > 0 ? (
                  groupKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 2, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                      activeDot={{
                        r: 6,
                        stroke: CHART_COLORS[index % CHART_COLORS.length],
                        strokeWidth: 2,
                      }}
                    />
                  ))
                ) : (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 2, fill: CHART_COLORS[0] }}
                    activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
        <DebugMetricTable data={mergedData} groupKeys={groupKeys} />
      </div>
    )
  }
)

MetricChart.displayName = 'MetricChart'

// Optimized metric card using shadcn/ui Card components
const MetricCard = memo(({ metric }: { metric: MetricDefinition }) => {
  const dataPointCount = metric.data?.length || 0
  const hasTags = metric.tag_definitions.length > 0

  // For gauge metrics, use the special gauge component
  if (metric.type === 'gauge') {
    return <RunGaugeMetric metric={metric} />
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold">{metric.name}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {metric.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {dataPointCount} points
            </Badge>
            {metric.unit && (
              <Badge variant="outline" className="text-xs">
                {metric.unit}
              </Badge>
            )}
          </div>
        </div>
        {hasTags && (
          <div className="flex gap-2 flex-wrap mt-3">
            {metric.tag_definitions.map((tag, tagIndex) => (
              <TooltipProvider key={tagIndex}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs cursor-help hover:bg-muted">
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
        <MetricChart metric={metric} metricType={metric.type} />
      </CardContent>
    </Card>
  )
})

MetricCard.displayName = 'MetricCard'

// Loading skeletons using shadcn/ui Skeleton
const TracesSkeleton = memo(() => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"
          style={{ animationDuration: '1.5s' }}
        ></div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">Loading Traces</h2>
        <p className="text-sm text-zinc-500">Please wait while we fetch the trace data...</p>
      </div>
    </div>

    <div className="space-y-4 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
))

TracesSkeleton.displayName = 'TracesSkeleton'

const MetricsSkeleton = memo(() => (
  <div className="space-y-8">
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/60 rounded-full animate-spin"
            style={{ animationDuration: '1.5s' }}
          ></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the metrics data...
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
))

MetricsSkeleton.displayName = 'MetricsSkeleton'

export default function RunTracesPage() {
  const params = useParams()
  const [run, setRun] = useState<Run | null>(null)
  const [runLoading, setRunLoading] = useState(true)
  const [traces, setTraces] = useState<Trace[]>([])
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const { getPrefetchedData } = usePrefetch()
  const [tracesLoading, setTracesLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [tracesError, setTracesError] = useState<string | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('traces')
  const [searchQuery, setSearchQuery] = useState('')
  const [metricsSearchQuery, setMetricsSearchQuery] = useState('')
  const [showSystemTraces, setShowSystemTraces] = useState(true)
  const [agentCount, setAgentCount] = useState(0)
  const [agents, setAgents] = useState<any[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [agentsError, setAgentsError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5
  const retryCountRef = useRef(0)
  const setupTracesStreamingRef = useRef<(() => EventSource | undefined) | null>(null)
  const fetchMetricsRef = useRef<(() => Promise<void>) | null>(null)
  const fetchTracesRef = useRef<(() => Promise<void>) | null>(null)
  const tracesScrollRef = useRef<HTMLDivElement>(null)
  const [pollingCounter, setPollingCounter] = useState(10)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const collectedTracesRef = useRef<Set<string>>(new Set())
  const isMocksEnabled = process.env.NEXT_PUBLIC_MOCKS_ENABLED === 'true'

  // Update ref when retryCount changes
  useEffect(() => {
    retryCountRef.current = retryCount
  }, [retryCount])

  // Scroll event handler for traces list
  const handleTracesScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const { scrollTop, scrollHeight, clientHeight } = target
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

    // Show scroll buttons when content is scrollable
    setShowScrollButtons(scrollHeight > clientHeight)
  }, [])

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (tracesScrollRef.current) {
      console.log('Scroll to top triggered')
      tracesScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [])

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (tracesScrollRef.current) {
      console.log('Scroll to bottom triggered')
      tracesScrollRef.current.scrollTo({
        top: tracesScrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [])

  // Keyboard shortcuts for scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when traces tab is active and there are traces
      if (activeTab !== 'traces' || tracesLoading || tracesError || traces.length === 0) {
        return
      }

      // Home key - scroll to top
      if (e.key === 'Home') {
        e.preventDefault()
        scrollToTop()
      }

      // End key - scroll to bottom
      if (e.key === 'End') {
        e.preventDefault()
        scrollToBottom()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, tracesLoading, tracesError, traces.length, scrollToTop, scrollToBottom])

  // Calculate total metrics count
  const totalMetricsCount = useMemo(() => {
    if (!metrics) return 0
    return metrics.metrics?.length || 0
  }, [metrics])

  // Filter traces based on search query and system trace toggle
  const filteredTraces = useMemo(() => {
    let filtered = traces

    // Filter out system traces if toggle is off
    if (!showSystemTraces) {
      filtered = filtered.filter((trace) => !trace.is_system_trace)
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (trace) =>
          trace.from.toLowerCase().includes(query) ||
          trace.to.toLowerCase().includes(query) ||
          trace.content.toLowerCase().includes(query) ||
          trace.created_at.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [traces, searchQuery, showSystemTraces])

  // Helper function to normalize trace data
  const normalizeTrace = useCallback(
    (trace: any): Trace => ({
      from: trace.from || trace.From || '',
      to: trace.to || trace.To || '',
      content: trace.content || trace.Content || '',
      is_system_trace: trace.is_system_trace,
      created_at: trace.created_at || trace.createdAt || trace.CreatedAt || '',
    }),
    []
  )

  // Helper function to sort traces by date (newest first)
  const sortTracesByDate = useCallback((traces: Trace[]): Trace[] => {
    return [...traces].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA // DESC order
    })
  }, [])

  // Fetch run details
  const fetchRunDetails = useCallback(async () => {
    if (!params.rid) return null

    try {
      const response = await fetch(`/api/runs/${params.rid}`)
      if (!response.ok) {
        throw new Error('Failed to fetch run details')
      }
      const data = await response.json()
      return data as Run
    } catch (error) {
      console.error('Error fetching run details:', error)
      return null
    }
  }, [params.rid])

  // Polling function for mocks
  const pollTraces = useCallback(
    async (counter: number) => {
      if (!params.rid) return

      try {
        const response = await fetch(`/api/runs/${params.rid}/traces?counter=${counter}`)
        if (!response.ok) {
          throw new Error('Failed to fetch traces')
        }

        const data = await response.json()
        const { traces: newTraces, done } = data

        // Add new traces to the set (avoiding duplicates)
        newTraces.forEach((trace: Trace) => {
          const traceKey = `${trace.from}-${trace.to}-${trace.created_at}`
          if (!collectedTracesRef.current.has(traceKey)) {
            collectedTracesRef.current.add(traceKey)
            setTraces((prev) => {
              const combined = [...prev, normalizeTrace(trace)]
              return sortTracesByDate(combined)
            })
          }
        })

        // If done or counter reaches 1, stop polling
        if (done || counter <= 1) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          setIsStreaming(false)
          setTracesLoading(false)
        }
      } catch (error) {
        console.error('Error polling traces:', error)
        setTracesError('Failed to poll traces')
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        setIsStreaming(false)
        setTracesLoading(false)
      }
    },
    [params.rid, normalizeTrace, sortTracesByDate]
  )

  // Streaming traces setup with progressive loading
  const setupTracesStreaming = useCallback(() => {
    if (!params.rid) return

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setTracesLoading(true)
    setTracesError(null)
    setIsStreaming(true)

    const eventSource = new EventSource(`/api/runs/${params.rid}/traces?stream=true`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      console.log('EventSource message received:', {
        data: event.data,
        type: event.type,
        lastEventId: event.lastEventId,
        origin: event.origin,
      })

      try {
        if (event.data === '[DONE]') {
          console.log('Streaming completed - received [DONE]')
          eventSource.close()
          setIsStreaming(false)
          setTracesLoading(false)
          return
        }

        const data = JSON.parse(event.data)
        // console.log('Parsed streaming data:', data)
        if (data) {
          setTraces((prevTraces) => {
            // Normalize the single incoming trace
            const normalizedTrace = normalizeTrace(data)

            // Since backend handles deduplication, just append the new trace
            const combinedTraces = [normalizedTrace, ...prevTraces]
            const sortedTraces = sortTracesByDate(combinedTraces)

            return sortedTraces
          })

          // Set loading to false after we receive first trace (progressive loading)
          setTracesLoading(false)
        } else {
          console.log('No valid trace in streaming data:', data)
          // Only set loading to false if we don't have a valid trace
          setTracesLoading(false)
        }
        setRetryCount(0) // Reset retry count on success
      } catch (error) {
        console.error('Error parsing streaming data:', error, 'Raw data:', event.data)
        setTracesError('Error parsing streaming data')
        setTracesLoading(false)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      console.error('EventSource readyState:', eventSource.readyState)
      setTracesError('Streaming connection error')
      setTracesLoading(false)
      setIsStreaming(false)
      eventSource.close()
      // Throttle retries and limit to maxRetries
      if (retryCountRef.current < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
        }, 5000) // 5 seconds delay
      }
    }

    eventSource.onopen = () => {
      setTracesError(null)
    }

    return eventSource
  }, [params.rid, maxRetries, normalizeTrace, sortTracesByDate])

  // Retry streaming when retryCount changes (throttled)
  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxRetries) {
      const timer = setTimeout(() => {
        setupTracesStreaming()
      }, 5000) // 5 seconds delay

      return () => clearTimeout(timer)
    }
  }, [retryCount, maxRetries, setupTracesStreaming])

  // Hybrid approach: Load initial traces immediately, then stream updates
  const fetchInitialTraces = useCallback(async () => {
    if (!params.rid) return

    try {
      // Check if we have prefetched data
      const prefetchedData = getPrefetchedData('traces', params.rid as string)
      if (prefetchedData) {
        console.log('Using prefetched trace data')
        const normalizedTraces = prefetchedData.traces.map(normalizeTrace)
        const sortedTraces = sortTracesByDate(normalizedTraces)
        setTraces(sortedTraces)
        setTracesLoading(false)
        return
      }

      const response = await fetch(`/api/runs/${params.rid}/traces`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch traces')
      }
      const data: TracesResponse = await response.json()

      // Normalize and sort traces
      const normalizedTraces = data.traces.map(normalizeTrace)
      const sortedTraces = sortTracesByDate(normalizedTraces)

      setTraces(sortedTraces)
      setTracesLoading(false) // Show data immediately
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setTracesError(errorMessage)
      setTracesLoading(false)
    }
  }, [params.rid, normalizeTrace, sortTracesByDate, getPrefetchedData])

  // Fallback fetch function for non-streaming
  const fetchTraces = useCallback(async () => {
    if (!params.rid) return

    try {
      setTracesLoading(true)
      setTracesError(null)
      const response = await fetch(`/api/runs/${params.rid}/traces`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch traces')
      }
      const data: TracesResponse = await response.json()

      // Normalize and sort traces
      const normalizedTraces = data.traces.map(normalizeTrace)
      const sortedTraces = sortTracesByDate(normalizedTraces)

      setTraces(sortedTraces)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setTracesError(errorMessage)
    } finally {
      setTracesLoading(false)
    }
  }, [params.rid, normalizeTrace, sortTracesByDate])

  const fetchMetrics = useCallback(async () => {
    if (!params.rid) return

    try {
      setMetricsLoading(true)
      setMetricsError(null)

      // Check if we have prefetched data
      const prefetchedData = getPrefetchedData('metrics', params.rid as string)
      if (prefetchedData) {
        console.log('Using prefetched metrics data')
        setMetrics(prefetchedData)
        setMetricsLoading(false)
        return
      }

      const response = await fetch(`/api/runs/${params.rid}/metrics`, {
        // Add performance headers for better caching
        headers: {
          'Cache-Control': 'max-age=60', // Cache for 1 minute
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch metrics')
      }
      const data: MetricsResponse = await response.json()
      setMetrics(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setMetricsError(errorMessage)
    } finally {
      setMetricsLoading(false)
    }
  }, [params.rid, getPrefetchedData])

  const fetchAgents = useCallback(async () => {
    if (!params.rid) return

    try {
      setAgentsLoading(true)
      setAgentsError(null)
      const response = await fetch(`/api/runs/${params.rid}/agents`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch agents')
      }
      const data = await response.json()
      const agents = data.agents || []
      setAgents(agents)
      setAgentCount(agents.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setAgentsError(errorMessage)
    } finally {
      setAgentsLoading(false)
    }
  }, [params.rid])

  // Update function refs after function declarations
  useEffect(() => {
    setupTracesStreamingRef.current = setupTracesStreaming
    fetchMetricsRef.current = fetchMetrics
    fetchTracesRef.current = fetchTraces
  }, [setupTracesStreaming, fetchMetrics, fetchTraces, fetchAgents])

  // Setup hybrid loading on mount - load initial data immediately, then stream updates
  useEffect(() => {
    if (params.rid) {
      // Load metrics and agents in parallel
      fetchMetrics()
      fetchAgents()

      // If mocks are enabled, use polling for "in progress" runs
      if (isMocksEnabled) {
        const setupPolling = async () => {
          // First fetch run details
          const runData = await fetchRunDetails()
          if (runData) {
            setRun(runData)
            setRunLoading(false)

            // If run is "in progress", use polling
            if (runData.status === 'in progress') {
              setIsStreaming(true)
              setTracesLoading(true)

              // Start polling
              let counter = 10
              setPollingCounter(counter)

              // Initial poll
              await pollTraces(counter)

              // Set up interval for subsequent polls
              pollingIntervalRef.current = setInterval(async () => {
                counter -= 1
                setPollingCounter(counter)
                await pollTraces(counter)

                if (counter <= 1) {
                  clearInterval(pollingIntervalRef.current!)
                  pollingIntervalRef.current = null
                }
              }, 2000) // Poll every 2 seconds
            } else {
              // For completed runs, just fetch all traces
              fetchInitialTraces()
            }
          } else {
            setRunLoading(false)
            fetchInitialTraces()
          }
        }

        setupPolling()
      } else {
        // Original streaming behavior
        fetchInitialTraces()
        const eventSource = setupTracesStreaming()

        // Set up a fallback timer in case streaming doesn't work
        const fallbackTimer = setTimeout(() => {
          setTracesLoading((prevLoading) => {
            if (prevLoading) {
              console.log('Streaming timeout, falling back to regular fetch')
              if (eventSource) {
                eventSource.close()
              }
              fetchTraces()
            }
            return prevLoading
          })
        }, 5000) // 5 second timeout

        return () => {
          clearTimeout(fallbackTimer)
          if (eventSource) {
            eventSource.close()
          }
        }
      }

      // Cleanup
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }
      }
    }
  }, [
    params.rid,
    fetchInitialTraces,
    setupTracesStreaming,
    fetchMetrics,
    fetchTraces,
    fetchAgents,
    fetchRunDetails,
    pollTraces,
    isMocksEnabled,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Force Recharts to recalculate size when Metrics tab is activated
  useEffect(() => {
    if (activeTab === 'metrics') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    }
  }, [activeTab])

  // Ensure scroll arrows show up as soon as content is scrollable
  useEffect(() => {
    if (tracesScrollRef.current && traces.length > 0) {
      const { scrollHeight, clientHeight } = tracesScrollRef.current
      setShowScrollButtons(scrollHeight > clientHeight)
    } else {
      setShowScrollButtons(false)
    }
  }, [traces.length])

  // Auto-scroll to bottom when new traces arrive, unless user has scrolled up
  useEffect(() => {
    const scrollEl = tracesScrollRef.current
    if (!scrollEl) return
    // If user is near the bottom (within 100px), auto-scroll
    const isNearBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 100
    if (isNearBottom) {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' })
    }
  }, [filteredTraces.length])

  // Memoized content to prevent unnecessary re-renders
  const tracesContent = useMemo(() => {
    if (tracesLoading) {
      return <TracesSkeleton />
    }

    if (tracesError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Traces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{tracesError}</p>
          </CardContent>
        </Card>
      )
    }

    if (!traces.length) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-muted-foreground">No traces available</p>
              {isStreaming && (
                <div className="mt-2 flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Listening for new traces...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="relative flex-1 min-h-0 h-full">
        {/* Main scrollable content */}
        <div
          ref={tracesScrollRef}
          className="absolute inset-0 overflow-y-auto pr-4"
          onScroll={handleTracesScroll}
        >
          {filteredTraces.map((trace, index) => {
            return (
              <TraceItem
                key={`${trace.from}-${trace.to}-${trace.created_at}-${index}`}
                trace={trace}
                index={index}
              />
            )
          })}
        </div>
      </div>
    )
  }, [
    tracesLoading,
    tracesError,
    traces.length,
    isStreaming,
    filteredTraces,
    handleTracesScroll,
    showScrollButtons,
    scrollToTop,
    scrollToBottom,
  ])

  const metricsContent = useMemo(() => {
    if (metricsLoading) {
      return <MetricsSkeleton />
    }

    if (metricsError) {
      return (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Metrics</h3>
              <p className="text-sm text-destructive/80">{metricsError}</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!metrics || !metrics.metrics?.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No metrics available</h3>
              <p className="text-sm text-muted-foreground">
                Metrics will appear here when the simulation run generates data. Once the run
                produces metrics, they will be displayed with interactive charts and visualizations.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Filter metrics based on search query
    const filteredMetrics = metrics.metrics.filter((metric) => {
      return (
        metricsSearchQuery === '' ||
        metric.name.toLowerCase().includes(metricsSearchQuery.toLowerCase())
      )
    })

    return (
      <div className="space-y-8">
        {/* Search Filter */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            {/* Search input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search metrics..."
                value={metricsSearchQuery}
                onChange={(e) => setMetricsSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Search results counter */}
          {metricsSearchQuery.trim() && (
            <div className="text-sm text-muted-foreground mt-2">
              {filteredMetrics.length} of {metrics.metrics.length} metrics
            </div>
          )}
        </div>

        {/* Metrics Grid - Batch render for better performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMetrics.map((metric, index) => (
            <div
              key={`${metric.name}-${index}`}
              style={
                {
                  // Stagger chart rendering to reduce initial load impact
                  '--chart-delay': `${Math.min(index * 50, 500)}ms`,
                } as React.CSSProperties
              }
            >
              <MetricCard metric={metric} />
            </div>
          ))}
        </div>
      </div>
    )
  }, [metricsLoading, metricsError, metrics, metricsSearchQuery])

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="sticky top-0 z-10 w-full bg-background px-6 py-4 border-b border-zinc-800 flex-shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${params.pid}/simulations`}>Project</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${params.pid}/simulations/${params.sid}`}>
                Simulation
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Run Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 pb-6 pt-0 flex flex-col">
        <Tabs
          defaultValue="traces"
          className="w-full flex flex-col flex-1"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="traces" className="flex items-center gap-2">
              {isStreaming && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
              Traces ({filteredTraces.length})
            </TabsTrigger>
            <TabsTrigger value="agents">Agents ({agentCount})</TabsTrigger>
            <TabsTrigger value="metrics">Metrics ({totalMetricsCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="traces" className="mt-6 flex-1 min-h-0 flex flex-col">
            {/* Search and filter controls */}
            {!tracesLoading && !tracesError && traces.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-4 items-center">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search traces..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  {/* System traces toggle */}
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Checkbox
                      id="system-traces"
                      checked={showSystemTraces}
                      onCheckedChange={(checked) => setShowSystemTraces(checked as boolean)}
                    />
                    <label
                      htmlFor="system-traces"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Show system traces
                    </label>
                  </div>
                </div>

                {/* Search results counter */}
                {searchQuery.trim() && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {filteredTraces.length} of {traces.length} traces
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0">{tracesContent}</div>
          </TabsContent>

          <TabsContent value="agents" className="mt-6 flex-1">
            <AgentsTab
              runId={params.rid as string}
              agents={agents}
              loading={agentsLoading}
              error={agentsError}
            />
          </TabsContent>

          <TabsContent
            value="metrics"
            className="mt-6 flex-1"
            key={activeTab === 'metrics' ? 'metrics-active' : 'metrics-inactive'}
          >
            {metricsContent}
          </TabsContent>
        </Tabs>
      </div>
      {/* --- FIX: Add scroll arrows as fixed elements on the right side of the screen --- */}
      {activeTab === 'traces' && filteredTraces.length > 0 && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    scrollToTop()
                  }}
                  className="w-12 h-12 bg-background/90 border border-border rounded-full shadow-xl hover:bg-accent flex items-center justify-center group transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Scroll to top (Home)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    scrollToBottom()
                  }}
                  className="w-12 h-12 bg-background/90 border border-border rounded-full shadow-xl hover:bg-accent flex items-center justify-center group transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Scroll to bottom (End)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
