import type { Roles } from '@saas/auth'

import { api } from './api-client'

interface CreateInviteRequest {
  orgSlug: string
  email: string
  role: Roles
}

type CreateInviteResponse = {
  inviteId: string
}

export async function createInvite({
  orgSlug,
  email,
  role,
}: CreateInviteRequest): Promise<CreateInviteResponse> {
  const results = await api
    .post(`organizations/${orgSlug}/invites`, {
      json: {
        email,
        role,
      },
    })
    .json<CreateInviteResponse>()

  return results
}
