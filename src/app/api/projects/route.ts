import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.API_URL
    const response = await fetch(`${apiUrl}/projects`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}
