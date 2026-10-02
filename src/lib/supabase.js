import { createClient } from '@supabase/supabase-js'

// Frontend uses the PUBLISHABLE key only. The SECRET key must never be
// bundled into this app — it belongs on a server (e.g. a Supabase Edge
// Function) for admin tasks like deleting auth users.
const url = import.meta.env?.VITE_SUPABASE_URL || ''
const publishableKey =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(url && publishableKey)

export const supabase = isSupabaseConfigured ? createClient(url, publishableKey) : null
