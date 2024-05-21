export function createSlug(text: string): string {
  // Remove acentos
  const withoutAccents = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Substituir caracteres especiais por espaço
  const withoutSpecialChars = withoutAccents.replace(/[^a-zA-Z0-9\s]/g, '')

  // Substituir espaços por hifens e converter para minúsculas
  const slug = withoutSpecialChars.trim().replace(/\s+/g, '-').toLowerCase()

  return slug
}
