import { rolesSchema } from '@saas/auth'
import { asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { members, users } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              members: z.array(
                z.object({
                  id: z.string(),
                  role: rolesSchema,
                  userId: z.string().nullable(),
                  name: z.string().nullable(),
                  email: z.string().nullable(),
                  avatarUrl: z.string().url().nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const { organization, membership } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User')) {
          throw new UnauthorizedError(
            "You're not allowed to see organization members.",
          )
        }

        const membersOrganization = await db
          .select({
            id: members.id,
            role: members.role,
            userId: users.id,
            name: users.name,
            email: users.email,
            organizationId: members.organizationId,
            avatarUrl: users.avatarUrl,
          })
          .from(members)
          .leftJoin(users, eq(members.userId, users.id))
          .where(eq(members.organizationId, organization.id))
          .orderBy(asc(members.role))

        return reply.status(200).send({
          members: membersOrganization,
        })
      },
    )
}
