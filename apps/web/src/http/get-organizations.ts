import { api } from './api-client'

interface GetOrganizationsResponse {
  organization: [
    {
      id: string
      name: string | null
      email: string
      slug: string
      avatarUrl: string | null
    },
  ]
}

export async function getOrganizations(): Promise<GetOrganizationsResponse> {
  const result = await api.get('organizations').json<GetOrganizationsResponse>()

  return result
}
