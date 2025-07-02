/*
  # Trigger Functions for Automation

  1. New Trigger Functions
    - `check_achievements_after_progress_update` - Check for achievements after progress updates
    - `sync_user_profile_after_auth_update` - Keep auth and profiles in sync
    - `auto_process_verified_transactions` - Process payments when marked as verified
    - `set_notification_timestamps` - Set timestamps for notification logs

  2. New Triggers
    - Add triggers to appropriate tables
    - Each trigger monitors specific tables for changes
*/

-- Trigger function to check for achievements after progress update
CREATE OR REPLACE FUNCTION check_achievements_after_progress_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Call achievement check function
    PERFORM check_achievements_eligibility(NEW.user_id);
    RETURN NEW;
END;
$$;

-- Trigger function to keep auth and profiles in sync
CREATE OR REPLACE FUNCTION sync_user_profile_after_auth_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create or update profile when a new user is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.profiles (
            id,
            email,
            name,
            role,
            subscription,
            preferences,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            'student',
            'free',
            '{"language": "en", "theme": "light", "notifications": true}',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO
        UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            updated_at = NOW();
    -- Update profile when user data changes
    ELSIF TG_OP = 'UPDATE' AND OLD.email <> NEW.email THEN
        UPDATE public.profiles
        SET 
            email = NEW.email,
            updated_at = NOW()
        WHERE id = NEW.id;
    -- Remove profile when user is deleted
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.profiles WHERE id = OLD.id;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Trigger function to process payments when marked as verified
CREATE OR REPLACE FUNCTION auto_process_verified_transactions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only process transitions to 'verified' status
    IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status <> 'verified') THEN
        -- Check if there's an access request for this transaction
        IF EXISTS (
            SELECT 1 FROM access_requests 
            WHERE payment_transaction_id = NEW.id AND status = 'pending'
        ) THEN
            -- Update access request
            UPDATE access_requests
            SET 
                status = 'approved',
                approved_by = NEW.verified_by,
                approved_at = NEW.verified_at,
                expires_at = CASE
                    WHEN requested_role = 'student' THEN NEW.verified_at + INTERVAL '1 year'
                    WHEN requested_role = 'teacher' THEN NEW.verified_at + INTERVAL '1 year'
                    ELSE NEW.verified_at + INTERVAL '30 days'
                END
            WHERE payment_transaction_id = NEW.id AND status = 'pending';
            
            -- Update user role and subscription
            WITH approved_request AS (
                SELECT user_id, requested_role
                FROM access_requests
                WHERE payment_transaction_id = NEW.id AND status = 'approved'
                LIMIT 1
            )
            UPDATE profiles
            SET 
                role = ar.requested_role,
                subscription = CASE 
                    WHEN ar.requested_role = 'student' THEN 'premium'
                    WHEN ar.requested_role = 'teacher' THEN 'pro'
                    ELSE 'free'
                END,
                updated_at = NOW()
            FROM approved_request ar
            WHERE profiles.id = ar.user_id;
            
            -- Create or update subscription record
            WITH approved_request AS (
                SELECT user_id, requested_role
                FROM access_requests
                WHERE payment_transaction_id = NEW.id AND status = 'approved'
                LIMIT 1
            )
            INSERT INTO subscriptions (
                user_id,
                plan,
                status,
                current_period_start,
                current_period_end
            )
            SELECT 
                ar.user_id,
                CASE 
                    WHEN ar.requested_role = 'student' THEN 'premium'::subscription_plan
                    WHEN ar.requested_role = 'teacher' THEN 'pro'::subscription_plan
                    ELSE 'free'::subscription_plan
                END,
                'active',
                NEW.verified_at,
                CASE
                    WHEN ar.requested_role = 'student' THEN NEW.verified_at + INTERVAL '1 year'
                    WHEN ar.requested_role = 'teacher' THEN NEW.verified_at + INTERVAL '1 year'
                    ELSE NEW.verified_at + INTERVAL '30 days'
                END
            FROM approved_request ar
            ON CONFLICT (user_id) DO UPDATE SET
                plan = EXCLUDED.plan,
                status = 'active',
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                updated_at = NOW();
            
            -- Create notification log
            WITH approved_request AS (
                SELECT ar.user_id, p.email
                FROM access_requests ar
                JOIN profiles p ON p.id = ar.user_id
                WHERE ar.payment_transaction_id = NEW.id AND ar.status = 'approved'
                LIMIT 1
            )
            INSERT INTO notification_logs (
                user_id,
                notification_type,
                email_to,
                subject,
                content,
                sent_at,
                delivery_status,
                created_at
            )
            SELECT 
                ar.user_id,
                'access_granted'::notification_type,
                ar.email,
                'Access Granted - Science Educational Program',
                'Your payment has been verified and access has been granted.',
                NOW(),
                'sent',
                NOW()
            FROM approved_request ar;
        END IF;
    -- Process transitions to 'failed' status
    ELSIF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status <> 'failed') THEN
        -- Update access request
        UPDATE access_requests
        SET 
            status = 'denied',
            approved_by = NEW.verified_by,
            approved_at = NEW.verified_at
        WHERE payment_transaction_id = NEW.id AND status = 'pending';
        
        -- Create notification log
        WITH denied_request AS (
            SELECT ar.user_id, p.email
            FROM access_requests ar
            JOIN profiles p ON p.id = ar.user_id
            WHERE ar.payment_transaction_id = NEW.id AND ar.status = 'denied'
            LIMIT 1
        )
        INSERT INTO notification_logs (
            user_id,
            notification_type,
            email_to,
            subject,
            content,
            sent_at,
            delivery_status,
            created_at
        )
        SELECT 
            dr.user_id,
            'access_denied'::notification_type,
            dr.email,
            'Payment Verification Issue - Science Educational Program',
            'We were unable to verify your payment. Please contact support for assistance.',
            NOW(),
            'sent',
            NOW()
        FROM denied_request dr;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Set notification timestamps
CREATE OR REPLACE FUNCTION set_notification_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Set sent_at if not provided
    IF NEW.sent_at IS NULL THEN
        NEW.sent_at := NOW();
    END IF;
    
    -- Ensure created_at is set
    IF NEW.created_at IS NULL THEN
        NEW.created_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add triggers

-- Check achievements after progress update
CREATE TRIGGER check_achievements_after_progress
AFTER INSERT OR UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION check_achievements_after_progress_update();

-- Sync user profile with auth
CREATE TRIGGER sync_auth_with_profiles
AFTER INSERT OR UPDATE OR DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_profile_after_auth_update();

-- Process verified payments
CREATE TRIGGER process_verified_payment
AFTER UPDATE ON payment_transactions
FOR EACH ROW
WHEN (NEW.status <> OLD.status)
EXECUTE FUNCTION auto_process_verified_transactions();

-- Set notification timestamps
CREATE TRIGGER set_notification_log_timestamps
BEFORE INSERT ON notification_logs
FOR EACH ROW
EXECUTE FUNCTION set_notification_timestamps();