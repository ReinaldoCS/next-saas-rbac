import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'docker',
    password: 'docker',
    database: 'next-saas',
  },
})
