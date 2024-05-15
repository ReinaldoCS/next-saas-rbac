import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { users } from '@/db/schema'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with e-mail and password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const [userFromEmail] = await db
        .select({
          passwordHash: users.passwordHash,
          id: users.id,
        })
        .from(users)
        .where(eq(users.email, email))

      if (!userFromEmail) {
        return reply
          .status(401)
          .send({ message: 'Invalid e-mail or password.' })
      }

      if (userFromEmail.passwordHash === null) {
        return reply
          .status(401)
          .send({ message: 'User does not have a password, use social login.' })
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid) {
        return reply
          .status(401)
          .send({ message: 'Invalid e-mail or password.' })
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
