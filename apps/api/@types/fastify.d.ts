import 'fastify'

import type { Members, Organization } from '@/db/schema'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId: () => Promise<string>
    getUserMembership: (slug: string) => Promise<{
      organization: Organization
      membership: Members
    }>
  }
}
