import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://pcsxikfvpunrkhfnauqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjc3hpa2Z2cHVucmtoZm5hdXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzUyODksImV4cCI6MjA2NzIxMTI4OX0.8N3j0y8ute4BnElX4U5P3Rfd6-OKPPJA2-kdSRRNqzU';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };