import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ rid: string }> }) {
  try {
    const { rid } = await context.params
    if (!rid) {
      return NextResponse.json({ error: 'Run ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const stream = searchParams.get('stream')

    const apiUrl = process.env.API_URL || 'http://localhost:8000'
    const backendUrl = `${apiUrl}/runs/${rid}/traces${stream ? '?stream=true' : ''}`

    if (stream) {
      // Handle streaming response
      const response = await fetch(backendUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(30000), // 30 second timeout
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
