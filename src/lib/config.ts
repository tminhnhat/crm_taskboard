// Utility to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(url && key && url !== 'https://demo-project.supabase.co' && !key.includes('demo'));
}

export function isBlobConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return !!(token && !token.includes('demo'));
}
