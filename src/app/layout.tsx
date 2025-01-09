import { Inter } from 'next/font/google'
import Head from 'next/head'
import '../styles/globals.css'

import AppSidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Organization } from '@/schemas/organization'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

async function fetchOrganizations(): Promise<Organization[]> {
  const response = await fetch('http://localhost:8000/organizations', { cache: 'reload' })

  if (!response.ok) {
    throw new Error('Failed to fetch organizations')
  }

  const { organizations } = await response.json()
  return organizations
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const organizations = await fetchOrganizations()
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true'

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <Head>
        <title>Autobox</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-sans antialiased',
          inter.className
        )}
      >
        <div className="flex h-screen">
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
              {children}
            </main>
          </SidebarProvider>
        </div>
      </body>
    </html>
  )
}
