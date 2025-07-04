import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const { rid } = await params
    const response = await fetch(`http://localhost:8080/runs/${rid}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch run')
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 })
  }
}
