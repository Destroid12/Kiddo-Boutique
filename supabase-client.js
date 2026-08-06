const SUPABASE_URL = window.KIDDO_SUPABASE_URL || 'https://iyiyocfrztbyrooaleyq.supabase.co';
const SUPABASE_ANON_KEY = window.KIDDO_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5aXlvY2ZyenRieXJvb2FsZXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAwMDY0MSwiZXhwIjoyMTAxNTc2NjQxfQ.FEwBrTNR1J_uMRDR5WwGOkI8WnbTOSa69HUdmwcEKSk';

var supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}
