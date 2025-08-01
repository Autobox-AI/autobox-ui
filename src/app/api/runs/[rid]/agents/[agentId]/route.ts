import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rid: string; agentId: string }> }
) {
  try {
    const { rid, agentId } = await params
    const response = await fetch(`${API_BASE_URL}/runs/${rid}/agents/${agentId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch agent' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ rid: string; agentId: string }> }
) {
  try {
    const { rid, agentId } = await params
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/runs/${rid}/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update agent' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
