import { rolesSchema } from '@saas/auth'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { invites, organizations, users } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getPendingInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/pending-invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get all user pending invites',
          response: {
            200: z.object({
              invites: z.array(
                z.object({
                  id: z.string().uuid(),
                  email: z.string().email(),
                  role: rolesSchema,
                  createdAt: z.date(),
                  author: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().nullable(),
                      avatarUrl: z.string().url().nullable(),
                    })
                    .nullable(),
                  organization: z
                    .object({
                      name: z.string().nullable(),
                    })
                    .nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const [user] = await db.select().from(users).where(eq(users.id, userId))

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        const inviteList = await db
          .select({
            id: invites.id,
            email: invites.email,
            role: invites.role,
            createdAt: invites.createdAt,
            author: {
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
            },
            organization: {
              name: organizations.name,
            },
          })
          .from(invites)
          .leftJoin(users, eq(invites.authorId, users.id))
          .leftJoin(organizations, eq(invites.organizationId, organizations.id))
          .where(eq(invites.email, user.email))

        return reply.status(200).send({
          invites: inviteList,
        })
      },
    )
}
