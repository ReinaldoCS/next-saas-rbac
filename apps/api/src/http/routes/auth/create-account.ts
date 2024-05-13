import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '../../../db/connection'
import { users } from '../../../db/schema'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async () => {
      try {
        const tbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, 'reinaldo'))

        await db
          .update(users)
          .set({ email: 'Reinaldo1' })
          .where(eq(users.email, 'Reinaldo'))
          .returning({ updatedId: users.id })

        console.log('tbUser -> ', tbUser)
      } catch (e) {
        console.log(e)
      }
      return 'User created successfully'
    },
  )
}
