import { Roles } from '@saas/auth'

import { api } from './api-client'

interface GetMembershipResponse {
  membership: {
    id: string
    userId: string
    role: Roles
    organizationId: string
  }
}

export async function getMembership(
  org: string,
): Promise<GetMembershipResponse> {
  const result = await api
    .get(`organizations/${org}/membership`)
    .json<GetMembershipResponse>()

  return result
}
