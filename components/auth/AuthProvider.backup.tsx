'use client'

import { createClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as DbUser } from '@/types/blog'

type AuthContextType = {
  session: Session | null
  user: (User & Partial<DbUser>) | null
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  error: null,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<(User & Partial<DbUser>) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setSession(session)
        
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (userError) {
            throw userError
          }
          
          setUser({
            ...session.user,
            ...userData,
          })
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    getSession()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (userError) {
            setError(userError.message)
            setUser(null)
          } else {
            setUser({
              ...session.user,
              ...userData,
            })
          }
        } else {
          setUser(null)
        }
        
        router.refresh()
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <AuthContext.Provider value={{ session, user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)