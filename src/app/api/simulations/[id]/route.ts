import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUrl = process.env.API_URL
    const { id } = await params
    const response = await fetch(`${apiUrl}/simulations/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch simulation')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch simulation' }, { status: 500 })
  }
}
