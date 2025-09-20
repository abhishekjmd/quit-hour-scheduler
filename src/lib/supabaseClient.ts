import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// If you have generated types, pass them here: createClient<Database>(...)
export const supaBase = createClient(supabaseUrl, supabaseAnonKey);
