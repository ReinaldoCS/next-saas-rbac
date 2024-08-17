export function getInitials(name: string): string {
  const nameParts = name.trim().split(' ')
  let initials = ''

  for (let i = 0; i < nameParts.length && initials.length < 2; i++) {
    if (nameParts[i]) {
      initials += nameParts[i][0].toUpperCase()
    }
  }

  return initials
}
