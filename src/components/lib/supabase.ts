import { createClient } from '@supabase/supabase-js'

// Using the provided Supabase credentials
const supabaseUrl = 'https://kjffnjcswakrmoqumbzn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZmZuamNzd2Frcm1vcXVtYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTU0NjksImV4cCI6MjA3OTMzMTQ2OX0.5fG3qJU3bLpXos94C1mGEJ7TueeK2pKh0Ov9f91fVp8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  carepoints: number
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  user?: User
  comments?: Comment[]
  reactions?: Reaction[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: User
  reactions?: Reaction[]
}

export interface Reaction {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  emoji: string
  created_at: string
  user?: User
}

export interface CarePoint {
  id: string
  user_id: string
  points: number
  action_type: string
  description: string
  created_at: string
}
