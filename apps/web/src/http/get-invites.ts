import type { Roles } from '@saas/auth'

import { api } from './api-client'

interface GetInvitesResponse {
  invites: {
    id: string
    email: string
    createdAt: string
    role: Roles
    author: {
      id: string
      name: string | null
    } | null
  }[]
}

export async function getInvites(orgSlug: string): Promise<GetInvitesResponse> {
  const result = await api
    .get(`organizations/${orgSlug}/invites`, {
      next: { tags: [`${orgSlug}-invites`] },
    })
    .json<GetInvitesResponse>()

  return result
}
