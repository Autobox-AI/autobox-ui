import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-background p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Autobox</h1>
        <p className="text-lg text-muted-foreground">The playground for your mind</p>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        {sections.map((item, index) => (
          <Link href={item.link} key={index}>
            <Card className="border-2 border-gray-700 hover:shadow-xl shadow-md transition-shadow duration-300 cursor-pointer flex flex-col">
              <CardHeader className="p-4">
                <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                <CardDescription className="mb-4">{item.description}</CardDescription>
              </CardHeader>
              <div className="relative w-full">
                <Image
                  src={item.image} // Image path from the sections data
                  alt={item.title}
                  width={400} // Set to your desired width
                  height={300} // Set to your desired height while maintaining aspect ratio
                  style={{ objectFit: 'contain' }}
                  className="mx-auto"
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
