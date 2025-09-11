import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uvdwymweuwfrzdqmhsjh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZHd5bXdldXdmcnpkcW1oc2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTMxNDQsImV4cCI6MjA3MjY2OTE0NH0.9upekTjCGOSNUH0QyoCHE_TH4k34IznM_f4iSs2Rgb8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Types
export interface Profile {
  id: string;
  name: string;
  profile_picture?: string;
  mood?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  country?: string;
  interests?: string[];
  invite_code?: string;
  created_at: string;
  completed: boolean;
}

export interface Couple {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id?: string;
}

export interface Question {
  id: string;
  content: string;
  created_at: string;
  scheduled_time: string;
}

export interface DailyQuestion {
  id: string;
  couple_id?: string;
  question_id?: string;
  scheduled_for: string;
  created_at: string;
}

export interface QuizTheme {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  theme_id: string;
  title: string;
  description?: string;
  image?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  content: string;
  ord: number;
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  quiz_id: string;
  user_id: string;
  couple_id: string;
  answer_value: number;
  created_at: string;
  answered_at: string;
}