/*
  # Fix update_updated_at_column function security issue

  1. Drop dependent triggers
  2. Drop and recreate function with security improvements
  3. Recreate all triggers
*/

-- Drop all triggers that depend on the function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_papers_updated_at ON papers;
DROP TRIGGER IF EXISTS update_exam_settings_updated_at ON exam_settings;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
DROP TRIGGER IF EXISTS update_annotations_updated_at ON annotations;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with security improvements
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate all the triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_settings_updated_at BEFORE UPDATE ON exam_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();