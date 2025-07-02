/*
  # Sri Lanka Payment Implementation

  1. New Settings
    - Update payment methods with Sri Lanka bank details
    - Set currency to LKR (Sri Lankan Rupee)
    - Configure subscription plans with proper pricing

  2. Security
    - Add LKR as a supported currency
    - Add specific bank transfer payment method for Commercial Bank
*/

-- Update payment_methods table with Commercial Bank of Sri Lanka
DELETE FROM payment_methods WHERE method_name = 'Bank Transfer';

INSERT INTO payment_methods (method_name, configuration, instructions, is_active) VALUES
(
  'Commercial Bank Transfer',
  jsonb_build_object(
    'bank_name', 'Commercial Bank of Sri Lanka',
    'account_number', '[Insert Account Number]',
    'account_name', '[Insert Account Name]',
    'branch', '[Insert Branch]',
    'currency', 'LKR',
    'swift_code', 'CCEYLKLX'
  ),
  'Please transfer the exact amount to the account details provided below. After completing your bank transfer, email your payment confirmation to [email address] with your full name, role (Student/Teacher), selected subscription plan (Monthly/Annual), and contact number. Your registration will be confirmed within 24 hours via email verification, and access will be granted immediately after confirmation.',
  true
);

-- Add subscription plans table for Sri Lanka pricing
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role user_role NOT NULL,
  period text NOT NULL,
  price_lkr numeric(10,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subscription plans" ON subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add subscription plans for Sri Lanka
INSERT INTO subscription_plans (name, role, period, price_lkr, description) VALUES
('Student Monthly', 'student', 'monthly', 500.00, 'Basic access to educational content for students'),
('Student Annual', 'student', 'annual', 5000.00, 'Annual subscription for students with 16.7% savings'),
('Teacher Monthly', 'teacher', 'monthly', 5000.00, 'Full access with content upload capabilities for teachers'),
('Teacher Annual', 'teacher', 'annual', 50000.00, 'Annual teacher subscription with 16.7% savings');

-- Update payment_transactions table to support LKR
ALTER TABLE payment_transactions ALTER COLUMN currency SET DEFAULT 'LKR';

-- Add trigger for updating timestamps
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();