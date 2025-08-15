import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.API_URL
    const response = await fetch(`${apiUrl}/organizations`, {
      cache: 'force-cache',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch organizations')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}
