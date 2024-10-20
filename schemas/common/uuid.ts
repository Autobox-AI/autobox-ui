import { z } from 'zod'

// Change to z.string().uuid() when this issue has been resolved (again): https://github.com/colinhacks/zod/issues/91#issuecomment-2108863350
export const UuidSchema = z.string().length(36, { message: 'Must be a uuid v4' })
