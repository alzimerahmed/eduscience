/*
  # Seed Data for SciencePapers

  1. Insert default subjects
  2. Insert sample achievements
  3. Insert admin user profile
  4. Insert sample papers and questions
*/

-- Insert subjects
INSERT INTO subjects (name, display_name, color, icon, description) VALUES
('chemistry', '{"en": "Chemistry", "ta": "வேதியியல்", "si": "රසායන විද්‍යාව"}', 'bg-green-500', 'TestTube', 'Study of matter, its properties, and reactions'),
('physics', '{"en": "Physics", "ta": "இயற்பியல்", "si": "භෞතික විද්‍යාව"}', 'bg-blue-500', 'Atom', 'Study of matter, energy, and their interactions'),
('biology', '{"en": "Biology", "ta": "உயிரியல்", "si": "ජීව විද්‍යාව"}', 'bg-emerald-500', 'Microscope', 'Study of living organisms and life processes');

-- Insert achievements
INSERT INTO achievements (name, description, icon, xp_reward, rarity, criteria) VALUES
('first_steps', 'Complete your first paper', 'Star', 50, 'common', '{"papers_completed": 1}'),
('chemistry_novice', 'Complete 5 Chemistry papers', 'TestTube', 100, 'common', '{"subject": "chemistry", "papers_completed": 5}'),
('physics_novice', 'Complete 5 Physics papers', 'Atom', 100, 'common', '{"subject": "physics", "papers_completed": 5}'),
('biology_novice', 'Complete 5 Biology papers', 'Microscope', 100, 'common', '{"subject": "biology", "papers_completed": 5}'),
('perfect_score', 'Get 100% on any paper', 'Trophy', 150, 'rare', '{"perfect_score": true}'),
('study_streak', 'Study for 7 consecutive days', 'Calendar', 200, 'rare', '{"streak_days": 7}'),
('ai_collaborator', 'Complete 10 AI tutoring sessions', 'Brain', 250, 'epic', '{"ai_sessions": 10}'),
('blockchain_pioneer', 'Mint your first NFT certificate', 'Award', 300, 'epic', '{"nft_certificates": 1}'),
('team_player', 'Participate in 5 collaboration sessions', 'Users', 350, 'epic', '{"collaboration_sessions": 5}'),
('subject_master', 'Reach level 10 in any subject', 'Crown', 500, 'legendary', '{"subject_level": 10}');

-- Note: Sample papers and questions will be inserted via the application
-- when users upload content or admins add official papers