import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '@/lib/supabase'
import { Session, AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateCarePoints: (points: number, action: string, description: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      toast.success('Welcome back to your growth journey!')
    } catch (error) {
      const authError = error as AuthError
      console.error('Sign in error:', authError)
      toast.error(authError.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      setLoading(true)
      
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        throw new Error('Username already taken')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              username,
              full_name: fullName,
              carepoints: 0,
              created_at: new Date().toISOString(),
            }
          ])

        if (profileError) throw profileError
        
        toast.success('Welcome to GROWTH Tribe! Your journey begins now.')
      }
    } catch (error) {
      const authError = error as AuthError
      console.error('Sign up error:', authError)
      toast.error(authError.message || 'Failed to create account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('See you on your next growth session!')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      throw error
    }
  }

  const updateCarePoints = async (points: number, action: string, description: string) => {
    if (!user) return

    try {
      const newPoints = (user.carepoints || 0) + points

      // Update user's Growth Points
      const { error: updateError } = await supabase
        .from('users')
        .update({ carepoints: newPoints })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Log the Growth Points transaction
      const { error: logError } = await supabase
        .from('carepoints_log')
        .insert([
          {
            user_id: user.id,
            points,
            action,
            description,
            created_at: new Date().toISOString(),
          }
        ])

      if (logError) console.error('Error logging Growth Points:', logError)

      // Update local user state
      setUser(prev => prev ? { ...prev, carepoints: newPoints } : null)
      
      toast.success(`+${points} Growth Points earned! ${description}`)
    } catch (error) {
      console.error('Error updating Growth Points:', error)
      toast.error('Failed to update Growth Points')
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateCarePoints,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
