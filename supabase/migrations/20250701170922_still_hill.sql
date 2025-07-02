/*
  # User Experience Functions

  1. New Functions
    - `add_user_xp` - Add XP to user profile and handle level updates
    - `check_streak` - Update user streak count
    - `check_achievements_eligibility` - Check and award eligible achievements
    - `update_user_paper_progress` - Update user progress for papers

  2. Security
    - Implement security definer functions where needed
    - Return values formatted for frontend use
*/

-- Function to add XP to a user profile and handle level progression
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_xp INTEGER;
    current_level INTEGER;
    new_xp INTEGER;
    new_level INTEGER;
    xp_per_level INTEGER := 250; -- XP needed per level
    level_up BOOLEAN := FALSE;
BEGIN
    -- Get current XP and level
    SELECT total_xp, level INTO current_xp, current_level
    FROM profiles
    WHERE id = user_id;

    -- Calculate new values
    new_xp := current_xp + xp_amount;
    new_level := 1 + FLOOR(new_xp / xp_per_level)::INTEGER;

    -- Check for level up
    IF new_level > current_level THEN
        level_up := TRUE;
    END IF;

    -- Update profile
    UPDATE profiles
    SET 
        total_xp = new_xp,
        level = new_level,
        last_activity = NOW()
    WHERE id = user_id;

    -- Return the results
    RETURN json_build_object(
        'user_id', user_id,
        'xp_gained', xp_amount,
        'new_xp_total', new_xp,
        'new_level', new_level,
        'level_up', level_up
    );
END;
$$;

-- Function to check and update user streak
CREATE OR REPLACE FUNCTION check_streak(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    last_activity_date DATE;
    current_date DATE := CURRENT_DATE;
    current_streak INTEGER;
    new_streak INTEGER;
    streak_updated BOOLEAN := FALSE;
BEGIN
    -- Get current streak and last activity date
    SELECT 
        streak_days, 
        (last_activity AT TIME ZONE 'UTC')::DATE INTO current_streak, last_activity_date
    FROM profiles
    WHERE id = user_id;

    -- Initialize streak if null
    IF current_streak IS NULL THEN
        current_streak := 0;
    END IF;

    -- Calculate new streak value
    IF last_activity_date IS NULL THEN
        -- First time activity
        new_streak := 1;
        streak_updated := TRUE;
    ELSIF last_activity_date = current_date THEN
        -- Already counted today
        new_streak := current_streak;
    ELSIF last_activity_date = current_date - INTERVAL '1 day' THEN
        -- Consecutive day
        new_streak := current_streak + 1;
        streak_updated := TRUE;
    ELSIF last_activity_date < current_date - INTERVAL '1 day' THEN
        -- Streak broken
        new_streak := 1;
        streak_updated := TRUE;
    ELSE
        -- Should not happen, but safety
        new_streak := 1;
        streak_updated := TRUE;
    END IF;

    -- Update profile if streak changed
    IF streak_updated THEN
        UPDATE profiles
        SET 
            streak_days = new_streak,
            last_activity = NOW()
        WHERE id = user_id;
    ELSE
        -- Just update last_activity
        UPDATE profiles
        SET last_activity = NOW()
        WHERE id = user_id;
    END IF;

    -- Return the results
    RETURN json_build_object(
        'user_id', user_id,
        'streak', new_streak,
        'streak_updated', streak_updated
    );
END;
$$;

-- Function to check achievement eligibility
CREATE OR REPLACE FUNCTION check_achievements_eligibility(user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    achievement_id UUID;
    achievement_record RECORD;
    user_record RECORD;
    criteria JSONB;
    eligible BOOLEAN;
BEGIN
    -- Get user data
    SELECT * INTO user_record FROM profiles WHERE id = user_id;
    
    -- Get all achievements
    FOR achievement_record IN 
        SELECT * FROM achievements
        -- Exclude already unlocked achievements
        WHERE NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE achievement_id = achievements.id AND user_id = check_achievements_eligibility.user_id
        )
    LOOP
        achievement_id := achievement_record.id;
        criteria := achievement_record.criteria;
        eligible := FALSE;
        
        -- Check against various criteria types
        -- Papers completed
        IF criteria ? 'papers_completed' AND 
           (SELECT COUNT(*) FROM user_progress WHERE user_id = check_achievements_eligibility.user_id AND completed = TRUE) >= (criteria->>'papers_completed')::INTEGER THEN
            eligible := TRUE;
        END IF;
        
        -- Subject-specific papers
        IF criteria ? 'subject' AND criteria ? 'papers_completed' THEN
            IF (
                SELECT COUNT(*) 
                FROM user_progress up
                JOIN papers p ON p.id = up.paper_id
                JOIN subjects s ON s.id = p.subject_id
                WHERE up.user_id = check_achievements_eligibility.user_id 
                AND up.completed = TRUE
                AND s.name = criteria->>'subject'
            ) >= (criteria->>'papers_completed')::INTEGER THEN
                eligible := TRUE;
            END IF;
        END IF;
        
        -- Perfect score
        IF criteria ? 'perfect_score' AND criteria->>'perfect_score' = 'true' AND
           EXISTS (
                SELECT 1 
                FROM user_progress 
                WHERE user_id = check_achievements_eligibility.user_id 
                AND best_score >= 100
           ) THEN
            eligible := TRUE;
        END IF;
        
        -- Streak days
        IF criteria ? 'streak_days' AND 
           user_record.streak_days >= (criteria->>'streak_days')::INTEGER THEN
            eligible := TRUE;
        END IF;
        
        -- AI sessions
        IF criteria ? 'ai_sessions' AND
           (SELECT COUNT(*) FROM user_responses WHERE user_id = check_achievements_eligibility.user_id) >= (criteria->>'ai_sessions')::INTEGER THEN
            eligible := TRUE;
        END IF;

        -- If eligible, add to results and insert user_achievement
        IF eligible THEN
            -- Insert achievement unlock record
            INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
            VALUES (check_achievements_eligibility.user_id, achievement_id, NOW());
            
            -- Return the achievement ID
            RETURN NEXT achievement_id;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;

-- Function to update user paper progress
CREATE OR REPLACE FUNCTION update_user_paper_progress(
    user_id UUID,
    paper_id UUID,
    questions_attempted INTEGER DEFAULT 1,
    questions_correct INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT NULL,
    xp_earned INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    progress_record RECORD;
    is_completed BOOLEAN := FALSE;
    total_questions INTEGER;
    best_score NUMERIC(5,2) := 0;
    new_attempts INTEGER := 1;
    result JSON;
BEGIN
    -- Check if there are existing progress records
    SELECT * INTO progress_record 
    FROM user_progress 
    WHERE user_id = update_user_paper_progress.user_id 
    AND paper_id = update_user_paper_progress.paper_id;

    -- Get total questions for this paper
    SELECT COUNT(*) INTO total_questions 
    FROM questions 
    WHERE paper_id = update_user_paper_progress.paper_id;

    -- If we have existing progress, update it
    IF FOUND THEN
        -- Calculate new values
        new_attempts := progress_record.attempts + 1;
        best_score := GREATEST(progress_record.best_score, (questions_correct::NUMERIC / NULLIF(total_questions, 0)) * 100);
        
        -- Check if paper is now completed
        IF progress_record.completed = FALSE AND questions_attempted >= total_questions THEN
            is_completed := TRUE;
        ELSE
            is_completed := progress_record.completed;
        END IF;
        
        -- Update the record
        UPDATE user_progress
        SET
            questions_attempted = progress_record.questions_attempted + questions_attempted,
            questions_correct = progress_record.questions_correct + questions_correct,
            total_time_spent = COALESCE(progress_record.total_time_spent, 0) + COALESCE(total_time_spent, 0),
            best_score = best_score,
            attempts = new_attempts,
            completed = is_completed,
            xp_earned = progress_record.xp_earned + xp_earned,
            last_attempt = NOW(),
            updated_at = NOW()
        WHERE user_id = update_user_paper_progress.user_id 
        AND paper_id = update_user_paper_progress.paper_id
        RETURNING * INTO progress_record;
    ELSE
        -- Create a new progress record
        IF questions_attempted >= total_questions THEN
            is_completed := TRUE;
        END IF;
        
        best_score := (questions_correct::NUMERIC / NULLIF(total_questions, 0)) * 100;
        
        INSERT INTO user_progress(
            user_id,
            paper_id,
            questions_attempted,
            questions_correct,
            total_time_spent,
            best_score,
            attempts,
            completed,
            xp_earned,
            last_attempt,
            created_at,
            updated_at
        )
        VALUES(
            update_user_paper_progress.user_id,
            update_user_paper_progress.paper_id,
            questions_attempted,
            questions_correct,
            total_time_spent,
            best_score,
            1,
            is_completed,
            xp_earned,
            NOW(),
            NOW(),
            NOW()
        )
        RETURNING * INTO progress_record;
    END IF;
    
    -- Add XP to user
    IF xp_earned > 0 THEN
        result := add_user_xp(update_user_paper_progress.user_id, xp_earned);
    END IF;
    
    -- Check streak
    result := check_streak(update_user_paper_progress.user_id);
    
    -- Check for achievements
    PERFORM check_achievements_eligibility(update_user_paper_progress.user_id);
    
    -- Return the updated progress
    RETURN json_build_object(
        'user_id', progress_record.user_id,
        'paper_id', progress_record.paper_id,
        'questions_attempted', progress_record.questions_attempted,
        'questions_correct', progress_record.questions_correct,
        'best_score', progress_record.best_score,
        'completed', progress_record.completed,
        'attempts', progress_record.attempts,
        'xp_earned', progress_record.xp_earned
    );
END;
$$;

-- Function to increment paper download count
CREATE OR REPLACE FUNCTION increment_download_count(paper_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE papers
    SET download_count = download_count + 1
    WHERE id = paper_id;
END;
$$;

-- Function to increment/decrement annotation votes
CREATE OR REPLACE FUNCTION increment_annotation_vote(annotation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE annotations
    SET votes = votes + 1
    WHERE id = annotation_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_annotation_vote(annotation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE annotations
    SET votes = GREATEST(0, votes - 1)
    WHERE id = annotation_id;
END;
$$;