import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { db } from '@/db/connection'
import { members, organizations } from '@/db/schema'

import { UnauthorizedError } from '../routes/_errors/unauthorized-error'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch {
        throw new UnauthorizedError('Invalid auth token.')
      }
    }

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId()

      const [member] = await db
        .select()
        .from(members)
        .leftJoin(organizations, eq(members.organizationId, organizations.id))
        .where(and(eq(members.userId, userId), eq(organizations.slug, slug)))

      if (!member || !member.organizations) {
        throw new UnauthorizedError(`You're mot a member of this organization.`)
      }

      return {
        organization: member.organizations,
        membership: member.members,
      }
    }
  })
})
