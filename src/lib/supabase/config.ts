import { createClient } from '@supabase/supabase-js'

// Supabase configuration with correct variable names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://iyezdyycisbakuozpcym.supabase.co'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTIyMjUsImV4cCI6MjA2Mzk2ODIyNX0.T5qpZ_aDtliO3g9f4Com6fERFVQyas6BzJgde60ggH4'

// Create client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// For server-side operations
export const createSupabaseServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not available, using anon key')
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export default supabase 