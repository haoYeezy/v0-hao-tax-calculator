import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we have the required environment variables
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey

// Create a comprehensive mock client for when credentials are missing
const createMockSupabaseClient = () => {
  const mockResponse = { data: null, error: null }

  const mockQuery = {
    select: () => mockQuery,
    eq: () => mockQuery,
    single: async () => mockResponse,
    delete: async () => mockResponse,
    upsert: async () => mockResponse,
    insert: async () => mockResponse,
    update: async () => mockResponse,
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => mockQuery,
  }
}

// Create a mock client or real client based on available credentials
export const supabase = hasSupabaseCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMockSupabaseClient() as any)

// Helper function to get the current user
export const getCurrentUser = async () => {
  if (!hasSupabaseCredentials) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to get a unique user identifier
export const getUserId = async () => {
  const user = await getCurrentUser()
  return user?.id || "anonymous"
}
