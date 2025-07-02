/*
  # Initial Database Schema for SciencePapers

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
    - `subjects` - Science subjects (Chemistry, Physics, Biology)
    - `papers` - Past papers and educational content
    - `questions` - Questions within papers
    - `user_responses` - Student answers to questions
    - `ai_gradings` - AI-generated grading results
    - `exam_settings` - Admin-configured exam parameters
    - `user_progress` - Learning progress tracking
    - `achievements` - User achievements and XP
    - `collaborations` - Real-time collaboration sessions
    - `annotations` - User annotations on papers
    - `subscriptions` - User subscription plans

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for sensitive operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE subscription_plan AS ENUM ('free', 'premium', 'pro');
CREATE TYPE paper_type AS ENUM ('1st-year-1st-term', '1st-year-2nd-term', '1st-year-3rd-term', '2nd-year-1st-term', '2nd-year-2nd-term', '2nd-year-3rd-term', 'practical', 'past-paper', 'model-paper');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_type AS ENUM ('multiple-choice', 'short-answer', 'essay', 'calculation', 'diagram', 'practical');
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE language_code AS ENUM ('en', 'ta', 'si');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role DEFAULT 'student',
  subscription subscription_plan DEFAULT 'free',
  avatar_url text,
  preferences jsonb DEFAULT '{"language": "en", "theme": "light", "notifications": true}',
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak_days integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  display_name jsonb NOT NULL, -- {"en": "Chemistry", "ta": "வேதியியல்", "si": "රසායන විද්‍යාව"}
  color text NOT NULL,
  icon text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  year integer NOT NULL,
  paper_type paper_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  language language_code DEFAULT 'en',
  file_url text,
  file_size text,
  content_text text, -- Extracted text for AI analysis
  tags text[] DEFAULT '{}',
  has_answers boolean DEFAULT false,
  has_answer_scheme boolean DEFAULT false,
  has_ai_tutor boolean DEFAULT false,
  download_count integer DEFAULT 0,
  status content_status DEFAULT 'pending',
  uploaded_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  marks integer NOT NULL,
  topic text,
  difficulty difficulty_level NOT NULL,
  correct_answer jsonb, -- Flexible for different answer types
  explanation text,
  common_mistakes text[],
  hints text[],
  related_concepts text[],
  marking_scheme jsonb, -- Array of marking criteria
  created_at timestamptz DEFAULT now()
);

-- User responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  time_spent integer, -- seconds
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id, submitted_at)
);

-- AI grading table
CREATE TABLE IF NOT EXISTS ai_gradings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id uuid REFERENCES user_responses(id) ON DELETE CASCADE,
  total_marks numeric(5,2) NOT NULL,
  max_marks integer NOT NULL,
  percentage numeric(5,2) NOT NULL,
  grade text,
  feedback text,
  strengths text[],
  improvements text[],
  detailed_breakdown jsonb,
  suggested_resources text[],
  ai_model text DEFAULT 'gemini-pro',
  confidence_score numeric(3,2),
  created_at timestamptz DEFAULT now()
);

-- Exam settings table
CREATE TABLE IF NOT EXISTS exam_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  time_limit integer NOT NULL, -- minutes
  allow_pause boolean DEFAULT true,
  show_timer boolean DEFAULT true,
  auto_submit boolean DEFAULT true,
  shuffle_questions boolean DEFAULT false,
  show_results boolean DEFAULT true,
  passing_score integer DEFAULT 60,
  max_attempts integer DEFAULT 3,
  available_from timestamptz,
  available_to timestamptz,
  instructions text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  total_time_spent integer DEFAULT 0, -- seconds
  best_score numeric(5,2),
  attempts integer DEFAULT 0,
  completed boolean DEFAULT false,
  xp_earned integer DEFAULT 0,
  last_attempt timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, paper_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text,
  xp_reward integer DEFAULT 0,
  rarity text DEFAULT 'common', -- common, rare, epic, legendary
  criteria jsonb NOT NULL, -- Conditions to unlock
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Collaboration sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  max_participants integer DEFAULT 10,
  is_active boolean DEFAULT true,
  session_data jsonb DEFAULT '{}', -- Real-time collaboration state
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Collaboration participants table
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(session_id, user_id)
);

-- Annotations table
CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  position jsonb, -- {x, y, page} coordinates
  is_public boolean DEFAULT false,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status text DEFAULT 'active', -- active, cancelled, expired
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_gradings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subjects policies (public read)
CREATE POLICY "Anyone can view subjects" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Papers policies
CREATE POLICY "Anyone can view approved papers" ON papers
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own papers" ON papers
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Authenticated users can upload papers" ON papers
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own pending papers" ON papers
  FOR UPDATE USING (uploaded_by = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all papers" ON papers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Questions policies
CREATE POLICY "Anyone can view questions for approved papers" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM papers 
      WHERE id = questions.paper_id AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User responses policies
CREATE POLICY "Users can view own responses" ON user_responses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own responses" ON user_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all responses" ON user_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- AI gradings policies
CREATE POLICY "Users can view own gradings" ON ai_gradings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_responses 
      WHERE id = ai_gradings.response_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create gradings" ON ai_gradings
  FOR INSERT WITH CHECK (true);

-- Exam settings policies
CREATE POLICY "Anyone can view exam settings" ON exam_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exam settings" ON exam_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can award achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

-- Collaboration policies
CREATE POLICY "Users can view active sessions" ON collaboration_sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create sessions" ON collaboration_sessions
  FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can manage own sessions" ON collaboration_sessions
  FOR ALL USING (host_id = auth.uid());

-- Collaboration participants policies
CREATE POLICY "Users can view session participants" ON collaboration_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaboration_sessions 
      WHERE id = collaboration_participants.session_id AND is_active = true
    )
  );

CREATE POLICY "Users can join sessions" ON collaboration_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Annotations policies
CREATE POLICY "Users can view public annotations" ON annotations
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own annotations" ON annotations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create annotations" ON annotations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own annotations" ON annotations
  FOR UPDATE USING (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions" ON subscriptions
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_papers_subject_status ON papers(subject_id, status);
CREATE INDEX idx_papers_year_type ON papers(year, paper_type);
CREATE INDEX idx_questions_paper ON questions(paper_id);
CREATE INDEX idx_user_responses_user_question ON user_responses(user_id, question_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_annotations_paper_public ON annotations(paper_id, is_public);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
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