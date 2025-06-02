import { type UserRole } from '@/types/blog'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'
import { cookies } from 'next/headers'

export async function getUserFromServer() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return null
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!userProfile) {
    return null
  }

  return {
    ...session.user,
    ...userProfile
  }
}

export function checkRole(requiredRoles: UserRole[], userRole?: UserRole) {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

export async function requireAuth(
  requiredRoles: UserRole[] = ['user', 'author', 'admin']
) {
  const user = await getUserFromServer()

  if (!user) {
    redirect('/login')
  }

  if (!checkRole(requiredRoles, user.role)) {
    redirect('/')
  }

  return user
}