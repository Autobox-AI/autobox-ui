import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const apiUrl = process.env.API_URL

    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return NextResponse.json(
        { error: 'API_URL environment variable is not set' },
        { status: 500 }
      )
    }

    const response = await fetch(`${apiUrl}/organizations/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch organization:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        organizationId: id,
      })
      return NextResponse.json(
        { error: `Failed to fetch organization: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
