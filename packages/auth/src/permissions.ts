import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'

export type Roles = 'ADMIN' | 'MEMBERS'

type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const rolePermissions: Record<Roles, DefinePermissions> = {
  ADMIN: (_, { can }) => {
    can('manage', 'all')
  },
  MEMBERS: (_, { can }) => {
    can('invite', 'User')
  },
}
