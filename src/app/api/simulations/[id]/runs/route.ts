import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUrl = process.env.API_URL
    const { id } = await params
    const response = await fetch(`${apiUrl}/simulations/${id}/runs`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch simulation runs')
    }

    const data = await response.json()

    // Forward cache headers from backend if available
    const cacheControl = response.headers.get('Cache-Control')
    const etag = response.headers.get('ETag')
    const lastModified = response.headers.get('Last-Modified')

    const responseHeaders: Record<string, string> = {}
    if (cacheControl) responseHeaders['Cache-Control'] = cacheControl
    if (etag) responseHeaders['ETag'] = etag
    if (lastModified) responseHeaders['Last-Modified'] = lastModified

    // Add additional client-side cache headers
    responseHeaders['Cache-Control'] =
      responseHeaders['Cache-Control'] || 'public, max-age=10, stale-while-revalidate=30'

    return NextResponse.json(data, { headers: responseHeaders })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch simulation runs' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUrl = process.env.API_URL
    const { id } = await params
    const body = await request.json()

    const response = await fetch(`${apiUrl}/simulations/${id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to create simulation run')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating simulation run:', error)
    return NextResponse.json(
      { error: 'Failed to create simulation run. Please try again later.' },
      { status: 503 }
    )
  }
}
