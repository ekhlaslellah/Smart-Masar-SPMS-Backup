import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Resolve the user's destination on the server so login does not depend on
 * SessionProvider hydration or client-side window.location redirects.
 */
export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  switch (session.user.role) {
    case 'hr':
      redirect('/dashboard')
    case 'manager':
      redirect('/evaluations')
    default:
      redirect('/my-evaluations')
  }
}
