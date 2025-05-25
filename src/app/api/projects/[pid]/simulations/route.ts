import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { pid: string } }) {
  try {
    const projectId = await Promise.resolve(params.pid)
    const response = await fetch(`http://localhost:8080/projects/${projectId}/simulations`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch simulations:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        { error: `Failed to fetch simulations: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data.simulations)
  } catch (error) {
    console.error('Error fetching simulations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
