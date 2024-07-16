import { rolesSchema } from '@saas/auth'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { invites, members, users } from '@/db/schema'
import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Create a new invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            email: z.string().email(),
            role: rolesSchema,
          }),
          response: {
            201: z.object({
              inviteId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { slug } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Invite')) {
          throw new UnauthorizedError(
            "You're not allowed to create new invites.",
          )
        }

        const { email, role } = request.body

        const [, domain] = email.split('@')

        if (
          organization.shouldAttachUsersByDomain &&
          organization.domain === domain
        ) {
          throw new BadRequestError(
            `Users with "${domain}" domain will join your organization automatically on login.`,
          )
        }

        const [inviteWithSameEmail] = await db
          .select({
            id: invites.id,
          })
          .from(invites)
          .where(
            and(
              eq(invites.email, email),
              eq(invites.organizationId, organization.id),
            ),
          )

        if (inviteWithSameEmail) {
          throw new BadRequestError(
            `Invite with email ${email} already exists for this organization.`,
          )
        }

        const [memberWithSameEmail] = await db
          .select()
          .from(members)
          .leftJoin(users, eq(members.userId, users.id))
          .where(
            and(
              eq(users.email, email),
              eq(members.organizationId, organization.id),
            ),
          )

        if (memberWithSameEmail) {
          throw new BadRequestError(
            `User with email ${email} already exists in this organization.`,
          )
        }

        const [invite] = await db
          .insert(invites)
          .values({
            email,
            role,
            authorId: userId,
            organizationId: organization.id,
          })
          .returning({
            id: invites.id,
          })

        return reply.status(201).send({
          inviteId: invite.id,
        })
      },
    )
}
