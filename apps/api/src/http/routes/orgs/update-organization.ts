import { organizationSchema } from '@saas/auth'
import { and, eq, not } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { organizations } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update organization details',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
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
        const { name, domain, shouldAttachUsersByDomain } = request.body
        const { slug } = request.params

        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(slug)

        const authOrganization = organizationSchema.parse({
          id: organization.id,
          ownerId: organization.ownerId,
        })

        console.log(userId)
        console.log(organization.ownerId)

        const permissions = getUserPermissions(userId, membership.role)

        if (permissions.cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            "You don't have permission to update this organization.",
          )
        }

        if (domain) {
          const [organizationFromDomain] = await db
            .select({ id: organizations.id })
            .from(organizations)
            .where(
              and(
                eq(organizations.domain, domain),
                not(eq(organizations.id, organization.id)),
              ),
            )

          if (organizationFromDomain) {
            throw new BadRequestError(
              'Organization with this domain already exists.',
            )
          }
        }

        await db
          .update(organizations)
          .set({
            name,
            domain,
            shouldAttachUsersByDomain,
          })
          .where(eq(organizations.id, organization.id))

        return reply.status(204).send()
      },
    )
}
