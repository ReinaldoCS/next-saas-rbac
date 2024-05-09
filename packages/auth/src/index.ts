import { Ability, AbilityBuilder } from '@casl/ability'

import { User } from './models/user'
import { rolePermissions } from './permissions'
import { ProjectSubject } from './subjects/project'
import { UserSubject } from './subjects/user'

type AppAbilities = UserSubject | ProjectSubject | ['manage', 'all']

export type AppAbility = Ability<AppAbilities>

export function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(Ability)

  if (typeof rolePermissions[user.role] !== 'function') {
    throw new Error(`Permissions for role "${user.role}" not found!`)
  }

  rolePermissions[user.role](user, builder)

  return builder.build()
}
