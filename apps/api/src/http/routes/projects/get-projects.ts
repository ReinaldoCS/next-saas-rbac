import { and, desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { projects, users } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/projects',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get all organization projects',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              projects: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  description: z.string(),
                  slug: z.string(),
                  ownerId: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  organizationId: z.string(),
                  createdAt: z.date(),
                  owner: z
                    .object({
                      id: z.string(),
                      name: z.string().nullable(),
                      avatarUrl: z.string().url().nullable(),
                    })
                    .nullable(),
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

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            "You're not allowed to see organization projects.",
          )
        }

        const projectsOrganization = await db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            slug: projects.slug,
            ownerId: projects.ownerId,
            avatarUrl: projects.avatarUrl,
            organizationId: projects.organizationId,
            createdAt: projects.createdAt,
            owner: {
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
            },
          })
          .from(projects)
          .leftJoin(users, eq(users.id, projects.ownerId))
          .where(and(eq(projects.organizationId, organization.id)))
          .orderBy(desc(projects.createdAt))

        return reply.status(200).send({
          projects: projectsOrganization,
        })
      },
    )
}
