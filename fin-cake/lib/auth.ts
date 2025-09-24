import { supabase } from './supabaseClient'

export interface AuthUser {
  id: string
  email: string
}

// Sign in with email (magic link)
export async function signInWithOtp(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sign in error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sign out error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Get current session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { success: true, session }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Get session error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email || ''
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Get user error:', errorMessage)
    return null
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || ''
      })
    } else {
      callback(null)
    }
  })
}
