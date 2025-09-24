import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fwcktzrwaazlzxstbnbp.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Y2t0enJ3YWF6bHp4c3RibmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODY0ODcsImV4cCI6MjA3NDI2MjQ4N30.o8dnVeL_2YR9BhV_oFscgBDizgdjs61jfOMHkcPiCyE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auth for this no-login MVP
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Database types
export interface NewsCluster {
  id: string;
  topic: string;
  summary: string;
  created_at: string;
}

export interface News {
  id: string;
  cluster_id: string;
  title: string;
  summary: string;
  source_url: string;
  source: string;
  published_at: string;
}

// Helper function to test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('news_clusters')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.log('Supabase connection error:', err);
    return false;
  }
};
