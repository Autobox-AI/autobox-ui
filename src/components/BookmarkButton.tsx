'use client'
import { useState } from 'react'
import { Bookmark, BookmarkX } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useBookmarkContext } from '@/contexts/BookmarkContext'
import { BookmarkType, CreateBookmark } from '@/schemas'

interface BookmarkButtonProps {
  type: BookmarkType
  itemId: string
  itemName: string
  itemDescription?: string | null
  projectId?: string
  projectName?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
}

export function BookmarkButton({
  type,
  itemId,
  itemName,
  itemDescription,
  projectId,
  projectName,
  size = 'md',
  variant = 'ghost',
  className = '',
}: BookmarkButtonProps) {
  const { isBookmarked, getBookmarkId, createBookmark, deleteBookmark } = useBookmarkContext()
  const [loading, setLoading] = useState(false)

  const bookmarked = isBookmarked(type, itemId)
  const bookmarkId = getBookmarkId(type, itemId)

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent parent click handlers

    if (loading) return

    setLoading(true)

    try {
      // Always use the POST API which now handles toggle logic
      const bookmarkData: CreateBookmark = {
        type,
        item_id: itemId,
        item_name: itemName,
        item_description: itemDescription || null,
        project_id: projectId,
        project_name: projectName,
      }
      await createBookmark(bookmarkData)
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          onClick={handleToggleBookmark}
          disabled={loading}
          className={`${buttonSizes[size]} ${className} ${
            bookmarked
              ? 'text-yellow-500 hover:text-yellow-400'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          {bookmarked ? (
            <Bookmark className={`${iconSizes[size]} fill-current`} />
          ) : (
            <BookmarkX className={iconSizes[size]} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}</TooltipContent>
    </Tooltip>
  )
}
