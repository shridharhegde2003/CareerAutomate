import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sapmqweflhqfprkjoikk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcG1xd2VmbGhxZnBya2pvaWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTQ3MTEsImV4cCI6MjA3NzA3MDcxMX0.5PcRJwNmEaa3wCvZeo2pR7C8wQYKf-g6F_mDXRT5rqo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
