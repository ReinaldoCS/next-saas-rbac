import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { tokens, users } from '@/db/schema'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/reset',
    {
      schema: {
        tags: ['auth'],
        summary: 'Reset password',
        body: z.object({
          code: z.string(),
          password: z.string().min(6),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { code, password } = request.body

      const [tokenFromCode] = await db
        .select()
        .from(tokens)
        .where(eq(tokens.id, code))

      if (!tokenFromCode || tokenFromCode.tokenType !== 'PASSWORD_RECOVER') {
        throw new UnauthorizedError()
      }

      const passwordHash = await hash(password, 6)

      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, tokenFromCode.userId))

      console.log('checout aui!')

      return reply.status(204).send()
    },
  )
}
