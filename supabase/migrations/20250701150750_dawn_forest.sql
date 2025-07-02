/*
  # Payments System Database Schema

  1. New Tables
    - `payment_transactions` - Track all payment attempts and status
    - `payment_methods` - Store accepted payment methods and bank details
    - `access_requests` - Track access requests and approvals
    - `notification_logs` - Log all email notifications sent
    - `two_factor_auth` - Store 2FA secrets and backup codes

  2. Security
    - Enable RLS on all payment-related tables
    - Admin-only policies for payment verification
    - Encrypted storage for sensitive data
*/

-- Add payment-related enums
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'verified', 'failed', 'refunded');
CREATE TYPE access_status AS ENUM ('pending', 'approved', 'denied', 'expired');
CREATE TYPE notification_type AS ENUM ('payment_received', 'access_granted', 'access_denied', 'payment_reminder');

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL, -- 'bank_transfer', 'stripe', 'paypal'
  payment_details jsonb, -- Store payment-specific data (encrypted)
  status payment_status DEFAULT 'pending',
  payment_proof_url text, -- URL to uploaded payment proof
  admin_notes text,
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment methods configuration table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  method_name text NOT NULL,
  is_active boolean DEFAULT true,
  configuration jsonb NOT NULL, -- Bank details, API keys, etc. (encrypted)
  instructions text NOT NULL, -- User-facing payment instructions
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Access requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  payment_transaction_id uuid REFERENCES payment_transactions(id),
  requested_role user_role NOT NULL,
  institution_name text,
  contact_number text,
  additional_info jsonb,
  status access_status DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  email_to text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  sent_at timestamptz,
  delivery_status text DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Two-factor authentication table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  secret_key text NOT NULL, -- Encrypted TOTP secret
  backup_codes text[], -- Encrypted backup codes
  is_enabled boolean DEFAULT false,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;

-- Payment transactions policies
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own payment transactions" ON payment_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending transactions" ON payment_transactions
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all payment transactions" ON payment_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payment methods policies
CREATE POLICY "Anyone can view active payment methods" ON payment_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payment methods" ON payment_methods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Access requests policies
CREATE POLICY "Users can view own access requests" ON access_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own access requests" ON access_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all access requests" ON access_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notification logs policies
CREATE POLICY "Users can view own notifications" ON notification_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notification_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" ON notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Two-factor auth policies
CREATE POLICY "Users can manage own 2FA" ON two_factor_auth
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_access_requests_user ON access_requests(user_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_requests_updated_at BEFORE UPDATE ON access_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON two_factor_auth
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment methods
INSERT INTO payment_methods (method_name, configuration, instructions) VALUES
(
  'Bank Transfer',
  '{"bank_name": "Your Bank Name", "account_number": "1234567890", "routing_number": "123456789", "account_holder": "Your Organization", "swift_code": "BANKUS33"}',
  'Please transfer the exact amount to the account details provided. Include your transaction ID in the reference/memo field. Upload your payment receipt after completing the transfer.'
),
(
  'Stripe Payment',
  '{"publishable_key": "pk_test_...", "webhook_secret": "whsec_..."}',
  'Pay securely with your credit or debit card. Your payment will be processed immediately.'
);