/**
 * Authentication Service
 * 
 * Handles user authentication for the performance management system supporting:
 * - Office workers: Email + password authentication
 * - Operational workers: Username + PIN authentication  
 * - Company-based multi-tenancy with optional company codes
 * - Secure password hashing with bcryptjs
 * - Role-based access control (employee, manager, hr)
 * - User type differentiation (office vs operational workers)
 */

import bcrypt from 'bcryptjs'
import { prisma } from './prisma-client'

export interface AuthUser {
  id: string
  name: string
  email?: string
  username?: string
  role: string
  companyId: string
  userType: 'office' | 'operational'
  department?: string
  position?: string
}

export async function authenticateUser(
  identifier: string,
  password: string,
  companyCode?: string
): Promise<AuthUser | null> {
  const normalizedIdentifier = identifier.trim()
  const normalizedPassword = password.trim()
  if (!normalizedIdentifier || !normalizedPassword) {
    return null
  }

  // Determine if identifier is email or username
  const isEmail = normalizedIdentifier.includes('@')
  const lookupIdentifier = isEmail
    ? normalizedIdentifier.toLowerCase()
    : normalizedIdentifier

  // Security guard: never allow synthetic @demo.com accounts in production
  if (
    process.env.NODE_ENV === 'production' &&
    isEmail &&
    lookupIdentifier.endsWith('@demo.com')
  ) {
    return null
  }

  const findUser = async () => {
    if (isEmail) {
      return prisma.user.findFirst({
        where: {
          email: lookupIdentifier,
          active: true,
          ...(companyCode && {
            company: { code: companyCode }
          })
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          passwordHash: true,
          role: true,
          companyId: true,
          userType: true,
          department: true,
          position: true,
          company: {
            select: { code: true }
          }
        }
      })
    }

    return prisma.user.findFirst({
      where: {
        username: lookupIdentifier,
        active: true,
        ...(companyCode && {
          company: { code: companyCode }
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        companyId: true,
        userType: true,
        department: true,
        position: true,
        company: {
          select: { code: true }
        }
      }
    })
  }

  let user = await findUser()

  // If in development/preview and demo user is missing (e.g. after container restart), auto-seed synthetic demo data
  if (!user && process.env.NODE_ENV !== 'production') {
    const userCount = await prisma.user.count()
    if (userCount === 0 || lookupIdentifier.endsWith('@demo.com')) {
      const { seedDatabase } = await import('./seed')
      await seedDatabase()
      user = await findUser()
    }
  }

  if (!user || !user.passwordHash) {
    return null
  }

  // Verify password (check raw password first, then trimmed password for copy-paste tolerance)
  const isValidPassword =
    (await bcrypt.compare(password, user.passwordHash)) ||
    (password !== normalizedPassword &&
      (await bcrypt.compare(normalizedPassword, user.passwordHash)))

  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email || undefined,
    username: user.username || undefined,
    role: user.role,
    companyId: user.companyId,
    userType: user.userType as 'office' | 'operational',
    department: user.department || undefined,
    position: user.position || undefined
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id, active: true },
    include: { company: true }
  })

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email || undefined,
    username: user.username || undefined,
    role: user.role,
    companyId: user.companyId,
    userType: user.userType as 'office' | 'operational',
    department: user.department || undefined,
    position: user.position || undefined
  }
}