import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ptoiqoqsaledvzhutkum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0b2lxb3FzYWxlZHZ6aHV0a3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NjMxNjAsImV4cCI6MjA1NTUzOTE2MH0.LfvzbqKRHHPTKbDXndvekzXmYbMpUZOPGlF_ZRWdNTc",
);
