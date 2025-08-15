import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await params
    const projectId = await Promise.resolve(pid)
    const apiUrl = process.env.API_URL
    console.log('Fetching simulations from:', `${apiUrl}/projects/${projectId}/simulations`)

    const response = await fetch(`${apiUrl}/projects/${projectId}/simulations`, {
      cache: 'force-cache',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch simulations:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${apiUrl}/projects/${projectId}/simulations`,
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

export async function POST(request: Request, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await params
    const projectId = await Promise.resolve(pid)
    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return NextResponse.json(
        { error: 'API_URL environment variable is not set' },
        { status: 500 }
      )
    }

    const body = await request.json()

    console.log('Creating simulation with:', {
      url: `${apiUrl}/projects/${projectId}/simulations`,
      body: JSON.stringify(body, null, 2),
    })

    const response = await fetch(`${apiUrl}/projects/${projectId}/simulations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (_e) {
      responseData = responseText
    }

    if (!response.ok) {
      console.error('Failed to create simulation:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        url: `${apiUrl}/projects/${projectId}/simulations`,
        requestBody: body,
      })
      return NextResponse.json(
        {
          error: `Failed to create simulation: ${response.status} ${response.statusText}`,
          details: responseData,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error creating simulation:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
