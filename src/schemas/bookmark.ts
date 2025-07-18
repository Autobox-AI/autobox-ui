import { z } from 'zod'
import { UuidSchema } from './common/uuid'

export const BOOKMARK_TYPES = {
  PROJECT: 'project',
  SIMULATION: 'simulation',
} as const

export const BookmarkTypeSchema = z.enum([BOOKMARK_TYPES.PROJECT, BOOKMARK_TYPES.SIMULATION])

export type BookmarkType = z.infer<typeof BookmarkTypeSchema>

export const BookmarkSchema = z.object({
  id: UuidSchema,
  type: BookmarkTypeSchema,
  item_id: UuidSchema,
  item_name: z.string(),
  item_description: z.string().nullable(),
  project_id: UuidSchema.optional(), // For simulations, reference to parent project
  project_name: z.string().optional(), // For simulations, parent project name
  created_at: z.string(),
  updated_at: z.string().nullable(),
})

export type Bookmark = z.infer<typeof BookmarkSchema>

export const BookmarksResponseSchema = z.object({
  bookmarks: z.array(BookmarkSchema),
})

export type BookmarksResponse = z.infer<typeof BookmarksResponseSchema>

export const CreateBookmarkSchema = z.object({
  type: BookmarkTypeSchema,
  item_id: UuidSchema,
  item_name: z.string(),
  item_description: z.string().nullable(),
  project_id: UuidSchema.optional(),
  project_name: z.string().optional(),
})

export type CreateBookmark = z.infer<typeof CreateBookmarkSchema>