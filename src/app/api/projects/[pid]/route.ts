import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const apiUrl = process.env.API_URL
    const { pid } = await params
    const response = await fetch(`${apiUrl}/projects/${pid}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch project:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        { error: `Failed to fetch project: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await params
    const apiUrl = process.env.API_URL
    const organizationId = process.env.ORG_ID

    const response = await fetch(`${apiUrl}/organizations/${organizationId}/projects/${pid}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to delete project:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        { error: `Failed to delete project: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project. Please try again later.' },
      { status: 503 }
    )
  }
}
