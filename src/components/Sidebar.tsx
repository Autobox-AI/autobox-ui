'use client'

import {
  Archive,
  ChevronDown,
  ChevronRight,
  FolderTree,
  GitGraph,
  Scale,
  Search,
  Settings,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from './ui/sidebar'

const AppSidebar = () => {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false)
  const { state } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    if (state === 'collapsed') {
      setIsProjectsExpanded(false)
    }
  }, [state])

  useEffect(() => {
    if (!pathname.startsWith('/projects')) {
      setIsProjectsExpanded(false)
    }
  }, [pathname])

  const handleProjectsClick = () => {
    setIsProjectsExpanded(!isProjectsExpanded)
  }

  const handleProjectsMouseEnter = () => {
    setIsProjectsExpanded(true)
  }

  const handleProjectsMouseLeave = () => {
    setIsProjectsExpanded(false)
  }

  console.log('Rendering sidebar, isProjectsExpanded:', isProjectsExpanded)

  // Mock logged in user
  const user = {
    username: 'margostino',
    isLoggedIn: true,
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mb-6 mt-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home">
              <Link href="/" className="flex items-center gap-3">
                <div className="min-w-[24px] flex items-center justify-center">
                  <span className="h-4 w-4">📦</span>
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Autobox Labs
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem
            onMouseEnter={handleProjectsMouseEnter}
            onMouseLeave={handleProjectsMouseLeave}
          >
            <SidebarMenuButton
              tooltip="Projects"
              onClick={handleProjectsClick}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="min-w-[24px] flex items-center justify-center">
                  <FolderTree className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Projects
                </span>
              </div>
              <div className="min-w-[24px] flex items-center justify-center text-white">
                {isProjectsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </SidebarMenuButton>
            {isProjectsExpanded && (
              <SidebarMenuSub className="mt-1 ml-2 pl-4 border-l border-zinc-800">
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/projects"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <FolderTree className="h-4 w-4" />
                      <span>All Projects</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/projects/active"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <GitGraph className="h-4 w-4" />
                      <span>Active</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/projects/archived"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Archive className="h-4 w-4" />
                      <span>Archived</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Simulations">
              <Link href="/simulations" className="flex items-center gap-3">
                <div className="min-w-[24px] flex items-center justify-center">
                  <Scale className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Simulations
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings" className="flex items-center gap-3">
                <div className="min-w-[24px] flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="relative w-full px-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton className="w-full" tooltip={user.username}>
              <div className="min-w-[24px] flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="flex items-center gap-2 text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                {user.isLoggedIn ? (
                  <>
                    <span>{user.username}</span>
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  </>
                ) : (
                  'Login'
                )}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
