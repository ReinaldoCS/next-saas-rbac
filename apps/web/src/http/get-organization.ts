import { api } from './api-client'

interface GetOrganizationRequest {
  slug: string
}

interface GetOrganizationResponse {
  organization: {
    id: string
    name: string
    slug: string
    domain: string | null
    shouldAttachUsersByDomain: boolean
    avatarUrl: string | null
    createdAt: string
    updatedAt: string | null
    ownerId: string
  }
}

export async function getOrganization({
  slug,
}: GetOrganizationRequest): Promise<GetOrganizationResponse> {
  const result = await api
    .get(`organizations/${slug}`)
    .json<GetOrganizationResponse>()

  return result
}
