import { useState, useEffect, useCallback } from 'react'
import { Bookmark, BookmarkType, CreateBookmark } from '@/schemas'

interface UseBookmarksReturn {
  bookmarks: Bookmark[]
  loading: boolean
  error: string | null
  createBookmark: (bookmark: CreateBookmark) => Promise<void>
  deleteBookmark: (id: string) => Promise<void>
  isBookmarked: (type: BookmarkType, itemId: string) => boolean
  getBookmarkId: (type: BookmarkType, itemId: string) => string | null
  refetch: () => Promise<void>
}

export function useBookmarks(type?: BookmarkType): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`/api/bookmarks?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks')
      }

      const data = await response.json()
      setBookmarks(data.bookmarks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [type])

  const createBookmark = useCallback(async (bookmark: CreateBookmark) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmark),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create/remove bookmark')
      }

      const result = await response.json()

      console.log('Bookmark API result:', result)

      if (result.action === 'added') {
        // Add bookmark to local state
        setBookmarks((prev) => [result.bookmark, ...prev])
        console.log('Bookmark added to local state')
      } else if (result.action === 'removed') {
        // Remove bookmark from local state
        setBookmarks((prev) => prev.filter((b) => b.id !== result.bookmark.id))
        console.log('Bookmark removed from local state')
      }
    } catch (err) {
      throw err
    }
  }, [])

  const deleteBookmark = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete bookmark')
      }

      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))
    } catch (err) {
      throw err
    }
  }, [])

  const isBookmarked = useCallback(
    (type: BookmarkType, itemId: string) => {
      return bookmarks.some((bookmark) => bookmark.type === type && bookmark.item_id === itemId)
    },
    [bookmarks]
  )

  const getBookmarkId = useCallback(
    (type: BookmarkType, itemId: string) => {
      const bookmark = bookmarks.find(
        (bookmark) => bookmark.type === type && bookmark.item_id === itemId
      )
      return bookmark?.id || null
    },
    [bookmarks]
  )

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  return {
    bookmarks,
    loading,
    error,
    createBookmark,
    deleteBookmark,
    isBookmarked,
    getBookmarkId,
    refetch: fetchBookmarks,
  }
}
