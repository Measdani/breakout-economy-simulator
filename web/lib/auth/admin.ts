import { cookies } from 'next/headers'

export function isAdmin(): boolean {
  const adminToken = cookies().get('admin_token')?.value
  return adminToken === process.env.ADMIN_SECRET_KEY
}

export function requireAdmin() {
  if (!isAdmin()) {
    throw new Error('Unauthorized')
  }
}
