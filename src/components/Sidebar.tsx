'use client'

import { Organization } from '@/schemas/organization'
import {
  Archive,
  BarChart2,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  Compass,
  FileText,
  FolderTree,
  GitGraph,
  LayoutDashboard,
  LogOut,
  Plus,
  Scale,
  Search,
  Settings,
  Shield,
  User,
  UserCog,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
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

interface AppSidebarProps {
  organizations: Organization[]
}

const AppSidebar = ({ organizations }: AppSidebarProps) => {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false)
  const [isTemplatesExpanded, setIsTemplatesExpanded] = useState(false)
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false)
  const { state } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    if (state === 'collapsed') {
      setIsProjectsExpanded(false)
      setIsTemplatesExpanded(false)
      setIsUserMenuExpanded(false)
    }
  }, [state])

  useEffect(() => {
    if (!pathname.startsWith('/projects')) {
      setIsProjectsExpanded(false)
    }
    if (!pathname.startsWith('/templates')) {
      setIsTemplatesExpanded(false)
    }
  }, [pathname])

  const handleProjectsClick = () => {
    if (state === 'expanded') {
      setIsProjectsExpanded(!isProjectsExpanded)
    }
  }

  const handleTemplatesClick = () => {
    if (state === 'expanded') {
      setIsTemplatesExpanded(!isTemplatesExpanded)
    }
  }

  const handleUserMenuClick = () => {
    if (state === 'expanded') {
      setIsUserMenuExpanded(!isUserMenuExpanded)
    }
  }

  // TODO: Mock logged in user
  const user = {
    username: 'margostino',
    isLoggedIn: true,
  }

  const renderSubmenu = (items: { icon: any; label: string; href: string }[]) => (
    <div className="flex flex-col gap-1 p-2">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-white/70 hover:bg-zinc-800 hover:text-white"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  )

  const projectsSubmenu = [
    { icon: FolderTree, label: 'All Projects', href: '/projects' },
    { icon: GitGraph, label: 'Active', href: '/projects/active' },
    { icon: Archive, label: 'Archived', href: '/projects/archived' },
  ]

  const templatesSubmenu = [
    { icon: Scale, label: 'Simulations', href: '/templates/simulations' },
    { icon: Bot, label: 'Agents', href: '/templates/agents' },
    { icon: Compass, label: 'Scenarios', href: '/templates/scenarios' },
    { icon: BarChart2, label: 'Metrics', href: '/templates/metrics' },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mb-6 mt-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home">
              <Link href="/" className="flex items-center gap-3 px-2">
                <div className="min-w-[32px] flex items-center justify-center">
                  <img
                    src="/assets/autobox-logo.png"
                    alt="Autobox Logo"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Autobox Studio
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard">
              <Link href="/dashboard" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Dashboard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Projects Section */}
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <SidebarMenuButton
                tooltip="Projects"
                onClick={handleProjectsClick}
                className="w-full flex items-center justify-between px-2"
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
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton tooltip="Projects" className="w-full px-2">
                    <div className="min-w-[24px] flex items-center justify-center">
                      <FolderTree className="h-4 w-4" />
                    </div>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  className="w-48 p-0 bg-zinc-900 border-zinc-800"
                  align="start"
                  sideOffset={20}
                >
                  {renderSubmenu(projectsSubmenu)}
                </PopoverContent>
              </Popover>
            )}
            {state === 'expanded' && isProjectsExpanded && (
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
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/projects/new"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Project</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Simulations */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Simulations">
              <Link href="/simulations" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <Scale className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Simulations
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Templates Section */}
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <SidebarMenuButton
                tooltip="Templates"
                onClick={handleTemplatesClick}
                className="w-full flex items-center justify-between px-2"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="min-w-[24px] flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                    Templates
                  </span>
                </div>
                <div className="min-w-[24px] flex items-center justify-center text-white">
                  {isTemplatesExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </SidebarMenuButton>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton tooltip="Templates" className="w-full px-2">
                    <div className="min-w-[24px] flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  className="w-48 p-0 bg-zinc-900 border-zinc-800"
                  align="start"
                  sideOffset={20}
                >
                  {renderSubmenu(templatesSubmenu)}
                </PopoverContent>
              </Popover>
            )}
            {state === 'expanded' && isTemplatesExpanded && (
              <SidebarMenuSub className="mt-1 ml-2 pl-4 border-l border-zinc-800">
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/templates/simulations"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Scale className="h-4 w-4" />
                      <span>Simulations</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/templates/agents"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Bot className="h-4 w-4" />
                      <span>Agents</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/templates/scenarios"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Compass className="h-4 w-4" />
                      <span>Scenarios</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/templates/metrics"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span>Metrics</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Agent Library */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Agent Library">
              <Link href="/agents" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Agent Library
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Scenarios */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Scenarios">
              <Link href="/scenarios" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Scenarios
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Metrics Explorer */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Metrics Explorer">
              <Link href="/metrics" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Metrics Explorer
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Quick Start */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Start New Simulation">
              <Link href="/simulations/new" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Start New Simulation
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Knowledge Hub */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Knowledge Hub">
              <Link href="/knowledge" className="flex items-center gap-3 px-2">
                <div className="min-w-[24px] flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white transition-opacity group-data-[state=collapsed]:opacity-0">
                  Knowledge Hub
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings" className="flex items-center gap-3 px-2">
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
            <div className="relative w-full px-2 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-zinc-400 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem className="-mt-2">
            {state === 'expanded' ? (
              <SidebarMenuButton
                onClick={handleUserMenuClick}
                className="w-full flex items-center justify-between px-2"
                tooltip={user.username}
              >
                <div className="flex items-center gap-3 flex-1">
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
                </div>
                <div className="min-w-[24px] flex items-center justify-center text-white">
                  {isUserMenuExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </SidebarMenuButton>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton className="w-full px-2" tooltip={user.username}>
                    <div className="min-w-[24px] flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  className="w-48 p-0 bg-zinc-900 border-zinc-800"
                  align="end"
                  sideOffset={20}
                >
                  {renderSubmenu([
                    { icon: UserCog, label: 'Profile', href: '/profile' },
                    { icon: Shield, label: 'Security', href: '/security' },
                    { icon: Settings, label: 'Preferences', href: '/preferences' },
                    { icon: LogOut, label: 'Logout', href: '/logout' },
                  ])}
                </PopoverContent>
              </Popover>
            )}
            {state === 'expanded' && isUserMenuExpanded && (
              <SidebarMenuSub className="mt-1 ml-2 pl-4 border-l border-zinc-800">
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <UserCog className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/security"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Security</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/preferences"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Preferences</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem className="py-1">
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/logout"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
