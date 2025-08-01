import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const apiUrl = process.env.API_URL
    const { rid } = await params
    const response = await fetch(`${apiUrl}/runs/${rid}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch run')
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

    return NextResponse.json(data, { headers: responseHeaders })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 })
  }
}
