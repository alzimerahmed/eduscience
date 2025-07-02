/*
  # Note Management System Functions

  1. New Functions
    - `create_note` - Creates a new note for a user
    - `update_note` - Updates an existing note
    - `delete_note` - Deletes a note
    - `add_note_tag` - Adds a tag to a note
    - `remove_note_tag` - Removes a tag from a note
    - `search_notes` - Searches user notes by title, content, or tags

  2. Security
    - Functions run with elevated permissions but verify user access
    - Input validation to prevent SQL injection
    - Permission checks to ensure proper access control
*/

-- Function to create a new note
CREATE OR REPLACE FUNCTION create_note(
    user_id UUID,
    title TEXT,
    content TEXT DEFAULT NULL,
    folder TEXT DEFAULT NULL,
    tags TEXT[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    note_id UUID;
    tag_id UUID;
    tag_name TEXT;
BEGIN
    -- Validate inputs
    IF user_id IS NULL OR title IS NULL THEN
        RAISE EXCEPTION 'User ID and title are required';
    END IF;

    -- Create the note
    INSERT INTO user_notes (
        user_id,
        title,
        content,
        folder,
        created_at,
        last_edited_at
    )
    VALUES (
        user_id,
        title,
        content,
        folder,
        NOW(),
        NOW()
    )
    RETURNING id INTO note_id;

    -- Add tags if provided
    IF tags IS NOT NULL AND array_length(tags, 1) > 0 THEN
        FOREACH tag_name IN ARRAY tags
        LOOP
            -- Check if tag exists, create if not
            SELECT id INTO tag_id FROM tags WHERE name = tag_name;
            
            IF NOT FOUND THEN
                INSERT INTO tags (name, created_by, created_at)
                VALUES (tag_name, user_id, NOW())
                RETURNING id INTO tag_id;
            END IF;
            
            -- Link tag to note
            INSERT INTO note_tags (note_id, tag_id)
            VALUES (note_id, tag_id);
        END LOOP;
    END IF;

    -- Return the created note
    RETURN json_build_object(
        'id', note_id,
        'user_id', user_id,
        'title', title,
        'content', content,
        'folder', folder,
        'created_at', NOW(),
        'tags', tags
    );
END;
$$;

-- Function to update an existing note
CREATE OR REPLACE FUNCTION update_note(
    note_id UUID,
    user_id UUID,
    title TEXT DEFAULT NULL,
    content TEXT DEFAULT NULL,
    folder TEXT DEFAULT NULL,
    is_favorite BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    note_record RECORD;
BEGIN
    -- Validate inputs
    IF note_id IS NULL OR user_id IS NULL THEN
        RAISE EXCEPTION 'Note ID and user ID are required';
    END IF;

    -- Check if note exists and belongs to the user
    SELECT * INTO note_record 
    FROM user_notes 
    WHERE id = note_id AND user_id = update_note.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Note not found or access denied';
    END IF;

    -- Update the note with provided values, keeping existing values if not provided
    UPDATE user_notes
    SET 
        title = COALESCE(update_note.title, user_notes.title),
        content = COALESCE(update_note.content, user_notes.content),
        folder = COALESCE(update_note.folder, user_notes.folder),
        is_favorite = COALESCE(update_note.is_favorite, user_notes.is_favorite),
        last_edited_at = NOW()
    WHERE id = note_id
    RETURNING * INTO note_record;

    -- Return the updated note
    RETURN json_build_object(
        'id', note_record.id,
        'user_id', note_record.user_id,
        'title', note_record.title,
        'content', note_record.content,
        'folder', note_record.folder,
        'is_favorite', note_record.is_favorite,
        'last_edited_at', note_record.last_edited_at
    );
END;
$$;

-- Function to delete a note
CREATE OR REPLACE FUNCTION delete_note(
    note_id UUID,
    user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate inputs
    IF note_id IS NULL OR user_id IS NULL THEN
        RAISE EXCEPTION 'Note ID and user ID are required';
    END IF;

    -- Check if note exists and belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM user_notes 
        WHERE id = note_id AND user_id = delete_note.user_id
    ) THEN
        RAISE EXCEPTION 'Note not found or access denied';
    END IF;

    -- Delete the note
    -- Note: note_tags records will be automatically deleted due to CASCADE
    DELETE FROM user_notes
    WHERE id = note_id;

    RETURN TRUE;
END;
$$;

-- Function to add a tag to a note
CREATE OR REPLACE FUNCTION add_note_tag(
    note_id UUID,
    user_id UUID,
    tag_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tag_id UUID;
BEGIN
    -- Validate inputs
    IF note_id IS NULL OR user_id IS NULL OR tag_name IS NULL THEN
        RAISE EXCEPTION 'Note ID, user ID, and tag name are required';
    END IF;

    -- Check if note exists and belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM user_notes 
        WHERE id = note_id AND user_id = add_note_tag.user_id
    ) THEN
        RAISE EXCEPTION 'Note not found or access denied';
    END IF;

    -- Check if tag exists, create if not
    SELECT id INTO tag_id FROM tags WHERE name = tag_name;
    
    IF NOT FOUND THEN
        INSERT INTO tags (name, created_by, created_at)
        VALUES (tag_name, user_id, NOW())
        RETURNING id INTO tag_id;
    END IF;
    
    -- Add tag to note if not already present
    IF NOT EXISTS (
        SELECT 1 FROM note_tags 
        WHERE note_id = add_note_tag.note_id AND tag_id = add_note_tag.tag_id
    ) THEN
        INSERT INTO note_tags (note_id, tag_id)
        VALUES (note_id, tag_id);
    END IF;

    -- Return the tag info
    RETURN json_build_object(
        'note_id', note_id,
        'tag_id', tag_id,
        'tag_name', tag_name
    );
END;
$$;

-- Function to remove a tag from a note
CREATE OR REPLACE FUNCTION remove_note_tag(
    note_id UUID,
    user_id UUID,
    tag_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate inputs
    IF note_id IS NULL OR user_id IS NULL OR tag_id IS NULL THEN
        RAISE EXCEPTION 'Note ID, user ID, and tag ID are required';
    END IF;

    -- Check if note exists and belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM user_notes 
        WHERE id = note_id AND user_id = remove_note_tag.user_id
    ) THEN
        RAISE EXCEPTION 'Note not found or access denied';
    END IF;

    -- Remove tag from note
    DELETE FROM note_tags
    WHERE note_id = remove_note_tag.note_id AND tag_id = remove_note_tag.tag_id;

    RETURN TRUE;
END;
$$;

-- Function to search user notes
CREATE OR REPLACE FUNCTION search_notes(
    user_id UUID,
    search_term TEXT DEFAULT NULL,
    folder TEXT DEFAULT NULL,
    tag_id UUID DEFAULT NULL,
    favorites_only BOOLEAN DEFAULT FALSE
)
RETURNS SETOF JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH note_with_tags AS (
        SELECT 
            n.*,
            array_agg(t.name) FILTER (WHERE t.id IS NOT NULL) AS tag_names,
            array_agg(t.id) FILTER (WHERE t.id IS NOT NULL) AS tag_ids
        FROM user_notes n
        LEFT JOIN note_tags nt ON n.id = nt.note_id
        LEFT JOIN tags t ON nt.tag_id = t.id
        WHERE 
            n.user_id = search_notes.user_id
            AND (search_notes.folder IS NULL OR n.folder = search_notes.folder)
            AND (search_notes.favorites_only = FALSE OR n.is_favorite = TRUE)
            AND (
                search_notes.search_term IS NULL 
                OR n.title ILIKE '%' || search_notes.search_term || '%' 
                OR n.content ILIKE '%' || search_notes.search_term || '%'
            )
        GROUP BY n.id
    )
    SELECT json_build_object(
        'id', n.id,
        'title', n.title,
        'content', n.content,
        'folder', n.folder,
        'is_favorite', n.is_favorite,
        'created_at', n.created_at,
        'last_edited_at', n.last_edited_at,
        'tags', COALESCE(n.tag_names, '{}'::text[])
    )
    FROM note_with_tags n
    WHERE 
        (search_notes.tag_id IS NULL OR search_notes.tag_id = ANY(n.tag_ids))
    ORDER BY 
        CASE WHEN n.is_favorite THEN 0 ELSE 1 END,
        n.last_edited_at DESC;
END;
$$;