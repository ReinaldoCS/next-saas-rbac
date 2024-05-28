import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { projects, users } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get project details',
          security: [{ bearerAuth: [] }],

          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            201: z.object({
              project: z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string(),
                slug: z.string(),
                ownerId: z.string(),
                avatarUrl: z.string().nullable(),
                organizationId: z.string(),
                owner: z
                  .object({
                    id: z.string(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  })
                  .nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params

        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError("You're not allowed to see this project.")
        }

        const [project] = await db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            slug: projects.slug,
            ownerId: projects.ownerId,
            avatarUrl: projects.avatarUrl,
            organizationId: projects.organizationId,
            owner: {
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
            },
          })
          .from(projects)
          .leftJoin(users, eq(users.id, projects.ownerId))
          .where(
            and(
              eq(projects.slug, projectSlug),
              eq(projects.organizationId, organization.id),
            ),
          )

        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        return reply.status(200).send({
          project,
        })
      },
    )
}
