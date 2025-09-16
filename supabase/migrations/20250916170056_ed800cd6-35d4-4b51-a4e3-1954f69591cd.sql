-- Add cascading deletes to handle couple relationships properly

-- First, let's add foreign keys with cascade delete where missing
-- This will ensure when we delete a couple, all related records are deleted automatically

-- Add foreign key constraints with CASCADE DELETE for couples table references
ALTER TABLE daily_questions 
DROP CONSTRAINT IF EXISTS daily_questions_couple_id_fkey,
ADD CONSTRAINT daily_questions_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE quiz_answers 
DROP CONSTRAINT IF EXISTS quiz_answers_couple_id_fkey,
ADD CONSTRAINT quiz_answers_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE game_stats 
DROP CONSTRAINT IF EXISTS game_stats_couple_id_fkey,
ADD CONSTRAINT game_stats_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE chat_threads 
DROP CONSTRAINT IF EXISTS chat_threads_couple_id_fkey,
ADD CONSTRAINT chat_threads_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE calendar_events 
DROP CONSTRAINT IF EXISTS calendar_events_couple_id_fkey,
ADD CONSTRAINT calendar_events_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE calendar_todos 
DROP CONSTRAINT IF EXISTS calendar_todos_couple_id_fkey,
ADD CONSTRAINT calendar_todos_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE calendar_souvenirs 
DROP CONSTRAINT IF EXISTS calendar_souvenirs_couple_id_fkey,
ADD CONSTRAINT calendar_souvenirs_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE quiz_results 
DROP CONSTRAINT IF EXISTS quiz_results_couple_id_fkey,
ADD CONSTRAINT quiz_results_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE simple_chat_notifications 
DROP CONSTRAINT IF EXISTS simple_chat_notifications_couple_id_fkey,
ADD CONSTRAINT simple_chat_notifications_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

ALTER TABLE daily_question_notifications 
DROP CONSTRAINT IF EXISTS daily_question_notifications_couple_id_fkey,
ADD CONSTRAINT daily_question_notifications_couple_id_fkey 
FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

-- Also add foreign keys for profiles to allow CASCADE DELETE for users
ALTER TABLE couples 
DROP CONSTRAINT IF EXISTS couples_user1_id_fkey,
ADD CONSTRAINT couples_user1_id_fkey 
FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE couples 
DROP CONSTRAINT IF EXISTS couples_user2_id_fkey,
ADD CONSTRAINT couples_user2_id_fkey 
FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE;