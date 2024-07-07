import { rolesSchema } from '@saas/auth'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { invites, organizations, users } from '@/db/schema'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/invites/:inviteId',
    {
      schema: {
        tags: ['invites'],
        summary: 'Get an invite',
        params: z.object({
          inviteId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            invite: z.object({
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
          }),
        },
      },
    },
    async (request, reply) => {
      const { inviteId } = request.params

      const [invite] = await db
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
        .where(eq(invites.id, inviteId))

      if (!invite) {
        throw new BadRequestError('Invite not found.')
      }

      return reply.status(201).send({
        invite,
      })
    },
  )
}
