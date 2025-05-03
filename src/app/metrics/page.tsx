'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ArrowDownRight, ArrowUpRight, BarChart2, CheckCircle, Clock, Users, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MetricData {
  name: string
  value: number
  change?: number
  trend?: 'up' | 'down'
  icon: React.ElementType
}

interface TimeSeriesData {
  timestamp: string
  value: number
}

async function fetchMetrics(): Promise<any> {
  try {
    const response = await fetch('http://localhost:8000/metrics')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const text = await response.text()

    // Parse the Prometheus format metrics
    const lines = text.split('\n')
    const metrics: Record<string, number> = {}

    lines.forEach(line => {
      if (!line.startsWith('#') && line.trim()) {
        const match = line.match(/^([^{]+)({[^}]+})?[ ]+([0-9.]+)/)
        if (match) {
          const [, name, labels, value] = match
          metrics[name.trim()] = parseFloat(value)
        }
      }
    })

    return metrics
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchMetrics()
        const now = new Date().toISOString()

        // Update time series data
        setTimeSeriesData(prev => {
          const newData = [...prev, { timestamp: now, value: data.decision_rounds || 0 }]
          // Keep only last 10 data points
          return newData.slice(-10)
        })

        const metricsData: MetricData[] = [
          {
            name: 'Success Rate',
            value: data.final_agreement_score || 0,
            change: 5,
            trend: 'up',
            icon: CheckCircle,
          },
          {
            name: 'Active Users',
            value: data.nodejs_active_resources_total || 0,
            change: 12,
            trend: 'up',
            icon: Users,
          },
          {
            name: 'Average Runtime',
            value: Number((data.http_request_duration_seconds_sum / (data.http_request_duration_seconds_count || 1)).toFixed(2)),
            change: -2,
            trend: 'down',
            icon: Clock,
          },
          {
            name: 'Decision Rounds',
            value: data.decision_rounds || 0,
            change: 0,
            trend: 'up',
            icon: Activity,
          },
          {
            name: 'Error Rate',
            value: Number(((data.http_request_duration_seconds_count_404 || 0) / (data.http_request_duration_seconds_count || 1) * 100).toFixed(1)),
            change: -1,
            trend: 'down',
            icon: XCircle,
          },
          {
            name: 'Memory Usage (MB)',
            value: Math.round(data.process_resident_memory_bytes / (1024 * 1024)) || 0,
            change: 3,
            trend: 'up',
            icon: BarChart2,
          }
        ]

        setMetrics(metricsData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 ml-[var(--sidebar-width-icon)] md:ml-[220px]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Real-time metrics from your simulations and system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change !== undefined && (
                <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>{metric.change}% from last hour</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Decision Rounds Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value) => [value, 'Decision Rounds']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}