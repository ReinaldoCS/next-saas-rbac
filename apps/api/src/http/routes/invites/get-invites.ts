import { rolesSchema } from '@saas/auth'
import { desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { invites, users } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get all organization invites',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
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

        const { slug } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Invite')) {
          throw new UnauthorizedError(
            "You're not allowed to get organization invites.",
          )
        }

        const invitesOrganization = await db
          .select({
            id: invites.id,
            email: invites.email,
            role: invites.role,
            createdAt: invites.createdAt,
            author: {
              id: users.id,
              name: users.name,
            },
          })
          .from(invites)
          .leftJoin(users, eq(users.id, invites.authorId))
          .where(eq(invites.organizationId, organization.id))
          .orderBy(desc(invites.createdAt))

        return reply.status(200).send({
          invites: invitesOrganization,
        })
      },
    )
}
