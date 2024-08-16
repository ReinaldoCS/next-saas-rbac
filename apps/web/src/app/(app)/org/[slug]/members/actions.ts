'use server'

import { type Roles, rolesSchema } from '@saas/auth'
import { HTTPError } from 'ky'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { getCurrentOrg } from '@/auth/auth'
import { createInvite } from '@/http/create-invite'
import { revokeInvite } from '@/http/remoke-invite'
import { removeMember } from '@/http/remove-member'
import { updateMember } from '@/http/update-member'

export async function removeMemberAction(memberId: string) {
  const currentOrg = getCurrentOrg()

  await removeMember({ memberId, org: currentOrg! })

  revalidateTag(`${currentOrg}-members`)
}

export async function updateMemberAction(memberId: string, role: Roles) {
  const currentOrg = getCurrentOrg()

  await updateMember({ memberId, role, org: currentOrg! })

  revalidateTag(`${currentOrg}-members`)
}

export async function revokeInviteAction(inviteId: string) {
  const currentOrg = getCurrentOrg()

  await revokeInvite({ inviteId, org: currentOrg! })

  revalidateTag(`${currentOrg}-invites`)
}

const inviteSchema = z.object({
  email: z.string().email({ message: 'Invalid e-mail address' }),
  role: rolesSchema,
})

export async function createInviteAction(data: FormData) {
  const results = inviteSchema.safeParse(Object.fromEntries(data))
  const currentOrg = getCurrentOrg()

  if (!results.success) {
    const errors = results.error.flatten().fieldErrors
    return {
      success: false,
      message: null,
      errors,
    }
  }

  const { email, role } = results.data

  try {
    await createInvite({ email, role, orgSlug: currentOrg! })

    // Revalidate serve query
    revalidateTag(`${currentOrg}-invites`)
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = (await error.response.json()) as { message: string }

      return {
        success: false,
        message,
        errors: null,
      }
    }

    console.error(error)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
    }
  }

  return {
    success: true,
    message: 'Successfully create the invite.',
    errors: null,
  }
}
