import { Inter } from 'next/font/google'
import '../styles/globals.css'

import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import AppSidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { BookmarkProvider } from '@/contexts/BookmarkContext'
import { cn } from '@/lib/utils'
import { Organization } from '@/schemas/organization'
import { cookies } from 'next/headers'

// Optimize font loading with display swap and preload
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
})

export const metadata = {
  title: 'Autobox - The playground for your mind',
  description: 'Explore your projects and manage simulations with Autobox',
  keywords: ['simulation', 'projects', 'autobox', 'playground'],
  authors: [{ name: 'Autobox Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Autobox - The playground for your mind',
    description: 'Explore your projects and manage simulations with Autobox',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
}

async function fetchDefaultOrganization(): Promise<Organization | null> {
  try {
    const organizationId = process.env.ORG_ID
    if (!organizationId) {
      console.warn('ORG_ID environment variable is not set')
      return null
    }

    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return null
    }

    const response = await fetch(`${apiUrl}/organizations/${organizationId}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch default organization:', {
        status: response.status,
        statusText: response.statusText,
        organizationId,
      })
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching default organization:', error)
    return null
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true'

  const defaultOrganization = await fetchDefaultOrganization()
  const organizations = defaultOrganization ? [defaultOrganization] : []

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/assets/autobox-logo.png" as="image" type="image/png" />
        <link rel="preload" href="/assets/autobox-projects.webp" as="image" type="image/webp" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/assets/autobox-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/autobox-logo.png" />

        {/* Manifest for PWA capabilities */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-sans antialiased',
          inter.className
        )}
      >
        <div className="flex h-screen">
          <BookmarkProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar organizations={organizations} />
              <main className="flex-1 flex flex-col w-full ml-[var(--sidebar-width-icon)] md:ml-[220px]">
                {children}
              </main>
            </SidebarProvider>
          </BookmarkProvider>
        </div>
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
