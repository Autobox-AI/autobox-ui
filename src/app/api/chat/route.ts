import { NextRequest, NextResponse } from 'next/server'

const disclaimerMessage = `🤖 **Welcome to Autobox Assistant Demo!**

This is a demo chat interface. There is no real LLM connected - all responses are pre-generated for demonstration purposes.

I can help you learn about agent-based simulations and the Autobox platform. Feel free to ask me questions!`

const agentQuotes = [
  'Agent-based simulations allow you to model complex systems by defining individual agents with their own behaviors, goals, and interactions.',
  'In Autobox, agents can represent anything from people in a social network to components in a supply chain, each with unique decision-making capabilities.',
  'The power of multi-agent systems lies in emergent behavior - simple agent rules can lead to surprisingly complex system-wide patterns.',
  'Autobox enables you to orchestrate conversations between AI agents, letting them negotiate, collaborate, and solve problems together.',
  'Unlike traditional simulations, agent-based models in Autobox can leverage LLMs to create agents that reason, adapt, and learn from their interactions.',
  'Each agent in an Autobox simulation maintains its own state, memory, and objectives, allowing for realistic modeling of autonomous entities.',
  "Autobox's distributed architecture allows simulations to scale from simple two-agent negotiations to complex multi-stakeholder scenarios.",
  "By combining agent-based modeling with modern AI, Autobox opens new possibilities for exploring 'what-if' scenarios in business, policy, and research.",
  'The trace system in Autobox captures every agent interaction, providing complete visibility into how decisions emerge from agent communications.',
  'Autobox simulations can model everything from market dynamics to organizational behavior, with agents that truly understand context and adapt their strategies.',
]

export async function POST(request: NextRequest) {
  try {
    const { message, isFirstMessage } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // If mocks are enabled, return mock response
    if (process.env.NEXT_PUBLIC_MOCKS_ENABLED === 'true') {
      const randomQuote = agentQuotes[Math.floor(Math.random() * agentQuotes.length)]

      // Add a small delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      let responseMessage = ''
      if (isFirstMessage) {
        responseMessage = `${disclaimerMessage}\n\n💡 **Did you know?**\n${randomQuote}`
      } else {
        responseMessage = `💡 **Did you know?**\n${randomQuote}`
      }

      return NextResponse.json({
        message: responseMessage,
        timestamp: new Date().toISOString(),
      })
    }

    // Otherwise, forward to the actual backend API
    const apiUrl = process.env.API_URL
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error('Failed to get chat response')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Chat service is not available. Please try again later.' },
      { status: 503 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}
