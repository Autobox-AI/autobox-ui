import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const itemId = searchParams.get('item_id')
    const apiUrl = process.env.API_URL

    if (!type || !itemId) {
      return NextResponse.json({ error: 'type and item_id are required' }, { status: 400 })
    }

    // Build query params for backend API
    const queryParams = new URLSearchParams()
    queryParams.append('type', type)
    queryParams.append('item_id', itemId)

    const response = await fetch(`${apiUrl}/bookmarks/check?${queryParams.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 400) {
        return NextResponse.json({ error: 'type and item_id are required' }, { status: 400 })
      }
      throw new Error('Failed to check bookmark in backend')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error checking bookmark:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}
