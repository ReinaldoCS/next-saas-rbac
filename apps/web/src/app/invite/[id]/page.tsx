import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getInvite } from '@/http/get-invite'

dayjs.extend(relativeTime)

interface InvitePageProps {
  params: {
    id: string
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const inviteId = params.id

  const { invite } = await getInvite(inviteId)

  function getInitials(name: string): string {
    const nameParts = name.trim().split(' ')
    let initials = ''

    for (let i = 0; i < nameParts.length && initials.length < 2; i++) {
      if (nameParts[i]) {
        initials += nameParts[i][0].toUpperCase()
      }
    }

    return initials
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="size-16">
            <AvatarFallback>
              {getInitials(invite.author?.name ?? 'Someone')}
            </AvatarFallback>

            {invite.author?.avatarUrl && (
              <AvatarImage src={invite.author?.avatarUrl} />
            )}
          </Avatar>

          <p className="text-balance text-center leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {invite.author?.name ?? 'Someone'}
            </span>{' '}
            invited you to join{' '}
            <span className="font-medium text-foreground">
              {invite.organization?.name}.
            </span>{' '}
            <span className="text-sm">{dayjs(invite.createdAt).fromNow()}</span>
          </p>
        </div>

        <Separator />
      </div>
    </div>
  )
}
