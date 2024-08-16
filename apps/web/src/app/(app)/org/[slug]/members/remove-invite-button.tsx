import { XOctagon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { revokeInviteAction } from './actions'

interface RemoveInviteButton {
  inviteId: string
}

export function RemoveInviteButton({ inviteId }: RemoveInviteButton) {
  return (
    <form action={revokeInviteAction.bind(null, inviteId)}>
      <Button size="sm" variant="destructive">
        <XOctagon className="mr-2 size-4" />
        Remove invite
      </Button>
    </form>
  )
}
