import { and, count, eq, inArray, not } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { members, projects } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getOrganizationBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/billing',
      {
        schema: {
          tags: ['billing'],
          summary: 'Get billing information from organizations',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              billing: z.object({
                seats: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                projects: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                total: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Billing')) {
          throw new UnauthorizedError(
            "You're not allowed to get organization billing information.",
          )
        }

        const [[amountOfMembers], [amountOfProject]] = await Promise.all([
          await db
            .select({ count: count() })
            .from(members)
            .where(
              and(
                eq(members.organizationId, organization.id),
                not(inArray(members.role, ['BILLING'])),
              ),
            ),
          await db
            .select({ count: count() })
            .from(projects)
            .where(and(eq(projects.organizationId, organization.id))),
        ])

        return reply.status(200).send({
          billing: {
            seats: {
              amount: amountOfMembers.count,
              unit: 10,
              price: amountOfMembers.count * 10,
            },
            projects: {
              amount: amountOfProject.count,
              unit: 20,
              price: amountOfProject.count * 20,
            },

            total: amountOfMembers.count * 10 + amountOfProject.count * 20,
          },
        })
      },
    )
}
