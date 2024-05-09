import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBERS' })

const userCanInviteSomeoneElse = ability.can('invite', 'User')
const userCanDeleteOtherElse = ability.can('delete', 'User')

const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(userCanInviteSomeoneElse)
console.log(userCanDeleteOtherElse)
console.log(userCannotDeleteOtherUsers)
