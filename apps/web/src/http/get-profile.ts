import { api } from './api-client'

interface GetProfileResponse {
  user: {
    id: string
    name: string | null
    avatarUrl: string | null
    email: string
  }
}

export async function getProfile(): Promise<GetProfileResponse> {
  const result = await api.get('profile').json<GetProfileResponse>()

  return result
}
