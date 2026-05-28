// File: src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ytzagjdxjyuxkchjgrsh.supabase.co'
const supabaseKey = 'sb_publishable_V0dZ0N97ApHgAh-M15H0Rg_6_0JMhj-'

export const supabase = createClient(supabaseUrl, supabaseKey)