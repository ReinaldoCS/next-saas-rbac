import { relations, sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { organizations } from './organizations'
import { users } from './users'

export const projects = pgTable('projects', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull(),
  description: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  avatarUrl: text('avatar_url'),
  owner: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  organization: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const projectRelations = relations(projects, ({ one }) => ({
  ownerProject: one(users, {
    fields: [projects.owner],
    references: [users.id],
  }),
  organizationProject: one(organizations, {
    fields: [projects.organization],
    references: [organizations.id],
  }),
}))
