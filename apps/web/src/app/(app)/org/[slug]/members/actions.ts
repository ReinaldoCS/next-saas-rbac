'use server'

import type { Roles } from '@saas/auth'
import { revalidateTag } from 'next/cache'

import { getCurrentOrg } from '@/auth/auth'
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