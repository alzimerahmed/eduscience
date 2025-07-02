/*
  # Stored Procedures for API Functionality

  1. New Procedures
    - `verify_payment_transaction` - Admin procedure to verify user payments
    - `reject_payment_transaction` - Admin procedure to reject user payments
    - `approve_access_request` - Admin procedure to approve access requests
    - `deny_access_request` - Admin procedure to deny access requests
    - `update_user_role` - Admin procedure to change user roles

  2. Security
    - All procedures use SECURITY DEFINER to ensure proper permissions
    - Procedures verify admin status before executing sensitive operations
*/

-- Procedure to verify a payment transaction
CREATE OR REPLACE PROCEDURE verify_payment_transaction(
    admin_id UUID,
    transaction_id UUID,
    admin_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    transaction_record RECORD;
BEGIN
    -- Check if the user is an admin
    SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = admin_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can verify payments';
    END IF;
    
    -- Get the transaction
    SELECT * INTO transaction_record 
    FROM payment_transactions 
    WHERE id = transaction_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;
    
    IF transaction_record.status NOT IN ('pending', 'paid') THEN
        RAISE EXCEPTION 'Transaction is already verified or failed';
    END IF;
    
    -- Update the transaction
    UPDATE payment_transactions
    SET 
        status = 'verified',
        admin_notes = COALESCE(verify_payment_transaction.admin_notes, payment_transactions.admin_notes),
        verified_by = admin_id,
        verified_at = NOW()
    WHERE id = transaction_id;
    
    -- Try to call the payment notification edge function via RPC
    -- This is a fallback since we can't directly call edge functions from stored procedures
    -- In a production environment, you would use a database trigger or a scheduled job
    BEGIN
        PERFORM net.http_post(
            url:='https://sciencepapers.com/api/notify-payment',
            body:=json_build_object(
                'transactionId', transaction_id,
                'notificationType', 'access_granted'
            )::text,
            headers:=json_build_object(
                'Content-Type', 'application/json'
            )
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but continue processing
        RAISE NOTICE 'Failed to send payment notification: %', SQLERRM;
    END;
    
    -- Look for any access requests related to this transaction and approve them
    UPDATE access_requests
    SET 
        status = 'approved',
        approved_by = admin_id,
        approved_at = NOW(),
        -- Set expiration date based on role (students: 1 year, teachers: 1 year)
        expires_at = CASE
            WHEN requested_role = 'student' THEN NOW() + INTERVAL '1 year'
            WHEN requested_role = 'teacher' THEN NOW() + INTERVAL '1 year'
            ELSE NOW() + INTERVAL '30 days' -- Default
        END
    WHERE payment_transaction_id = transaction_id AND status = 'pending';
    
    -- Update user role based on approved access request
    WITH approved_request AS (
        SELECT user_id, requested_role
        FROM access_requests
        WHERE payment_transaction_id = transaction_id AND status = 'approved'
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
    
    -- Create subscription record
    WITH approved_request AS (
        SELECT user_id, requested_role
        FROM access_requests
        WHERE payment_transaction_id = transaction_id AND status = 'approved'
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
        NOW(),
        CASE
            WHEN ar.requested_role = 'student' THEN NOW() + INTERVAL '1 year'
            WHEN ar.requested_role = 'teacher' THEN NOW() + INTERVAL '1 year'
            ELSE NOW() + INTERVAL '30 days' -- Default
        END
    FROM approved_request ar
    ON CONFLICT (user_id) DO UPDATE SET
        plan = EXCLUDED.plan,
        status = 'active',
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();
END;
$$;

-- Procedure to reject a payment transaction
CREATE OR REPLACE PROCEDURE reject_payment_transaction(
    admin_id UUID,
    transaction_id UUID,
    admin_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    transaction_record RECORD;
BEGIN
    -- Check if the user is an admin
    SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = admin_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can reject payments';
    END IF;
    
    -- Get the transaction
    SELECT * INTO transaction_record 
    FROM payment_transactions 
    WHERE id = transaction_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;
    
    IF transaction_record.status NOT IN ('pending', 'paid') THEN
        RAISE EXCEPTION 'Transaction is already verified or failed';
    END IF;
    
    -- Update the transaction
    UPDATE payment_transactions
    SET 
        status = 'failed',
        admin_notes = COALESCE(reject_payment_transaction.admin_notes, payment_transactions.admin_notes),
        verified_by = admin_id,
        verified_at = NOW()
    WHERE id = transaction_id;
    
    -- Update any related access requests
    UPDATE access_requests
    SET 
        status = 'denied',
        approved_by = admin_id,
        approved_at = NOW()
    WHERE payment_transaction_id = transaction_id AND status = 'pending';
    
    -- Try to send notification
    BEGIN
        PERFORM net.http_post(
            url:='https://sciencepapers.com/api/notify-payment',
            body:=json_build_object(
                'transactionId', transaction_id,
                'notificationType', 'access_denied'
            )::text,
            headers:=json_build_object(
                'Content-Type', 'application/json'
            )
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but continue processing
        RAISE NOTICE 'Failed to send payment notification: %', SQLERRM;
    END;
END;
$$;

-- Procedure to approve an access request
CREATE OR REPLACE PROCEDURE approve_access_request(
    admin_id UUID,
    request_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    request_record RECORD;
BEGIN
    -- Check if the user is an admin
    SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = admin_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can approve access requests';
    END IF;
    
    -- Get the request
    SELECT * INTO request_record 
    FROM access_requests 
    WHERE id = request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access request not found';
    END IF;
    
    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Access request is not pending';
    END IF;
    
    -- Update the access request
    UPDATE access_requests
    SET 
        status = 'approved',
        approved_by = admin_id,
        approved_at = NOW(),
        -- Set expiration date based on role
        expires_at = CASE
            WHEN requested_role = 'student' THEN NOW() + INTERVAL '1 year'
            WHEN requested_role = 'teacher' THEN NOW() + INTERVAL '1 year'
            ELSE NOW() + INTERVAL '30 days' -- Default
        END
    WHERE id = request_id;
    
    -- Update user role
    UPDATE profiles
    SET 
        role = request_record.requested_role,
        subscription = CASE 
            WHEN request_record.requested_role = 'student' THEN 'premium'
            WHEN request_record.requested_role = 'teacher' THEN 'pro'
            ELSE 'free'
        END,
        updated_at = NOW()
    WHERE id = request_record.user_id;
    
    -- Create or update subscription record
    INSERT INTO subscriptions (
        user_id,
        plan,
        status,
        current_period_start,
        current_period_end
    )
    VALUES (
        request_record.user_id,
        CASE 
            WHEN request_record.requested_role = 'student' THEN 'premium'::subscription_plan
            WHEN request_record.requested_role = 'teacher' THEN 'pro'::subscription_plan
            ELSE 'free'::subscription_plan
        END,
        'active',
        NOW(),
        CASE
            WHEN request_record.requested_role = 'student' THEN NOW() + INTERVAL '1 year'
            WHEN request_record.requested_role = 'teacher' THEN NOW() + INTERVAL '1 year'
            ELSE NOW() + INTERVAL '30 days' -- Default
        END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan = EXCLUDED.plan,
        status = 'active',
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();
END;
$$;

-- Procedure to deny an access request
CREATE OR REPLACE PROCEDURE deny_access_request(
    admin_id UUID,
    request_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    request_record RECORD;
BEGIN
    -- Check if the user is an admin
    SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = admin_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can deny access requests';
    END IF;
    
    -- Get the request
    SELECT * INTO request_record 
    FROM access_requests 
    WHERE id = request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access request not found';
    END IF;
    
    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Access request is not pending';
    END IF;
    
    -- Update the access request
    UPDATE access_requests
    SET 
        status = 'denied',
        approved_by = admin_id,
        approved_at = NOW()
    WHERE id = request_id;
END;
$$;

-- Procedure to update a user's role
CREATE OR REPLACE PROCEDURE update_user_role(
    admin_id UUID,
    user_id UUID,
    new_role user_role,
    new_subscription subscription_plan DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    target_user RECORD;
BEGIN
    -- Check if the user is an admin
    SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = admin_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can update user roles';
    END IF;
    
    -- Get the target user
    SELECT * INTO target_user 
    FROM profiles 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Determine subscription plan if not provided
    IF new_subscription IS NULL THEN
        new_subscription := CASE 
            WHEN new_role = 'student' THEN 'premium'
            WHEN new_role = 'teacher' THEN 'pro'
            WHEN new_role = 'admin' THEN 'pro'
            ELSE 'free'
        END;
    END IF;
    
    -- Update user role
    UPDATE profiles
    SET 
        role = new_role,
        subscription = new_subscription,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Create or update subscription record
    INSERT INTO subscriptions (
        user_id,
        plan,
        status,
        current_period_start,
        current_period_end
    )
    VALUES (
        user_id,
        new_subscription,
        'active',
        NOW(),
        CASE
            WHEN new_subscription = 'free' THEN NOW() + INTERVAL '100 years'
            ELSE NOW() + INTERVAL '1 year'
        END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan = EXCLUDED.plan,
        status = 'active',
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();
END;
$$;