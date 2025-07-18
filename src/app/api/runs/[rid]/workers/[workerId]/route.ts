import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rid: string; workerId: string }> }
) {
  try {
    const { rid, workerId } = await params
    const response = await fetch(`${API_BASE_URL}/runs/${rid}/workers/${workerId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch worker' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching worker:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ rid: string; workerId: string }> }
) {
  try {
    const { rid, workerId } = await params
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/runs/${rid}/workers/${workerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update worker' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating worker:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
