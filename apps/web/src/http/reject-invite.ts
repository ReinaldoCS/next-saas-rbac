import { api } from './api-client'

interface RevokeInviteRequest {
  inviteId: string
}

export async function rejectInvite({ inviteId }: RevokeInviteRequest) {
  await api.post(`invites/${inviteId}/reject`)
}
