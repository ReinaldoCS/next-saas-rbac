import type { Roles } from '@saas/auth'

import { api } from './api-client'

interface GetInviteResponse {
  invite: {
    id: string
    email: string
    role: Roles
    createdAt: string
    author: {
      id: string
      name: string | null
      avatarUrl: string | null
    } | null
    organization: {
      name: string | null
    } | null
  }
}

export async function getInvite(inviteId: string): Promise<GetInviteResponse> {
  const result = await api.get(`invites/${inviteId}`).json<GetInviteResponse>()

  return result
}
