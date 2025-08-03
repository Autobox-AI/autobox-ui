'use client'

import OptimizedImage from '@/components/OptimizedImage'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if (message.trim()) {
      router.push(`/chat?message=${encodeURIComponent(message)}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }
  const sections = [
    {
      title: 'Projects',
      description: 'Explore your projects and manage simulations.',
      link: '/projects',
      image: '/assets/autobox-projects.webp',
    },
    {
      title: 'Examples',
      description: 'Browse example simulations and use cases.',
      link: '/examples',
      image: '/assets/autobox-examples.webp',
    },
    {
      title: 'Usage',
      description: 'Learn how to use Autobox effectively.',
      link: '/usage',
      image: '/assets/autobox-usage.webp',
    },
    {
      title: 'Documentation',
      description: 'Find detailed information about Autobox features.',
      link: '/documentation',
      image: '/assets/autobox-documentation.webp',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">Autobox</h1>
        <p className="text-lg text-muted-foreground">The playground for your mind</p>
      </div>
      {/* Message Input and Send Button */}
      <div className="w-full max-w-4xl mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Start your simulation idea..."
            className="w-full h-14 p-4 pr-12 rounded-full border border-gray-400 bg-black text-white caret-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSendMessage}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Chat Triggers */}
      <div className="w-full max-w-4xl mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            'Create a climate negotiation simulation',
            'Design a marketplace with AI traders',
            'Build a collaborative problem-solving scenario',
            'Set up a multi-agent debate on ethics',
          ].map((trigger, index) => (
            <button
              key={index}
              onClick={() => {
                router.push(`/chat?message=${encodeURIComponent(trigger)}`)
              }}
              className="p-3 text-xs text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 text-left"
            >
              {trigger}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
        {sections.map((item, index) => (
          <Link href={item.link} key={index}>
            <Card className="border border-gray-700 hover:shadow-lg shadow-sm transition-shadow duration-300 cursor-pointer flex flex-col h-full overflow-hidden">
              <CardHeader className="p-4 text-center flex-shrink-0">
                <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                <CardDescription className="text-sm">{item.description}</CardDescription>
              </CardHeader>
              <div className="relative flex-grow flex items-center justify-center p-4">
                <div className="w-48 h-48 relative">
                  <OptimizedImage
                    src={item.image}
                    alt={item.title}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="object-contain rounded-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 192px"
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
