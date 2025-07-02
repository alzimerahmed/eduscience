-- Insert sample papers if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM papers LIMIT 1) THEN
        -- Get subject IDs
        DECLARE
            chemistry_id UUID;
            physics_id UUID;
            biology_id UUID;
        BEGIN
            SELECT id INTO chemistry_id FROM subjects WHERE name = 'chemistry';
            SELECT id INTO physics_id FROM subjects WHERE name = 'physics';
            SELECT id INTO biology_id FROM subjects WHERE name = 'biology';
            
            -- Insert sample papers
            INSERT INTO papers (
                title,
                subject_id,
                year,
                paper_type,
                difficulty,
                language,
                tags,
                has_answers,
                has_answer_scheme,
                has_ai_tutor,
                download_count,
                status,
                created_at,
                updated_at
            ) VALUES
                -- Chemistry Papers
                (
                    'Organic Chemistry - Basic Concepts',
                    chemistry_id,
                    2024,
                    '1st-year-1st-term'::paper_type,
                    'easy'::difficulty_level,
                    'en'::language_code,
                    ARRAY['organic', 'basic-concepts', 'introduction'],
                    TRUE,
                    TRUE,
                    TRUE,
                    1247,
                    'approved'::content_status,
                    NOW() - INTERVAL '2 months',
                    NOW() - INTERVAL '2 months'
                ),
                (
                    'Chemical Bonding and Molecular Structure',
                    chemistry_id,
                    2024,
                    '1st-year-2nd-term'::paper_type,
                    'medium'::difficulty_level,
                    'en'::language_code,
                    ARRAY['bonding', 'molecular-structure', 'hybridization'],
                    TRUE,
                    TRUE,
                    TRUE,
                    892,
                    'approved'::content_status,
                    NOW() - INTERVAL '2 months',
                    NOW() - INTERVAL '2 months'
                ),
                -- Physics Papers
                (
                    'Mechanics and Motion',
                    physics_id,
                    2024,
                    '1st-year-1st-term'::paper_type,
                    'easy'::difficulty_level,
                    'en'::language_code,
                    ARRAY['mechanics', 'motion', 'kinematics'],
                    TRUE,
                    TRUE,
                    TRUE,
                    2103,
                    'approved'::content_status,
                    NOW() - INTERVAL '2 months',
                    NOW() - INTERVAL '2 months'
                ),
                (
                    'Waves and Oscillations',
                    physics_id,
                    2024,
                    '1st-year-2nd-term'::paper_type,
                    'medium'::difficulty_level,
                    'en'::language_code,
                    ARRAY['waves', 'oscillations', 'frequency'],
                    TRUE,
                    TRUE,
                    TRUE,
                    987,
                    'approved'::content_status,
                    NOW() - INTERVAL '2 months',
                    NOW() - INTERVAL '2 months'
                ),
                -- Biology Papers
                (
                    'Cell Biology Basics',
                    biology_id,
                    2024,
                    '1st-year-1st-term'::paper_type,
                    'easy'::difficulty_level,
                    'en'::language_code,
                    ARRAY['cell', 'basics', 'organelles'],
                    TRUE,
                    TRUE,
                    TRUE,
                    1856,
                    'approved'::content_status,
                    NOW() - INTERVAL '2 months',
                    NOW() - INTERVAL '2 months'
                ),
                (
                    'Plant Biology and Photosynthesis',
                    biology_id,
                    2024,
                    '1st-year-2nd-term'::paper_type,
                    'medium'::difficulty_level,
                    'en'::language_code,
                    ARRAY['plants', 'photosynthesis', 'chloroplast'],
                    TRUE,
                    TRUE,
                    TRUE,
                    567,
                    'approved'::content_status,
                    NOW() - INTERVAL '2 months',
                    NOW() - INTERVAL '2 months'
                );
        END;
    END IF;
END;
$$;

-- Insert sample questions for papers
DO $$
DECLARE
    paper_record RECORD;
    question_count INTEGER;
BEGIN
    -- Loop through all papers
    FOR paper_record IN SELECT id, subject_id FROM papers
    LOOP
        -- Check if questions already exist for this paper
        SELECT COUNT(*) INTO question_count FROM questions WHERE paper_id = paper_record.id;
        
        IF question_count = 0 THEN
            -- For each paper, add 5 sample questions
            FOR i IN 1..5 LOOP
                INSERT INTO questions (
                    paper_id,
                    question_number,
                    question_text,
                    question_type,
                    marks,
                    topic,
                    difficulty,
                    correct_answer,
                    explanation,
                    common_mistakes,
                    hints,
                    related_concepts,
                    marking_scheme,
                    created_at
                ) VALUES (
                    paper_record.id,
                    i,
                    CASE 
                        WHEN EXISTS (SELECT 1 FROM subjects WHERE id = paper_record.subject_id AND name = 'chemistry') THEN
                            CASE 
                                WHEN i = 1 THEN 'Explain the mechanism of SN2 reaction with suitable examples. Discuss the factors affecting the rate of SN2 reactions.'
                                WHEN i = 2 THEN 'Calculate the pH of a 0.1 M solution of acetic acid (Ka = 1.8 × 10⁻⁵).'
                                WHEN i = 3 THEN 'Compare and contrast the properties of ionic and covalent compounds.'
                                WHEN i = 4 THEN 'Describe the process of fractional distillation and its applications.'
                                ELSE 'Explain the concept of resonance using benzene as an example.'
                            END
                        WHEN EXISTS (SELECT 1 FROM subjects WHERE id = paper_record.subject_id AND name = 'physics') THEN
                            CASE 
                                WHEN i = 1 THEN 'State and explain Newton''s three laws of motion with examples.'
                                WHEN i = 2 THEN 'Calculate the force required to accelerate an object of mass 10 kg at 5 m/s².'
                                WHEN i = 3 THEN 'Describe the wave-particle duality of light.'
                                WHEN i = 4 THEN 'Explain how a transformer works and its practical applications.'
                                ELSE 'Discuss the principles of thermodynamics with relevant examples.'
                            END
                        ELSE
                            CASE 
                                WHEN i = 1 THEN 'Describe the structure and function of a eukaryotic cell.'
                                WHEN i = 2 THEN 'Explain the process of photosynthesis and its importance.'
                                WHEN i = 3 THEN 'Compare mitosis and meiosis in terms of process and outcomes.'
                                WHEN i = 4 THEN 'Discuss the role of enzymes in biological reactions.'
                                ELSE 'Explain the principles of Mendelian genetics with examples.'
                            END
                    END,
                    (CASE 
                        WHEN i = 1 OR i = 3 OR i = 5 THEN 'essay'
                        WHEN i = 2 THEN 'calculation'
                        ELSE 'short-answer'
                    END)::question_type,
                    CASE 
                        WHEN i = 1 OR i = 5 THEN 10
                        WHEN i = 2 OR i = 3 THEN 5
                        ELSE 8
                    END,
                    CASE 
                        WHEN EXISTS (SELECT 1 FROM subjects WHERE id = paper_record.subject_id AND name = 'chemistry') THEN
                            CASE 
                                WHEN i = 1 THEN 'Organic Reaction Mechanisms'
                                WHEN i = 2 THEN 'Acid-Base Equilibrium'
                                WHEN i = 3 THEN 'Chemical Bonding'
                                WHEN i = 4 THEN 'Separation Techniques'
                                ELSE 'Aromatic Chemistry'
                            END
                        WHEN EXISTS (SELECT 1 FROM subjects WHERE id = paper_record.subject_id AND name = 'physics') THEN
                            CASE 
                                WHEN i = 1 THEN 'Classical Mechanics'
                                WHEN i = 2 THEN 'Forces and Motion'
                                WHEN i = 3 THEN 'Quantum Physics'
                                WHEN i = 4 THEN 'Electromagnetism'
                                ELSE 'Thermodynamics'
                            END
                        ELSE
                            CASE 
                                WHEN i = 1 THEN 'Cell Biology'
                                WHEN i = 2 THEN 'Plant Physiology'
                                WHEN i = 3 THEN 'Cell Division'
                                WHEN i = 4 THEN 'Biochemistry'
                                ELSE 'Genetics'
                            END
                    END,
                    (CASE 
                        WHEN i IN (1, 3) THEN 'medium'
                        WHEN i = 5 THEN 'hard'
                        ELSE 'easy'
                    END)::difficulty_level,
                    jsonb_build_object('expected_points', ARRAY['Point 1', 'Point 2', 'Point 3']),
                    'Detailed explanation would be provided here. This is a sample placeholder for the explanation of this question.',
                    ARRAY['Common mistake 1', 'Common mistake 2'],
                    ARRAY['Think about the basic principles', 'Consider all factors involved'],
                    ARRAY['Related concept 1', 'Related concept 2'],
                    jsonb_build_array(
                        jsonb_build_object(
                            'criterion', 'Understanding of Concepts',
                            'maxMarks', 5,
                            'description', 'Demonstrates understanding of key principles'
                        ),
                        jsonb_build_object(
                            'criterion', 'Application',
                            'maxMarks', 3,
                            'description', 'Applies concepts to solve problems'
                        ),
                        jsonb_build_object(
                            'criterion', 'Communication',
                            'maxMarks', 2,
                            'description', 'Clearly communicates ideas'
                        )
                    ),
                    NOW() - INTERVAL '2 months'
                );
            END LOOP;
        END IF;
    END LOOP;
END;
$$;

-- Insert sample user progress if needed
DO $$
DECLARE
    user_record RECORD;
    paper_record RECORD;
    progress_exists BOOLEAN;
BEGIN
    -- Check if we have any profiles
    FOR user_record IN SELECT id FROM profiles LIMIT 3
    LOOP
        -- Check if progress exists for this user
        SELECT EXISTS (
            SELECT 1 FROM user_progress WHERE user_id = user_record.id LIMIT 1
        ) INTO progress_exists;
        
        IF NOT progress_exists THEN
            -- For each paper, create some random progress
            FOR paper_record IN SELECT id FROM papers LIMIT 3
            LOOP
                INSERT INTO user_progress (
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
                ) VALUES (
                    user_record.id,
                    paper_record.id,
                    FLOOR(RANDOM() * 10) + 1,
                    FLOOR(RANDOM() * 8) + 1,
                    FLOOR(RANDOM() * 3600) + 1800,
                    FLOOR(RANDOM() * 40) + 60,
                    FLOOR(RANDOM() * 3) + 1,
                    CASE WHEN RANDOM() > 0.5 THEN TRUE ELSE FALSE END,
                    FLOOR(RANDOM() * 100) + 50,
                    NOW() - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL,
                    NOW() - (FLOOR(RANDOM() * 60) || ' days')::INTERVAL,
                    NOW() - (FLOOR(RANDOM() * 15) || ' days')::INTERVAL
                );
            END LOOP;
        END IF;
    END LOOP;
END;
$$;