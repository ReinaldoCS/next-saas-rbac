import type { Roles } from '@saas/auth'

import { api } from './api-client'

interface GetPendingInvitesResponse {
  invites: {
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
      name: string
    } | null
  }[]
}

export async function getPendingInvites(): Promise<GetPendingInvitesResponse> {
  const result = await api
    .post('pending-invites')
    .json<GetPendingInvitesResponse>()

  return result
}
