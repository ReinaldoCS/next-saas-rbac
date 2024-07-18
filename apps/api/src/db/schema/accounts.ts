import { relations, sql } from 'drizzle-orm'
import { pgEnum, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const providerAccountUnum = pgEnum('provider_account_unum', ['GITHUB'])

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    provider: providerAccountUnum('provider').notNull(),
    providerAccountId: text('provider_account_id').unique().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.provider, t.userId),
  }),
)

export const accountRelations = relations(accounts, ({ one }) => ({
  usersAccount: one(users, {
    fields: [accounts.id],
    references: [users.id],
  }),
}))
