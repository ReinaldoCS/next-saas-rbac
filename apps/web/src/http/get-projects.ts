import { api } from './api-client'

interface GetProjectsResponse {
  projects: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    createdAt: Date
    ownerId: string
    organizationId: string
    description: string
    owner: {
      id: string
      name: string | null
      avatarUrl: string | null
    } | null
  }[]
}

export async function getProjects(
  orgSlug: string,
): Promise<GetProjectsResponse> {
  const result = await api
    .get(`organizations/${orgSlug}/projects`, {
      next: {
        tags: [`${orgSlug}-projects`],
      },
    })
    .json<GetProjectsResponse>()

  return result
}
