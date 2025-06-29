import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.API_URL
    console.log('Fetching metric templates from:', `${apiUrl}/templates/metrics`)

    const response = await fetch(`${apiUrl}/templates/metrics`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch metric templates:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${apiUrl}/templates/metrics`,
      })
      return NextResponse.json(
        { error: `Failed to fetch metric templates: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching metric templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return NextResponse.json(
        { error: 'API_URL environment variable is not set' },
        { status: 500 }
      )
    }

    const body = await request.json()

    console.log('Creating metric template with:', {
      url: `${apiUrl}/templates/metrics`,
      body: JSON.stringify(body, null, 2),
    })

    const response = await fetch(`${apiUrl}/templates/metrics`, {
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
      console.error('Failed to create metric template:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        url: `${apiUrl}/templates/metrics`,
        requestBody: body,
      })
      return NextResponse.json(
        {
          error: `Failed to create metric template: ${response.status} ${response.statusText}`,
          details: responseData,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error creating metric template:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return NextResponse.json(
        { error: 'API_URL environment variable is not set' },
        { status: 500 }
      )
    }

    const body = await request.json()

    console.log('Updating metric template with:', {
      url: `${apiUrl}/templates/metrics`,
      body: JSON.stringify(body, null, 2),
    })

    const response = await fetch(`${apiUrl}/templates/metrics`, {
      method: 'PUT',
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
      console.error('Failed to update metric template:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        url: `${apiUrl}/templates/metrics`,
        requestBody: body,
      })
      return NextResponse.json(
        {
          error: `Failed to update metric template: ${response.status} ${response.statusText}`,
          details: responseData,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error updating metric template:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return NextResponse.json(
        { error: 'API_URL environment variable is not set' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    console.log('Deleting metric template:', {
      url: `${apiUrl}/templates/metrics?id=${id}`,
    })

    const response = await fetch(`${apiUrl}/templates/metrics?id=${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to delete metric template:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${apiUrl}/templates/metrics?id=${id}`,
      })
      return NextResponse.json(
        { error: `Failed to delete metric template: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting metric template:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
