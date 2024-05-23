import {
  type AppAbility,
  defineAbilityFor,
  type Roles,
  userSchema,
} from '@saas/auth'

export function getUserPermissions(userId: string, role: Roles): AppAbility {
  const authUser = userSchema.parse({
    id: userId,
    role,
  })

  return defineAbilityFor(authUser)
}
