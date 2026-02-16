import { cookies } from 'next/headers'

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')?.value
  return adminToken === process.env.ADMIN_SECRET_KEY
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized')
  }
}
