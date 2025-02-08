import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tfwgkvzhpougjywsxveu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmd2drdnpocG91Z2p5d3N4dmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NDQzNzQsImV4cCI6MjA1NDUyMDM3NH0.7pxfdrhSng3bl1ctmgyDiiIOinhcHzhYamI21JCul_I";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
