import { organizationSchema } from '@saas/auth'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { members, organizations } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organizations/:slug/owner',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Transfer organization ownership',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.string().uuid(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(slug)

        const authOrganization = organizationSchema.parse({
          id: organization.id,
          ownerId: organization.ownerId,
        })

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            "You don't have permission to transfer this organization ownership.",
          )
        }

        const { transferToUserId } = request.body

        const [transferToMembership] = await db
          .select()
          .from(members)
          .where(
            and(
              eq(members.organizationId, organization.id),
              eq(members.userId, transferToUserId),
            ),
          )

        if (!transferToMembership) {
          throw new BadRequestError(
            `Target user is not a member of this organization.`,
          )
        }

        await db.transaction(async (tx) => {
          await tx
            .update(members)
            .set({
              role: 'ADMIN',
            })
            .where(
              and(
                eq(members.organizationId, organization.id),
                eq(members.userId, transferToUserId),
              ),
            )

          await tx
            .update(organizations)
            .set({
              ownerId: transferToUserId,
            })
            .where(eq(organizations.id, organization.id))
        })

        return reply.status(204).send()
      },
    )
}
