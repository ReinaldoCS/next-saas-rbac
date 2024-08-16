import { Roles } from '@saas/auth'

import { api } from './api-client'

interface GetMembersResponse {
  members: {
    id: string
    name: string | null
    avatarUrl: string | null
    email: string | null
    role: Roles
    userId: string | null
  }[]
}

export async function getMembers(orgSlug: string): Promise<GetMembersResponse> {
  const result = await api
    .get(`organizations/${orgSlug}/members`, {
      next: {
        tags: [`${orgSlug}-members`],
      },
    })
    .json<GetMembersResponse>()

  return result
}
