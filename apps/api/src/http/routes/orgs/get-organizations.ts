import { rolesSchema } from '@saas/auth'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { members, organizations } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'

export async function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get details where user is a member',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              organization: z.array(
                z.object({
                  id: z.string().uuid().nullable(),
                  name: z.string().nullable(),
                  slug: z.string().nullable(),
                  domain: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                  role: rolesSchema,
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()

        const membersAndOrganizations = await db
          .select({
            id: organizations.id!,
            name: organizations.name!,
            slug: organizations.slug!,
            domain: organizations.domain!,
            avatarUrl: organizations.avatarUrl!,
            role: members.role,
          })
          .from(members)
          .leftJoin(organizations, eq(members.organizationId, organizations.id))
          .where(eq(members.userId, userId))

        return {
          organization: membersAndOrganizations,
        }
      },
    )
}
