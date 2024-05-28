import { projectSchema } from '@saas/auth'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { projects } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Delete a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            projectId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params

        const { organization, membership } =
          await request.getUserMembership(slug)

        const [project] = await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organization.id),
            ),
          )

        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        const userId = await request.getCurrentUserId()
        const { cannot } = getUserPermissions(userId, membership.role)

        const authProject = projectSchema.parse({
          id: project.id,
          ownerId: project.ownerId,
        })

        if (cannot('delete', authProject)) {
          throw new UnauthorizedError(
            "You're not allowed to delete this projects.",
          )
        }

        await db.delete(projects).where(eq(projects.id, project.id))

        return reply.status(204).send()
      },
    )
}
