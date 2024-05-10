import { Ability, AbilityBuilder } from '@casl/ability'
import { z } from 'zod'

import { User } from './models/user'
import { rolePermissions } from './permissions'
import { billingSubjectSchema } from './subjects/billing'
import { inviteSubjectSchema } from './subjects/invite'
import { organizationSubjectSchema } from './subjects/organization'
import { projectSubjectSchema } from './subjects/project'
import { userSubjectSchema } from './subjects/user'

export * from './models/organization'
export * from './models/project'
export * from './models/user'

const appAbilitiesSchema = z.union([
  billingSubjectSchema,
  inviteSubjectSchema,
  organizationSubjectSchema,
  projectSubjectSchema,
  userSubjectSchema,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = Ability<AppAbilities>

export function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(Ability)

  if (typeof rolePermissions[user.role] !== 'function') {
    throw new Error(`Permissions for role "${user.role}" not found!`)
  }

  rolePermissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType: (subject) => {
      return subject.__typename
    },
  })

  return ability
}
