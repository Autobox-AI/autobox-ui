import { Inter } from 'next/font/google'
import Sidebar from '../components/Sidebar'
import '../styles/globals.css'

import { cn } from '@/lib/utils'
import { Organization } from '@/schemas/organization'

const inter = Inter({ subsets: ['latin'] })

async function fetchOrganizations(): Promise<Organization[]> {
  const response = await fetch('http://localhost:8000/organizations')

  if (!response.ok) {
    throw new Error('Failed to fetch organizations')
  }

  const { organizations } = await response.json()
  return organizations
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const organizations = await fetchOrganizations()

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-sans antialiased',
          inter.className
        )}
      >
        {' '}
        {/* Provide the context to all child components */}
        <div className="flex h-screen">
          <Sidebar organizations={organizations} />
          <div className="flex-1 p-8 bg-background">{children}</div>
        </div>
      </body>
    </html>
  )
}
