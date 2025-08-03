'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialMessage = searchParams.get('message') || ''

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialized = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialMessage && !hasInitialized.current) {
      hasInitialized.current = true
      handleSendMessage(initialMessage)
    }
  }, [initialMessage])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if user is already typing in the input field
      if (e.target === inputRef.current) return

      // Skip if user is interacting with other form elements
      const tagName = (e.target as HTMLElement).tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return

      // Skip if modifier keys are pressed (except shift for capital letters)
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Focus on the input if it's a printable character
      const isPrintableChar = e.key.length === 1
      if (isPrintableChar && inputRef.current) {
        inputRef.current.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [])

  const simulateStreaming = (fullText: string, messageId: string) => {
    let currentIndex = 0
    const words = fullText.split(' ')

    streamingIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        const partialContent = words.slice(0, currentIndex + 1).join(' ')
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content: partialContent } : msg))
        )
        currentIndex++
      } else {
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current)
        }
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg))
        )
        setIsLoading(false)
      }
    }, 100) // Simulate word-by-word streaming every 100ms
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim()
    if (!text) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          isFirstMessage: messages.length === 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Simulate streaming the response
      simulateStreaming(data.message, assistantMessage.id)
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage()
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="border-b p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Autobox Assistant</h1>
          <span className="text-base text-muted-foreground ml-auto">Demo Mode</span>
        </div>

        {/* Messages Container */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <h2 className="text-3xl mb-2 text-foreground">Welcome to Autobox Assistant</h2>
                <p className="text-base">
                  This is a demo chat interface. No real LLM is connected.
                </p>
                <p className="text-base mt-2">Ask me about agent-based simulations!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <Card
                  className={cn(
                    'max-w-[80%] px-4 py-3',
                    message.role === 'user' ? 'bg-muted' : 'bg-background border-muted'
                  )}
                >
                  <p className="text-base whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-muted-foreground animate-pulse ml-1" />
                    )}
                  </p>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Container */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled size="icon" variant="outline" className="h-12 w-12">
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>File upload is under construction</p>
              </TooltipContent>
            </Tooltip>
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 h-12 text-base px-4"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="h-12 w-12"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
