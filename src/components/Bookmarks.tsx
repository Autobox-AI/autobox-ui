'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookmarkButton } from './BookmarkButton'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { TooltipProvider } from './ui/tooltip'
import { useBookmarkContext } from '@/contexts/BookmarkContext'
import { Bookmark, BOOKMARK_TYPES } from '@/schemas'
import {
  FolderOpen,
  GitBranch,
  Calendar,
  Search,
  Bookmark as BookmarkIcon,
  Folder,
  Layers,
} from 'lucide-react'

interface BookmarkCardProps {
  bookmark: Bookmark
  onNavigate: (bookmark: Bookmark) => void
}

function BookmarkCard({ bookmark, onNavigate }: BookmarkCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getIcon = () => {
    return bookmark.type === BOOKMARK_TYPES.PROJECT ? (
      <Folder className="h-5 w-5 text-blue-400" />
    ) : (
      <Layers className="h-5 w-5 text-green-400" />
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-zinc-800 hover:border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getIcon()}
            <div className="min-w-0 flex-1">
              <CardTitle
                className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate"
                onClick={() => onNavigate(bookmark)}
              >
                {bookmark.item_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {bookmark.type === BOOKMARK_TYPES.PROJECT ? 'Project' : 'Simulation'}
                </Badge>
                {bookmark.type === BOOKMARK_TYPES.SIMULATION && bookmark.project_name && (
                  <Badge variant="outline" className="text-xs">
                    {bookmark.project_name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <BookmarkButton
            type={bookmark.type}
            itemId={bookmark.item_id}
            itemName={bookmark.item_name}
            itemDescription={bookmark.item_description}
            projectId={bookmark.project_id}
            projectName={bookmark.project_name}
            size="sm"
            variant="ghost"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription
          className="text-sm text-zinc-400 line-clamp-2 mb-3"
          onClick={() => onNavigate(bookmark)}
        >
          {bookmark.item_description || 'No description available'}
        </CardDescription>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Calendar className="h-3 w-3" />
          <span>Bookmarked {formatDate(bookmark.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function Bookmarks() {
  const router = useRouter()
  const { bookmarks, loading, error } = useBookmarkContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.item_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.project_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab === 'all' || bookmark.type === activeTab

    return matchesSearch && matchesTab
  })

  const projectBookmarks = filteredBookmarks.filter((b) => b.type === BOOKMARK_TYPES.PROJECT)
  const simulationBookmarks = filteredBookmarks.filter((b) => b.type === BOOKMARK_TYPES.SIMULATION)

  const handleNavigate = (bookmark: Bookmark) => {
    if (bookmark.type === BOOKMARK_TYPES.PROJECT) {
      router.push(`/projects/${bookmark.item_id}/simulations`)
    } else {
      router.push(`/projects/${bookmark.project_id}/simulations/${bookmark.item_id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading bookmarks</p>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="w-full bg-background px-6 pt-6 pb-4 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <BookmarkIcon className="h-8 w-8 text-yellow-500" />
                  Bookmarks
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Quick access to your favorite projects and simulations
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>{projectBookmarks.length} projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>{simulationBookmarks.length} simulations</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All ({bookmarks.length})</TabsTrigger>
                <TabsTrigger value={BOOKMARK_TYPES.PROJECT}>
                  Projects ({projectBookmarks.length})
                </TabsTrigger>
                <TabsTrigger value={BOOKMARK_TYPES.SIMULATION}>
                  Simulations ({simulationBookmarks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookmarkIcon className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-zinc-400 mb-2">
                      {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
                    </h3>
                    <p className="text-zinc-500 mb-6">
                      {searchQuery
                        ? 'Try adjusting your search terms'
                        : 'Start bookmarking your favorite projects and simulations'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => router.push('/projects')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse Projects
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value={BOOKMARK_TYPES.PROJECT} className="space-y-4">
                {projectBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-zinc-400 mb-2">
                      {searchQuery ? 'No project bookmarks found' : 'No project bookmarks yet'}
                    </h3>
                    <p className="text-zinc-500 mb-6">
                      {searchQuery
                        ? 'Try adjusting your search terms'
                        : 'Bookmark your favorite projects for quick access'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => router.push('/projects')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse Projects
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value={BOOKMARK_TYPES.SIMULATION} className="space-y-4">
                {simulationBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-zinc-400 mb-2">
                      {searchQuery
                        ? 'No simulation bookmarks found'
                        : 'No simulation bookmarks yet'}
                    </h3>
                    <p className="text-zinc-500 mb-6">
                      {searchQuery
                        ? 'Try adjusting your search terms'
                        : 'Bookmark your favorite simulations for quick access'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => router.push('/projects')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Browse Simulations
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {simulationBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
