'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionCookieOptions,
} from '@/lib/auth/admin'

export async function logout() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  })
  cookieStore.set('admin_token', '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  })

  redirect('/admin/login')
}
