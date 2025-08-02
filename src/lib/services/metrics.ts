export interface MetricLabel {
  simulation_id: string
  simulation_name: string
  agent_name: string
  app: string
  [key: string]: string // For any additional labels
}

export interface MetricValue {
  labels: MetricLabel
  value: number
}

export interface HistogramBucket {
  le: string
  count: number
}

export interface Metric {
  name: string
  help: string
  type: 'gauge' | 'counter' | 'histogram'
  values: MetricValue[]
  // Additional fields for histogram
  buckets?: HistogramBucket[]
  sum?: number
  count?: number
}

export async function fetchMetrics(): Promise<Metric[]> {
  try {
    console.log('Fetching metrics from /api/metrics')
    const response = await fetch('/api/metrics', {
      headers: {
        Accept: 'text/plain',
        Origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8888',
      },
      credentials: 'include',
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    console.log('Response text length:', text.length)
    console.log('First 100 chars of response:', text.substring(0, 100))

    const parsedMetrics = parsePrometheusMetrics(text)
    console.log('Parsed metrics count:', parsedMetrics.length)
    console.log(
      'Available metric names:',
      parsedMetrics.map((m) => m.name)
    )

    return parsedMetrics
  } catch (error) {
    console.error('Error in fetchMetrics:', error)
    throw error
  }
}

function parsePrometheusMetrics(metricsText: string): Metric[] {
  const lines = metricsText.split('\n')
  const metrics: Map<string, Metric> = new Map()
  let currentMetric: Metric | null = null

  for (const line of lines) {
    if (line.startsWith('# HELP')) {
      const [, name, help] = line.match(/# HELP\s+(\S+)\s+(.+)/) || []
      currentMetric = {
        name,
        help,
        type: 'gauge', // Will be updated when we find TYPE
        values: [],
      }
      metrics.set(name, currentMetric)
    } else if (line.startsWith('# TYPE')) {
      const [, name, type] = line.match(/# TYPE\s+(\S+)\s+(\S+)/) || []
      const metric = metrics.get(name)
      if (metric) {
        metric.type = type as 'gauge' | 'counter' | 'histogram'
        if (type === 'histogram') {
          metric.buckets = []
        }
      }
    } else if (line && !line.startsWith('#')) {
      const metric = currentMetric
      if (!metric) continue

      if (metric.type === 'histogram') {
        if (line.includes('_bucket')) {
          const match = line.match(/\{(.+?)\}\s+(\d+)/)
          if (match) {
            const labels = parseLabels(match[1])
            const value = parseFloat(match[2])
            const le = labels.le
            delete labels.le
            metric.buckets?.push({ le, count: value })
          }
        } else if (line.includes('_sum')) {
          const match = line.match(/\{(.+?)\}\s+(\d+)/)
          if (match) {
            metric.sum = parseFloat(match[2])
          }
        } else if (line.includes('_count')) {
          const match = line.match(/\{(.+?)\}\s+(\d+)/)
          if (match) {
            metric.count = parseFloat(match[2])
          }
        }
      } else {
        const match = line.match(/\{(.+?)\}\s+(\S+)/)
        if (match) {
          const labels = parseLabels(match[1])
          const value = parseFloat(match[2])
          metric.values.push({ labels, value })
        }
      }
    }
  }

  return Array.from(metrics.values())
}

function parseLabels(labelsString: string): MetricLabel {
  const labels: { [key: string]: string } = {}
  const pairs = labelsString.match(/(\w+)="([^"]+)"/g) || []

  for (const pair of pairs) {
    const [key, value] = pair.replace(/"/g, '').split('=')
    labels[key] = value
  }

  return labels as MetricLabel
}
