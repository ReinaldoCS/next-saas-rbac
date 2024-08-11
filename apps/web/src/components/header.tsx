import Image from 'next/image'

import rocketseatIcon from '@/assets/rocketseat-icon.svg'

import { ProfileButton } from './profile-button'

export function Header() {
  return (
    <header className="mx-auto flex max-w-[1200px] items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src={rocketseatIcon}
          alt="Rocketseat"
          className="size-6 dark:invert"
        />
      </div>

      <div className="flex items-center gap-4">
        <ProfileButton />
      </div>
    </header>
  )
}
