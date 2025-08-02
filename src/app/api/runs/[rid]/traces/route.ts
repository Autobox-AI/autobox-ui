import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ rid: string }> }) {
  try {
    const { rid } = await context.params
    if (!rid) {
      return NextResponse.json({ error: 'Run ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const stream = searchParams.get('stream')
    const counter = searchParams.get('counter')

    const apiUrl = process.env.API_URL || 'http://localhost:8000'
    let backendUrl = `${apiUrl}/runs/${rid}/traces`

    // Build query parameters
    const queryParams = []
    if (stream) queryParams.push('stream=true')
    if (counter) queryParams.push(`counter=${counter}`)

    if (queryParams.length > 0) {
      backendUrl += '?' + queryParams.join('&')
    }

    // console.log('Traces API - Backend URL:', backendUrl)
    // console.log('Traces API - Stream:', stream)
    // console.log('Traces API - Counter:', counter)

    if (stream) {
      // Handle streaming response
      const response = await fetch(backendUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(30000), // 30 second timeout
        headers: {
          Accept: 'text/event-stream',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
        return NextResponse.json(
          { error: `Failed to fetch run traces: ${response.statusText}` },
          { status: response.status }
        )
      }

      // Forward the SSE response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable Nginx buffering
        },
      })
    } else {
      // Handle regular JSON response
      const response = await fetch(backendUrl, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
        return NextResponse.json(
          { error: `Failed to fetch run traces: ${response.statusText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error fetching run traces:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching run traces' },
      { status: 500 }
    )
  }
}
