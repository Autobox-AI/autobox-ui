import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const apiUrl = process.env.API_URL
    const organizationId = process.env.ORG_ID

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is not configured' },
        { status: 400 }
      )
    }

    const response = await fetch(`${apiUrl}/organizations/${organizationId}/bookmarks/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
      }
      throw new Error('Failed to delete bookmark from backend')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const apiUrl = process.env.API_URL
    const organizationId = process.env.ORG_ID

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is not configured' },
        { status: 400 }
      )
    }

    const response = await fetch(`${apiUrl}/organizations/${organizationId}/bookmarks/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
      }
      throw new Error('Failed to fetch bookmark from backend')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching bookmark:', error)
    return NextResponse.json(
      { error: 'Backend service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}
