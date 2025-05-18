'use client'

import { CounterMetric } from '@/components/metrics/CounterMetric'
import { GaugeMetric } from '@/components/metrics/GaugeMetric'
import { HistogramMetric } from '@/components/metrics/HistogramMetric'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metric } from '@/lib/services/metrics'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface TimeSeriesData {
  timestamp: string
  value: number
}

async function fetchMetrics(): Promise<Metric[]> {
  try {
    const response = await fetch('http://localhost:8080/metrics/simulations/83c006c4-ecf1-404d-afe3-7eb0ff152c49/runs/e8aab6d4-11a2-4cc2-badd-022fdaf8b04c')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const text = await response.text()

    // Parse the Prometheus format metrics
    const lines = text.split('\n')
    const metrics: Record<string, Metric> = {}
    let currentMetric: Partial<Metric> | null = null

    lines.forEach(line => {
      if (line.startsWith('# HELP')) {
        const [, name, help] = line.match(/# HELP ([^ ]+) (.+)/) || []
        if (name && help) {
          currentMetric = {
            name,
            help,
            type: 'counter', // default type
            values: []
          }
        }
      } else if (line.startsWith('# TYPE')) {
        const [, name, type] = line.match(/# TYPE ([^ ]+) ([^ ]+)/) || []
        if (name && type && currentMetric) {
          currentMetric.type = type as Metric['type']
          if (type === 'histogram') {
            currentMetric.buckets = []
          }
          if (!currentMetric.values) {
            currentMetric.values = []
          }
          metrics[name] = currentMetric as Metric
        }
      } else if (line.trim() && !line.startsWith('#')) {
        const match = line.match(/^([^{]+)({[^}]+})?[ ]+([0-9.]+)/)
        if (match && currentMetric) {
          const [, name, labelsStr, value] = match
          const labels = labelsStr ? JSON.parse(labelsStr.replace(/([a-zA-Z0-9_]+)="([^"]+)"/g, '"$1":"$2"')) : {}

          if (currentMetric.type === 'histogram' && name.endsWith('_bucket')) {
            const le = labels.le
            if (!currentMetric.buckets) currentMetric.buckets = []
            currentMetric.buckets.push({ le, count: parseFloat(value) })
          } else {
            if (!currentMetric.values) currentMetric.values = []
            currentMetric.values.push({ value: parseFloat(value), labels })
          }
        }
      }
    })

    return Object.values(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchMetrics()
        const now = new Date().toISOString()

        // Update time series data for any counter metric
        const counterMetric = data.find(m => m.type === 'counter')
        if (counterMetric) {
          setTimeSeriesData(prev => {
            const newData = [...prev, { timestamp: now, value: counterMetric.values[0]?.value || 0 }]
            return newData.slice(-10)
          })
        }

        setMetrics(data)
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
        {metrics.map((metric, i) => {
          switch (metric.type) {
            case 'counter':
              return <CounterMetric key={i} metric={metric} />
            case 'gauge':
              return <GaugeMetric key={i} metric={metric} />
            case 'histogram':
              return <HistogramMetric key={i} metric={metric} />
            default:
              return null
          }
        })}
      </div>

      {timeSeriesData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Metrics Over Time</CardTitle>
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
                    formatter={(value) => [value, 'Value']}
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
      )}
    </div>
  )
}
