import { type InferModel, relations, sql } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { invites } from './invites'
import { members } from './members'
import { projects } from './projects'
import { users } from './users'

export const organizations = pgTable('organizations', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  domain: text('domain').unique(),
  shouldAttachUsersByDomain: boolean('should_attach_users_by_domain').default(
    false,
  ),
  avatarUrl: text('avatar_url'),
  ownerId: uuid('owner_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    invites: many(invites),
    members: many(members),
    projects: many(projects),
    ownerOrganization: one(users, {
      fields: [organizations.ownerId],
      references: [users.id],
    }),
  }),
)

export type Organization = InferModel<typeof organizations>
