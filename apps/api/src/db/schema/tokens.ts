import { relations, sql } from 'drizzle-orm'
import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const tokenTypeEnum = pgEnum('token_type_enum', ['PASSWORD_RECOVER'])

export const tokens = pgTable('tokens', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  tokenType: tokenTypeEnum('token_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const tokenRelations = relations(tokens, ({ one }) => ({
  usersToken: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}))
