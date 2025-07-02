-- Add index for user search on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING GIN (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(email, ''))
);

-- Function to get subject progress for analytics
CREATE OR REPLACE FUNCTION get_subject_progress(user_id UUID)
RETURNS TABLE(
  subject TEXT,
  completed INTEGER,
  total INTEGER,
  level INTEGER,
  xp INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name AS subject,
    COUNT(up.*) FILTER (WHERE up.completed = TRUE)::INTEGER AS completed,
    COUNT(up.*)::INTEGER AS total,
    GREATEST(1, FLOOR(SUM(COALESCE(up.xp_earned, 0)) / 100)::INTEGER) AS level,
    SUM(COALESCE(up.xp_earned, 0))::INTEGER AS xp
  FROM 
    subjects s
  LEFT JOIN 
    papers p ON p.subject_id = s.id
  LEFT JOIN 
    user_progress up ON up.paper_id = p.id AND up.user_id = get_subject_progress.user_id
  GROUP BY 
    s.id, s.name
  ORDER BY 
    xp DESC;
END;
$$;

-- Make sure we have at least one admin user for initial access
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE role = 'admin'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Try to create admin user if auth.users has any entries
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
      -- Make the first user an admin
      UPDATE profiles
      SET 
        role = 'admin'::user_role,
        subscription = 'pro'::subscription_plan
      WHERE id = (SELECT id FROM profiles LIMIT 1);
    END IF;
  END IF;
END;
$$;

-- Make sure we have at least one payment method
INSERT INTO payment_methods (method_name, configuration, instructions, is_active)
SELECT 
  'Commercial Bank Transfer',
  jsonb_build_object(
    'bank_name', 'Commercial Bank of Sri Lanka',
    'account_number', '1234567890',
    'account_name', 'Science Papers Ltd',
    'branch', 'Main Branch',
    'currency', 'LKR',
    'swift_code', 'CCEYLKLX'
  ),
  'Please transfer the exact amount to the account details provided. After completing the transfer, upload your payment receipt and provide your contact details.',
  TRUE
WHERE
  NOT EXISTS (SELECT 1 FROM payment_methods WHERE method_name = 'Commercial Bank Transfer');

-- Make sure we have subscription plans
INSERT INTO subscription_plans (name, role, period, price_lkr, description)
SELECT 'Student Monthly', 'student'::user_role, 'monthly', 500.00, 'Monthly access for students'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Student Monthly' AND role = 'student' AND period = 'monthly')
UNION ALL
SELECT 'Student Annual', 'student'::user_role, 'annual', 5000.00, 'Annual access for students (save 16.7%)'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Student Annual' AND role = 'student' AND period = 'annual')
UNION ALL
SELECT 'Teacher Monthly', 'teacher'::user_role, 'monthly', 5000.00, 'Monthly access for teachers'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Teacher Monthly' AND role = 'teacher' AND period = 'monthly')
UNION ALL
SELECT 'Teacher Annual', 'teacher'::user_role, 'annual', 50000.00, 'Annual access for teachers (save 16.7%)'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Teacher Annual' AND role = 'teacher' AND period = 'annual');

-- Make sure achievements are set up
INSERT INTO achievements (name, description, icon, xp_reward, rarity, criteria)
SELECT 
  'first_steps', 
  'Complete your first paper', 
  'award', 
  50, 
  'common', 
  jsonb_build_object('papers_completed', 1)
WHERE 
  NOT EXISTS (SELECT 1 FROM achievements LIMIT 1);