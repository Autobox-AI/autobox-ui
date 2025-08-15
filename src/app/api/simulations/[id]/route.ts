import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUrl = process.env.API_URL
    const { id } = await params
    const response = await fetch(`${apiUrl}/simulations/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // next: { revalidate: 60 }, // Cache for 1 minute
      cache: 'force-cache',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch simulation')
    }

    const data = await response.json()

    // Add cache headers for client-side caching
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch simulation' }, { status: 500 })
  }
}
