import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { users } from '@/db/schema'

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
    async (request, reply) => {
      const { email, name, password } = request.body

      const userWithSameEmail = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.email, email))

      if (userWithSameEmail.length > 0) {
        return reply
          .status(400)
          .send({ message: 'user with same e-mail already exists.' })
      }

      const passwordHash = await hash(password, 6)

      await db.insert(users).values({
        email,
        name,
        passwordHash,
      })

      return reply.status(201).send()
    },
  )
}
