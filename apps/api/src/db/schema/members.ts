import { type InferModel, relations, sql } from 'drizzle-orm'
import { pgEnum, pgTable, unique, uuid } from 'drizzle-orm/pg-core'

import { organizations } from './organizations'
import { users } from './users'

export const roleEnum = pgEnum('role_enum', ['ADMIN', 'MEMBER', 'BILLING'])

export const members = pgTable(
  'members',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    role: roleEnum('role').default('MEMBER').notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.organizationId, t.userId),
  }),
)

export const membersRelations = relations(members, ({ one }) => ({
  organizationMember: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  userMember: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}))

export type Members = InferModel<typeof members>
