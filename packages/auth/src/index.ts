import { Ability, AbilityBuilder, ForcedSubject } from '@casl/ability'

import { User } from './models/user'
import { rolePermissions } from './permissions'

const actions = ['manage', 'invite', 'delete'] as const
const subjects = ['User', 'all'] as const

type AppAbilities = [
  (typeof actions)[number],
  (
    | (typeof subjects)[number]
    | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>
  ),
]
export type AppAbility = Ability<AppAbilities>

export function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(Ability)

  if (typeof rolePermissions[user.role] !== 'function') {
    throw new Error(`Permissions for role "${user.role}" not found!`)
  }

  rolePermissions[user.role](user, builder)

  return builder.build()
}
