import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { pid: string } }) {
  try {
    const { pid } = await params
    const response = await fetch(`http://localhost:8080/projects/${pid}`, {
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
