import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Organization } from '@/schemas/organization'
import { ArrowRight } from 'lucide-react'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

async function fetchOrganizations(): Promise<Organization[]> {
  console.time('fetchOrganizations')
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  const response = await fetch(`${protocol}://${host}/api/organizations`, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch organizations')
  }

  const { organizations } = await response.json()
  console.timeEnd('fetchOrganizations')
  return organizations
}

export default async function Home() {
  console.time('HomePageRender')
  const organizations = await fetchOrganizations()
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

  const page = (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">Autobox</h1>
        <p className="text-lg text-muted-foreground">The playground for your mind</p>
      </div>
      {/* Message Input and Send Button */}
      <div className="w-full max-w-5xl mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your simulation idea..."
            className="w-full h-14 p-4 pr-12 rounded-full border border-gray-400 bg-black text-white caret-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            autoFocus // Ensures the input is focused when the page loads, so the blinking cursor shows immediately
          />
          <button className="absolute top-1/2 right-3 transform -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors duration-200">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        {sections.map((item, index) => (
          <Link href={item.link} key={index}>
            <Card className="border-2 border-gray-700 hover:shadow-xl shadow-md transition-shadow duration-300 cursor-pointer flex flex-col p-3">
              <CardHeader className="p-2 text-center">
                <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                <CardDescription className="text-sm mb-2">{item.description}</CardDescription>
              </CardHeader>
              <div className="relative w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={300}
                  height={200}
                  priority={index === 0}
                  style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                  className="mx-auto"
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
  console.timeEnd('HomePageRender')
  return page
}
