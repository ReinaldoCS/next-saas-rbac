import { hash } from 'bcryptjs'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { members, organizations, users } from '@/db/schema'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        summary: 'Create a new account',
        tags: ['auth'],
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
        throw new BadRequestError('User with same e-mail already exists.')
      }

      const [, domain] = email.split('@')

      const [autoJoinOrganization] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(
          and(
            eq(organizations.domain, domain),
            eq(organizations.shouldAttachUsersByDomain, true),
          ),
        )

      const passwordHash = await hash(password, 6)

      const [user] = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash,
        })
        .returning({ id: users.id, name: users.name })

      if (autoJoinOrganization) {
        await db.insert(members).values({
          organizationId: autoJoinOrganization.id,
          userId: user.id,
        })
      }

      return reply
        .status(201)
        .send({ message: `User ${user.name} created successfully!` })
    },
  )
}
