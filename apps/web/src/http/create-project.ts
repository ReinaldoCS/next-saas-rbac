import { api } from './api-client'

interface CreateProjectRequest {
  orgSlug: string
  name: string
  description: string
}

type CreateProjectResponse = void

export async function createProject({
  orgSlug,
  name,
  description,
}: CreateProjectRequest): Promise<CreateProjectResponse> {
  await api
    .post(`organizations/${orgSlug}/projects`, {
      json: {
        name,
        description,
      },
    })
    .json<CreateProjectResponse>()
}
