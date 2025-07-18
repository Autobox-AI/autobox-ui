import { BookmarksResponseSchema, CreateBookmarkSchema } from '@/schemas'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const apiUrl = process.env.API_URL

    // Build query params for backend API
    const queryParams = new URLSearchParams()
    if (type) {
      queryParams.append('type', type)
    }

    const backendUrl = `${apiUrl}/bookmarks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(backendUrl, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks from backend')
    }

    const data = await response.json()

    // Validate response with schema
    const validatedResponse = BookmarksResponseSchema.parse(data)

    return NextResponse.json(validatedResponse)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const createBookmarkData = CreateBookmarkSchema.parse(body)
    const apiUrl = process.env.API_URL

    // Forward the request to backend API
    const response = await fetch(`${apiUrl}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBookmarkData),
    })

    if (!response.ok) {
      throw new Error('Failed to create/toggle bookmark in backend')
    }

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}
