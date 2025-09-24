import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fwcktzrwaazlzxstbnbp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Y2t0enJ3YWF6bHp4c3RibmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODY0ODcsImV4cCI6MjA3NDI2MjQ4N30.o8dnVeL_2YR9BhV_oFscgBDizgdjs61jfOMHkcPiCyE'

// Browser/client client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (for API routes)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
