import { NextRequest, NextResponse } from 'next/server'

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
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching metrics:', error)

    return NextResponse.json(
      { error: 'Internal server error while fetching metrics' },
      { status: 500 }
    )
  }
}
