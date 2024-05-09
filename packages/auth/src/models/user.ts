import { z } from 'zod'

import { rolesSchema } from '../roles'

const userSchema = z.object({
  role: rolesSchema,
})

export type User = z.infer<typeof userSchema>
