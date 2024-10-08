import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { invites } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/invites/:inviteId',
      {
        schema: {
          tags: ['invites'],
          summary: 'Revoke an invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            inviteId: z.string(),
          }),

          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { slug, inviteId } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Invite')) {
          throw new UnauthorizedError("You're not allowed to delete an invite.")
        }

        const [invite] = await db
          .select({
            id: invites.id,
          })
          .from(invites)
          .where(
            and(
              eq(invites.id, inviteId),
              eq(invites.organizationId, organization.id),
            ),
          )

        if (!invite) {
          throw new BadRequestError('Invite not found.')
        }

        await db.delete(invites).where(eq(invites.id, inviteId))

        return reply.status(204).send()
      },
    )
}
