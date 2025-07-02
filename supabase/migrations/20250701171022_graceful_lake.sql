/*
  # Real-time Collaboration Functions

  1. New Functions
    - `create_collaboration_session` - Creates a new collaboration session
    - `join_collaboration_session` - Allows a user to join an existing session
    - `leave_collaboration_session` - Records when a user leaves a session
    - `end_collaboration_session` - Ends an active collaboration session
    - `get_session_participants` - Gets all participants of a session

  2. Security
    - All functions use SECURITY DEFINER to run with elevated permissions
    - Input validation to prevent SQL injection
    - Permission checks to ensure proper access control
*/

-- Function to create a new collaboration session
CREATE OR REPLACE FUNCTION create_collaboration_session(
    host_id UUID,
    paper_id UUID,
    title TEXT,
    description TEXT DEFAULT NULL,
    max_participants INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_id UUID;
    result RECORD;
BEGIN
    -- Validate inputs
    IF host_id IS NULL OR paper_id IS NULL OR title IS NULL THEN
        RAISE EXCEPTION 'Host ID, paper ID, and title are required';
    END IF;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = host_id) THEN
        RAISE EXCEPTION 'Invalid host ID';
    END IF;

    -- Check if paper exists
    IF NOT EXISTS (SELECT 1 FROM papers WHERE id = paper_id) THEN
        RAISE EXCEPTION 'Invalid paper ID';
    END IF;

    -- Create new session
    INSERT INTO collaboration_sessions (
        host_id,
        paper_id,
        title,
        description,
        max_participants,
        is_active,
        session_data,
        created_at
    )
    VALUES (
        host_id,
        paper_id,
        title,
        description,
        max_participants,
        TRUE,
        '{}'::jsonb,
        NOW()
    )
    RETURNING id INTO session_id;

    -- Automatically add host as first participant
    INSERT INTO collaboration_participants (
        session_id,
        user_id,
        joined_at
    )
    VALUES (
        session_id,
        host_id,
        NOW()
    );

    -- Get session details with related data
    SELECT 
        s.id,
        s.title,
        s.description,
        s.created_at,
        s.is_active,
        p.title AS paper_title,
        h.name AS host_name,
        (SELECT COUNT(*) FROM collaboration_participants cp WHERE cp.session_id = s.id AND cp.left_at IS NULL) AS participant_count
    INTO result
    FROM collaboration_sessions s
    JOIN papers p ON p.id = s.paper_id
    JOIN profiles h ON h.id = s.host_id
    WHERE s.id = session_id;

    -- Return the session details
    RETURN json_build_object(
        'session_id', session_id,
        'title', result.title,
        'description', result.description,
        'paper_title', result.paper_title,
        'host_name', result.host_name,
        'participant_count', result.participant_count,
        'created_at', result.created_at,
        'is_active', result.is_active
    );
END;
$$;

-- Function to join an existing collaboration session
CREATE OR REPLACE FUNCTION join_collaboration_session(
    session_id UUID,
    user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_record RECORD;
    participant_count INTEGER;
    is_already_joined BOOLEAN := FALSE;
BEGIN
    -- Validate inputs
    IF session_id IS NULL OR user_id IS NULL THEN
        RAISE EXCEPTION 'Session ID and user ID are required';
    END IF;

    -- Check if session exists and is active
    SELECT 
        s.*,
        (SELECT COUNT(*) FROM collaboration_participants cp WHERE cp.session_id = s.id AND cp.left_at IS NULL) AS current_participants
    INTO session_record
    FROM collaboration_sessions s
    WHERE s.id = session_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found';
    END IF;

    IF NOT session_record.is_active THEN
        RAISE EXCEPTION 'Session is no longer active';
    END IF;

    -- Check if session is full
    IF session_record.current_participants >= session_record.max_participants THEN
        RAISE EXCEPTION 'Session is full';
    END IF;

    -- Check if user is already in session
    IF EXISTS (
        SELECT 1 FROM collaboration_participants 
        WHERE session_id = join_collaboration_session.session_id 
        AND user_id = join_collaboration_session.user_id 
        AND left_at IS NULL
    ) THEN
        is_already_joined := TRUE;
    ELSE
        -- Check if user was previously in the session but left
        IF EXISTS (
            SELECT 1 FROM collaboration_participants 
            WHERE session_id = join_collaboration_session.session_id 
            AND user_id = join_collaboration_session.user_id
        ) THEN
            -- Update the existing record to mark re-joining
            UPDATE collaboration_participants
            SET 
                joined_at = NOW(),
                left_at = NULL
            WHERE 
                session_id = join_collaboration_session.session_id 
                AND user_id = join_collaboration_session.user_id;
        ELSE
            -- Add user to session
            INSERT INTO collaboration_participants (
                session_id,
                user_id,
                joined_at
            )
            VALUES (
                join_collaboration_session.session_id,
                join_collaboration_session.user_id,
                NOW()
            );
        END IF;
    END IF;

    -- Get updated participant count
    SELECT COUNT(*) INTO participant_count
    FROM collaboration_participants
    WHERE session_id = join_collaboration_session.session_id AND left_at IS NULL;

    -- Return session details
    RETURN json_build_object(
        'session_id', session_id,
        'user_id', user_id,
        'joined_at', NOW(),
        'participant_count', participant_count,
        'already_joined', is_already_joined
    );
END;
$$;

-- Function to leave a collaboration session
CREATE OR REPLACE FUNCTION leave_collaboration_session(
    session_id UUID,
    user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_host BOOLEAN := FALSE;
    participant_count INTEGER;
BEGIN
    -- Validate inputs
    IF session_id IS NULL OR user_id IS NULL THEN
        RAISE EXCEPTION 'Session ID and user ID are required';
    END IF;

    -- Check if user is in the session
    IF NOT EXISTS (
        SELECT 1 FROM collaboration_participants 
        WHERE session_id = leave_collaboration_session.session_id 
        AND user_id = leave_collaboration_session.user_id 
        AND left_at IS NULL
    ) THEN
        RAISE EXCEPTION 'User is not in this session';
    END IF;

    -- Check if user is the host
    SELECT EXISTS (
        SELECT 1 FROM collaboration_sessions 
        WHERE id = session_id AND host_id = user_id
    ) INTO is_host;

    -- Update participant record
    UPDATE collaboration_participants
    SET left_at = NOW()
    WHERE 
        session_id = leave_collaboration_session.session_id 
        AND user_id = leave_collaboration_session.user_id 
        AND left_at IS NULL;

    -- Get updated participant count
    SELECT COUNT(*) INTO participant_count
    FROM collaboration_participants
    WHERE session_id = leave_collaboration_session.session_id AND left_at IS NULL;

    -- If host is leaving and no participants remain, end the session
    IF is_host AND participant_count = 0 THEN
        UPDATE collaboration_sessions
        SET 
            is_active = FALSE,
            ended_at = NOW()
        WHERE id = session_id;
    END IF;

    -- Return results
    RETURN json_build_object(
        'session_id', session_id,
        'user_id', user_id,
        'left_at', NOW(),
        'remaining_participants', participant_count,
        'was_host', is_host,
        'session_ended', (is_host AND participant_count = 0)
    );
END;
$$;

-- Function to end a collaboration session (host only)
CREATE OR REPLACE FUNCTION end_collaboration_session(
    session_id UUID,
    host_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_record RECORD;
BEGIN
    -- Validate inputs
    IF session_id IS NULL OR host_id IS NULL THEN
        RAISE EXCEPTION 'Session ID and host ID are required';
    END IF;

    -- Check if session exists and user is the host
    SELECT * INTO session_record
    FROM collaboration_sessions
    WHERE id = session_id AND host_id = host_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found or user is not the host';
    END IF;

    -- End the session
    UPDATE collaboration_sessions
    SET 
        is_active = FALSE,
        ended_at = NOW()
    WHERE id = session_id;

    -- Mark all participants as having left
    UPDATE collaboration_participants
    SET left_at = NOW()
    WHERE 
        session_id = end_collaboration_session.session_id 
        AND left_at IS NULL;

    -- Return results
    RETURN json_build_object(
        'session_id', session_id,
        'ended_at', NOW(),
        'ended_by', host_id,
        'title', session_record.title
    );
END;
$$;

-- Function to get all participants of a session
CREATE OR REPLACE FUNCTION get_session_participants(
    session_id UUID
)
RETURNS SETOF JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT json_build_object(
        'user_id', p.id,
        'name', p.name,
        'avatar_url', p.avatar_url,
        'joined_at', cp.joined_at,
        'is_active', cp.left_at IS NULL,
        'is_host', (cs.host_id = p.id)
    )
    FROM collaboration_participants cp
    JOIN profiles p ON p.id = cp.user_id
    JOIN collaboration_sessions cs ON cs.id = cp.session_id
    WHERE cp.session_id = get_session_participants.session_id
    ORDER BY cp.joined_at;
END;
$$;