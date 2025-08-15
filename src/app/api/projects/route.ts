import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.API_URL
    const organizationId = process.env.ORG_ID
    const response = await fetch(`${apiUrl}/organizations/${organizationId}/projects`, {
      cache: 'force-cache',
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

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.API_URL
    const organizationId = process.env.ORG_ID
    const body = await request.json()

    const response = await fetch(`${apiUrl}/organizations/${organizationId}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to create project')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project. Please try again later.' },
      { status: 503 }
    )
  }
}
