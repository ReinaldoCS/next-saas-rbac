import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db/connection'
import { members, organizations } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { createSlug } from '@/utils/create-slug'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Create a new organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              organizationId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name, domain, shouldAttachUsersByDomain } = request.body

        if (domain) {
          const [organizationFromDomain] = await db
            .select({ id: organizations.id })
            .from(organizations)
            .where(eq(organizations.domain, domain))

          if (organizationFromDomain) {
            throw new BadRequestError(
              'Organization with this domain already exists.',
            )
          }
        }

        const [organization] = await db
          .insert(organizations)
          .values({
            name,
            slug: createSlug(name),
            domain,
            shouldAttachUsersByDomain,
            ownerId: userId,
          })
          .returning({ id: organizations.id })

        await db.insert(members).values({
          organizationId: organization.id,
          userId,
          role: 'ADMIN',
        })

        return reply.status(201).send({
          organizationId: organization.id,
        })
      },
    )
}
