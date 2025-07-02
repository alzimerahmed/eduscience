/*
  # Additional Tables for Enhanced Functionality

  1. New Tables
    - `content_analysis_logs` - Store AI content analysis logs
    - `user_notes` - Store user workspace notes
    - `note_tags` - Many-to-many relationship between notes and tags
    - `tags` - Store reusable tags for notes and other content
    - `user_feedback` - Store user feedback on AI features

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
*/

-- Content analysis logs table for AI analysis tracking
CREATE TABLE IF NOT EXISTS content_analysis_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_sample text NOT NULL,  -- First ~1000 chars of content
  analysis_results jsonb NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- User notes table for workspace feature
CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  folder text,  -- User-defined folder
  is_favorite boolean DEFAULT false,
  last_edited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tags table for organizing content
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  color text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Many-to-many relationship between notes and tags
CREATE TABLE IF NOT EXISTS note_tags (
  note_id uuid REFERENCES user_notes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- User feedback on AI features
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  feature_type text NOT NULL,  -- 'ai_tutor', 'recommendations', 'analytics', etc.
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE content_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_analysis_logs (admin only)
CREATE POLICY "Only admins can view analysis logs" ON content_analysis_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for user_notes
CREATE POLICY "Users can view own notes" ON user_notes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own notes" ON user_notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes" ON user_notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notes" ON user_notes
  FOR DELETE USING (user_id = auth.uid());

-- RLS policies for tags
CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (created_by = auth.uid());

-- RLS policies for note_tags
CREATE POLICY "Users can view own note tags" ON note_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_notes 
      WHERE id = note_tags.note_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own notes" ON note_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_notes 
      WHERE id = note_tags.note_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from own notes" ON note_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_notes 
      WHERE id = note_tags.note_id AND user_id = auth.uid()
    )
  );

-- RLS policies for user_feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can submit feedback" ON user_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all feedback" ON user_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_folder ON user_notes(user_id, folder);
CREATE INDEX idx_user_feedback_user ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_feature ON user_feedback(feature_type);