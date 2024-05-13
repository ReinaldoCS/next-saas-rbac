import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const client = postgres({
  host: 'localhost',
  port: 5432,
  user: 'docker',
  password: 'docker',
  database: 'next-saas',
})

export const db = drizzle(client, { schema })
