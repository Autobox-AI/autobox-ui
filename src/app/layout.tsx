import { Inter } from 'next/font/google'
import Head from 'next/head'
import '../styles/globals.css'

import AppSidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils'
import { Organization } from '@/schemas/organization'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
  organizations,
}: {
  children: React.ReactNode
  organizations: Organization[]
}) {
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
            <AppSidebar organizations={organizations} />
            <main className="flex-1 flex flex-col w-full">{children}</main>
          </SidebarProvider>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
