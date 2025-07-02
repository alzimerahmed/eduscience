import { supabase } from '../lib/supabaseClient';

export interface Note {
  id: string;
  title: string;
  content: string;
  folder?: string;
  is_favorite?: boolean;
  created_at: string;
  last_edited_at: string;
  tags?: string[];
}

export interface NoteTag {
  id: string;
  name: string;
  color?: string;
}

export const workspaceService = {
  /**
   * Get all notes for a user
   */
  getNotes: async (userId: string, options: {
    folder?: string;
    searchTerm?: string;
    tagId?: string;
    favoritesOnly?: boolean;
  } = {}): Promise<Note[]> => {
    try {
      // Call the note-sync Edge Function to fetch notes
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'get_notes',
          userId,
          data: options
        })
      });

      if (error) throw error;
      return data.notes || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  /**
   * Create a new note
   */
  createNote: async (userId: string, title: string, content?: string, folder?: string, tags?: string[]): Promise<Note> => {
    try {
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'create_note',
          userId,
          data: { title, content, folder, tags }
        })
      });

      if (error) throw error;
      return data.note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  /**
   * Update an existing note
   */
  updateNote: async (userId: string, noteId: string, updates: {
    title?: string;
    content?: string;
    folder?: string;
    is_favorite?: boolean;
  }): Promise<Note> => {
    try {
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'update_note',
          userId,
          noteId,
          data: updates
        })
      });

      if (error) throw error;
      return data.note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  /**
   * Delete a note
   */
  deleteNote: async (userId: string, noteId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'delete_note',
          userId,
          noteId
        })
      });

      if (error) throw error;
      return data.deleted;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  /**
   * Get all tags for a user
   */
  getTags: async (userId: string): Promise<NoteTag[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'get_all_tags',
          userId
        })
      });

      if (error) throw error;
      return data.tags || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  /**
   * Add a tag to a note
   */
  addTagToNote: async (userId: string, noteId: string, tagName: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'add_tag',
          userId,
          noteId,
          data: { tag_name: tagName }
        })
      });

      if (error) throw error;
      return data.tag;
    } catch (error) {
      console.error('Error adding tag to note:', error);
      throw error;
    }
  },

  /**
   * Remove a tag from a note
   */
  removeTagFromNote: async (userId: string, noteId: string, tagId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('note-sync', {
        body: JSON.stringify({
          action: 'remove_tag',
          userId,
          noteId,
          data: { tag_id: tagId }
        })
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error('Error removing tag from note:', error);
      throw error;
    }
  }
};

export default workspaceService;