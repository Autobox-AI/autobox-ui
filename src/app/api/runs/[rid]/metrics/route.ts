import { NextRequest, NextResponse } from 'next/server'

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
  type: string // Backend sends uppercase like "COUNTER", "GAUGE", etc.
}

interface FlattenedMetric extends MetricDefinition {
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const { rid } = await params

    if (!rid) {
      return NextResponse.json({ error: 'Run ID is required' }, { status: 400 })
    }

    const apiUrl = process.env.API_URL || 'http://localhost:8000'
    const backendUrl = `${apiUrl}/runs/${rid}/metrics`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)

      return NextResponse.json(
        { error: `Failed to fetch metrics: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Process the metrics from the new backend schema
    const flattenedMetrics: FlattenedMetric[] = []

    // Backend now sends metrics in a single array with type field
    if (data.metrics && Array.isArray(data.metrics)) {
      data.metrics.forEach((metric: MetricDefinition) => {
        // Convert backend type (uppercase) to frontend type (lowercase)
        const frontendType = metric.type.toLowerCase() as 'counter' | 'gauge' | 'histogram' | 'summary'
        flattenedMetrics.push({ ...metric, type: frontendType })
      })
    }

    // Forward cache headers from backend if available
    const cacheControl = response.headers.get('Cache-Control')
    const etag = response.headers.get('ETag')
    const lastModified = response.headers.get('Last-Modified')
    
    const responseHeaders: Record<string, string> = {}
    if (cacheControl) responseHeaders['Cache-Control'] = cacheControl
    if (etag) responseHeaders['ETag'] = etag
    if (lastModified) responseHeaders['Last-Modified'] = lastModified
    
    return NextResponse.json({ metrics: flattenedMetrics }, { headers: responseHeaders })
  } catch (error) {
    console.error('Error fetching metrics:', error)

    return NextResponse.json(
      { error: 'Internal server error while fetching metrics' },
      { status: 500 }
    )
  }
}
