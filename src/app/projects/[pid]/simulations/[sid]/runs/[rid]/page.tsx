'use client'

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
import { Input } from '@/components/ui/input'
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
import { format } from 'date-fns'
import { useParams } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

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
}

interface MetricsResponse {
  counters: MetricDefinition[]
  gauges: MetricDefinition[]
  histograms: MetricDefinition[]
  summaries: MetricDefinition[]
}

// Pre-computed colors array to avoid recreation
const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

// Optimized trace item with aggressive memoization
const TraceItem = memo(({ trace, index }: { trace: Trace; index: number }) => {
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
              <Badge variant="outline" className="font-semibold">
                {trace.from}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">TO:</span>
              <Badge variant="outline" className="font-semibold">
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
const DebugMetricTable = ({ data, groupKeys }: { data: any[]; groupKeys?: string[] }) => (
  <div className="mt-4">
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Time</TableHead>
            {groupKeys && groupKeys.length > 0 ? (
              groupKeys.map((key) => (
                <TableHead key={key} className="text-center">
                  {key}
                </TableHead>
              ))
            ) : (
              <TableHead className="text-center">Value</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 5).map((row, i) => (
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
    {data.length > 5 && (
      <div className="text-xs text-muted-foreground mt-2 text-center">
        ...and {data.length - 5} more data points
      </div>
    )}
  </div>
)

// Simple chart component without lazy loading
const MetricChart = memo(
  ({ metric, metricType }: { metric: MetricDefinition; metricType: string }) => {
    // Pivot data: each tag group is a separate line, X axis is union of all timestamps
    const { _chartData, mergedData, groupKeys } = useMemo(() => {
      if (!metric.data?.length) return { _chartData: [], mergedData: [], groupKeys: [] }

      if (metric.tag_definitions.length > 0) {
        // Group by tagKey
        const groupedData: Record<string, any[]> = {}
        const allTimestamps = new Set<string>()
        metric.data.forEach((point) => {
          const tagKey = metric.tag_definitions.map((tag) => point.tags[tag.tag]).join('_')
          if (!groupedData[tagKey]) groupedData[tagKey] = []
          groupedData[tagKey].push({
            time: new Date(point.time).getTime(),
            value: point.value,
            name: tagKey,
            timestamp: format(new Date(point.time), 'HH:mm:ss'),
          })
          allTimestamps.add(point.time)
        })
        // Build mergedData: one row per timestamp, each group as a key
        const timestamps = Array.from(allTimestamps).sort()
        const mergedData = timestamps.map((time) => {
          const row: any = {
            time: new Date(time).getTime(),
            timestamp: format(new Date(time), 'HH:mm:ss'),
          }
          Object.entries(groupedData).forEach(([tagKey, arr]) => {
            const found = arr.find((d) => d.time === row.time)
            row[tagKey] = found ? found.value : null
          })
          return row
        })
        return { _chartData: groupedData, mergedData, groupKeys: Object.keys(groupedData) }
      }
      // No tags: single line
      const mergedData = metric.data.map((point) => ({
        time: new Date(point.time).getTime(),
        value: point.value,
        timestamp: format(new Date(point.time), 'HH:mm:ss'),
      }))
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

    useEffect(() => {
      if (!containerRef.current) return
      const ro = new window.ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'))
      })
      ro.observe(containerRef.current)
      return () => ro.disconnect()
    }, [])

    if (!metric.data?.length || !mergedData.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-muted-foreground">No data available for {metric.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Data points: {metric.data?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (allZero) {
      return (
        <Card className="border-dashed border-yellow-500/50">
          <CardContent className="flex flex-col items-center justify-center h-32">
            <div className="text-center">
              <p className="text-yellow-500 font-medium">All values are zero for {metric.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Data points: {mergedData.length}</p>
            </div>
            <DebugMetricTable data={mergedData} groupKeys={groupKeys} />
          </CardContent>
        </Card>
      )
    }

    // Unique key for chart and container
    const chartKey = `${metric.name}-${mergedData.length}`

    return (
      <div
        ref={containerRef}
        className="w-full border rounded-lg p-4 bg-card"
        style={{ height: 320, minWidth: 400 }}
      >
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
                    dot={{ r: 4, fill: CHART_COLORS[index % CHART_COLORS.length] }}
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
                  dot={{ r: 4, fill: CHART_COLORS[0] }}
                  activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
        <DebugMetricTable data={mergedData} groupKeys={groupKeys} />
      </div>
    )
  }
)

MetricChart.displayName = 'MetricChart'

// Optimized metric card using shadcn/ui Card components
const MetricCard = memo(
  ({ metric, metricType }: { metric: MetricDefinition; metricType: string }) => {
    const dataPointCount = metric.data?.length || 0
    const hasTags = metric.tag_definitions.length > 0

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
          <MetricChart metric={metric} metricType={metricType} />
        </CardContent>
      </Card>
    )
  }
)

MetricCard.displayName = 'MetricCard'

// Optimized metrics section with lazy loading
const MetricsSection = memo(
  ({
    title,
    metrics,
    metricType,
  }: {
    title: string
    metrics: MetricDefinition[]
    metricType: string
  }) => {
    if (!metrics.length) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Badge variant="secondary">{metrics.length} metrics</Badge>
        </div>
        <div className="grid gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={`${metric.name}-${index}`} metric={metric} metricType={metricType} />
          ))}
        </div>
      </div>
    )
  }
)

MetricsSection.displayName = 'MetricsSection'

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
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">Loading Metrics</h2>
        <p className="text-sm text-zinc-500">Please wait while we fetch the metrics data...</p>
      </div>
    </div>

    <div className="space-y-6 w-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
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
  const [traces, setTraces] = useState<Trace[]>([])
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [tracesLoading, setTracesLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [tracesError, setTracesError] = useState<string | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('traces')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSystemTraces, setShowSystemTraces] = useState(true)
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
    return (
      (metrics.counters?.length || 0) +
      (metrics.gauges?.length || 0) +
      (metrics.histograms?.length || 0) +
      (metrics.summaries?.length || 0)
    )
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

  // Streaming traces setup
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

            // console.log('Streaming update:', {
            //   received: 1,
            //   existing: prevTraces.length,
            //   total: sortedTraces.length,
            // })

            // console.log('Updated traces count:', sortedTraces.length)
            return sortedTraces
          })

          // Set loading to false after we receive a trace
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
      const response = await fetch(`/api/runs/${params.rid}/metrics`)
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
  }, [params.rid])

  // Update function refs after function declarations
  useEffect(() => {
    setupTracesStreamingRef.current = setupTracesStreaming
    fetchMetricsRef.current = fetchMetrics
    fetchTracesRef.current = fetchTraces
  }, [setupTracesStreaming, fetchMetrics, fetchTraces])

  // Setup streaming on mount - only run once when component mounts or params.rid changes
  useEffect(() => {
    if (params.rid) {
      // Try streaming first, fallback to regular fetch if it fails
      const eventSource = setupTracesStreaming()
      fetchMetrics()

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
  }, [params.rid, setupTracesStreaming, fetchMetrics, fetchTraces])

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
      <div className="relative flex-1 min-h-0">
        {/* Main scrollable content */}
        <div
          ref={tracesScrollRef}
          className="flex-1 min-h-0 overflow-y-auto pr-4"
          onScroll={handleTracesScroll}
          style={{ height: '100%' }}
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
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{metricsError}</p>
          </CardContent>
        </Card>
      )
    }

    if (!metrics) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-muted-foreground">No metrics available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Metrics will appear here when the simulation run generates data
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-8">
        <MetricsSection title="Counters" metrics={metrics.counters || []} metricType="counter" />
        <MetricsSection title="Gauges" metrics={metrics.gauges || []} metricType="gauge" />
        <MetricsSection
          title="Histograms"
          metrics={metrics.histograms || []}
          metricType="histogram"
        />
        <MetricsSection title="Summaries" metrics={metrics.summaries || []} metricType="summary" />
      </div>
    )
  }, [metricsLoading, metricsError, metrics])

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

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col">
        <Tabs
          defaultValue="traces"
          className="w-full flex flex-col flex-1"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="traces" className="flex items-center gap-2">
              {isStreaming && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
              Traces ({filteredTraces.length})
            </TabsTrigger>
            <TabsTrigger value="metrics">Metrics ({totalMetricsCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="traces" className="mt-6 flex-1 min-h-0 flex flex-col">
            {/* Search and filter controls - sticky and always visible */}
            {!tracesLoading && !tracesError && traces.length > 0 && (
              <Card className="mb-6 sticky top-0 z-20 flex-shrink-0 bg-background/95 backdrop-blur-sm border-b shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {/* Search input */}
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <Input
                        type="text"
                        placeholder="Search traces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Search results counter */}
                    {searchQuery.trim() && (
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {filteredTraces.length} of {traces.length} traces
                      </div>
                    )}

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
                </CardContent>
              </Card>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">{tracesContent}</div>
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
      {activeTab === 'traces' && traces.length > 0 && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={scrollToTop}
                  className="w-12 h-12 bg-background/90 border border-border rounded-full shadow-xl hover:bg-accent flex items-center justify-center group transition-all duration-200"
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
                  onClick={scrollToBottom}
                  className="w-12 h-12 bg-background/90 border border-border rounded-full shadow-xl hover:bg-accent flex items-center justify-center group transition-all duration-200"
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
