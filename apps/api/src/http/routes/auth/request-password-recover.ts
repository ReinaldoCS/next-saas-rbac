import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import kleur from 'kleur'
import z from 'zod'

import { db } from '@/db/connection'
import { tokens, users } from '@/db/schema'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['auth'],
        summary: 'Request password recovery',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const [userFromEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))

      if (!userFromEmail) {
        // We don't want people to know if user really exists
        return reply.status(201).send()
      }

      const [token] = await db
        .insert(tokens)
        .values({
          userId: userFromEmail.id,
          tokenType: 'PASSWORD_RECOVER',
        })
        .returning()

      // Send e-mail with password recovery link
      console.log(kleur.green(`Recover password token: ${token.id}`))

      return reply.status(201).send()
    },
  )
}
