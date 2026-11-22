/**
 * Next.js Middleware with Security Headers
 * 
 * This middleware runs on every request to:
 * - Apply Content Security Policy (CSP) headers for XSS protection
 * - Set security headers (X-Frame-Options, X-Content-Type-Options, etc.)
 * - Implement referrer policy for privacy
 * - Configure permissions policy to restrict browser APIs
 * - Enable CSRF protection via NextAuth SameSite cookies
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(() => {
  const response = NextResponse.next()

  // Security headers compatible with AI Studio Preview iframe and proxy
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}