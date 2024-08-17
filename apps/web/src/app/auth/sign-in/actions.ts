'use server'

import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please, provider a valid e-mail address.' }),
  password: z.string().min(6, { message: 'Please, provider your password.' }),
})

export async function signInWithEmailAndPassword(data: FormData) {
  const results = signInSchema.safeParse(Object.fromEntries(data))

  if (!results.success) {
    const errors = results.error.flatten().fieldErrors
    return {
      success: false,
      message: null,
      errors,
    }
  }

  try {
    const { token } = await signInWithPassword(results.data)

    cookies().set('saas-token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    const inviteId = cookies().get('inviteId')?.value

    if (inviteId) {
      try {
        await acceptInvite({ inviteId })
      } finally {
        cookies().delete('inviteId')
      }
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = (await error.response.json()) as { message: string }

      return {
        success: false,
        message,
        errors: null,
      }
    }

    console.error(error)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
