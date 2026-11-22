'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

/**
 * Submit credentials on the server instead of relying on a client-only
 * onSubmit handler. This prevents unhydrated forms from falling back to
 * GET /login?identifier=... without creating an authentication session.
 */
export async function loginWithCredentials(formData: FormData) {
  const identifier = String(formData.get('identifier') || '').trim()
  const password = String(formData.get('password') || '')

  if (!identifier || !password) {
    redirect('/login?error=credentials')
  }

  try {
    await signIn('credentials', {
      identifier,
      password,
      redirectTo: '/',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login?error=credentials')
    }
    // Successful NextAuth sign-in redirects through a special Next.js error.
    // Re-throw that redirect (and unexpected errors) unchanged.
    throw error
  }
}
