import { relations, sql } from 'drizzle-orm'
import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

import { roleEnum } from './members'
import { organizations } from './organizations'
import { users } from './users'

export const invites = pgTable(
  'invites',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    email: text('email').unique().notNull(),
    role: roleEnum('role').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    authorId: uuid('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, {
        onDelete: 'cascade',
      })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.email, t.organizationId),
    idx: index().on(t.email),
  }),
)

export const invitesRelations = relations(invites, ({ one }) => ({
  authorInvite: one(users, {
    fields: [invites.authorId],
    references: [users.id],
  }),
  organizationInvite: one(organizations, {
    fields: [invites.organizationId],
    references: [organizations.id],
  }),
}))
